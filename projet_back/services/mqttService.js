const mqtt = require('mqtt');
const dotenv = require('dotenv');
const pgClient = require('./db');
const { verifyAccess } = require('./accessService');

dotenv.config();

// Configuration du client MQTT
const MQTT_BROKER = process.env.MQTT_BROKER || "mqtt://test.mosquitto.org";
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
const MQTT_CLIENT_ID = process.env.MQTT_CLIENT_ID || `mqtt_client_${Math.random().toString(16).slice(2, 10)}`;

// Structure pour stocker les callbacks de messages par sujet
const topicCallbacks = {};

// Création du client MQTT
const options = {
    clientId: MQTT_CLIENT_ID,
    clean: true,
    reconnectPeriod: 5000,  // Gardez cette valeur pour la reconnexion en cas de perte réelle
    keepalive: 60,          // Augmenter le keepalive à 60 secondes (valeur par défaut)
    rejectUnauthorized: false
};

// Ajout des identifiants si fournis
if (MQTT_USERNAME && MQTT_PASSWORD) {
    options.username = MQTT_USERNAME;
    options.password = MQTT_PASSWORD;
}

// Connexion au broker MQTT
const client = mqtt.connect(MQTT_BROKER, options);

// Gestion des événements de connexion
client.on('connect', () => {
    console.log('✅ Connecté au broker MQTT avec l\'ID client:', MQTT_CLIENT_ID);

    // S'abonner aux topics une seule fois lors de la connexion initiale
    if (!client.initialSubscriptionsDone) {
        console.log('🔔 Configuration des abonnements initiaux...');
        setupDefaultSubscriptions();
        subscribeToAllInputModules();
        client.initialSubscriptionsDone = true;
    } else {
        console.log('⚠️ Reconnecté au broker MQTT, abonnements déjà configurés');
    }
});

client.on('error', (error) => {
    console.error('❌ Erreur MQTT:', error);
});

client.on('reconnect', () => {
    console.log('🔄 Tentative de reconnexion MQTT');
});

client.on('close', () => {
    console.log('⚠️ Connexion au broker MQTT fermée');
});

client.on('offline', () => {
    console.log('🔌 Client MQTT déconnecté');
});

client.on('end', () => {
    console.log('🛑 Connexion MQTT terminée');
});

/**
 * Abonnement à un topic MQTT
 * @param {string} topic - Le sujet auquel s'abonner
 * @param {function} callback - La fonction à appeler quand un message est reçu
 */
const subscribe = (topic, callback) => {
    client.subscribe(topic, (err) => {
        if (err) {
            console.error(`❌ Erreur lors de l'abonnement au sujet ${topic}:`, err);
            return;
        }
        console.log(`✅ Abonné au sujet: ${topic}`);

        // Enregistrer le callback pour ce sujet
        if (!topicCallbacks[topic]) {
            topicCallbacks[topic] = [];
        }
        topicCallbacks[topic].push(callback);
    });
};

// Gestion des messages reçus
client.on('message', (topic, message) => {
    console.log(`📩 Message reçu sur ${topic}: ${message.toString()}`);

    // Appeler les callbacks associés à ce sujet
    if (topicCallbacks[topic]) {
        topicCallbacks[topic].forEach(callback => {
            try {
                callback(topic, message.toString());
            } catch (error) {
                console.error(`❌ Erreur dans le callback pour ${topic}:`, error);
            }
        });
    }
});

/**
 * Publication d'un message sur un sujet MQTT
 * @param {string} topic - Le sujet sur lequel publier
 * @param {string|object} message - Le message à publier (converti en JSON si objet)
 * @param {object} options - Options de publication MQTT
 */
const publish = (topic, message, options = {}) => {
    const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;

    client.publish(topic, messageStr, options, (err) => {
        if (err) {
            console.error(`❌ Erreur lors de la publication sur ${topic}:`, err);
            return;
        }
        console.log(`📤 Message publié sur ${topic}: ${messageStr}`);
    });
};

/**
 * S'abonner aux topics d'un module d'entrée spécifique
 * @param {object} inModule - Module d'entrée (objet avec id, hostname, etc.)
 */
const subscribeToInputModule = (inModule) => {
    // Extraire l'adresse MAC du hostname (ESP32_I_XXXX)
    const macAddress = inModule.hostname.split('_')[2];

    // S'abonner aux différents topics du module d'entrée
    const topicBase = `/in/${inModule.hostname}`;

    // Topic pour les requêtes d'accès
    subscribe(`${topicBase}/access`, (topic, message) => {
        handleInputModuleMessage(inModule.id, topic, message);
    });

    // Topic pour les entrées de code PIN
    subscribe(`${topicBase}/pin`, (topic, message) => {
        handleInputModuleMessage(inModule.id, topic, message);
    });

    console.log(`✅ Abonnement aux topics du module ${inModule.hostname}`);
};

/**
 * Récupérer tous les modules d'entrée et s'abonner à leurs topics
 */
const subscribeToAllInputModules = async () => {
    try {
        // Récupérer tous les modules d'entrée
        const result = await pgClient.query('SELECT * FROM module WHERE type = $1', ['IN']);

        if (result.rows.length > 0) {
            console.log(`🔄 Abonnement à ${result.rows.length} module(s) d'entrée existant(s)...`);

            // S'abonner à tous les modules existants
            result.rows.forEach(module => {
                subscribeToInputModule(module);
            });
        } else {
            console.log("ℹ️ Aucun module d'entrée existant dans la base de données");
        }
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des modules d\'entrée:', error);
    }
};

