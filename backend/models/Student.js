const mongoose = require("mongoose");

const deptStatusSchema = new mongoose.Schema(
  {
    status: { type: String, default: "Pending" }, // Pending / Approved / Rejected
    updatedBy: { type: String, default: "" },
    updatedAt: { type: Date }
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // one student = one doc
    department: { type: String, required: true },
    reason: { type: String, required: true },

    // ✅ Department-wise clearances
    clearances: {
      library: { type: deptStatusSchema, default: () => ({}) },
      hostel: { type: deptStatusSchema, default: () => ({}) },
      accounts: { type: deptStatusSchema, default: () => ({}) },
      hod: { type: deptStatusSchema, default: () => ({}) }
    },

    // ✅ Final overall status
    finalStatus: { type: String, default: "Pending" } // Pending / Cleared / Rejected
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
