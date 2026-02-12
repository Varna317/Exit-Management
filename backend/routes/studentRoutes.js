const express = require("express");
const router = express.Router();
const Student = require("../models/Student");



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

// ✅ Student submit/update (NO duplicates + workflow rules)
router.post("/submit", async (req, res) => {
  try {
    const { name, email, department, reason } = req.body;

    const existing = await Student.findOne({ email });

    // If final cleared, lock
    if (existing && existing.finalStatus === "Cleared") {
      return res.status(403).json({
        message: "Your clearance is already Completed. You cannot resubmit."
      });
    }

    // If final rejected, allow resubmit and reset everything to Pending
    if (existing && existing.finalStatus === "Rejected") {
      existing.name = name;
      existing.department = department;
      existing.reason = reason;

      existing.clearances.library.status = "Pending";
      existing.clearances.hostel.status = "Pending";
      existing.clearances.accounts.status = "Pending";
      existing.clearances.hod.status = "Pending";

      existing.finalStatus = "Pending";
      await existing.save();

      return res.json({
        message: "Resubmitted. All clearances reset to Pending.",
        data: existing
      });
    }

    // Pending or not exists => upsert, keep clearance as-is if already exists
    const saved = await Student.findOneAndUpdate(
      { email },
      {
        $set: { name, department, reason },
        $setOnInsert: {
          finalStatus: "Pending",
          clearances: {
            library: { status: "Pending" },
            hostel: { status: "Pending" },
            accounts: { status: "Pending" },
            hod: { status: "Pending" }
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
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists." });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all requests (Admin/Dept)
router.get("/all", async (req, res) => {
  try {
    const students = await Student.find().sort({ updatedAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update a specific clearance (Library/Hostel/Accounts/HOD/Admin)
router.put("/clearance/:id", async (req, res) => {
  try {
    const { key, status, updatedBy } = req.body; 
    // key = library|hostel|accounts|hod
    // status = Approved|Rejected

    if (!["library", "hostel", "accounts", "hod"].includes(key)) {
      return res.status(400).json({ message: "Invalid clearance key" });
    }

    const doc = await Student.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    // update that dept clearance
    doc.clearances[key].status = status;
    doc.clearances[key].updatedBy = updatedBy || "";
    doc.clearances[key].updatedAt = new Date();

    // update final status
    doc.finalStatus = computeFinalStatus(doc);

    await doc.save();
    res.json({ message: "Clearance updated", data: doc });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Student: Get my request by email
router.get("/myrequest/:email", async (req, res) => {
  try {
    const request = await Student.findOne({ email: req.params.email });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



const PDFDocument = require("pdfkit");

// ✅ Download Clearance Certificate (PDF)
router.get("/certificate/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student request not found" });
    }

    if (student.finalStatus !== "Cleared") {
      return res.status(403).json({ message: "Clearance not completed yet" });
    }

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Clearance_Certificate_${student.name}.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    // ====== PDF CONTENT ======
    doc.fontSize(18).text("COLLEGE CLEARANCE CERTIFICATE", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).text("Student Exit Management System", { align: "center" });

    doc.moveDown(1);
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });

    doc.moveDown(1);
    doc.fontSize(14).text("Student Details", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Name: ${student.name}`);
    doc.text(`Email: ${student.email}`);
    doc.text(`Department: ${student.department}`);
    doc.text(`Reason: ${student.reason}`);

    doc.moveDown(1);
    doc.fontSize(14).text("Clearance Status", { underline: true });
    doc.moveDown(0.5);

    const c = student.clearances || {};
    const rows = [
      ["Library", c.library?.status || "Pending"],
      ["Hostel", c.hostel?.status || "Pending"],
      ["Accounts", c.accounts?.status || "Pending"],
      ["HOD", c.hod?.status || "Pending"]
    ];

    // Simple table-like layout
    rows.forEach(([dept, status]) => {
      doc.fontSize(12).text(`${dept}: ${status}`);
    });

    doc.moveDown(1);
    doc.fontSize(14).text(`FINAL STATUS: ${student.finalStatus}`, { align: "center" });

    doc.moveDown(2);
    doc.fontSize(12).text("Signatures", { underline: true });
    doc.moveDown(1);

    doc.text("Library In-charge: ____________________");
    doc.moveDown(0.5);
    doc.text("Hostel Warden: ________________________");
    doc.moveDown(0.5);
    doc.text("Accounts Officer: ______________________");
    doc.moveDown(0.5);
    doc.text("Head of Department: ____________________");
    doc.moveDown(0.5);
    doc.text("Principal / Admin: _____________________");

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
