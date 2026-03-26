import React, { useState } from "react";
import { Users, Home, AlertTriangle, Key, Search, Plus } from "lucide-react";

const AdminDashboard = () => {
  //Exempeldata för boende
  const allResidents = [
    {
      id: 1,
      name: "Anna Andersson",
      adress: "Storgatan 4, lgh 1201",
      status: "Aktiv",
      phone: "070-123 45 67",
    },
    {
      id: 2,
      name: "Erik Karlsson",
      adress: "Storgatan 4, lgh 1102",
      status: "Inflyttande",
      phone: "072-987 65 43",
    },
    {
      id: 3,
      name: "Maria Lind",
      adress: "Västra Vägen 10",
      status: "Uppsagd",
      phone: "073-555 12 34",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const filteredResidents = allResidents.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.adress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div p-6 text-2xl font-bol border-b border-slate-800>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center p-3 bg-blue-600 rounded-lg">
            <Home className="mr-3 w-5 h-5" />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center p-3 hover:bg-slate-800 rounded-lg text-gray-400"
          >
            <Users className="mr-3 w-5 h-5" />
            Boende
          </a>
          <a
            href="#"
            className="flex items-center p-3 hover:bg-slate-800 rounded-lg text-gray-400"
          >
            <AlertTriangle className="mr-3 w-5 h-5" />
            Felanmälningar
          </a>
          <a
            href="#"
            className="flex items-center p-3 hover:bg-slate-800 rounded-lg text-gray-400"
          >
            <Key className="mr-3 w-5 h-5" />
            Fastigheter
          </a>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="relative w-96">
            <span className="absolute inset-y-0 pl-3 flex items-center text-gray-400">
              <Search size={18} />
            </span>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder -gray-500 focus:outlinde_none focus:ring-1 focus:ring-blue-500 sm-text-sm"
              placeholder="Sök boende eller adress... "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus size={18} className="mr-2" /> Ny boende
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Översikt Boende
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Totala boende"
              value="142"
              icon={<Users className="text-blue-600" />}
              color="bg-blue-50"
            />
            <StatCard
              title="Lediga enheter"
              value="3"
              icon={<Home className="text-green-600" />}
              color="bg-blue-50"
            />
            <StatCard
              title="Aktiva ärenden"
              value="12"
              icon={<AlertTriangle className="text-red-600" />}
              color="bg-blue-50"
            />
            <StatCard
              title="Inflyttningar (mån)"
              value="5"
              icon={<Key className="text-purple-600" />}
              color="bg-blue-50"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 font-semibold text-gray-700">
              Senaste boende
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Namn</th>
                  <th className="px-6 py-4 font-medium">Adress</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Åtgärd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredResidents.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {person.name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {person.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{person.adress}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          person.status === "Aktiv"
                            ? "bg-green-100 text-green-700"
                            : person.status === "Uppsagd"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:cursor-pointer hover:text-blue-800 font-medium">
                        Hantera
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredResidents.length === 0 && (
                    <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">
                            inga boende matchar din sökning "{searchTerm}"
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
