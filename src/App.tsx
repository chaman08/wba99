import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { AcceptInvitePage } from "./pages/auth/AcceptInvitePage";
import { AuthProvisioning } from "./components/auth/AuthProvisioning";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PhysioDashboard } from "./pages/physio/Dashboard";
import { PatientsPage } from "./pages/physio/Patients";
import { PatientProfile } from "./pages/physio/PatientProfile";
import { PhysioActivity } from "./pages/physio/Activity";
import { CaseDetail } from "./pages/physio/CaseDetail";
import { CaseReport } from "./pages/physio/CaseReport";
import { CaseWizard } from "./pages/physio/CaseWizard";
import { GlobalFeedback } from "./components/common/GlobalFeedback";
import { AdminDashboard } from "./pages/admin/dashboard/AdminDashboard";
import { AdminCases } from "./pages/admin/Cases";
import { AdminUsers } from "./pages/admin/Users";
import { AdminCaseDetail } from "./pages/admin/CaseDetail";
import { AdminHome } from "./pages/admin/Home";
import { Profiles } from "./pages/admin/profiles/Profiles";
import { ProfileDetail } from "./pages/admin/profiles/ProfileDetail";
import { ProgramBuilder } from "./pages/admin/program-builder/ProgramBuilder";
import { Configuration } from "./pages/admin/configuration/Configuration";
import { Management } from "./pages/admin/management/Management";
import { AdminShell } from "./components/layout/AdminShell";
import { CapturePage } from "./pages/physio/CapturePage";
import { ReportsPage } from "./pages/physio/tabs/ReportsPage";
import { SettingsPage } from "./pages/physio/tabs/SettingsPage";
import { Toaster } from "react-hot-toast";

export const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <GlobalFeedback />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        <Route path="/provisioning" element={<AuthProvisioning />} />

        <Route element={<ProtectedRoute variant="clinician" />}>
          <Route path="/app/dashboard" element={<PhysioDashboard />} />
          <Route path="/app/clients" element={<PatientsPage />} />
          <Route path="/app/clients/:patientId" element={<PatientProfile />} />
          <Route path="/app/capture" element={<CapturePage />} />
          <Route path="/app/reports" element={<ReportsPage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
          <Route path="/app/cases" element={<PhysioActivity />} />
          <Route path="/app/cases/new" element={<CaseWizard />} />
          <Route path="/app/cases/:caseId" element={<CaseDetail />} />
          <Route path="/app/cases/:caseId/report" element={<CaseReport />} />
        </Route>

        <Route element={<ProtectedRoute adminOnly={true} variant="admin" />}>
          <Route element={<AdminShell />}>
            <Route path="/admin/home" element={<AdminHome />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profiles" element={<Profiles />} />
            <Route path="/admin/profiles/:id" element={<ProfileDetail />} />
            <Route path="/admin/program-builder" element={<ProgramBuilder />} />
            <Route path="/admin/configuration" element={<Configuration />} />
            <Route path="/admin/configuration/:tab" element={<Configuration />} />
            <Route path="/admin/management" element={<Management />} />
            <Route path="/admin/management/:tab" element={<Management />} />

            {/* Consolidated legacy routes */}
            <Route path="/admin/cases" element={<AdminCases />} />
            <Route path="/admin/cases/:caseId" element={<AdminCaseDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>

        <Route path="/app/view" element={<div>Read Only View (To be implemented)</div>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};
