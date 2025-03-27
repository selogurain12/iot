const mqtt = require('mqtt');
const dotenv = require('dotenv');
const pgClient = require('./db');
const { verifyAccess } = require('./accessService');

dotenv.config();

// MQTT client configuration
const MQTT_BROKER = process.env.MQTT_BROKER || "mqtt://test.mosquitto.org";
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
const MQTT_CLIENT_ID = `backend_${Math.random().toString(16).substring(2, 10)}_${Date.now()}`;
// Structure to store message callbacks by topic
const topicCallbacks = {};

// MQTT client creation
const options = {
    clientId: MQTT_CLIENT_ID,
    clean: true,
    reconnectPeriod: 5000,  // Keep this value for reconnection in case of real connection loss
    keepalive: 60,          // Increase keepalive to 60 seconds (default value)
    rejectUnauthorized: false
};

// Add credentials if provided
if (MQTT_USERNAME && MQTT_PASSWORD) {
    options.username = MQTT_USERNAME;
    options.password = MQTT_PASSWORD;
}

// Connect to MQTT broker
const client = mqtt.connect(MQTT_BROKER, options);

// Connection event handling
client.on('connect', () => {
    console.log('✅ Connected to MQTT broker with client ID:', MQTT_CLIENT_ID);

    // Subscribe to topics only once during initial connection
    if (!client.initialSubscriptionsDone) {
        console.log('🔔 Setting up initial subscriptions...');
        setupDefaultSubscriptions();
        subscribeToAllInputModules();
        client.initialSubscriptionsDone = true;
    } else {
        console.log('⚠️ Reconnected to MQTT broker, subscriptions already configured');
    }
});

client.on('error', (error) => {
    console.error('❌ MQTT Error:', error);
});

client.on('reconnect', () => {
    console.log('🔄 MQTT reconnection attempt');
});

client.on('close', () => {
    console.log('⚠️ MQTT broker connection closed');
});

client.on('offline', () => {
    console.log('🔌 MQTT client disconnected');
});

client.on('end', () => {
    console.log('🛑 MQTT connection ended');
});

/**
 * Subscribe to an MQTT topic
 * @param {string} topic - The topic to subscribe to
 * @param {function} callback - The function to call when a message is received
 */
const subscribe = (topic, callback) => {
    client.subscribe(topic, (err) => {
        if (err) {
            console.error(`❌ Error subscribing to topic ${topic}:`, err);
            return;
        }
        console.log(`✅ Subscribed to topic: ${topic}`);

        // Register callback for this topic
        if (!topicCallbacks[topic]) {
            topicCallbacks[topic] = [];
        }
        topicCallbacks[topic].push(callback);
    });
};

// Handle received messages
client.on('message', (topic, message) => {
    console.log(`📩 Message received on ${topic}: ${message.toString()}`);

    // Call callbacks associated with this topic
    if (topicCallbacks[topic]) {
        topicCallbacks[topic].forEach(callback => {
            try {
                callback(topic, message.toString());
            } catch (error) {
                console.error(`❌ Error in callback for ${topic}:`, error);
            }
        });
    }
});

/**
 * Publish a message to an MQTT topic
 * @param {string} topic - The topic to publish to
 * @param {string|object} message - The message to publish (converted to JSON if object)
 * @param {object} options - MQTT publish options
 */
const publish = (topic, message, options = {}) => {
    const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;

    client.publish(topic, messageStr, options, (err) => {
        if (err) {
            console.error(`❌ Error publishing to ${topic}:`, err);
            return;
        }
        console.log(`📤 Message published to ${topic}: ${messageStr}`);
    });
};

/**
 * Subscribe to topics of a specific input module
 * @param {object} inModule - Input module (object with id, hostname, etc.)
 */
