import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "./api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setErrorMsg("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ FIXED: normalize role to avoid "HOD" vs "hod" mismatch
  const goByRole = (role) => {
    const r = String(role || "").trim().toLowerCase();

    if (r === "admin") return "/admin";
    if (r === "library") return "/library";
    if (r === "hostel") return "/hostel";
    if (r === "accounts") return "/accounts";
    if (r === "hod") return "/hod";
    if (r === "student") return "/student";

    return "/";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);

      const res = await API.post("/auth/login", formData);

      const normalizedRole = String(res.data.role || "").trim().toLowerCase();

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("email", res.data.email || formData.email);

      // ✅ NEW: store name for navbar
      localStorage.setItem("name", res.data.name || "");

      navigate(goByRole(normalizedRole));
    } catch (error) {
      const msg = error?.response?.data?.message || "Login Failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        {/* Header */}
        <div
          className="auth-header"
          style={{ background: "linear-gradient(120deg, #4f46e5, #06b6d4)" }}
        >
          <h3 className="m-0">Welcome back 👋</h3>
          <div className="auth-subtitle">
            Login to continue your clearance process
          </div>
        </div>

        {/* Body */}
        <div className="auth-body">
          {errorMsg && (
            <div className="alert alert-danger py-2" style={{ fontSize: 14 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="form-label">Email</label>
            <input
              className="form-control mb-3"
              name="email"
              placeholder="example@college.edu"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <label className="form-label">Password</label>
            <div className="input-group mb-3">
              <input
                type={showPw ? "text" : "password"}
                className="form-control"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => setShowPw((p) => !p)}
                style={{ borderRadius: "12px" }}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>

            <button className="btn btn-primary w-100 auth-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-3">
            New here?{" "}
            <Link className="small-link" to="/register">
              Create an account
            </Link>
          </div>

          <div className="text-center mt-2 text-muted" style={{ fontSize: 12 }}>
            Tip: Use your college email registered in the system.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
