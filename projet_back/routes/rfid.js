const express = require('express');
const router = express.Router();
const { getAllRfids } = require('../services/rfidService');
const errorHandler = require("../utils/errorHandler");
const sql = require("../services/db");

router.get("/", async (req, res) => {
    try {
        const rfids = await getAllRfids();
        res.json(rfids.rows);
    } catch (error) {
        errorHandler(res, error);
    }
});

module.exports = router;