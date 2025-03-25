const client = require("./db");

// Vérifier l'accès en utilisant une carte RFID et un code PIN
const verifyAccess = async (cardId, pinCode) => {
    // 1. Vérifier si la carte existe et si elle est active
    const cardQuery = `
        SELECT r.id, r.card_id, r.is_active, r.user_id
        FROM rfid_cards r
        WHERE r.card_id = $1`;

    const cardResult = await client.query(cardQuery, [cardId]);

    if (cardResult.rows.length === 0) {
        return {
            success: false,
            message: "Carte RFID non trouvée"
        };
    }

    const rfidCard = cardResult.rows[0];

    if (!rfidCard.is_active) {
        // Enregistrer la tentative d'accès échouée
        await logAccessAttempt(cardId, rfidCard.user_id, false, "La carte RFID est désactivée");
        return {
            success: false,
            message: "Carte RFID désactivée"
        };
    }

    if (!rfidCard.user_id) {
        // Enregistrer la tentative d'accès échouée
        await logAccessAttempt(cardId, null, false, "Aucun utilisateur associé à cette carte");
        return {
            success: false,
            message: "Carte RFID non associée à un utilisateur"
        };
    }

    // 2. Vérifier si l'utilisateur a un code d'accès actif correspondant au code PIN fourni
    const codeQuery = `
        SELECT a.id, a.code, a.is_active, u.id as user_id, u.name, u.firstname
        FROM access_codes a
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = $1 AND a.code = $2`;

    const codeResult = await client.query(codeQuery, [rfidCard.user_id, pinCode]);

    if (codeResult.rows.length === 0) {
        // Enregistrer la tentative d'accès échouée
        await logAccessAttempt(cardId, rfidCard.user_id, false, "Code PIN invalide");
        return {
            success: false,
            message: "Code PIN invalide"
        };
    }

    const accessCode = codeResult.rows[0];

    if (!accessCode.is_active) {
        // Enregistrer la tentative d'accès échouée
        await logAccessAttempt(cardId, rfidCard.user_id, false, "Code d'accès désactivé");
        return {
            success: false,
            message: "Code d'accès désactivé"
        };
    }

    // 3. Si tout est valide, accès autorisé
    // Enregistrer la tentative d'accès réussie
    await logAccessAttempt(cardId, rfidCard.user_id, true, "Accès autorisé");

    return {
        success: true,
        message: `Bienvenue, ${accessCode.firstname} ${accessCode.name}`,
        userData: {
            user_id: accessCode.user_id,
            name: accessCode.name,
            firstname: accessCode.firstname
        }
    };
};

// Fonction pour enregistrer les tentatives d'accès
const logAccessAttempt = async (identifier, userId, success, message) => {
    const query = `
        INSERT INTO access_logs 
        (access_type, identifier, user_id, success, created_at) 
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`;

    // Utiliser 'rfid' comme type d'accès (selon la contrainte)
    await client.query(query, ['rfid', identifier, userId, success]);
};

module.exports = {
    verifyAccess,
    logAccessAttempt
};