import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./components/AuthPage";
import KycForm from "./components/KycForm";
import KycDashboard from "./components/kycDashboard";
import KycDetails from "./components/KycDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route path="/login" element={<AuthPage />} />

        <Route path="/register" element={<KycForm />} />

        <Route path="/dashboard" element={<KycDashboard />} />

        <Route path="/dashboard/:id" element={<KycDetails />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
