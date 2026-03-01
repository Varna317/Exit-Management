const mongoose = require("mongoose");

const HostelRecordSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    roomNo: { type: String, default: "" },
    dueAmount: { type: Number, default: 0 },   // hostel due
    messDue: { type: Number, default: 0 },     // mess due
    roomVacated: { type: Boolean, default: false },

    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HostelRecord", HostelRecordSchema);
