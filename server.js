const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Koneksi ke database MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123Ferri!",
    database: "rawconnect",
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database.");
});

// Route untuk login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    console.log("Login request received for username:", username);

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching user.", error: err });
        }

        if (results.length === 0) {
            console.log("User not found:", username);
            return res.status(404).json({ message: "User not found." });
        }

        const user = results[0];
        console.log("User found:", user);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid password for user:", username);
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            "secretkey",
            { expiresIn: "1h" }
        );

        console.log("Login successful for user:", username);
        res.status(200).json({ message: "Login successful!", token });
    });
});

// Route untuk mendapatkan profil user
app.get("/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Token not provided." });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, "secretkey", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token." });
        }
        res.status(200).json({ user });
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
