const express = require('express');
const router = express.Router();
const { getAllModules, pairOrUnpairModules, getModulePairing } = require('../services/moduleService');
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

/**
 * @swagger
 * /module/pairing:
 *   get:
 *     summary: Retrieve the pairing information of modules
 *     tags: [Modules]
 *     responses:
 *       200:
 *         description: A list of module pairings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   moduleInId:
 *                     type: string
 *                     description: The ID of the input module
 *                   moduleOutId:
 *                     type: string
 *                     description: The ID of the output module
 *       500:
 *         description: Internal server error
 */
router.get("/pairing", async (req, res) => {
    try {
        const modules = await getModulePairing();
        res.json(modules);
    } catch (error) {
        errorHandler(res, error);
    }
});

/**
 * @swagger
 * /module/:
 *   put:
 *     summary: Pair two modules together
 *     tags: [Modules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleInId:
 *                 type: string
 *                 description: The ID of the input module
 *               moduleOutId:
 *                 type: string
 *                 description: The ID of the output module
 *     responses:
 *       200:
 *         description: Successfully paired modules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                 message:
 *                   type: string
 *                   description: Additional information
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put("/", async (req, res) => {
    try {
        console.log(req.body);
        await pairOrUnpairModules(req.body.moduleInId, req.body.moduleOutId);
        res.status(200).json({
            success: true,
            message: "Modules apparayés avec succès"
        });
    } catch (error) {
        errorHandler(res, error);
    }
});

module.exports = router;