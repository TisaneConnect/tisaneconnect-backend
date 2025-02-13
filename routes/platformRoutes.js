const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Endpoint untuk mendapatkan semua platform
router.get("/", (req, res) => {
  console.log("GET /platform accessed");

  db.query("SELECT * FROM platform", (err, results) => {
    if (err) {
      console.error("Error fetching platform:", err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log("Query result:", results);
    res.json(results);
  });
});

router.get("/by-toko/:toko_id", (req, res) => {
  const tokoId = req.params.toko_id;
  const query = `
    SELECT id, nama_platform FROM platform WHERE toko_id = ?
  `;

  db.query(query, [tokoId], (err, results) => {
    if (err) {
      console.error("Error fetching platform by toko:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


module.exports = router;
