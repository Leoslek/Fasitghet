import React, { useEffect, useState } from "react";
import { Calendar, Megaphone, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import BottomNav from "./BottomNav";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", user.id)
          .single();

        setUserName(userData?.full_name || user.email);

        // Hämtar bokning (vi tar även med end_time nu för att veta när det slutar)
        const { data: bookingData } = await supabase
          .from("bookings")
          .select("id, start_time, end_time")
          .eq("user_id", user.id)
          .eq("status", "confirmed")
          .gte("end_time", new Date().toISOString()) // Visa bokningen tills den är slut
          .order("start_time", { ascending: true })
          .limit(1)
          .maybeSingle();

        setUpcomingBooking(bookingData);

        const { data: infoData } = await supabase
          .from("announcements")
          .select("title, created_at")
          .eq("is_archived", false)
          .order("created_at", { descending: true })
          .limit(2);

        setAnnouncements(infoData || []);
      } else {
        navigate("/");
      }
    };

    fetchDashboardData();
  }, [navigate]);

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
      return {
        label: "Laundry in progress",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      };
    }
    if (now < startTime) {
      return {
        label: "Kommande bokning",
        color: "bg-green-50 text-green-800 border-green-100",
      };
    }
    return null;
  };

  const formatBooking = (isoString) => {
    const [datePart, timePart] = isoString.split("T");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");

    // Skapa ett lokalt datumobjekt utan tidszons-offset
    const d = new Date(year, month - 1, day, hour, minute);

    return (
      d.toLocaleDateString("sv-SE", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }) +
      " kl " +
      hour +
      ":" +
      minute
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="p-8">
        <h1 className="text-3xl font-bold text-blue-950">
          Välkommen tillbaka {userName}
        </h1>
        <p className="text-gray-500">
          Detta händer i din byggnad idag.{" "}
        </p>
      </header>

      <main className="px-6 space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Megaphone size={20} /> Meddelanden
            </h2>
            <Link to="/announcements" className="text-gray-500 text-sm font-medium">
              Visa Alla
            </Link>
          </div>
          {announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((ann, i) => (
                <div key={i} className="border-l-4 border-blue-500 pl-3 py-1">
                  <p className="text-sm font-medium text-gray-800">
                    {ann.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div> 
          ) : (
            <p className="text-gray-400 text-center py-4">
              Inga Meddelanden Idag.
            </p>
          )}
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-green-600" /> Bokningar
          </h2>
          <div className="text-center py-4">
            {upcomingBooking ? (
              <div
                className={`mb-4 p-4 rounded-xl border ${getBookingStatus(upcomingBooking.start_time, upcomingBooking.end_time)?.color}`}
              >
                <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">
                  {
                    getBookingStatus(
                      upcomingBooking.start_time,
                      upcomingBooking.end_time,
                    )?.label
                  }
                </span>
                <p className="font-bold text-lg">
                  {formatBooking(upcomingBooking.start_time)}
                </p>
                <p className="text-xs opacity-80">Tvättstuga</p>
              </div>
            ) : (
              <p className="text-gray-400 mb-4">Inga Kommande Bokningar.</p>
            )}
            <Link to="/booking" className="inline-block border-2 border-gray-800 text-gray-800 px-6 py-2 rounded-lg font-medium text-center">
              Boka Tvättid
            </Link>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-orange-500" /> Mina Felanmälningar
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-700">Vasken rinner över</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                Öppen
              </span>
            </div>
          </div>
          <Link to="/issues" className="block text-gray-500 text-sm mt-4 w-full text-center hover:text-blue-900 transition">
            Visa Alla
          </Link>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};
export default Dashboard;
