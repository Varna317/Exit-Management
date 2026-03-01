const express = require("express");
const router = express.Router();
const HostelRecord = require("../models/HostelRecord");

// ✅ Get hostel record by email
router.get("/by-email/:email", async (req, res) => {
  try {
    const doc = await HostelRecord.findOne({ email: req.params.email.toLowerCase() });
    if (!doc) return res.status(404).json({ message: "Hostel record not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create/Update hostel record (admin can use this to insert)
router.post("/upsert", async (req, res) => {
  try {
    const { email, roomNo, dueAmount, messDue, roomVacated, remarks } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const saved = await HostelRecord.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          roomNo: roomNo ?? "",
          dueAmount: Number(dueAmount ?? 0),
          messDue: Number(messDue ?? 0),
          roomVacated: Boolean(roomVacated ?? false),
          remarks: remarks ?? ""
        }
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Hostel record saved", data: saved });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
