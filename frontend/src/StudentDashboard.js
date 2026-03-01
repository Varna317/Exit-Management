import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import API from "./api";

/* Keep departments outside component */
const DEPTS = ["library", "hostel", "accounts", "hod"];

/* ---------- UI Helper ---------- */

const Badge = ({ tone = "neutral", children }) => {
  const styles = {
    success: { background: "#dcfce7", color: "#166534" },
    danger: { background: "#fee2e2", color: "#991b1b" },
    warn: { background: "#fef3c7", color: "#92400e" },
    neutral: { background: "#f3f4f6", color: "#374151" },
  }[tone];

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        textTransform: "uppercase",
        ...styles,
      }}
    >
      {children}
    </span>
  );
};

const statusTone = (s) => {
  if (s === "Approved" || s === "Cleared") return "success";
  if (s === "Rejected") return "danger";
  if (s === "Pending") return "warn";
  return "neutral";
};

/* ---------- Component ---------- */

function StudentDashboard() {
  const navigate = useNavigate();

  const [studentProfile, setStudentProfile] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ---------- Auth Check ---------- */
  useEffect(() => {
    const role = (localStorage.getItem("role") || "").toLowerCase();
    const email = localStorage.getItem("email");

    if (!role || role !== "student") {
      navigate("/");
      return;
    }

    if (email) fetchAll(email);
  }, [navigate]);

  /* ---------- Fetch Profile + Request ---------- */
  const fetchAll = async (email) => {
    try {
      setLoading(true);
      setMessage("");

      const [profileRes, requestRes] = await Promise.allSettled([
        API.get(`/studentmaster/by-email/${email}`),
        API.get(`/students/myrequest/${email}`),
      ]);

      if (profileRes.status === "fulfilled") {
        setStudentProfile(profileRes.value.data);
      }

      if (requestRes.status === "fulfilled") {
        setMyRequest(requestRes.value.data);
        if (requestRes.value.data?.reason) {
          setReason(requestRes.value.data.reason);
        }
      } else {
        setMyRequest(null);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Submit Request ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const email = localStorage.getItem("email");

      const res = await API.post("/students/submit", {
        email,
        reason,
      });

      setMessage(res.data.message || "Request submitted successfully");
      fetchAll(email);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Submission failed");
    }
  };

  /* ---------- Download Certificate ---------- */
  const downloadCertificate = async () => {
    try {
      const email = localStorage.getItem("email");
      const res = await API.get(`/students/certificate/${email}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Clearance_Certificate.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setMessage("Unable to download certificate");
    }
  };

  /* ---------- SAFE Memoized Clearances (NO WARNING) ---------- */
  const clearances = useMemo(() => {
    return myRequest?.clearances ?? null;
  }, [myRequest]);

  /* ---------- Progress Calculation ---------- */
  const approvedCount = useMemo(() => {
    if (!clearances) return 0;

    return DEPTS.filter(
      (d) => clearances[d]?.status === "Approved"
    ).length;
  }, [clearances]);

  const progress = Math.round((approvedCount / 4) * 100);
  const finalStatus = myRequest?.finalStatus || "Not Submitted";
  const isCleared = finalStatus === "Cleared";

  /* ---------- UI ---------- */

  return (
    <>
      <Navbar title="Student Dashboard" />

      <div className="page">

        {/* Header */}
        <div className="cardx p-3 mb-3">
          <div className="h1x">Clearance Overview</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Track your department approvals and exit request.
          </div>
        </div>

        {/* Profile + Status */}
        <div className="row g-3">

          {/* Profile */}
          <div className="col-lg-5">
            <div className="cardx p-3">
              <div style={{ fontWeight: 900, marginBottom: 10 }}>
                Student Profile
              </div>

              {!studentProfile ? (
                <div className="muted">
                  {loading ? "Loading..." : "Profile not found"}
                </div>
              ) : (
                <>
                  <p><b>Name:</b> {studentProfile.name}</p>
                  <p><b>Reg No:</b> {studentProfile.regNo}</p>
                  <p><b>Email:</b> {studentProfile.email}</p>
                  <p><b>Department:</b> {studentProfile.department}</p>
                  <p><b>Year / Section:</b> {studentProfile.year} / {studentProfile.section}</p>
                </>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="col-lg-7">
            <div className="cardx p-3">
              <div style={{ fontWeight: 900 }}>Final Status</div>

              <div style={{ marginTop: 10 }}>
                <Badge tone={statusTone(finalStatus)}>
                  {finalStatus}
                </Badge>
              </div>

              <div style={{ marginTop: 15 }}>
                <div className="muted" style={{ fontSize: 12 }}>
                  Progress ({approvedCount}/4 Approved)
                </div>

                <div
                  style={{
                    height: 10,
                    background: "#e5e7eb",
                    borderRadius: 999,
                    marginTop: 5,
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      background: "#06b6d4",
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>

              {isCleared && (
                <button
                  className="btnx"
                  style={{ marginTop: 15 }}
                  onClick={downloadCertificate}
                >
                  Download Certificate
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Department Cards */}
        <div className="cardx p-3 mt-3">
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Department Clearances
          </div>

          <div className="row g-3">
            {DEPTS.map((dept) => {
              const st = clearances?.[dept]?.status || "Pending";

              return (
                <div key={dept} className="col-md-3">
                  <div className="cardx p-3" style={{ boxShadow: "none" }}>
                    <div style={{ fontWeight: 900, textTransform: "uppercase" }}>
                      {dept}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Badge tone={statusTone(st)}>{st}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exit Request */}
        <div className="cardx p-3 mt-3">
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Exit Request
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              className="inputx"
              style={{ minHeight: 100 }}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isCleared}
              required
            />

            <button
              className="btnx"
              style={{ width: "100%", marginTop: 10 }}
              disabled={isCleared}
            >
              Submit / Update Request
            </button>
          </form>

          {message && (
            <div style={{ marginTop: 10, fontWeight: 700 }}>
              {message}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default StudentDashboard;