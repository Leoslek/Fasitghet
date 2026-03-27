import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Loader2,
  Home,
  MapPin,
  Edit3,
  Trash2,
  X,
} from "lucide-react";
import BottomNav from "./BottomNav";

const ResidentsManagement = () => {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "Boende",
  });

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from("users")
        .select(
          `
            id,
            full_name,
            email,
            phone,
            role,
            apartments (
                apt_number,
                building_address
            )
            `,
        )
        .eq("role", "Boende");

      if (supabaseError) throw supabaseError;
      setResidents(data);
    } catch (err) {
      setError("Kunde inte ladda boende: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const openModal = (resident = null) => {
    if (resident) {
      setEditingResident(resident);
      setFormData({
        full_name: resident.full_name || "",
        email: resident.email || "",
        phone: resident.phone || "",
        role: "Boende",
      });
    } else {
      setEditingResident(null);
      setFormData({ full_name: "", email: "", role: "Boende" });
    }
    setIsModalOpen(true);
  };

  // Hantera spara (både Insert och Update)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingResident) {
        // Uppdatera
        const { error: updateError } = await supabase
          .from("users")
          .update({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
          })
          .eq("id", editingResident.id);

        if (updateError) throw updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from("users")
          .insert([formData]);

        if (insertError) throw insertError;
      }

      setIsModalOpen(false);
      fetchResidents(); // Ladda om listan
    } catch (err) {
      alert("Ett fel uppstod: " + err.message);
    }
  };

  // Hantera borttagning
  const handleDelete = async (id) => {
    if (window.confirm("Är du säker på att du vill bort denna boende?")) {
      try {
        const { error: deleteError } = await supabase
          .from("users")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
        fetchResidents();
      } catch (err) {
        alert("Kunde inte ta bort boende: " + err.message);
      }
    }
  };

  const filteredResidents = residents.filter((r) => {
    const search = searchTerm.toLowerCase();
    return (
      r.full_name?.toLowerCase().includes(search) ||
      r.email?.toLowerCase().includes(search) ||
      r.apartments?.apt_number?.includes(search) ||
      r.apartments?.building_address?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hantera Boende</h1>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition shadow-sm"
        >
          <UserPlus size={18} className="mr-2" /> Registrera ny boende
        </button>
      </div>

      <div className="mb-6 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Sök på namn eller lägenhetsnummer..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Hämtar boende...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hiddem">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Namn
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Bostad
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Kontakt
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Åtgärd
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResidents.length > 0 ? (
                filteredResidents.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {r.full_name || "Inget namn"}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {r.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {r.apartments ? (
                        <>
                          <div className="text-sm font-bold text-gray-800 flex items-center">
                            <Home size={14} className="mr-1 text-blue-500" />{" "}
                            Lgh {r.apartments.apt_number}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-1 italic">
                            <MapPin size={12} className="mr-1" />{" "}
                            {r.apartments.building_address}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-amber-500">
                          Ej tilldelad
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center text-blue-600 font-medium">
                        <Mail size={14} className="mr-2" /> {r.email}
                      </div>
                      <div className="flex items-center mt-1 text-gray-500 text-xs">
                        <Phone size={14} className="mr-2" />{" "}
                        {r.phone || "Saknas"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(r)}
                          className="flex items-center bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-md transition duration-200 text-sm font-medium"
                        >
                          <Edit3 size={14} className="mr-1" /> Redigera
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="flex items-center bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-md transition duration-200 text-sm font-medium"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Inga boende hittades
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
            <div className="fixed insert-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            {editingResident ? "Redigera boende" : "Ny registrering"}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                    <form onsubmit={handleSave} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Fullständigt namn</label>
                            <input 
                            required
                            className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> E-post</label>
                            <input 
                            required
                            className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Telefon</label>
                            <input 
                            required
                            className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div className="flex space-x-3 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 rounded-lg font-bold">Avbryt</button>
                            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Spara</button>
                        </div>
                    </form>
                </div>

            </div>
        )}
      <BottomNav />
    </div>
  );
};

export default ResidentsManagement;
