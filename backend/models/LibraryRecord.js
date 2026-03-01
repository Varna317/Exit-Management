const mongoose = require("mongoose");

const LibraryRecordSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    dueAmount: { type: Number, default: 0 },
    booksIssued: { type: Number, default: 0 },
    allBooksReturned: { type: Boolean, default: true },

    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LibraryRecord", LibraryRecordSchema);
