const mongoose = require("mongoose");

const HodRecordSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    attendancePercent: { type: Number, default: 0 },
    projectSubmitted: { type: Boolean, default: false },
    labDues: { type: Number, default: 0 },

    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HodRecord", HodRecordSchema);
