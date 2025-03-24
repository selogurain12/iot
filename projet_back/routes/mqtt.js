const express = require('express');
const router = express.Router();
const { publish, subscribe } = require('../services/mqttService');
const errorHandler = require('../utils/errorHandler');

/**
 * @swagger
 * tags:
 *   name: MQTT
 *   description: Gestion des commandes MQTT
 */

/**
 * @swagger
 * /mqtt/publish:
 *   post:
 *     summary: Publier un message sur un topic MQTT
 *     tags: [MQTT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - message
 *             properties:
 *               topic:
 *                 type: string
 *                 description: Topic sur lequel publier
 *               message:
 *                 type: string
 *                 description: Message à publier
 *     responses:
 *       200:
 *         description: Message publié avec succès
 *       400:
 *         description: Requête invalide
 *       500:
 *         description: Erreur serveur
 */
router.post('/publish', (req, res) => {
    try {
        const { topic, message } = req.body;

        if (!topic || !message) {
            return res.status(400).json({ error: 'Topic et message sont requis' });
        }

        publish(topic, message);
        res.status(200).json({ success: true, message: `Message publié sur ${topic}` });
    } catch (error) {
        errorHandler(res, error);
    }
});

/**
 * @swagger
 * /mqtt/door/open:
 *   post:
 *     summary: Ouvrir la porte via MQTT
 *     tags: [MQTT]
 *     responses:
 *       200:
 *         description: Commande envoyée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/door/open', (req, res) => {
    try {
        publish('door/command', { action: 'open', timestamp: new Date().toISOString() });
        res.status(200).json({ success: true, message: 'Commande d\'ouverture envoyée' });
    } catch (error) {
        errorHandler(res, error);
    }
});




module.exports = router;