import Navbar from "./Navbar";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

/* Small UI helpers (same style as redesigned dashboards) */
const Badge = ({ tone = "neutral", children }) => {
  const styles = {
    success: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
    danger: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
    warn: { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
    info: { background: "#e0f2fe", color: "#075985", border: "1px solid #bae6fd" },
    neutral: { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" },
    primary: { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  }[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
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

const Banner = ({ type = "info", text, onClose }) => {
  if (!text) return null;
  const map = {
    info: { bg: "#e0f2fe", border: "#bae6fd", fg: "#075985" },
    success: { bg: "#dcfce7", border: "#bbf7d0", fg: "#166534" },
    warn: { bg: "#fef3c7", border: "#fde68a", fg: "#92400e" },
    danger: { bg: "#fee2e2", border: "#fecaca", fg: "#991b1b" },
  }[type];

  return (
    <div
      style={{
        background: map.bg,
        border: `1px solid ${map.border}`,
        color: map.fg,
        borderRadius: 14,
        padding: "10px 12px",
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        alignItems: "center",
        marginBottom: 12,
        fontWeight: 800,
      }}
    >
      <div style={{ fontSize: 13 }}>{text}</div>
      {onClose ? (
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            fontWeight: 900,
            cursor: "pointer",
            color: map.fg,
          }}
          aria-label="Close"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
};

const formatDate = (dateVal) => {
  if (!dateVal) return "-";
  return new Date(dateVal).toLocaleString();
};

const statusTone = (s) => {
  if (s === "Cleared") return "success";
  if (s === "Rejected") return "danger";
  if (s === "Pending") return "warn";
  return "neutral";
};

const deptTone = (s) => {
  if (s === "Approved") return "success";
  if (s === "Rejected") return "danger";
  return "warn";
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [finalFilter, setFinalFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const [banner, setBanner] = useState({ type: "info", text: "" });
  const showBanner = (type, text) => setBanner({ type, text });

  useEffect(() => {
    const role = (localStorage.getItem("role") || "").trim().toLowerCase();
    if (!role || role !== "admin") {
      navigate("/");
      return;
    }
    fetchRequests();
    // eslint-disable-next-line
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setBanner({ type: "info", text: "" });

      const res = await API.get("/students/all");
      setRequests(res.data || []);
    } catch (error) {
      console.log(error);
      showBanner("danger", error?.response?.data?.message || "Error fetching requests");
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (email, studentName) => {
    try {
      setBanner({ type: "info", text: "" });

      const res = await API.get(`/students/certificate/${email}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Clearance_Certificate_${studentName || "Student"}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      showBanner("success", "Certificate downloaded.");
    } catch (error) {
      console.log(error);
      showBanner("danger", error?.response?.data?.message || "Unable to download certificate");
    }
  };

  const counts = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => (r.finalStatus || "Pending") === "Pending").length,
      cleared: requests.filter((r) => r.finalStatus === "Cleared").length,
      rejected: requests.filter((r) => r.finalStatus === "Rejected").length,
    };
  }, [requests]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return requests
      .filter((r) => finalFilter === "All" || (r.finalStatus || "Pending") === finalFilter)
      .filter((r) => {
        if (!s) return true;
        return (
          r.name?.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s) ||
          r.department?.toLowerCase().includes(s) ||
          r.regNo?.toLowerCase?.().includes?.(s)
        );
      });
  }, [requests, search, finalFilter]);

  const activityLog = useMemo(() => {
    const list = [...requests];
    list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    return list.slice(0, 6);
  }, [requests]);

  return (
    <>
      <Navbar title="Admin Dashboard" />

      <div className="page">
        <Banner
          type={banner.type}
          text={banner.text}
          onClose={() => setBanner({ type: "info", text: "" })}
        />

        {/* Header */}
        <div className="cardx p-3 mb-3" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="h1x" style={{ marginBottom: 2 }}>Clearance Control Center</div>
            <div className="muted" style={{ fontSize: 13 }}>
              View all exit requests, check department approvals, and download certificates for cleared students.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Badge tone="primary">Admin</Badge>
            <button className="btnx" onClick={fetchRequests} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="row g-3 mb-3">
          {[
            { label: "Total", value: counts.total, tone: "neutral" },
            { label: "Pending", value: counts.pending, tone: "warn" },
            { label: "Cleared", value: counts.cleared, tone: "success" },
            { label: "Rejected", value: counts.rejected, tone: "danger" },
          ].map((c, i) => (
            <div className="col-md-3" key={i}>
              <div className="cardx p-3">
                <div className="muted" style={{ fontSize: 12, fontWeight: 900 }}>{c.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>{c.value}</div>
                  <Badge tone={c.tone}>{c.label}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity + Filters */}
        <div className="row g-3 mb-3">
          <div className="col-lg-5">
            <div className="cardx p-3" style={{ height: "100%" }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>🕒 Recent Activity</div>
              {activityLog.length === 0 ? (
                <div className="muted" style={{ fontSize: 13 }}>No activity yet</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {activityLog.map((r) => (
                    <div key={r._id} className="cardx p-3" style={{ boxShadow: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 900 }}>{r.name}</div>
                        <Badge tone={statusTone(r.finalStatus || "Pending")}>
                          {r.finalStatus || "Pending"}
                        </Badge>
                      </div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                        {r.email} • {formatDate(r.updatedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="cardx p-3" style={{ height: "100%" }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Filters</div>

              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    className="inputx"
                    placeholder="Search by name / email / department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={finalFilter}
                    onChange={(e) => setFinalFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Cleared">Cleared</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <button className="btn btn-outline-primary w-100" onClick={fetchRequests} disabled={loading}>
                    Reload
                  </button>
                </div>
              </div>

              <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                Showing <b>{filtered.length}</b> of <b>{requests.length}</b> records
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="cardx p-3">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="cardx p-3">
            <div style={{ fontWeight: 900, marginBottom: 6 }}>No records found</div>
            <div className="muted" style={{ fontSize: 13 }}>Try changing filters or refresh.</div>
          </div>
        ) : (
          filtered.map((r) => {
            const c = r.clearances || {};
            const final = r.finalStatus || "Pending";

            return (
              <div key={r._id} className="cardx p-3 mb-3">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>{r.name}</div>
                      <Badge tone={statusTone(final)}>{final}</Badge>
                      {r.department ? <Badge tone="primary">{r.department}</Badge> : null}
                      {r.regNo ? <Badge tone="neutral">RegNo: {r.regNo}</Badge> : null}
                    </div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{r.email}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div className="muted" style={{ fontSize: 12, fontWeight: 900 }}>Last Updated</div>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{formatDate(r.updatedAt)}</div>
                  </div>
                </div>

                <div style={{ height: 1, background: "#e5e7eb", margin: "14px 0" }} />

                <div className="row g-3">
                  <div className="col-lg-5">
                    <div className="cardx p-3" style={{ height: "100%" }}>
                      <div className="muted" style={{ fontSize: 12, fontWeight: 900 }}>Exit Reason</div>
                      <div style={{ fontWeight: 900, marginTop: 6 }}>{r.reason || "-"}</div>
                    </div>
                  </div>

                  <div className="col-lg-7">
                    <div className="cardx p-3" style={{ height: "100%" }}>
                      <div style={{ fontWeight: 900, marginBottom: 10 }}>Department Clearances</div>

                      <div style={{ overflowX: "auto" }}>
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>Department</th>
                              <th>Status</th>
                              <th>Updated By</th>
                              <th>Last Updated</th>
                            </tr>
                          </thead>
                          <tbody>
                            {["library", "hostel", "accounts", "hod"].map((dept) => (
                              <tr key={dept}>
                                <td style={{ fontWeight: 900 }}>{dept.toUpperCase()}</td>
                                <td>
                                  <Badge tone={deptTone(c[dept]?.status || "Pending")}>
                                    {c[dept]?.status || "Pending"}
                                  </Badge>
                                </td>
                                <td>{(c[dept]?.updatedBy || "-").toUpperCase()}</td>
                                <td>{formatDate(c[dept]?.updatedAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {final === "Cleared" ? (
                        <button
                          className="btnx"
                          style={{ marginTop: 12 }}
                          onClick={() => downloadCertificate(r.email, r.name)}
                        >
                          ⬇ Download Clearance Certificate
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default AdminDashboard;
