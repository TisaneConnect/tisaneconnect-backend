const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Endpoint untuk mendapatkan semua toko
router.get("/", (req, res) => {
  console.log("GET /toko accessed"); // Log akses

  db.query("SELECT * FROM toko", (err, results) => {
    if (err) {
      console.error("Error fetching toko:", err.message); // Log error
      return res.status(500).json({ error: err.message });
    }

    console.log("Query result:", results); // Log hasil query
    res.json(results);
  });
});

module.exports = router;
