const express = require("express");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users (hanya superadmin)
router.get("/", verifyToken, (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Not authorized" });
    }

    const sql = "SELECT id, username, password, role FROM users";
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching users", error: err });
        }
        res.status(200).json(results);
    });
});

// Add new user
router.post("/", verifyToken, (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Not authorized" });
    }

    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    db.query(sql, [username, password, role], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error creating user", error: err });
        }
        res.status(201).json({ message: "User created successfully", id: result.insertId });
    });
});

module.exports = router;
