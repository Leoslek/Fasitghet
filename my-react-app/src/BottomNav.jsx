import React from 'react';
import { Home, ClipboardList, Book, LogOut, User, LayoutDashboard } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const BottomNav = ({ isAdmin }) => { // FIX: Måsvingar här är superviktigt!
    const navigate = useNavigate();

    const getLinkClass = ({ isActive }) => 
        `flex flex-col items-center flex-1 transition-colors ${isActive ? 'text-blue-900' : 'text-gray-400'}`;

    const handleLogout = async () => {
        if (window.confirm("Vill du logga ut?")) {
            await supabase.auth.signOut();
            navigate("/");
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
            
            <NavLink to={isAdmin ? "/admindashboard" : "/dashboard"} className={getLinkClass}>
                {isAdmin ? <LayoutDashboard size={24} /> : <Home size={24} />}
                <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">{isAdmin ? 'Admin' : 'Hem'}</span>
            </NavLink>

            <NavLink to="/issues" className={getLinkClass}>
                <ClipboardList size={24} />
                <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">Ärenden</span>
            </NavLink>

            {!isAdmin && (
                <NavLink to="/booking" className={getLinkClass}>
                    <Book size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">Boka</span>
                </NavLink>
            )}

            <NavLink to="/profile" className={getLinkClass}>
                <User size={24} />
                <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">Profil</span>
            </NavLink>

            <button onClick={handleLogout} className="flex flex-col items-center flex-1 text-red-500 hover:cursor-pointer">
                <LogOut size={24} />
                <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">Logga ut</span>
            </button>
        </nav>
    );
};

export default BottomNav;