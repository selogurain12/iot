const express = require('express');
const router = express.Router();
const { getAllRfids, createRfid, updateRfid, deleteRfid, getRfidByCardId, verifyAccess, allLogs } = require('../services/rfidService');
const errorHandler = require("../utils/errorHandler");

/**
 * @swagger
 * tags:
 *   name: RFID
 *   description: Gestion des badges RFID
 */

/**
 * @swagger
 * /rfid:
 *   get:
 *     summary: Récupérer toutes les cartes RFID
 *     tags: [RFID]
 *     responses:
 *       200:
 *         description: Liste des cartes RFID
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
 *                     description: Identifiant unique de la carte RFID
 *                   card_id:
 *                     type: string
 *                     description: Code unique de la carte RFID
 *                   user_id:
 *                     type: string
 *                     format: uuid
 *                     description: ID de l'utilisateur associé à la carte
 *                   is_active:
 *                     type: boolean
 *                     description: Indique si la carte est active
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Date de création de la carte
 *                   name:
 *                     type: string
 *                     description: Nom de l'utilisateur associé
 *                   firstname:
 *                     type: string
 *                     description: Prénom de l'utilisateur associé
 *                   email:
 *                     type: string
 *                     description: Email de l'utilisateur associé
 *       500:
 *         description: Erreur serveur
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
 *     summary: Récupérer une carte RFID par son code
 *     tags: [RFID]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Code de la carte RFID
 *     responses:
 *       200:
 *         description: Carte RFID trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: Identifiant unique de la carte RFID
 *                 card_id:
 *                   type: string
 *                   description: Code unique de la carte RFID
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   description: ID de l'utilisateur associé à la carte
 *                 is_active:
 *                   type: boolean
 *                   description: Indique si la carte est active
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date de création de la carte
 *                 name:
 *                   type: string
 *                   description: Nom de l'utilisateur associé
 *                 firstname:
 *                   type: string
 *                   description: Prénom de l'utilisateur associé
 *                 email:
 *                   type: string
 *                   description: Email de l'utilisateur associé
 *       404:
 *         description: Carte RFID non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/card/:cardId", async (req, res) => {
    try {
        const rfid = await getRfidByCardId(req.params.cardId);
        if (!rfid) {
            return res.status(404).json({ error: "Carte RFID non trouvée" });
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
 *     summary: Créer une nouvelle carte RFID
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
 *                 description: Code unique de la carte RFID
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de l'utilisateur à associer à la carte
 *               is_active:
 *                 type: boolean
 *                 description: Statut d'activation de la carte
 *     responses:
 *       201:
 *         description: Carte RFID créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: Identifiant unique de la carte RFID
 *                 card_id:
 *                   type: string
 *                   description: Code unique de la carte RFID
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   description: ID de l'utilisateur associé à la carte
 *                 is_active:
 *                   type: boolean
 *                   description: Indique si la carte est active
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date de création de la carte
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post("/", async (req, res) => {
    try {
        if (!req.body.card_id) {
            return res.status(400).json({ error: "Le code de la carte est requis" });
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
 *     summary: Mettre à jour une carte RFID
 *     tags: [RFID]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Identifiant unique de la carte RFID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               card_id:
 *                 type: string
 *                 description: Nouveau code de la carte RFID
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID du nouvel utilisateur à associer
 *               is_active:
 *                 type: boolean
 *                 description: Nouveau statut d'activation
 *     responses:
 *       200:
 *         description: Carte RFID mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: Identifiant unique de la carte RFID
 *                 card_id:
 *                   type: string
 *                   description: Code unique de la carte RFID
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   description: ID de l'utilisateur associé à la carte
 *                 is_active:
 *                   type: boolean
 *                   description: Indique si la carte est active
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date de création de la carte
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Carte RFID non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", async (req, res) => {
    try {
        const rfid = await updateRfid(req.params.id, req.body);
        res.json(rfid);
    } catch (error) {
        if (error.message === "Carte RFID non trouvée") {
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
 *     summary: Supprimer une carte RFID
 *     tags: [RFID]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Identifiant unique de la carte RFID
 *     responses:
 *       200:
 *         description: Carte RFID supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: Identifiant unique de la carte RFID
 *                 card_id:
 *                   type: string
 *                   description: Code unique de la carte RFID
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   description: ID de l'utilisateur associé à la carte
 *                 is_active:
 *                   type: boolean
 *                   description: Indique si la carte est active
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date de création de la carte
 *       404:
 *         description: Carte RFID non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", async (req, res) => {
    try {
        const rfid = await deleteRfid(req.params.id);
        res.json(rfid);
    } catch (error) {
        if (error.message === "Carte RFID non trouvée") {
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
 *     summary: Vérifier l'accès d'une carte RFID avec un code PIN
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
 *                 description: Code unique de la carte RFID
 *               pinCode:
 *                 type: string
 *                 description: Code PIN associé à l'utilisateur
 *     responses:
 *       200:
 *         description: Résultat de la vérification d'accès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access:
 *                   type: boolean
 *                   description: Indique si l'accès est autorisé
 *                 message:
 *                   type: string
 *                   description: Message explicatif du résultat
 *       400:
 *         description: Données manquantes
 *       404:
 *         description: Carte RFID non trouvée
 *       500:
 *         description: Erreur serveur
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