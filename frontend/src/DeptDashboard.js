import Navbar from "./Navbar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

/* ✅ Clean UI renderer for each department record (NO JSON display) */
function DeptDetailsCard({ deptKey, rec }) {
  if (!rec) {
    return (
      <div className="alert alert-warning mb-0">
        No {deptKey.toUpperCase()} record found for this student.
      </div>
    );
  }

  // ✅ Library UI
  if (deptKey === "library") {
    const due = rec.dueAmount ?? 0;
    const booksIssued = rec.booksIssued ?? 0;
    const returned = rec.allBooksReturned === true;

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Due Amount</span>
            <span className={`badge ${due > 0 ? "bg-danger" : "bg-success"}`}>
              ₹ {due}
            </span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Books Issued</span>
            <span className="fw-semibold">{booksIssued}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">All Books Returned</span>
            <span className={`badge ${returned ? "bg-success" : "bg-danger"}`}>
              {returned ? "YES" : "NO"}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-muted">Record Remarks</div>
            <div className="fw-semibold">{rec.remarks || "-"}</div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Hostel UI
  if (deptKey === "hostel") {
    const due = rec.dueAmount ?? 0;
    const messDue = rec.messDue ?? 0;
    const room = rec.roomNo || "-";
    const vacated = rec.roomVacated === true;

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Room No</span>
            <span className="fw-semibold">{room}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Hostel Due</span>
            <span className={`badge ${due > 0 ? "bg-danger" : "bg-success"}`}>
              ₹ {due}
            </span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Mess Due</span>
            <span className={`badge ${messDue > 0 ? "bg-danger" : "bg-success"}`}>
              ₹ {messDue}
            </span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Room Vacated</span>
            <span className={`badge ${vacated ? "bg-success" : "bg-danger"}`}>
              {vacated ? "YES" : "NO"}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-muted">Record Remarks</div>
            <div className="fw-semibold">{rec.remarks || "-"}</div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Accounts UI
  if (deptKey === "accounts") {
    const feeDue = rec.feeDue ?? 0;
    const fine = rec.fine ?? 0;
    const total = feeDue + fine;

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Fee Due</span>
            <span className={`badge ${feeDue > 0 ? "bg-danger" : "bg-success"}`}>
              ₹ {feeDue}
            </span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Fine</span>
            <span className={`badge ${fine > 0 ? "bg-danger" : "bg-success"}`}>
              ₹ {fine}
            </span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Total Pending</span>
            <span className={`badge ${total > 0 ? "bg-danger" : "bg-success"}`}>
              ₹ {total}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-muted">Record Remarks</div>
            <div className="fw-semibold">{rec.remarks || "-"}</div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ HOD UI
  if (deptKey === "hod") {
    const attendance = rec.attendancePercent ?? "-";
    const projectSubmitted = rec.projectSubmitted === true;
    const labDues = rec.labDues ?? 0;

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Attendance %</span>
            <span className="fw-semibold">{attendance}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Project Submitted</span>
            <span className={`badge ${projectSubmitted ? "bg-success" : "bg-danger"}`}>
              {projectSubmitted ? "YES" : "NO"}
            </span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Lab Dues</span>
            <span className={`badge ${labDues > 0 ? "bg-danger" : "bg-success"}`}>
              ₹ {labDues}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-muted">Record Remarks</div>
            <div className="fw-semibold">{rec.remarks || "-"}</div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="alert alert-secondary mb-0">No UI for {deptKey}</div>;
}

/* ✅ Approval rules per department (this is what was blocking you earlier) */
function canApprove(deptKey, rec) {
  if (!rec) return { ok: false, msg: "No department record found." };

  if (deptKey === "library") {
    const due = rec.dueAmount ?? 0;
    const returned = rec.allBooksReturned === true;
    if (due > 0) return { ok: false, msg: "Cannot approve: Library due pending." };
    if (!returned) return { ok: false, msg: "Cannot approve: Books not returned." };
    return { ok: true, msg: "" };
  }

  if (deptKey === "hostel") {
    const due = rec.dueAmount ?? 0;
    const messDue = rec.messDue ?? 0;
    const vacated = rec.roomVacated === true;
    if (due > 0) return { ok: false, msg: "Cannot approve: Hostel due pending." };
    if (messDue > 0) return { ok: false, msg: "Cannot approve: Mess due pending." };
    if (!vacated) return { ok: false, msg: "Cannot approve: Room not vacated." };
    return { ok: true, msg: "" };
  }

  if (deptKey === "accounts") {
    const feeDue = rec.feeDue ?? 0;
    const fine = rec.fine ?? 0;
    const total = feeDue + fine;
    if (total > 0) return { ok: false, msg: "Cannot approve: Fees/Fine pending." };
    return { ok: true, msg: "" };
  }

  if (deptKey === "hod") {
    const attendance = rec.attendancePercent ?? 0;
    const projectSubmitted = rec.projectSubmitted === true;
    const labDues = rec.labDues ?? 0;

    if (attendance < 75) return { ok: false, msg: "Cannot approve: Attendance below 75%." };
    if (!projectSubmitted) return { ok: false, msg: "Cannot approve: Project not submitted." };
    if (labDues > 0) return { ok: false, msg: "Cannot approve: Lab dues pending." };
    return { ok: true, msg: "" };
  }

  return { ok: true, msg: "" };
}

function DeptDashboard({ deptKey, title }) {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [deptMap, setDeptMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [search, setSearch] = useState("");
  const [showOnlyPending, setShowOnlyPending] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/students/all");
      const list = res.data || [];

      const filtered = list.filter((r) => {
        const myStatus = r?.clearances?.[deptKey]?.status || "Pending";
        const final = r.finalStatus || "Pending";
        if (final !== "Pending") return false;
        if (showOnlyPending) return myStatus === "Pending";
        return true;
      });

      setRequests(filtered);

      const map = {};
      await Promise.all(
        filtered.map(async (r) => {
          try {
            const dr = await API.get(`/${deptKey}/by-email/${r.email}`);
            map[r.email] = dr.data;
          } catch {
            map[r.email] = null;
          }
        })
      );
      setDeptMap(map);
    } catch (e) {
      alert("Error fetching requests");
    } finally {
      setLoading(false);
    }
  }, [deptKey, showOnlyPending]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role !== deptKey) {
      navigate("/");
      return;
    }
    fetchRequests();
  }, [navigate, deptKey, fetchRequests]);

  const updateClearance = async (requestId, status, deptRec) => {
    try {
      const remarks = (remarksMap[requestId] || "").trim();

      // ✅ Reject requires remarks
      if (status === "Rejected" && !remarks) {
        alert("Please enter remarks before rejecting.");
        return;
      }

      // ✅ Approve is clickable always, but block approval with clear message if not eligible
      if (status === "Approved") {
        const check = canApprove(deptKey, deptRec);
        if (!check.ok) {
          alert(check.msg);
          return;
        }
      }

      await API.put(`/students/clearance/${requestId}`, {
        key: deptKey,
        status,
        updatedBy: deptKey,
        remarks
      });

      alert(`${deptKey.toUpperCase()} marked as ${status}`);
      fetchRequests();
    } catch (err) {
      alert(err?.response?.data?.message || "Error updating clearance");
    }
  };

  const filteredUI = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return requests;

    return requests.filter((r) => {
      const name = (r.name || "").toLowerCase();
      const email = (r.email || "").toLowerCase();
      const dept = (r.department || "").toLowerCase();
      const regNo = (r.regNo || "").toLowerCase();
      return name.includes(s) || email.includes(s) || dept.includes(s) || regNo.includes(s);
    });
  }, [requests, search]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <Navbar title={title} />

      <div className="page">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h4 className="m-0">{title}</h4>
            <div className="text-muted" style={{ fontSize: 13 }}>
              Approve works on click for all dashboards. Reject requires remarks.
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={fetchRequests}>
              Refresh
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="card p-3 shadow-sm mb-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-7">
              <input
                className="form-control"
                placeholder="Search by name / email / regNo / department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <button
                className={"btn w-100 " + (showOnlyPending ? "btn-warning" : "btn-outline-warning")}
                onClick={() => setShowOnlyPending((p) => !p)}
              >
                {showOnlyPending ? "Pending Only" : "Show All"}
              </button>
            </div>

            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={fetchRequests}>
                Reload
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="alert alert-info">Loading...</div>
        ) : filteredUI.length === 0 ? (
          <div className="alert alert-success">No requests found 🎉</div>
        ) : (
          filteredUI.map((r) => {
            const deptRec = deptMap[r.email];

            return (
              <div key={r._id} className="card shadow-sm p-3 mb-3">
                {/* Student basic */}
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1">{r.name}</h5>
                    <div className="text-muted">{r.email}</div>
                    <div className="mt-2">
                      <span className="badge bg-light text-dark border me-2">
                        Dept: {r.department}
                      </span>
                      {r.regNo && (
                        <span className="badge bg-light text-dark border me-2">
                          RegNo: {r.regNo}
                        </span>
                      )}
                      {r.year && r.section && (
                        <span className="badge bg-light text-dark border">
                          {r.year} / {r.section}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-muted" style={{ fontSize: 13 }}>
                    Request Updated: {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "-"}
                  </div>
                </div>

                <hr />

                <div className="row g-3">
                  {/* Reason */}
                  <div className="col-md-4">
                    <div className="text-muted">Exit Reason</div>
                    <div className="fw-semibold">{r.reason}</div>
                  </div>

                  {/* Dept details */}
                  <div className="col-md-5">
                    <h6 className="mb-2">{deptKey.toUpperCase()} Details</h6>
                    <DeptDetailsCard deptKey={deptKey} rec={deptRec} />
                  </div>

                  {/* Actions */}
                  <div className="col-md-3">
                    <h6 className="mb-2">Action</h6>

                    <label className="form-label text-muted mb-1">
                      Remarks (required on Reject)
                    </label>
                    <input
                      className="form-control mb-2"
                      placeholder="Example: Pay due / Submit project"
                      value={remarksMap[r._id] || ""}
                      onChange={(e) =>
                        setRemarksMap((prev) => ({ ...prev, [r._id]: e.target.value }))
                      }
                    />

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-success"
                        onClick={() => updateClearance(r._id, "Approved", deptRec)}
                      >
                        Approve
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={() => updateClearance(r._id, "Rejected", deptRec)}
                      >
                        Reject
                      </button>
                    </div>

                    {/* Helpful hint */}
                    <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                      * Approve will be blocked only if record has pending dues/requirements.
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

export default DeptDashboard;
