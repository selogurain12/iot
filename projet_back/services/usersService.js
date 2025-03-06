const pool = require("./db"); // Importez directement l'objet pool
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

// Récupère un utilisateur via son ID en base de données
const getUserByIdBd = async (id_bd) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT id, email, firstname, name, created_at, password, role FROM users WHERE id = $1',
            [id_bd]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Récupère une liste de User par l'email
const getUsersByEmail = async (email) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM users WHERE email LIKE $1',
            [email]
        );
        return result.rows;
    } finally {
        client.release();
    }
};

// Récupère tous les users
const getAllUsers = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users');
        console.log(result.rows);
        return result.rows;
    } finally {
        client.release();
    }
};

// Vérifie si un utilisateur existe
const userExists = async (email) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows.length > 0;
    } finally {
        client.release();
    }
};

// Ajoute un utilisateur
const createUser = async (email, firstname, name, password) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertResult = await client.query(
            'INSERT INTO users (email, firstname, name, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, firstname, name, hashedPassword, 'user']
        );
        return insertResult.rows[0];
    } finally {
        client.release();
    }
};

// Login a user and generate a token
const login = async ({ identifier, password }) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users WHERE email = $1', [identifier]);
        if (result.rows.length === 0) {
            throw new Error('Invalid email or password');
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        return token;
    } finally {
        client.release();
    }
};

module.exports = { getUserByIdBd, userExists, createUser, getUsersByEmail, getAllUsers };