import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Users, AlertTriangle, Home, LogOut } from "lucide-react";
import { supabase } from "./supabaseClient";

const AdminBottomNav = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm("Vill du logga ut?")) {
            await supabase.auth.signOut();
            navigate("/");
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">

            
                {/* Dashboard */}
                <NavLink to="/admindashboard" className={({ isActive }) =>
                `flex flex-col items-center flex-1 transition-colors ${isActive ? 'text-blue-900' : 'text-gray-400'}`
                }
            >
                <Home size={24} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Hem</span>
                </NavLink>

                {/* Boende */}
                <NavLink to="/residentsmanagement" className={({ isActive }) =>
                `flex flex-col items-center flex-1 transition-colors ${isActive ? 'text-blue-900' : 'text-gray-400'}`
                }
            >
                <Users size={24} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Boende</span>
                </NavLink>

                {/* Felanmälningar */}
                <NavLink to="/issues" className={({ isActive }) => 
                `flex flex-col items-center flex-1 transition-colors ${isActive ? 'text-blue-900' : 'text-gray-400'}`
                }
            >   
                <AlertTriangle size={24} />
                <span className="text-[10px] font-semibold mt-1 uppercase tracking-tight">Ärenden</span>
                </NavLink>

                {/* Fastigheter */}
                <NavLink to="/propertymanagement" className={({ isActive }) => 
                `flex flex-col items-center flex-1 transition-colors ${isActive ? 'text-blue-900' : 'text-gray-400'}`
                }
            >   
                <AlertTriangle size={24} />
                <span className="text-[10px] font-semibold mt-1 uppercase tracking-tight">Fastigheter</span>
                </NavLink>

                {/* Logga ut */}
                <button
                    onClick={{handleLogout}}
                    className="flex flex-col items-center flex-1 transition-colors text-red-500 hover:cursor-pointer"
                >
                    <LogOut size={24} />
                    <span className="text-[10px] font-semibold mt-1 uppercase tracking-tight">Logga ut</span>
                </button>

        </nav>
    );
};

export default AdminBottomNav;