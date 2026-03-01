// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { authMiddleware, allowRoles } = require("../middleware/authMiddleware");

// 🔐 Use environment variable in real projects
const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

// ======================
// REGISTER (STUDENT ONLY)
// ======================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const role = "student"; // ✅ Student only

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ enforce official college domain for student registration
    if (!email.endsWith("@bitsathy.ac.in")) {
      return res.status(400).json({
        message: "Please use your official college email (@bitsathy.ac.in)",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return res.status(201).json({ message: "Student Registered Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Registration Failed" });
  }
});

// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User Not Found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      role: user.role,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login Failed" });
  }
});

// ======================
// CREATE STAFF (ADMIN ONLY)
// ======================
router.post(
  "/create-staff",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      const allowedRoles = ["admin", "library", "hostel", "accounts", "hod"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
      });

      await newUser.save();

      return res.status(201).json({
        message: "Staff account created successfully",
        data: { email: normalizedEmail, role },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to create staff" });
    }
  }
);

module.exports = router;
