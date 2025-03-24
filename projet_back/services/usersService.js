const client = require("./db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;


// Récupère un utilisateur via son ID en base de données
const getUserByIdBd = async (id) => {
    const user = await client.query('SELECT * FROM users WHERE id = $1::uuid', [id]);
    return user;
};

// Récupère une liste de User par le name
const getUsersByEmail = async (email) => {
    try {
        const result = await client.query(
            'SELECT * FROM users WHERE email LIKE $1',
            [email]
        );
        return result.rows;
    } catch (error) {
        throw new Error(error);
    }
};

// Récupère tous les users
const getAllUsers = async () => {
    try {
        const result = await client.query('SELECT * FROM users');
        return result.rows;
    } catch (error) {
        throw new Error(error);
    }
};

// Vérifie si un utilisateur existe
const userExists = async (email) => {
    try {
        const result = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows.length > 0;
    } catch (error) {
        throw new Error(error);
    }
};

// Met à jour un utilisateur
const updateUser = async (id, email, firstname, name, password) => {
    await client.query(`
        UPDATE "users"
        SET firstname = $3, name = $4, password = $5, email = $2
        WHERE id = $1;`, [id, email, firstname, name, password]);
};

// Ajoute un utilisateur
const createUser = async ({ email, firstname, name, password }) => {
    try {
        // Vérifier si l'utilisateur existe déjà
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            throw new Error('User already exists');
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer le nouvel utilisateur
        const insertResult = await client.query(
            'INSERT INTO users (email, firstname, name, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, firstname, name, hashedPassword, 'user']
        );

        const user = insertResult.rows[0];

        // Générer un token pour le nouvel utilisateur
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        // Retourner l'utilisateur et le token
        return { token };
    } catch (error) {
        throw new Error(error.message);
    }
};

const deleteUser = async (id) => {
    await client.query(`DELETE FROM "users" WHERE id = $1`, [id]);
}

// Login a user and generate a token
const login = async ({ identifier, password }) => {
    try {
        console.log(identifier + ' ' + password);
        const result = await client.query('SELECT * FROM users WHERE email = $1', [identifier]);
        if (result.rows.length === 0) {
            throw new Error('Invalid email or password');
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        return token;
    } catch (error) {
        throw new Error(error);
    }
};

// Middleware to verify token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
}

function verifyTokenAdmin(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.log(decoded);

        if (decoded.role !== 'admin') {

            return res.status(403).json({ error: 'Unauthorized' });
        }

        req.user = decoded;
        next();
    });
}

module.exports = { getUserByIdBd, userExists, createUser, getUsersByEmail, getAllUsers, login, verifyToken, verifyTokenAdmin, updateUser, deleteUser };
