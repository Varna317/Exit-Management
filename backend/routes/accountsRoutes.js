const express = require("express");
const router = express.Router();
const AccountsRecord = require("../models/AccountsRecord");

// ✅ Get accounts record by email
router.get("/by-email/:email", async (req, res) => {
  try {
    const doc = await AccountsRecord.findOne({ email: req.params.email.toLowerCase() });
    if (!doc) return res.status(404).json({ message: "Accounts record not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create/Update accounts record
router.post("/upsert", async (req, res) => {
  try {
    const { email, feeDue, fine, remarks } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const saved = await AccountsRecord.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          feeDue: Number(feeDue ?? 0),
          fine: Number(fine ?? 0),
          remarks: remarks ?? ""
        }
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Accounts record saved", data: saved });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
