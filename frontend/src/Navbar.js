import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ title = "" }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "14px 20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {/* LEFT SIDE — Brand */}
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: 0.5,
              }}
            >
              GradClear 🎓
            </div>

            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#6b7280",
              }}
            >
              {title || "Student Exit Management System"}
            </div>
          </div>

          {/* RIGHT SIDE — Logout */}
          <button
            style={{
              background: "#4f46e5",
              color: "#ffffff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;