const express = require("express");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

// Add new process (default status: "Process")
router.post("/", verifyToken, (req, res) => {
    const { toko_id, platform_id, ekspedisi_id, jenis_id, item_id, jumlah } = req.body;
    if (!toko_id || !platform_id || !ekspedisi_id || !jenis_id || !item_id || !jumlah) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const sql = `INSERT INTO process (toko_id, platform_id, ekspedisi_id, jenis_id, item_id, jumlah, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'Process')`;
    db.query(sql, [toko_id, platform_id, ekspedisi_id, jenis_id, item_id, jumlah], (err, result) => {
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
    const processId = req.params.id;
    console.log(`Received request to update process ${processId}`);

    const sql = "UPDATE process SET status = 'Done' WHERE id = ?";
    db.query(sql, [processId], (err, result) => {
        if (err) {
            console.error("Error updating process:", err);
            return res.status(500).json({ message: "Error updating process", error: err });
        }
        if (result.affectedRows === 0) {
            console.warn("Process not found:", processId);
            return res.status(404).json({ message: "Process not found" });
        }
        console.log("Process marked as Done successfully");
        res.status(200).json({ message: "Process marked as Done successfully" });
    });
});


// Get all processes with additional details
router.get("/", verifyToken, (req, res) => {
    const sql = `
        SELECT 
            p.id,
            p.jumlah,
            p.status,
            p.timestamp,
            t.nama_toko AS nama_toko,
            plat.nama_platform AS nama_platform,
            e.nama_ekspedisi AS nama_ekspedisi,
            j.jenis AS jenis,
            i.nama_item AS nama_item
        FROM process p
        JOIN toko t ON p.toko_id = t.id
        JOIN platform plat ON p.platform_id = plat.id
        JOIN ekspedisi e ON p.ekspedisi_id = e.id
        JOIN jenis j ON p.jenis_id = j.id
        JOIN item i ON p.item_id = i.id
        ORDER BY p.timestamp DESC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Error fetching processes", error: err });
        }
        console.log("API Response:", results);
        res.status(200).json(results);
    });
});

router.get("/done/:jenis", verifyToken, (req, res) => {
    const jenis = req.params.jenis;

    console.log("Endpoint /process/done/:jenis diakses dengan jenis:", jenis);
    console.log("Header Authorization:", req.headers.authorization);

    if (!jenis) {
        return res.status(400).json({ message: "Jenis tidak diberikan" });
    }

    const sql = `
        SELECT 
            p.id,
            p.jumlah,
            p.status,
            p.timestamp,
            t.nama_toko AS toko,
            plat.nama_platform AS platform,
            e.nama_ekspedisi AS ekspedisi,
            j.jenis AS jenis,
            i.nama_item AS namaItem
        FROM process p
        JOIN toko t ON p.toko_id = t.id
        JOIN platform plat ON p.platform_id = plat.id
        JOIN ekspedisi e ON p.ekspedisi_id = e.id
        JOIN jenis j ON p.jenis_id = j.id
        JOIN item i ON p.item_id = i.id
        WHERE p.status = 'Done' AND j.jenis = ?
        ORDER BY p.timestamp DESC;
    `;

    db.query(sql, [jenis], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Error fetching processes", error: err });
        }
        console.log("Query berhasil, jumlah hasil:", results.length);
        res.status(200).json(results);
    });
});


module.exports = router;

