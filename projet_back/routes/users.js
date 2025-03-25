const express = require('express');
const router = express.Router();
const { getUserByIdBd, userExists, createUser, getUsersByEmail, getAllUsers, login, verifyToken, verifyTokenAdmin, updateUser, deleteUser, decryptAES } = require('../services/usersService');
const errorHandler = require("../utils/errorHandler");

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Liste de tous les utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "b123e456-78cd-90ef-12gh-3456789ijkl"
 *                   name:
 *                     type: string
 *                     example: "Alice"
 *                   email:
 *                     type: string
 *                     example: "alice@example.com"
 */
router.get("/", verifyTokenAdmin, async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        errorHandler(res, error);
    }
});

// Route pour ajouter un utilisateur
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstname
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               firstname:
 *                 type: string
 *                 example: "John"
 *               name:
 *                 type: string
 *                 example: "Doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès et connecté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "b123e456-78cd-90ef-12gh-3456789ijkl"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     firstname:
 *                       type: string
 *                       example: "John"
 *                     name:
 *                       type: string
 *                       example: "Doe"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Requête invalide ou utilisateur déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post("/register", async (req, res) => {
    try {
        const { email, firstname, name, password } = req.body;
        if (!email) return res.status(400).json({ error: "email est requis" });
        if (!firstname) return res.status(400).json({ error: "firstname est requis" });
        if (!name) return res.status(400).json({ error: "name est requis" });
        if (!password) return res.status(400).json({ error: "password est requis" });

        const result = await createUser({ email, firstname, name, password });
        res.status(201).json(result);
    } catch (error) {
        errorHandler(res, error);
    }
});

/**
 * @swagger
 * /users/update/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "alice@example.com"
 *               firstname:
 *                 type: string
 *                 example: "Alice"
 *               name:
 *                 type: string
 *                 example: "Doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "b123e456-78cd-90ef-12gh-3456789ijkl"
 *                 email:
 *                   type: string
 *                   example: "alice@example.com"
 *                 firstname:
 *                   type: string
 *                   example: "Alice"
 *                 name:
 *                   type: string
 *                   example: "Doe"
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put("/update/:id", async (req, res) => {
    try {
        const { email, firstname, name, password } = req.body;
        if (!email) return res.status(400).json({ error: "email est requis" });
        if (!firstname) return res.status(400).json({ error: "firstname est requis" });
        if (!name) return res.status(400).json({ error: "name est requis" });
        if (!password) return res.status(400).json({ error: "password est requis" });

        const user = await getUserByIdBd(req.params.id);
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        const updatedUser = await updateUser(req.params.id, email, firstname, name, password);
        res.json(updatedUser);
    } catch (error) {
        errorHandler(res, error);
    }
});

/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur à supprimer
 *     responses:
 *       204:
 *         description: Utilisateur supprimé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/delete/:id", async (req, res) => {
    try {
        const user = await getUserByIdBd(req.params.id);
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        deleteUser(req.params.id);
        res.status(204).send();
    } catch (error) {
        errorHandler(res, error);
    }
});

// Route pour récupérer un utilisateur par ID
router.get("/:id", verifyToken, async (req, res) => {
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

// Route pour récupérer une liste d'utilisateurs par email
router.get("/email/:email", verifyToken, async (req, res) => {
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

// Route pour se connecter
router.post('/login', async (req, res) => {
    try {
        const token = await login(req.body);
        res.status(200).json({ token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

module.exports = router;
