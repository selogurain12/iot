const express = require('express');
const router = express.Router();
const { getAllRfids, createRfid, updateRfid, deleteRfid, getRfidByCardId, getRfidById, verifyAccess, allLogs } = require('../services/rfidService');
const errorHandler = require("../utils/errorHandler");

/**
 * @swagger
 * tags:
 *   name: RFID
 *   description: RFID badge management
 */

/**
 * @swagger
 * /rfid:
 *   get:
 *     summary: Get all RFID cards
 *     tags: [RFID]
 *     responses:
 *       200:
 *         description: List of RFID cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: Unique identifier of the RFID card
 *                   card_id:
 *                     type: string
 *                     description: Unique code of the RFID card
 *                   user_id:
 *                     type: string
 *                     format: uuid
 *                     description: ID of the user associated with the card
 *                   is_active:
 *                     type: boolean
 *                     description: Indicates if the card is active
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Date when the card was created
 *                   name:
 *                     type: string
 *                     description: Name of the associated user
 *                   firstname:
 *                     type: string
 *                     description: First name of the associated user
 *                   email:
 *                     type: string
 *                     description: Email of the associated user
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
    try {
        const rfids = await getAllRfids();
        res.json(rfids);
    } catch (error) {
        errorHandler(res, error);
    }
});

/**
 * @swagger
 * /rfid/card/{cardId}:
 *   get:
 *     summary: Get an RFID card by its code
 *     tags: [RFID]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         schema:
 *           type: string
 *         required: true
 *         description: RFID card code
 *     responses:
 *       200:
 *         description: RFID card found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: Unique identifier of the RFID card
 *                 card_id:
 *                   type: string
 *                   description: Unique code of the RFID card
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   description: ID of the user associated with the card
 *                 is_active:
 *                   type: boolean
 *                   description: Indicates if the card is active
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date when the card was created
 *                 name:
 *                   type: string
 *                   description: Name of the associated user
 *                 firstname:
 *                   type: string
 *                   description: First name of the associated user
 *                 email:
 *                   type: string
 *                   description: Email of the associated user
 *       404:
 *         description: RFID card not found
 *       500:
 *         description: Server error
 */
router.get("/card/:cardId", async (req, res) => {
    try {
        const rfid = await getRfidByCardId(req.params.cardId);
        if (!rfid) {
            return res.status(404).json({ error: "RFID card not found" });
        }
        res.json(rfid);
    } catch (error) {
        errorHandler(res, error);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const rfid = await getRfidById(req.params.id);
        if (!rfid) {
            return res.status(404).json({ error: "RFID card not found" });
        }
        res.json(rfid);
    } catch (error) {
        errorHandler(res, error);
    }
});

/**
 * @swagger
 * /rfid:
 *   post:
 *     summary: Create a new RFID card
 *     tags: [RFID]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - card_id
 *             properties:
 *               card_id:
 *                 type: string
 *                 description: Unique code of the RFID card
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to associate with the card
 *               is_active:
 *                 type: boolean
 *                 description: Card activation status
 *     responses:
 *       201:
 *         description: RFID card created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: Unique identifier of the RFID card
 *                 card_id:
 *                   type: string
 *                   description: Unique code of the RFID card
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   description: ID of the user associated with the card
 *                 is_active:
 *                   type: boolean
 *                   description: Indicates if the card is active
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date when the card was created
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
    try {
        if (!req.body.card_id) {
            return res.status(400).json({ error: "Card code is required" });
        }
        const rfid = await createRfid(req.body);
        res.status(201).json(rfid);
    } catch (error) {
        errorHandler(res, error);
    }
});

/**
 * @swagger
 * /rfid/{id}:
 *   put:
 *     summary: Update an RFID card
 *     tags: [RFID]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Unique identifier of the RFID card
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               card_id:
 *                 type: string
 *                 description: New RFID card code
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the new user to associate
 *               is_active:
 *                 type: boolean
 *                 description: New activation status
 *     responses:
 *       200:
 *         description: RFID card updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: Unique identifier of the RFID card
 *                 card_id:
 *                   type: string
 *                   description: Unique code of the RFID card
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   description: ID of the user associated with the card
 *                 is_active:
 *                   type: boolean
 *                   description: Indicates if the card is active
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date when the card was created
 *       400:
 *         description: Invalid data
 *       404:
 *         description: RFID card not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
    try {
        const rfid = await updateRfid(req.params.id, req.body);
        res.json(rfid);
    } catch (error) {
        if (error.message === "RFID card not found") {
            res.status(404).json({ error: error.message });
        } else {
            errorHandler(res, error);
        }
    }
});

/**
 * @swagger
 * /rfid/{id}:
 *   delete:
 *     summary: Delete an RFID card
 *     tags: [RFID]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Unique identifier of the RFID card
 *     responses:
 *       200:
 *         description: RFID card deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: Unique identifier of the RFID card
 *                 card_id:
 *                   type: string
 *                   description: Unique code of the RFID card
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   description: ID of the user associated with the card
 *                 is_active:
 *                   type: boolean
 *                   description: Indicates if the card is active
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date when the card was created
 *       404:
 *         description: RFID card not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
    try {
        const rfid = await deleteRfid(req.params.id);
        res.json(rfid);
    } catch (error) {
        if (error.message === "RFID card not found") {
            res.status(404).json({ error: error.message });
        } else {
            errorHandler(res, error);
        }
    }
});


/**
 * @swagger
 * /rfid/verify-access:
 *   post:
 *     summary: Verify access of an RFID card with a PIN code
 *     tags: [RFID]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardId
 *               - pinCode
 *             properties:
 *               cardId:
 *                 type: string
 *                 description: Unique code of the RFID card
 *               pinCode:
 *                 type: string
 *                 description: PIN code associated with the user
 *     responses:
 *       200:
 *         description: Access verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access:
 *                   type: boolean
 *                   description: Indicates if access is authorized
 *                 message:
 *                   type: string
 *                   description: Explanatory message for the result
 *       400:
 *         description: Missing data
 *       404:
 *         description: RFID card not found
 *       500:
 *         description: Server error
 */
router.post("/verify-access", async (req, res) => {
    try {
        const { cardId, pinCode } = req.body;
        const result = await verifyAccess(cardId, pinCode);
        res.json(result);
    } catch (error) {
        errorHandler(res, error);
    }
});

router.get("/access_logs", async (req, res) => {
    try {
     const access = await allLogs();
     console.log(access)
      res.json(access);
    } catch (error) {
        errorHandler(res, error);
    }
  });
module.exports = router;