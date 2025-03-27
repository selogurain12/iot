const express = require('express');
const router = express.Router();
const { getUserByIdBd, userExists, createUser, getUsersByEmail, getAllUsers, login, verifyToken, verifyTokenAdmin, updateUser, deleteUser, decryptAES } = require('../services/usersService');
const errorHandler = require("../utils/errorHandler");

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
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

// Route to add a user
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
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
 *         description: User successfully created and logged in
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
 *         description: Invalid request or user already exists
 *       500:
 *         description: Server error
 */
router.post("/register", async (req, res) => {
    try {
        const { email, firstname, name, password } = req.body;
        if (!email) return res.status(400).json({ error: "email is required" });
        if (!firstname) return res.status(400).json({ error: "firstname is required" });
        if (!name) return res.status(400).json({ error: "name is required" });
        if (!password) return res.status(400).json({ error: "password is required" });

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
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
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
 *         description: User successfully updated
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
 *         description: Invalid request
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/update/:id", async (req, res) => {
    try {
        const { email, firstname, name, password } = req.body;
        if (!email) return res.status(400).json({ error: "email is required" });
        if (!firstname) return res.status(400).json({ error: "firstname is required" });
        if (!name) return res.status(400).json({ error: "name is required" });
        if (!password) return res.status(400).json({ error: "password is required" });

        const user = await getUserByIdBd(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

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
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       204:
 *         description: User successfully deleted
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/delete/:id", async (req, res) => {
    try {
        const user = await getUserByIdBd(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        deleteUser(req.params.id);
        res.status(204).send();
    } catch (error) {
        errorHandler(res, error);
    }
});

// Route to get a user by ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "id is required" });
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

// Route to get a list of users by email
router.get("/email/:email", verifyToken, async (req, res) => {
    try {
        const users = await getUsersByEmail(req.params.email);
        res.json(users);
    } catch (error) {
        errorHandler(res, error);
    }
});

// Route to check if a user exists
router.get("/exists/:email", async (req, res) => {
    try {
        const exists = await userExists(req.params.email);
        res.json({ exists });
    } catch (error) {
        errorHandler(res, error);
    }
});

// Route for login
router.post('/login', async (req, res) => {
    try {
        const token = await login(req.body);
        res.status(200).json({ token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

module.exports = router;
