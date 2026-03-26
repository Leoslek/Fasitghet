import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage.jsx";
import LandingPage from "./LandingPage.jsx";
import Dashboard from "./Dashboard.jsx";
import BookingPage from "./BookingPage.jsx";
import IssuesPage from "./IssuesPage.jsx";
import ReportIssuesPage from "./ReportIssuesPage.jsx";
import Profile from "./Profile.jsx";
import AnnouncementsPage from "./AnnouncementsPage.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import IssueDetails from "./IssueDetails.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Inloggning */}
        <Route path="/login/resident" element={<LoginPage role="resident" />} />
        <Route path="/login/landlord" element={<LoginPage role="landlord" />} />
        
        {/* Boende-sidor */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/report-issues" element={<ReportIssuesPage />} />
        
        {/* Detaljsidan för ett ärende */}
        <Route path="/issue/:id" element={<IssueDetails />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        
        {/* Admin-sidor */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;