const subscribeToInputModule = (inModule) => {
    // Extract MAC address from hostname (ESP32_I_XXXX)
    const macAddress = inModule.hostname.split('_')[2];

    // Subscribe to different topics of the input module
    const topicBase = `/in/${inModule.hostname}`;

    // Topic for access requests
    subscribe(`${topicBase}/access`, (topic, message) => {
        handleInputModuleMessage(inModule.id, topic, message);
    });

    // Topic for PIN code inputs
    subscribe(`${topicBase}/display`, (topic, message) => {
        handleInputModuleMessage(inModule.id, topic, message);
    });

    // Topic for RFID card detection
    subscribe(`${topicBase}/card`, (topic, message) => {
        handleCardDetection(inModule.id, message);
    });

    console.log(`✅ Subscribed to ${inModule.hostname} module topics`);
};

/**
 * Handle RFID card detection
 * @param {string} moduleId - ID of the module that detected the card
 * @param {string} cardId - RFID card UUID
 */
const handleCardDetection = async (moduleId, cardId) => {
    try {
        cardId = cardId.trim().toUpperCase();
        console.log(`📇 RFID card detected by module ${moduleId}: ${cardId}`);

        // Import RFID service
        const rfidService = require('./rfidService');

        // Check if card exists
        const existingCard = await rfidService.getRfidByCardId(cardId);

        // get the input module hostname from the id
        const inputModule = await pgClient.query(
            'SELECT * FROM module WHERE id = $1',
            [moduleId]
        );
        if (existingCard) {
            // check if the card is associated with a user (check userid)
            if (!existingCard.user_id) {
                console.log(`ℹ️ RFID card ${cardId} is not associated with a user yet`);
                publish(`/in/${inputModule.rows[0].hostname}/existingcard`, "0");
                return existingCard;
            }
            console.log(`ℹ️ RFID card ${cardId} already exists in database with ID: ${existingCard.id}`);

            publish(`/in/${inputModule.rows[0].hostname}/existingcard`, "1");

            return existingCard;
        } else {

            // publish to the input module (not output) that a new card is detected so it stops waiting for user input on the keypad
            publish(`/in/${inputModule.rows[0].hostname}/existingcard`, "0");


            // Create new card with default values
            console.log(`➕ Creating new RFID card ${cardId} in database...`);

            const newCard = await rfidService.createRfid({
                card_id: cardId,
                user_id: null, // No user associated yet
                is_active: false // Inactive by default
            });

            console.log(`✅ New RFID card created with ID: ${newCard.id}`);


            return newCard;
        }
    } catch (error) {
        console.error(`❌ Error handling RFID card detection:`, error);
        return null;
    }
};



/**
 * Retrieve all input modules and subscribe to their topics
 */
const subscribeToAllInputModules = async () => {
    try {
        // Retrieve all input modules
        const result = await pgClient.query('SELECT * FROM module WHERE type = $1', ['IN']);

        if (result.rows.length > 0) {
            console.log(`🔄 Subscribing to ${result.rows.length} existing input module(s)...`);

            // Subscribe to all existing modules
            result.rows.forEach(module => {
                subscribeToInputModule(module);
            });
        } else {
            console.log("ℹ️ No existing input modules in the database");
        }
    } catch (error) {
        console.error('❌ Error retrieving input modules:', error);
    }
};

/**
 * Default subscription setup at startup
 */
