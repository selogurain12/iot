require("dotenv").config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
  });
  
client.connect()
.then(() => console.log("✅ Connecté à PostgreSQL"))
.catch(err => console.error("❌ Erreur de connexion à PostgreSQL :", err));

module.exports = client;