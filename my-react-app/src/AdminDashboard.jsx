import React, { useState, useEffect } from "react";
import { Users, Home, AlertTriangle, Key, Search, Plus } from "lucide-react";
import { supabase } from "./supabaseClient"; // Importera supabase
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [residents, setResidents] = useState([]); // Stat för riktiga boende
  const [activeTicketsCount, setActiveTicketsCount] = useState(0); // Stat för ärenden
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Hämta data när sidan laddas
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      
      // 1. Hämta alla användare med rollen 'Boende'
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("role", "Boende")
        .order("full_name");

      if (userData) setResidents(userData);

      // 2. Räkna aktiva ärenden (registered och in_progress)
      const { count } = await supabase
        .from("tickets")
        .select('*', { count: 'exact', head: true })
        .in("status", ["registered", "in_progress"]);

      setActiveTicketsCount(count || 0);
      setLoading(false);
    };

    fetchAdminData();
  }, []);

  const filteredResidents = residents.filter(person =>
    person.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-slate-900">
      {/* --- DIN ORIGINAL-SIDEBAR --- */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 italic uppercase">
          Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admindashboard" className="flex items-center p-3 hover:bg-slate-800 rounded-lg text-gray-400">
            <Home className="mr-3 w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/residentsmanagement" className="flex items-center p-3 hover:bg-slate-800 rounded-lg text-gray-400">
            <Users className="mr-3 w-5 h-5" />
            Boende
          </Link>
          {/* Länkad till felanmälningslistan vi byggde */}
          <Link to="/issues" className="flex items-center p-3 hover:bg-slate-800 rounded-lg text-gray-400">
            <AlertTriangle className="mr-3 w-5 h-5" />
            Felanmälningar
          </Link>
          <a href="#" className="flex items-center p-3 hover:bg-slate-800 rounded-lg text-gray-400">
            <Key className="mr-3 w-5 h-5" />
            Fastigheter
          </a>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- DIN ORIGINAL-HEADER --- */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="relative w-96">
            <span className="absolute inset-y-0 pl-3 flex items-center text-gray-400">
              <Search size={18} />
            </span>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Sök boende eller adress... "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
            <Plus size={18} className="mr-2" /> Ny boende
          </button>
        </header>

        {/* --- DIN MAIN CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6 uppercase tracking-tight italic">
            Översikt Boende
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Totala boende"
              value={residents.length}
              icon={<Users className="text-blue-600" />}
              color="bg-blue-50"
            />
            <StatCard
              title="Lediga enheter"
              value="3"
              icon={<Home className="text-green-600" />}
              color="bg-green-50"
            />
            <StatCard
              title="Aktiva ärenden"
              value={activeTicketsCount}
              icon={<AlertTriangle className="text-red-600" />}
              color="bg-red-50"
            />
            <StatCard
              title="Inflyttningar (mån)"
              value="5"
              icon={<Key className="text-purple-600" />}
              color="bg-purple-50"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 font-semibold text-gray-700 uppercase text-xs tracking-widest">
              Senaste boende
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm uppercase tracking-wider bg-gray-50/50">
                  <th className="px-6 py-4 font-medium">Namn</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Åtgärd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="3" className="p-10 text-center text-gray-400 italic">Hämtar data...</td></tr>
                ) : filteredResidents.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 uppercase italic">
                        {person.full_name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {person.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-green-100 text-green-700 border border-green-200">
                        Aktiv
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-bold uppercase text-[10px] tracking-widest">
                        Hantera
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

// --- DIN ORIGINAL-STATCARD ---
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-900 italic tracking-tighter leading-none">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;