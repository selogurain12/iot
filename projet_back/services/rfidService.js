const client = require("./db");

// Récupère toutes les cartes RFID en base de données avec les infos utilisateur
const getAllRfids = async () => {
    const query = `
        SELECT r.id, r.card_id, r.is_active, r.created_at, r.user_id,
               u.name, u.email, u.firstname
        FROM rfid_cards r
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC`;

    const result = await client.query(query);
    return result.rows;
};

// Crée une nouvelle carte RFID en base de données
const createRfid = async (rfidData) => {
    const { card_id, user_id, is_active = true } = rfidData;

    // Vérifier si l'utilisateur existe si un user_id est fourni
    if (user_id) {
        const userExists = await client.query('SELECT id FROM users WHERE id = $1', [user_id]);
        if (userExists.rows.length === 0) {
            throw new Error(`User with ID ${user_id} does not exist`);
        }
    }

    // Insérer la carte RFID
    const cardQuery = 'INSERT INTO rfid_cards (card_id, user_id, is_active) VALUES ($1, $2, $3) RETURNING *';
    const cardValues = [card_id, user_id, is_active];
    const cardResult = await client.query(cardQuery, cardValues);

    // Si un utilisateur est spécifié, créer l'association dans user_rfid
    if (user_id) {
        const userRfidQuery = 'INSERT INTO user_rfid (user_id, rfid_id) VALUES ($1, $2)';
        await client.query(userRfidQuery, [user_id, cardResult.rows[0].id]);
    }

    return cardResult.rows[0];
};

// Met à jour les informations d'une carte RFID
const updateRfid = async (id, rfidData) => {
    const { card_id, user_id, is_active } = rfidData;

    // Créer le SET dynamiquement en fonction des champs fournis
    let setClauses = [];
    let values = [];
    let paramCount = 1;

    if (card_id !== undefined) {
        setClauses.push(`card_id = $${paramCount}`);
        values.push(card_id);
        paramCount++;
    }

    if (user_id !== undefined) {
        setClauses.push(`user_id = $${paramCount}`);
        values.push(user_id);
        paramCount++;
    }

    if (is_active !== undefined) {
        setClauses.push(`is_active = $${paramCount}`);
        values.push(is_active);
        paramCount++;
    }

    // Ajouter l'ID à la fin des valeurs
    values.push(id);

    // Si aucun champ à mettre à jour n'est fourni
    if (setClauses.length === 0) {
        throw new Error("No data provided for update");
    }

    // Construire la requête SQL
    const query = `UPDATE rfid_cards SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    // Mettre à jour la carte RFID
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
        throw new Error("RFID card not found");
    }

    // Si l'utilisateur est mis à jour, mettre à jour l'association user_rfid
    if (user_id !== undefined) {
        // Supprimer les associations existantes
        await client.query('DELETE FROM user_rfid WHERE rfid_id = $1', [id]);

        // Créer la nouvelle association si user_id n'est pas null
        if (user_id !== null) {
            await client.query('INSERT INTO user_rfid (user_id, rfid_id) VALUES ($1, $2)', [user_id, id]);
        }
    }

    return result.rows[0];
};

// Supprime une carte RFID de la base de données
const deleteRfid = async (id) => {
    // Les associations user_rfid seront supprimées automatiquement grâce à la contrainte ON DELETE CASCADE
    const query = 'DELETE FROM rfid_cards WHERE id = $1 RETURNING *';
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
        throw new Error("RFID card not found");
    }

    return result.rows[0];
};

// Récupère une carte RFID par son card_id
const getRfidByCardId = async (cardId) => {
    const query = `
        SELECT r.id, r.card_id, r.is_active, r.created_at, r.user_id,
               u.name, u.email, u.firstname
        FROM rfid_cards r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.card_id = $1`;

    const result = await client.query(query, [cardId]);
    return result.rows[0] || null;
};

const getRfidById = async (id) => {
    const query = `
        SELECT r.id, r.card_id, r.is_active, r.created_at, r.user_id
        FROM rfid_cards r
        WHERE r.id = $1`;

    const result = await client.query(query, [id]);
    return result.rows[0] || null;
};


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
        message:
            "Welcome, " + accessCode.firstname + " " + accessCode.name
    };
};

// Fonction pour enregistrer les tentatives d'accès
const logAccessAttempt = async (identifier, userId, success, message) => {
    const query = `
        INSERT INTO access_logs 
        (access_type, identifier, user_id, success, created_at) 
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`;

    // Utiliser 'rfid' ou une autre valeur qui est acceptée par la contrainte
    await client.query(query, ['rfid', identifier, userId, success]);
};

const allLogs = async() => {
    const query = await client.query('SELECT * FROM access_logs ORDER BY created_at DESC')
    return query.rows;
}

module.exports = {
    getAllRfids,
    createRfid,
    updateRfid,
    deleteRfid,
    getRfidByCardId,
    verifyAccess,
    allLogs,
    getRfidById
};