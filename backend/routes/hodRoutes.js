const express = require("express");
const router = express.Router();
const HodRecord = require("../models/HodRecord");

// ✅ Get HOD record by email
router.get("/by-email/:email", async (req, res) => {
  try {
    const doc = await HodRecord.findOne({ email: req.params.email.toLowerCase() });
    if (!doc) return res.status(404).json({ message: "HOD record not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create/Update HOD record
router.post("/upsert", async (req, res) => {
  try {
    const { email, attendancePercent, projectSubmitted, labDues, remarks } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const saved = await HodRecord.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          attendancePercent: Number(attendancePercent ?? 0),
          projectSubmitted: Boolean(projectSubmitted ?? false),
          labDues: Number(labDues ?? 0),
          remarks: remarks ?? ""
        }
      },
      { new: true, upsert: true }
    );

    res.json({ message: "HOD record saved", data: saved });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