const setupDefaultSubscriptions = () => {
    // Subscribe to general topic
    subscribe('arrivals', async (topic, message) => {
        console.log(`📡 New module detected: ${message}`);

        try {
            // Parse the received message
            const msgPattern = /^ESP32_([OI])_((?:[0-9A-F]{2}){6})$/i;

            const matches = message.toString().match(msgPattern);

            if (!matches) {
                console.error('❌ Invalid message format:', message);
                return;
            }

            const type = matches[1] === 'O' ? 'OUT' : 'IN';
            const macAddress = matches[2];
            const hostname = `ESP32_${matches[1]}_${macAddress}`;

            // Check if module already exists
            const existingModule = await pgClient.query(
                'SELECT * FROM module WHERE hostname = $1',
                [hostname]
            );

            let moduleId;

            if (existingModule.rows.length === 0) {
                // Add the new module to the database
                const result = await pgClient.query(
                    'INSERT INTO module (hostname, type) VALUES ($1, $2) RETURNING id',
                    [hostname, type]
                );
                moduleId = result.rows[0].id;
                console.log(`✅ New module registered: ${hostname} (${type}) with ID: ${moduleId}`);
            } else {
                moduleId = existingModule.rows[0].id;
                console.log(`ℹ️ Module already known: ${hostname} (${type}) with ID: ${moduleId}`);
            }

            // Subscribe ONLY to input module topics (IN)
            if (type === 'IN') {
                const module = {
                    id: moduleId,
                    hostname: hostname,
                    type: type
                };
                subscribeToInputModule(module);
            } else {
                // For output modules, we don't subscribe
                // but we keep the ID to be able to send commands later
                console.log(`Output module ${hostname} registered (no subscription)`);
            }

        } catch (error) {
            console.error('❌ Error processing new module:', error);
        }
    });
};

// Handle input module messages
const handleInputModuleMessage = async (moduleId, topic, message) => {
    try {
        console.log(`Module ${moduleId} sent on ${topic}: ${message}`);

        // Extract module ID from topic
        const topicParts = topic.split('/');
        const hostname = topicParts[2];

        // Retrieve the paired module (output)
        const moduleResult = await pgClient.query(
            'SELECT m.*, p.hostname as pair_hostname FROM module m ' +
            'LEFT JOIN module p ON m.pair_id = p.id ' +
            'WHERE m.hostname = $1',
            [hostname]
        );

        if (moduleResult.rows.length === 0) {
            console.error(`❌ Unknown module: ${hostname}`);
            return;
        }

        const module = moduleResult.rows[0];
        const outputHostname = module.pair_hostname;

        // If no paired output module
        if (!outputHostname) {
            console.error(`❌ Module ${hostname} has no paired output module`);
            return;
        }

        // Process different types of messages based on the topic
        if (topic.includes('/access')) {
            // Expected format: uuid:pin
            const parts = message.split(':');
            if (parts.length !== 2) {
                console.error(`❌ Invalid access message format: ${message}`);
                return;
            }

            const cardId = parts[0].toUpperCase();
            const pinCode = parts[1];

            // Verify access
            const accessResult = await verifyAccess(cardId, pinCode);

            console.log(`Access verification result:`, accessResult);

            // Send response to output module
            publish(`/out/${outputHostname}/access`, accessResult.success ? "1" : "0");

            // If access authorized, send welcome message
            if (accessResult.success && accessResult.userData) {
                const welcomeMessage = `Hello, ${accessResult.userData.firstname} ${accessResult.userData.name}`;
                publish(`/out/${outputHostname}/display`, welcomeMessage);
            } else {
                // Error message
                publish(`/out/${outputHostname}/display`, accessResult.message || "Access denied");
            }
        }
        else if (topic.includes('/display')) {
            // We can also display it
            publish(`/out/${outputHostname}/display`, message);
        }
    } catch (error) {
        console.error(`❌ Error processing input message:`, error);
    }
};

/**
 * Send a command to an output module
 * @param {string} moduleId - Output module ID
 * @param {object} command - Command to send
 */
const sendCommandToOutputModule = async (moduleId, command) => {
    try {
        // Retrieve module info
        const result = await pgClient.query('SELECT * FROM module WHERE id = $1 AND type = $2', [moduleId, 'OUT']);

        if (result.rows.length === 0) {
            throw new Error(`Output module ${moduleId} not found`);
        }

        const module = result.rows[0];

        // Extract MAC address from hostname (ESP32_OUT_XXXX)
        const macAddress = module.hostname.split('_')[2];

        // Send command to module topic
        const topic = `ESP32_O_${macAddress}`;
        publish(topic, command);

        return { success: true, message: `Command sent to module ${module.hostname}` };
    } catch (error) {
        console.error(`❌ Error sending command:`, error);
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
    subscribeToAllInputModules,
    handleCardDetection
};