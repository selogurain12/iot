const express = require('express');
const router = express.Router();
const { updateCodePinUser, createUserPin, disabledUserPin } = require('../services/accessService');
const errorHandler = require("../utils/errorHandler");

/**
 * @swagger
 * /access/:
 *   put:
 *     summary: Update a code pin for a user
 *     tags: [Access]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               createCode:
 *                 type: string
 *                 description: The code pin to create
 *     responses:
 *       200:
 *         description: Code pin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       500:
 *         description: Internal server error
 */
router.put("/", async (req, res) => {
    try {
        await updateCodePinUser(req.body.userId, req.body.createCode);
        res.json({ message: "Code pin updated" });
    } catch (error) {
        errorHandler(res, error);
    }
});

/**
 * @swagger
 * /access/:
 *   post:
 *     summary: Create a code pin for a user
 *     tags: [Access]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               createCode:
 *                 type: string
 *                 description: The code pin to create
 *     responses:
 *       200:
 *         description: Code pin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       500:
 *         description: Internal server error
 */
router.post("/", async (req, res) => {
    try {
        await createUserPin(req.body.userId, req.body.createCode);
        res.json({ message: "Code pin created" });
    } catch (error) {
        errorHandler(res, error);
    }
});

/**
 * @swagger
 * /access/disable:
 *   put:
 *     summary: Disable a code pin for a user
 *     tags: [Access]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *     responses:
 *       200:
 *         description: Code pin disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       500:
 *         description: Internal server error
 */
router.put("/", async (req, res) => {
    try {
        await disabledUserPin(req.body.userId);
        res.json({ message: "Code pin disabled" });
    } catch (error) {
        errorHandler(res, error);
    }
});
module.exports = router;