const express = require('express');
const client = require('../services/db');
const router = express.Router();
const { getUserByIdBd, userExists, createUser, getUsersByEmail, getAllUsers } = require('../services/usersService');
const errorHandler = require("../utils/errorHandler");
const sql = require("../services/db");

// Route pour récupérer tous les utilisateurs
router.get("/", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users.rows);
    } catch (error) {
        errorHandler(res, error);
    }
});

// Route pour ajouter un utilisateur
router.post("/", async (req, res) => {
    try {
        const { email, firstname, name, created_at, password } = req.body;
        if (!email) return res.status(400).json({ error: "email est requis" });
        if (!firstname) return res.status(400).json({ error: "firstname est requis" });
        if (!name) return res.status(400).json({ error: "name est requis" });
        if (!created_at) return res.status(400).json({ error: "created_at est requis" });
        if (!password) return res.status(400).json({ error: "password est requis" });

        // check if user already exists
        const exists = await userExists(email);
        if (exists) return res.status(400).json({ error: "Cet utilisateur existe déjà" });

        const newUser = await createUser(email, firstname, name, created_at, password);
        res.status(201).json(newUser[0]);
    } catch (error) {
        errorHandler(res, error);
    }
});

// Route pour récupérer un utilisateur par ID
router.get("/:id", async (req, res) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "l'id est requis" });
        const user = await getUserByIdBd(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        errorHandler(res, error);
    }
});

// Route pour récupérer une liste d'utilisateurs par nom
router.get("/email/:email", async (req, res) => {
    try {
        const users = await getUsersByEmail(req.params.email);
        res.json(users);
    } catch (error) {
        errorHandler(res, error);
    }
});

// Route pour vérifier si un utilisateur existe
router.get("/exists/:email", async (req, res) => {
    try {
        const exists = await userExists(req.params.email);
        res.json({ exists });
    } catch (error) {
        errorHandler(res, error);
    }
});

module.exports = router;