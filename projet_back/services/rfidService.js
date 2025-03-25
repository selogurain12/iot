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
            throw new Error(`L'utilisateur avec l'ID ${user_id} n'existe pas`);
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
        throw new Error("Aucune donnée fournie pour la mise à jour");
    }

    // Construire la requête SQL
    const query = `UPDATE rfid_cards SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    // Mettre à jour la carte RFID
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
        throw new Error("Carte RFID non trouvée");
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
        throw new Error("Carte RFID non trouvée");
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



module.exports = {
    getAllRfids,
    createRfid,
    updateRfid,
    deleteRfid,
    getRfidByCardId
};