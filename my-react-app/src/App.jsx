import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage.jsx";
import LandingPage from "./LandingPage.jsx";
import Dashboard from "./Dashboard.jsx";
import BookingPage from "./BookingPage.jsx";
import IssuesPage from "./IssuesPage.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Här skickar vi med rollen som en "prop"*/}
        <Route path="/login/resident" element={<LoginPage role="resident" />} />
        <Route path="/login/landlord" element={<LoginPage role="landlord" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/issues" element={<IssuesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

