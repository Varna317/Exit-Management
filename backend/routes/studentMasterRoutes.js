const express = require("express");
const router = express.Router();
const StudentMaster = require("../models/StudentMaster");

// ✅ Add a student into StudentMaster (for mini project / admin use)
router.post("/add", async (req, res) => {
  try {
    const { regNo, name, email, department, year, section, phone } = req.body;

    const exists = await StudentMaster.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Student already exists in master DB" });
    }

    const student = new StudentMaster({
      regNo,
      name,
      email,
      department,
      year,
      section,
      phone
    });

    await student.save();
    res.json({ message: "Student added to Master DB", data: student });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch student details by email (used everywhere)
router.get("/by-email/:email", async (req, res) => {
  try {
    const student = await StudentMaster.findOne({ email: req.params.email });

    if (!student) {
      return res.status(404).json({ message: "Student not found in Master DB" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
