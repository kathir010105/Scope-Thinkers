import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Courses from "../pages/Courses";
import StudentDetails from "../pages/StudentDetails";


class AppRoutes extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/students" element={<Students />} />

        <Route path="/courses" element={<Courses />} />
        <Route path="/students/:id" element={<StudentDetails />} />
      </Routes>
    );
  }
}

export default AppRoutes;
