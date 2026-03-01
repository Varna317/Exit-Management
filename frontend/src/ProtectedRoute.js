import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem("token");
  const roleRaw = localStorage.getItem("role");

  const role = String(roleRaw || "").trim().toLowerCase();

  if (!token || !role) {
    return <Navigate to="/" replace />;
  }

  const allowed = allowedRoles.map(r => String(r).trim().toLowerCase());

  if (allowed.length > 0 && !allowed.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
