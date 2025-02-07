const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Get all items sorted by name (A-Z)
router.get("/", (req, res) => {
    const sql = "SELECT * FROM item ORDER BY nama_item ASC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching items", error: err });
        }
        res.status(200).json(results);
    });
});

module.exports = router;
