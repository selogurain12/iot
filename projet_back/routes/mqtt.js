const express = require('express');
const router = express.Router();
const { publish, subscribe } = require('../services/mqttService');
const errorHandler = require('../utils/errorHandler');

/**
 * @swagger
 * tags:
 *   name: MQTT
 *   description: MQTT Commands Management
 */

/**
 * @swagger
 * /mqtt/publish:
 *   post:
 *     summary: Publish a message to an MQTT topic
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
 *                 description: Topic to publish to
 *               message:
 *                 type: string
 *                 description: Message to publish
 *     responses:
 *       200:
 *         description: Message published successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/publish', (req, res) => {
    try {
        const { topic, message } = req.body;

        if (!topic || !message) {
            return res.status(400).json({ error: 'Topic and message are required' });
        }

        publish(topic, message);
        res.status(200).json({ success: true, message: `Message published to ${topic}` });
    } catch (error) {
        errorHandler(res, error);
    }
});

module.exports = router;
