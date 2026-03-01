import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "./api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setErrorMsg("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);

      // IMPORTANT: role will be sent to backend
      await API.post("/auth/register", formData);

      alert("Registered Successfully!");
      navigate("/");
    } catch (error) {
      const msg = error?.response?.data?.message || "Registration Failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 520 }}>
      <div className="card p-4 shadow">
        <h3 className="text-center mb-3">Register</h3>

        {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-label">Name</label>
          <input
            className="form-control mb-3"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label className="form-label">Email</label>
          <input
            className="form-control mb-3"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control mb-3"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label className="form-label">Role</label>
          <select
            className="form-control mb-3"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
            <option value="library">Library</option>
            <option value="hostel">Hostel</option>
            <option value="accounts">Accounts</option>
            <option value="hod">HOD</option>
          </select>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-3 text-center">
          Already have account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
