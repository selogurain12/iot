const client = require("./db");

// Récupère un utilisateur via son ID en base de données
const getAllRfids = async (id_bd) => {
    const rfids = await client.query('SELECT * FROM rfid_cards');
    return rfids;
};

module.exports = { getAllRfids };
