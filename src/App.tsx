import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PhysioDashboard } from "./pages/physio/Dashboard";
import { PatientsPage } from "./pages/physio/Patients";
import { PatientProfile } from "./pages/physio/PatientProfile";
import { CaseWizard } from "./pages/physio/CaseWizard";
import { CaseDetail } from "./pages/physio/CaseDetail";
import { CaseReport } from "./pages/physio/CaseReport";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminCases } from "./pages/admin/Cases";
import { AdminUsers } from "./pages/admin/Users";
import { AdminCaseDetail } from "./pages/admin/CaseDetail";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute role="physio" />}>
        <Route path="/dashboard" element={<PhysioDashboard />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:patientId" element={<PatientProfile />} />
        <Route path="/cases/new" element={<CaseWizard />} />
        <Route path="/cases/:caseId" element={<CaseDetail />} />
        <Route path="/cases/:caseId/report" element={<CaseReport />} />
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/cases" element={<AdminCases />} />
        <Route path="/admin/cases/:caseId" element={<AdminCaseDetail />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
