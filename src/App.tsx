import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CareerMatcherPage from "./pages/CareerMatcherPage";
import CareerAssessmentPage from "./pages/CareerAssessmentPage";


import AdminDashboardV3Page from "./pages/AdminDashboardV3Page";
import AdminReferralManagementPage from "./pages/AdminReferralManagementPage";
import PromoManagementPage from "./pages/PromoManagementPage";

import CareerManagementPage from "./pages/CareerManagementPage";
import CareerExplorerProPage from "./pages/CareerExplorerProPage";
import CareerDetailsProPage from "./pages/CareerDetailsProPage";

import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";

import LaunchBatchProPage from "./pages/LaunchBatchProPage";
import LaunchBatchDashboardProPage from "./pages/LaunchBatchDashboardProPage";

import CommunityPage from "./pages/CommunityPage";
import FormManagementProPage from "./pages/FormManagementProPage";
import CommunityManagementProPage from "./pages/CommunityManagementProPage";
import EligibilityManagementProPage from "./pages/EligibilityManagementProPage";
import ReferralDashboardProPage from "./pages/ReferralDashboardProPage";
import StudentManagementProPage from "./pages/StudentManagementProPage";

import RoadmapGeneratorProPage from "./pages/RoadmapGeneratorProPage";
import RoadmapTemplateAdminPage from "./pages/RoadmapTemplateAdminPage";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage";
import ATSCheckerPage from "./pages/ATSCheckerPage";
import LinkedInAnalyzerPage from "./pages/LinkedInAnalyzerPage";
import SkillGapAnalysisPage from "./pages/SkillGapAnalysisPage";
import CareerAICoachPage from "./pages/CareerAICoachPage";

import SkillsManagerPage from "./pages/SkillsManagerPage";
import SkillWizardV2Page from "./pages/SkillWizardV2Page";
import SkillWizardV3Page from "./pages/SkillWizardV3Page";
import SkillWizardV4Page from "./pages/SkillWizardV4Page";
import SkillListPage from "./pages/SkillListPage";
import StorageTestPage from "./pages/StorageTestPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/career-explorer" element={<CareerExplorerProPage />} />
        <Route path="/career/:careerName" element={<CareerDetailsProPage />} />
        <Route path="/launch-batch" element={<LaunchBatchProPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
             <ProtectedRoute>
             <CareerAssessmentPage />
             </ProtectedRoute>
         }
       />
        <Route
          path="/career-matcher"
          element={
            <ProtectedRoute>
              <CareerMatcherPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/launch-batch-dashboard"
          element={
            <ProtectedRoute>
              <LaunchBatchDashboardProPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/referrals"
          element={
            <ProtectedRoute>
              <ReferralDashboardProPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roadmap-generator"
          element={
            <ProtectedRoute>
              <RoadmapGeneratorProPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume-analyzer"
          element={
            <ProtectedRoute>
              <ResumeAnalyzerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ats-checker"
          element={
            <ProtectedRoute>
              <ATSCheckerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/linkedin-analyzer"
          element={
            <ProtectedRoute>
              <LinkedInAnalyzerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skill-gap-analysis"
          element={
            <ProtectedRoute>
              <SkillGapAnalysisPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/career-ai"
          element={
            <ProtectedRoute>
              <CareerAICoachPage />
            </ProtectedRoute>
          }
        />

        <Route path="/admin" element={<AdminDashboardV3Page />} />
        <Route path="/admin/careers" element={<CareerManagementPage />} />
        <Route path="/admin/analytics" element={<AnalyticsDashboardPage />} />
        <Route path="/admin/forms" element={<FormManagementProPage />} />
        <Route path="/admin/community" element={<CommunityManagementProPage />} />
        <Route
          path="/admin/eligibility"
          element={<EligibilityManagementProPage />}
        />
        <Route path="/admin/referrals" element={<AdminReferralManagementPage />} />
        <Route path="/admin/promos" element={<PromoManagementPage />} />
        <Route path="/admin/students" element={<StudentManagementProPage />} />
        <Route path="/admin/roadmaps" element={<RoadmapTemplateAdminPage />} />

        <Route path="/skills-manager" element={<SkillsManagerPage />} />
        <Route path="/admin/skill-wizard" element={<SkillWizardV2Page />} />
        <Route path="/admin/skill-wizard-v3" element={<SkillWizardV3Page />} />
        <Route path="/admin/skill-wizard-v4" element={<SkillWizardV4Page />} />
        <Route path="/admin/skills" element={<SkillListPage />} />
        <Route path="/admin/storage-test" element={<StorageTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;