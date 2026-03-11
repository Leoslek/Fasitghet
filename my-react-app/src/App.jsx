import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage.jsx";
import LandingPage from "./LandingPage.jsx";
import Dashboard from "./Dashboard.jsx";
import BookingPage from "./BookingPage.jsx";
import IssuesPage from "./IssuesPage.jsx"
import ReportIssuesPage from "./ReportIssuesPage.jsx";
import { IssuesProvider } from "./IssuesContext.jsx";
import Profile from "./Profile.jsx";
import AnnouncementsPage from "./AnnouncementsPage.jsx";

function App() {
  return (
    <IssuesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Här skickar vi med rollen som en "prop"*/}
          <Route path="/login/resident" element={<LoginPage role="resident" />} />
          <Route path="/login/landlord" element={<LoginPage role="landlord" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/report-issues" element={<ReportIssuesPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
        </Routes>
      </BrowserRouter>
    </IssuesProvider>
  
  );
}
export default App;

