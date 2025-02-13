const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Endpoint untuk mendapatkan semua item
router.get("/", (req, res) => {
  console.log("GET /item accessed"); // Log akses

  db.query("SELECT * FROM item", (err, results) => {
    if (err) {
      console.error("Error fetching item:", err.message); // Log error
      return res.status(500).json({ error: err.message });
    }

    console.log("Query result:", results); // Log hasil query
    res.json(results);
  });
});

router.get("/by-toko-jenis/:toko_id/:jenis_id", (req, res) => {
  const { toko_id, jenis_id } = req.params;

  const query = `
    SELECT id, nama_item 
    FROM item 
    WHERE toko_id = ? AND jenis_id = ?
  `;

  db.query(query, [toko_id, jenis_id], (err, results) => {
    if (err) {
      console.error("Error fetching items:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


module.exports = router;
