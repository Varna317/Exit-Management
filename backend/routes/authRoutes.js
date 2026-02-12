const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SECRET_KEY = "mysecretkey";

// ======================
// REGISTER
// ======================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        res.json({ message: "User Registered Successfully" });

    } catch (error) {
        res.status(500).json({ message: "Registration Failed" });
    }
});

// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User Not Found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            SECRET_KEY,
            { expiresIn: "1d" }
        );

        // 🔥 IMPORTANT FIX HERE
        res.json({
            token,
            role: user.role,
            email: user.email
        });

    } catch (error) {
        res.status(500).json({ message: "Login Failed" });
    }
});

module.exports = router;
