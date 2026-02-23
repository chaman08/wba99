import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PhysioDashboard } from "./pages/physio/Dashboard";
import { PatientsPage } from "./pages/physio/Patients";
import { PatientProfile } from "./pages/physio/PatientProfile";
import { PhysioActivity } from "./pages/physio/Activity";
import { CaseDetail } from "./pages/physio/CaseDetail";
import { CaseReport } from "./pages/physio/CaseReport";
import { GlobalFeedback } from "./components/common/GlobalFeedback";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminCases } from "./pages/admin/Cases";
import { AdminUsers } from "./pages/admin/Users";
import { AdminCaseDetail } from "./pages/admin/CaseDetail";
import { AssessTab } from "./pages/physio/tabs/AssessTab";
import { ReportsPage } from "./pages/physio/tabs/ReportsPage";
import { SettingsPage } from "./pages/physio/tabs/SettingsPage";
import { MovementAssessment } from "./pages/physio/assessments/MovementAssessment";
import { PostureAssessment } from "./pages/physio/assessments/PostureAssessment";
import { MSKAssessment } from "./pages/physio/assessments/MSKAssessment";

export const App = () => {
  return (
    <>
      <GlobalFeedback />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute role="physio" />}>
          <Route path="/app/dashboard" element={<PhysioDashboard />} />
          <Route path="/app/clients" element={<PatientsPage />} />
          <Route path="/app/clients/:patientId" element={<PatientProfile />} />
          <Route path="/app/assess" element={<AssessTab />} />
          <Route path="/app/reports" element={<ReportsPage />} />
          <Route path="/app/settings" element={<SettingsPage />} />

          <Route path="/app/assessment/posture/:clientId" element={<PostureAssessment />} />
          <Route path="/app/assessment/movement/:clientId" element={<MovementAssessment />} />
          <Route path="/app/assessment/gait/:clientId" element={<MovementAssessment />} />
          <Route path="/app/assessment/treadmill/:clientId" element={<MovementAssessment />} />
          <Route path="/app/assessment/msk/:clientId" element={<MSKAssessment />} />

          <Route path="/app/cases" element={<PhysioActivity />} />
          <Route path="/app/cases/:caseId" element={<CaseDetail />} />
          <Route path="/app/cases/:caseId/report" element={<CaseReport />} />
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/app/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/app/admin/cases" element={<AdminCases />} />
          <Route path="/app/admin/cases/:caseId" element={<AdminCaseDetail />} />
          <Route path="/app/admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </>
  );
};
