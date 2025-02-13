const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Endpoint untuk mendapatkan semua ekspedisi
router.get("/", (req, res) => {
  console.log("GET /ekspedisi accessed");

  db.query("SELECT * FROM ekspedisi", (err, results) => {
    if (err) {
      console.error("Error fetching ekspedisi:", err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log("Query result:", results);
    res.json(results);
  });
});

// Endpoint untuk mendapatkan ekspedisi berdasarkan platform_id atau nama_platform
router.get("/by-platform/:platform_id", (req, res) => {
  const platformId = req.params.platform_id;
  const query = `
    SELECT ekspedisi.id, ekspedisi.nama_ekspedisi
    FROM ekspedisi
    JOIN platform ON ekspedisi.platform_id = platform.id
    WHERE platform.id = ?
  `;

  db.query(query, [platformId], (err, results) => {
    if (err) {
      console.error("Error fetching ekspedisi by platform:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


module.exports = router;
