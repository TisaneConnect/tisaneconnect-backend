const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "rawconnect",
    password: "rawconnect",
    database: "rawconnect",
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database.");
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Token not provided." });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token." });
        }
        req.user = decoded;
        next();
    });
};

// Login route
app.post("/login", (req, res) => {
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

        // Langsung verifikasi password dengan string plaintext
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

// Get all users
app.get("/users", verifyToken, (req, res) => {
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
app.post("/users", verifyToken, (req, res) => {
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

// Update user
app.put("/users/:id", verifyToken, (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Not authorized" });
    }

    const { username, password, role } = req.body;
    const userId = req.params.id;

    const sql = "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?";
    const params = [username, password, role, userId];

    db.query(sql, params, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating user", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully" });
    });
});

// Delete user
app.delete("/users/:id", verifyToken, (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Not authorized" });
    }

    const userId = req.params.id;
    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting user", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