/**
 * Configuration des abonnements par défaut au démarrage
 */
const setupDefaultSubscriptions = () => {
    // Abonnement au topic général
    subscribe('arrivals', async (topic, message) => {
        console.log(`📡 Nouveau module détecté: ${message}`);

        try {
            // Analyser le message reçu
            const msgPattern = /^ESP32_([OI])_((?:[0-9A-F]{2}){6})$/i;

            const matches = message.toString().match(msgPattern);

            if (!matches) {
                console.error('❌ Format du message invalide:', message);
                return;
            }

            const type = matches[1] === 'O' ? 'OUT' : 'IN';
            const macAddress = matches[2];
            const hostname = `ESP32_${matches[1]}_${macAddress}`;

            // Vérifier si le module existe déjà
            const existingModule = await pgClient.query(
                'SELECT * FROM module WHERE hostname = $1',
                [hostname]
            );

            let moduleId;

            if (existingModule.rows.length === 0) {
                // Ajouter le nouveau module à la base de données
                const result = await pgClient.query(
                    'INSERT INTO module (hostname, type) VALUES ($1, $2) RETURNING id',
                    [hostname, type]
                );
                moduleId = result.rows[0].id;
                console.log(`✅ Nouveau module enregistré: ${hostname} (${type}) avec ID: ${moduleId}`);
            } else {
                moduleId = existingModule.rows[0].id;
                console.log(`ℹ️ Module déjà connu: ${hostname} (${type}) avec ID: ${moduleId}`);
            }

            // S'abonner UNIQUEMENT au topic des modules d'entrée (IN)
            if (type === 'IN') {
                const module = {
                    id: moduleId,
                    hostname: hostname,
                    type: type
                };
                subscribeToInputModule(module);
            } else {
                // Pour les modules de sortie, on ne s'abonne pas
                // mais on garde l'ID pour pouvoir lui envoyer des commandes ultérieurement
                console.log(`Module de sortie ${hostname} enregistré (pas d'abonnement)`);
            }

        } catch (error) {
            console.error('❌ Erreur lors du traitement du nouveau module:', error);
        }
    });
};

// Gestion des messages des modules d'entrée
const handleInputModuleMessage = async (moduleId, topic, message) => {
    try {
        console.log(`Module ${moduleId} a envoyé sur ${topic}: ${message}`);

        // Extraire l'identifiant du module depuis le topic
        const topicParts = topic.split('/');
        const hostname = topicParts[2]; 

        // Récupérer le module apparié (sortie)
        const moduleResult = await pgClient.query(
            'SELECT m.*, p.hostname as pair_hostname FROM module m ' +
            'LEFT JOIN module p ON m.pair_id = p.id ' +
            'WHERE m.hostname = $1',
            [hostname]
        );

        if (moduleResult.rows.length === 0) {
            console.error(`❌ Module inconnu: ${hostname}`);
            return;
        }

        const module = moduleResult.rows[0];
        const outputHostname = module.pair_hostname;

        // Si pas de module de sortie apparié
        if (!outputHostname) {
            console.error(`❌ Module ${hostname} n'a pas de module de sortie apparié`);
            return;
        }

        // Traiter les différents types de messages selon le topic
        if (topic.includes('/access')) {
            // Format attendu: uuid:pin
            const parts = message.split(':');
            if (parts.length !== 2) {
                console.error(`❌ Format de message d'accès invalide: ${message}`);
                return;
            }

            const cardId = parts[0];
            const pinCode = parts[1];

            // Vérifier l'accès
            const accessResult = await verifyAccess(cardId, pinCode);

            console.log(`Résultat de la vérification d'accès:`, accessResult);

            // Envoyer la réponse au module de sortie
            publish(`/out/${outputHostname}/access`, accessResult.success ? "1" : "0");

            // Si accès autorisé, envoyer le message de bienvenue
            if (accessResult.success && accessResult.userData) {
                const welcomeMessage = `Bonjour, ${accessResult.userData.firstname} ${accessResult.userData.name}`;
                publish(`/out/${outputHostname}/display`, welcomeMessage);
            } else {
                // Message d'erreur
                publish(`/out/${outputHostname}/display`, accessResult.message || "Accès refusé");
            }
        }
        else if (topic.includes('/pin')) {
            // On peut aussi l'afficher
            publish(`/out/${outputHostname}/display`, message);
        }
    } catch (error) {
        console.error(`❌ Erreur de traitement du message d'entrée:`, error);
    }
};

/**
 * Envoie une commande à un module de sortie
 * @param {string} moduleId - ID du module de sortie
 * @param {object} command - Commande à envoyer
 */
const sendCommandToOutputModule = async (moduleId, command) => {
    try {
        // Récupérer les infos du module
        const result = await pgClient.query('SELECT * FROM module WHERE id = $1 AND type = $2', [moduleId, 'OUT']);

        if (result.rows.length === 0) {
            throw new Error(`Module de sortie ${moduleId} non trouvé`);
        }

        const module = result.rows[0];

        // Extraire l'adresse MAC du hostname (ESP32_OUT_XXXX)
        const macAddress = module.hostname.split('_')[2];

        // Envoyer la commande au topic du module
        const topic = `ESP32_O_${macAddress}`;
        publish(topic, command);

        return { success: true, message: `Commande envoyée au module ${module.hostname}` };
    } catch (error) {
        console.error(`❌ Erreur lors de l'envoi de la commande:`, error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    client,
    publish,
    subscribe,
    sendCommandToOutputModule,
    handleInputModuleMessage,
    subscribeToInputModule,
    subscribeToAllInputModules
};