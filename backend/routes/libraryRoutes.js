const express = require("express");
const router = express.Router();
const LibraryRecord = require("../models/LibraryRecord");

// GET by email
router.get("/by-email/:email", async (req, res) => {
  try {
    const rec = await LibraryRecord.findOne({ email: req.params.email });
    res.json(rec);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPSERT (add or update)
router.post("/upsert", async (req, res) => {
  try {
    const saved = await LibraryRecord.findOneAndUpdate(
      { email: req.body.email },
      { $set: req.body },
      { upsert: true, new: true }
    );
    res.json({ message: "Library record saved", data: saved });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
