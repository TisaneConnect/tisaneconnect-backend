const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "rawconnect",
    password: "rawconnect",
    database: "rawconnect",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database.");
});

module.exports = db;
