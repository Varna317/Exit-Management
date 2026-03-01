const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const studentMasterRoutes = require("./routes/studentMasterRoutes");

const libraryRoutes = require("./routes/libraryRoutes");
const hostelRoutes = require("./routes/hostelRoutes");
const accountsRoutes = require("./routes/accountsRoutes");
const hodRoutes = require("./routes/hodRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/studentmaster", studentMasterRoutes);
app.use("/api/students", studentRoutes);

app.use("/api/library", libraryRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/hod", hodRoutes);

mongoose
  .connect("mongodb://localhost:27017/studentExitDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
