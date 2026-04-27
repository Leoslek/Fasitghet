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
    // Funktion för att hämta rollen
    async function getUserRole(user) {
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(data?.role);
      } else {
        setRole(null);
      }
      setloading(false);
    }

    // 1. Kolla vem som är inloggad när appen laddas
    supabase.auth.getUser().then(({ data: { user } }) => {
      getUserRole(user);
    });

    // 2. MAGIN: Lyssna live på inloggningar! Uppdaterar rollen direkt utan omladdning
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      getUserRole(session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-400">Laddar...</div>;

  // Täcker in alla möjliga variationer av admin-roller
  const isAdmin = role !== null && [
    "Hyresvärd", "landlord", 
    "admin", "Admin", 
    "Styrelse", "board",
    "janitor", "Fastighetsskötare"
  ].includes(role);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Inloggning */}
        <Route path="/login/resident" element={<LoginPage role="resident" />} />
        <Route path="/login/landlord" element={<LoginPage role="landlord" />} />
        
        {/* Sidor som ligger i appen (Layout hanterar bottenmenyn) */}
        <Route element={<Layout isAdmin={isAdmin} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/issues" element={<IssuesPage isAdmin={isAdmin} />} />
          <Route path="/report-issues" element={<ReportIssuesPage />} />
          <Route path="/issue/:id" element={<IssueDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          
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