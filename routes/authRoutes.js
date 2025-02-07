const express = require("express");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Login route
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching user.", error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = results[0];

        if (password !== user.password) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            "secretkey",
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful!", token });
    });
});

module.exports = router;
