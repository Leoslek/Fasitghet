import React, { useEffect, useState } from "react";
import { Calendar, Megaphone, AlertCircle, Clock, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import BottomNav from "./BottomNav";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]); // Ny state för live-ärenden
  const [loadingIssues, setLoadingIssues] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Hämta användarnamn
        const { data: userData } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", user.id)
          .single();

        setUserName(userData?.full_name || user.email);

        // Hämta senaste bokningen
        const { data: bookingData } = await supabase
          .from("bookings")
          .select("id, start_time, end_time")
          .eq("user_id", user.id)
          .eq("status", "confirmed")
          .gte("end_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(1)
          .maybeSingle();

        setUpcomingBooking(bookingData);

        // Hämta meddelanden
        const { data: infoData } = await supabase
          .from("announcements")
          .select("title, created_at")
          .eq("is_archived", false)
          .order("created_at", { descending: true })
          .limit(1);

        setAnnouncements(infoData || []);

        // --- NYTT: Hämta de 2 senaste felanmälningarna ---
        const { data: ticketData } = await supabase
          .from("tickets")
          .select("id, category, status, created_at, description")
          .eq("creator_id", user.id)
          .order("created_at", { descending: true })
          .limit(2);

        setRecentIssues(ticketData || []);
        setLoadingIssues(false);
      } else {
        navigate("/");
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Hjälpfunktion för att snygga till status-texter från databasen
  const formatStatus = (status) => {
    const statusMap = {
      registered: "Registrerad",
      in_progress: "Hanteras",
      resolved: "Löst",
      closed: "Stängd"
    };
    return statusMap[status] || status;
  };

  const getBookingStatus = (start, end) => {
    const now = new Date();
    const parseLocal = (isoStr) => {
      const [d, t] = isoStr.split("T");
      const [y, mo, day] = d.split("-");
      const [h, mi] = t.split(":");
      return new Date(y, mo - 1, day, h, mi);
    };
    const startTime = parseLocal(start);
    const endTime = parseLocal(end);

    if (now >= startTime && now <= endTime) {
      return { label: "Pågående tvättid", color: "bg-blue-100 text-blue-800 border-blue-200" };
    }
    if (now < startTime) {
      return { label: "Kommande bokning", color: "bg-green-50 text-green-800 border-green-100" };
    }
    return null;
  };

  const formatBooking = (isoString) => {
    const [datePart, timePart] = isoString.split("T");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");
    const d = new Date(year, month - 1, day, hour, minute);
    return d.toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" }) + " kl " + hour + ":" + minute;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="p-8">
        <h1 className="text-3xl font-bold text-blue-950 tracking-tight italic uppercase">
          Välkommen {userName.split(" ")[0]}
        </h1>
        <p className="text-gray-500 font-medium">Detta händer i din byggnad idag.</p>
      </header>

      <main className="px-6 space-y-6">
        {/* Meddelanden */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Megaphone size={16} /> Meddelanden
          </h2>
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((item, i) => (
                <div key={i} className="border-l-4 border-blue-500 pl-3 py-1">
                  <h3 className="font-bold text-blue-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase font-bold">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">Inga nya meddelanden.</p>
            )}
          </div>
        </section>

        {/* Bokningar */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-green-600" /> Bokningar
          </h2>
          <div className="text-center">
            {upcomingBooking ? (
              <div className={`mb-4 p-5 rounded-2xl border ${getBookingStatus(upcomingBooking.start_time, upcomingBooking.end_time)?.color}`}>
                <span className="text-[10px] uppercase tracking-widest font-black opacity-70 block mb-1">
                  {getBookingStatus(upcomingBooking.start_time, upcomingBooking.end_time)?.label}
                </span>
                <p className="font-bold text-lg italic uppercase tracking-tighter">
                  {formatBooking(upcomingBooking.start_time)}
                </p>
                <p className="text-[10px] font-bold uppercase mt-1 opacity-60">Gemensam Tvättstuga</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm mb-4 italic">Inga kommande bokningar.</p>
            )}
            <Link to="/booking" className="block w-full bg-blue-50 text-blue-700 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition">
              Boka tid
            </Link>
          </div>
        </section>

        {/* Felanmälningar - NU LIVE-KOPPLAD */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-500" /> Mina Ärenden
            </h2>
            <Link to="/issues" className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              Visa alla
            </Link>
          </div>
          
          <div className="space-y-3">
            {loadingIssues ? (
              <div className="h-12 bg-gray-50 animate-pulse rounded-2xl" />
            ) : recentIssues.length > 0 ? (
              recentIssues.map((issue) => (
                <Link 
                  to={`/issue/${issue.id}`} 
                  key={issue.id} 
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 active:scale-[0.98] transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tighter truncate italic">
                      {issue.category}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {new Date(issue.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black bg-white px-2 py-1 rounded-full border border-gray-200 text-gray-600 uppercase tracking-tighter">
                      {formatStatus(issue.status)}
                    </span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-xs italic">Du har inga aktiva ärenden.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default Dashboard;