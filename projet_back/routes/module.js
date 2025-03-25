const express = require('express');
const router = express.Router();
const { getAllModules } = require('../services/moduleService');
const errorHandler = require("../utils/errorHandler");

/**
 * @swagger
 * /module/:
 *   get:
 *     summary: Retrieve a list of all modules
 *     tags: [Modules]
 *     responses:
 *       200:
 *         description: A list of modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The module ID
 *                   name:
 *                     type: string
 *                     description: The module name
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
    try {
        const modules = await getAllModules();
        res.json(modules);
    } catch (error) {
        errorHandler(res, error);
    }
});


module.exports = router;