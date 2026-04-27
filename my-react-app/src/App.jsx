import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";
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
import ResidentsManagement from "./ResidentsManagement.jsx";
import PropertyManagement from "./PropertyManagement.jsx";
import Layout from "./Layout.jsx";
import AdminAnnouncements from "./AdminAnnouncements.jsx";

function App() {
  const [role, setRole] = useState(null);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    async function getUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(data?.role);
      }
      setloading(false);
    }
    getUserRole();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Laddar...</div>

  const isAdmin = role !== null && ["Hyresvärd", "landlord", "admin", "Styrelse"].includes(role);
  console.log("DEBUG -> Nuvarande roll i databasen:", role);
console.log("DEBUG -> Är admin enligt logiken:", isAdmin);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Inloggning */}
        <Route path="/login/resident" element={<LoginPage role="resident" />} />
        <Route path="/login/landlord" element={<LoginPage role="landlord" />} />
        
        {/* Boende-sidor */}
        <Route element={<Layout isAdmin={isAdmin} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/issues" element={<IssuesPage isAdmin={isAdmin} />} />
        <Route path="/report-issues" element={<ReportIssuesPage />} />
        
        {/* Detaljsidan för ett ärende */}
        <Route path="/issue/:id" element={<IssueDetails />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        
        {/* Admin-sidor */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/residentsmanagement" element={<ResidentsManagement />} />
        <Route path="/propertymanagement" element={<PropertyManagement />} />
        <Route path="/adminannouncements" element={<AdminAnnouncements />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;