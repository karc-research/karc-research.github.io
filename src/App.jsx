import { Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import DashboardLayout from './components/common/DashboardLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import ResearchPage from './pages/public/ResearchPage'
import DataPage from './pages/public/DataPage'
// import ParticipatePage from './pages/public/ParticipatePage'  // Hidden until IRB approval
import SupportPage from './pages/public/SupportPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import PendingApprovalPage from './pages/auth/PendingApprovalPage'
import DashboardHome from './pages/dashboard/DashboardHome'
import VariantsPage from './pages/dashboard/VariantsPage'
import ReportsPage from './pages/dashboard/ReportsPage'
import ResearchersPage from './pages/dashboard/ResearchersPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import MembersPage from './pages/dashboard/MembersPage'
import AnnouncementsPage from './pages/dashboard/AnnouncementsPage'

export default function App() {
  return (
    <Routes>
      {/* Public site layout (Navbar + Footer) */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/data" element={<DataPage />} />
        {/* <Route path="/participate" element={<ParticipatePage />} /> */}{/* Hidden until IRB approval */}
        <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pending" element={<ProtectedRoute><PendingApprovalPage /></ProtectedRoute>} />
      </Route>

      {/* Dashboard layout (Sidebar) */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/variants" element={<VariantsPage />} />
        <Route path="/dashboard/reports" element={<ReportsPage />} />
        <Route path="/dashboard/researchers" element={<ResearchersPage />} />
        <Route path="/dashboard/announcements" element={<AnnouncementsPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/members" element={<ProtectedRoute allowedRoles={['admin']}><MembersPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}
