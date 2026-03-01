const mongoose = require("mongoose");

const studentMasterSchema = new mongoose.Schema(
  {
    regNo: { type: String, required: true },              // Register/Roll Number
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // College email
    department: { type: String, required: true },
    year: { type: String, default: "" },
    section: { type: String, default: "" },
    phone: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentMaster", studentMasterSchema);
