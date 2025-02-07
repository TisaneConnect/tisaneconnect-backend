const express = require("express");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Add new process (default status: "Process")
router.post("/", verifyToken, (req, res) => {
    const { toko_id, ekspedisi_id, jenis_id, item_id, jumlah } = req.body;

    if (!toko_id || !ekspedisi_id || !jenis_id || !item_id || !jumlah) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = `INSERT INTO process (toko_id, ekspedisi_id, jenis_id, item_id, jumlah, status) 
                 VALUES (?, ?, ?, ?, ?, 'Process')`;

    db.query(sql, [toko_id, ekspedisi_id, jenis_id, item_id, jumlah], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error creating process", error: err });
        }
        res.status(201).json({ message: "Process created successfully", id: result.insertId });
    });
});

// Cancel process by admin
router.put("/cancel/:id", verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
    }

    const processId = req.params.id;

    const sql = "UPDATE process SET status = 'Cancelled' WHERE id = ?";
    db.query(sql, [processId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating process", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Process not found" });
        }
        res.status(200).json({ message: "Process cancelled successfully" });
    });
});

// Mark process as "Done" by user
router.put("/done/:id", verifyToken, (req, res) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ message: "Not authorized" });
    }

    const processId = req.params.id;

    const sql = "UPDATE process SET status = 'Done' WHERE id = ?";
    db.query(sql, [processId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating process", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Process not found" });
        }
        res.status(200).json({ message: "Process marked as Done successfully" });
    });
});

// Get all processes with sorting
router.get("/", verifyToken, (req, res) => {
    const { sortBy = "timestamp", order = "DESC" } = req.query;

    // Daftar kolom yang bisa digunakan untuk sorting
    const allowedSortFields = ["id", "toko_id", "ekspedisi_id", "jenis_id", "item_id", "status", "timestamp"];
    
    if (!allowedSortFields.includes(sortBy)) {
        return res.status(400).json({ message: "Invalid sort field" });
    }

    const sql = `SELECT * FROM process ORDER BY ${sortBy} ${order === "ASC" ? "ASC" : "DESC"}`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching processes", error: err });
        }
        res.status(200).json(results);
    });
});


module.exports = router;
