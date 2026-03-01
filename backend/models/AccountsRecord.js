const mongoose = require("mongoose");

const AccountsRecordSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    feeDue: { type: Number, default: 0 },
    fine: { type: Number, default: 0 },

    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccountsRecord", AccountsRecordSchema);
