const mongoose = require("mongoose");

// ✅ Clearance sub-schema (for each department)
const clearanceSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    updatedBy: {
      type: String,
      default: ""
    },
    updatedAt: {
      type: Date,
      default: null
    },
    remarks: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

// ✅ Main Student Exit Request Schema
const studentSchema = new mongoose.Schema(
  {
    // 🔹 Verified student info (from StudentMaster)
    regNo: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    department: {
      type: String,
      required: true
    },
    year: {
      type: String,
      default: ""
    },
    section: {
      type: String,
      default: ""
    },

    // 🔹 Exit request info
    reason: {
      type: String,
      required: true
    },

    // 🔹 Department clearances
    clearances: {
      library: {
        type: clearanceSchema,
        default: () => ({})
      },
      hostel: {
        type: clearanceSchema,
        default: () => ({})
      },
      accounts: {
        type: clearanceSchema,
        default: () => ({})
      },
      hod: {
        type: clearanceSchema,
        default: () => ({})
      }
    },

    // 🔹 Final status (auto computed in route)
    finalStatus: {
      type: String,
      enum: ["Pending", "Cleared", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: true // automatically adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Student", studentSchema);
