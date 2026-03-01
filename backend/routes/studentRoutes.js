const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const StudentMaster = require("../models/StudentMaster");
const PDFDocument = require("pdfkit");

const { authMiddleware, allowRoles } = require("../middleware/authMiddleware");

// helper: compute finalStatus
function computeFinalStatus(doc) {
  const c = doc.clearances || {};
  const statuses = ["library", "hostel", "accounts", "hod"].map(
    (k) => c?.[k]?.status || "Pending"
  );

  if (statuses.includes("Rejected")) return "Rejected";
  if (statuses.every((s) => s === "Approved")) return "Cleared";
  return "Pending";
}

// ✅ helper: role -> deptKey
function deptKeyFromRole(role) {
  if (["library", "hostel", "accounts", "hod"].includes(role)) return role;
  return null;
}

// ===============================
// ✅ STUDENT SUBMIT / UPDATE
// ===============================
router.post(
  "/submit",
  authMiddleware,
  allowRoles("student"),
  async (req, res) => {
    try {
      const { email, reason } = req.body;

      if (!email) return res.status(400).json({ message: "Email is required" });
      if (!reason) return res.status(400).json({ message: "Reason is required" });

      // ✅ SECURITY: student can submit only their own email
      if (req.user?.email && req.user.email !== email) {
        return res.status(403).json({ message: "You can submit only your own request" });
      }

      // ✅ verified details from StudentMaster
      const master = await StudentMaster.findOne({ email });
      if (!master) {
        return res.status(400).json({ message: "Student not found in Master DB" });
      }

      const verifiedData = {
        name: master.name,
        email: master.email,
        department: master.department,
        regNo: master.regNo || "",
        year: master.year || "",
        section: master.section || ""
      };

      const existing = await Student.findOne({ email });

      // If final cleared, lock
      if (existing && existing.finalStatus === "Cleared") {
        return res.status(403).json({
          message: "Your clearance is already completed. You cannot resubmit."
        });
      }

      // If final rejected -> reset and resubmit
      if (existing && existing.finalStatus === "Rejected") {
        existing.name = verifiedData.name;
        existing.department = verifiedData.department;
        existing.regNo = verifiedData.regNo;
        existing.year = verifiedData.year;
        existing.section = verifiedData.section;

        existing.reason = reason;

        ["library", "hostel", "accounts", "hod"].forEach((k) => {
          existing.clearances[k].status = "Pending";
          existing.clearances[k].updatedBy = "";
          existing.clearances[k].updatedAt = null;
          existing.clearances[k].remarks = "";
        });

        existing.finalStatus = "Pending";
        await existing.save();

        return res.json({
          message: "Resubmitted. All clearances reset to Pending.",
          data: existing
        });
      }

      // pending or not exists -> upsert
      const saved = await Student.findOneAndUpdate(
        { email },
        {
          $set: {
            name: verifiedData.name,
            department: verifiedData.department,
            regNo: verifiedData.regNo,
            year: verifiedData.year,
            section: verifiedData.section,
            reason
          },
          $setOnInsert: {
            email: verifiedData.email,
            finalStatus: "Pending",
            clearances: {
              library: { status: "Pending", updatedBy: "", updatedAt: null, remarks: "" },
              hostel: { status: "Pending", updatedBy: "", updatedAt: null, remarks: "" },
              accounts: { status: "Pending", updatedBy: "", updatedAt: null, remarks: "" },
              hod: { status: "Pending", updatedBy: "", updatedAt: null, remarks: "" }
            }
          }
        },
        { new: true, upsert: true }
      );

      res.json({
        message: existing ? "Request updated." : "Request submitted.",
        data: saved
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ===============================
// ✅ GET ALL REQUESTS (ADMIN + DEPT)
// ===============================
router.get(
  "/all",
  authMiddleware,
  allowRoles("admin", "library", "hostel", "accounts", "hod"),
  async (req, res) => {
    try {
      const students = await Student.find().sort({ updatedAt: -1 });
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ===============================
// ✅ UPDATE CLEARANCE (ADMIN + DEPT)
// ===============================
router.put(
  "/clearance/:id",
  authMiddleware,
  allowRoles("admin", "library", "hostel", "accounts", "hod"),
  async (req, res) => {
    try {
      let { key, status, remarks } = req.body;

      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // ✅ SECURITY: non-admin can update ONLY their own deptKey
      if (req.user.role !== "admin") {
        key = deptKeyFromRole(req.user.role);
      }

      if (!["library", "hostel", "accounts", "hod"].includes(key)) {
        return res.status(400).json({ message: "Invalid clearance key" });
      }

      // ✅ Require remarks on Reject (good practice)
      if (status === "Rejected" && !(remarks || "").trim()) {
        return res.status(400).json({ message: "Remarks are required for rejection" });
      }

      const doc = await Student.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });

      doc.clearances[key].status = status;
      doc.clearances[key].updatedBy = req.user.role; // ✅ always correct
      doc.clearances[key].updatedAt = new Date();
      doc.clearances[key].remarks = (remarks || "").trim();

      doc.finalStatus = computeFinalStatus(doc);

      await doc.save();
      res.json({ message: "Clearance updated", data: doc });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ===============================
// ✅ STUDENT: GET MY REQUEST
// ===============================
router.get(
  "/myrequest/:email",
  authMiddleware,
  allowRoles("student"),
  async (req, res) => {
    try {
      const email = req.params.email;

      // ✅ SECURITY: student can view only their own request
      if (req.user?.email && req.user.email !== email) {
        return res.status(403).json({ message: "Access denied" });
      }

      const request = await Student.findOne({ email });
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ===============================
// ✅ STUDENT: DOWNLOAD CERTIFICATE
// ===============================
router.get(
  "/certificate/:email",
  authMiddleware,
  allowRoles("student"),
  async (req, res) => {
    try {
      const email = req.params.email;

      // ✅ SECURITY
      if (req.user?.email && req.user.email !== email) {
        return res.status(403).json({ message: "Access denied" });
      }

      const student = await Student.findOne({ email });
      if (!student) return res.status(404).json({ message: "Student request not found" });

      if (student.finalStatus !== "Cleared") {
        return res.status(403).json({ message: "Clearance not completed yet" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Clearance_Certificate_${student.name}.pdf"`
      );

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      doc.pipe(res);

      doc.fontSize(18).text("COLLEGE CLEARANCE CERTIFICATE", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).text("Student Exit Management System", { align: "center" });

      doc.moveDown(1);
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });

      doc.moveDown(1);
      doc.fontSize(14).text("Student Details", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12).text(`Name: ${student.name}`);
      doc.text(`Reg No: ${student.regNo || "-"}`);
      doc.text(`Email: ${student.email}`);
      doc.text(`Department: ${student.department}`);
      doc.text(`Year/Section: ${(student.year || "-")} / ${(student.section || "-")}`);
      doc.text(`Reason: ${student.reason}`);

      doc.moveDown(1);
      doc.fontSize(14).text("Clearance Status", { underline: true });
      doc.moveDown(0.5);

      const c = student.clearances || {};
      const rows = [
        ["Library", c.library?.status || "Pending", c.library?.remarks || ""],
        ["Hostel", c.hostel?.status || "Pending", c.hostel?.remarks || ""],
        ["Accounts", c.accounts?.status || "Pending", c.accounts?.remarks || ""],
        ["HOD", c.hod?.status || "Pending", c.hod?.remarks || ""]
      ];

      rows.forEach(([dept, status, remarks]) => {
        doc.fontSize(12).text(`${dept}: ${status}${remarks ? `  (Remarks: ${remarks})` : ""}`);
      });

      doc.moveDown(1);
      doc.fontSize(14).text(`FINAL STATUS: ${student.finalStatus}`, { align: "center" });

      doc.end();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
