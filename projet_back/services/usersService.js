const client = require("./db");
const sql = require("./db");


// Récupère un utilisateur via son ID en base de données
const getUserByIdBd = async (id) => {
    const user = await client.query('SELECT * FROM users WHERE id = $1::uuid', [id]);
    return user;
};



// Récupère une liste de User par le name
const getUsersByEmail = async (email) => {
    const users = await sql`
        SELECT * FROM "users" WHERE email LIKE ${email};
      `;
    return users;
};

// Récupère tous les users
const getAllUsers = async () => {
    return await client.query('SELECT * FROM users');
};

// Vérifie si un utilisateur existe
const userExists = async (email) => {
    const user = await sql`
        SELECT * FROM "users" WHERE email = ${email};
      `;
    return user.length > 0;
};

// Met à jour un utilisateur
const updateUser = async (id, email, firstname, name, password) => {
    await client.query(`
        UPDATE "users"
        SET firstname = $3, name = $4, password = $5, email = $2
        WHERE id = $1;`, [id, email, firstname, name, password]);
};

// Ajoute un utilisateur
const createUser = async (email, firstname, name, password) => {
    return await sql`
      INSERT INTO "users" (email, firstname, name, password, role)
      VALUES (${email},  ${firstname}, ${name}, ${password}, 'user')
      RETURNING *`;
};

const deleteUser = async (id) => {
    await client.query(`DELETE FROM "users" WHERE id = $1`, [id]);
}

module.exports = { getUserByIdBd, userExists, createUser, getUsersByEmail, getAllUsers, updateUser, deleteUser };
