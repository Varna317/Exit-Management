import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";
import DeptDashboard from "./DeptDashboard";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Department Dashboards (Reusable Component) */}
        <Route
          path="/library"
          element={
            <ProtectedRoute allowedRoles={["library"]}>
              <DeptDashboard deptKey="library" title="📚 Library Clearance Dashboard" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hostel"
          element={
            <ProtectedRoute allowedRoles={["hostel"]}>
              <DeptDashboard deptKey="hostel" title="🏠 Hostel Clearance Dashboard" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accounts"
          element={
            <ProtectedRoute allowedRoles={["accounts"]}>
              <DeptDashboard deptKey="accounts" title="💰 Accounts Clearance Dashboard" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hod"
          element={
            <ProtectedRoute allowedRoles={["hod"]}>
              <DeptDashboard deptKey="hod" title="👨‍🏫 HOD Clearance Dashboard" />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
