import React from 'react';
import { Home, ClipboardList, Book, LogOut, User, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { supabase } from './supabaseClient';

const BottomNav = ({ isAdmin }) => {

    const getLinkClass = ({ isActive }) => 
        `flex flex-col items-center transition-colors ${isActive ? 'text-blue-900' : 'text-gray-400'}`;


    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
            
            {/* SMART HEM-KNAPP: Går till Admin- eller Boende-dashboard */}
            <NavLink to={isAdmin ? "/admindashboard" : "/dashboard"} className={getLinkClass}>
                {isAdmin ? <LayoutDashboard size={24} /> : <Home size={24} />}
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                    {isAdmin ? 'Admin' : 'Hem'}
                </span>
            </NavLink>

            <NavLink to="/issues" className={getLinkClass}>
                <ClipboardList size={24} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Ärenden</span>
            </NavLink>

            {/* Boka-knappen (kanske bara för boende?) */}
            {!isAdmin && (
                <NavLink to="/booking" className={getLinkClass}>
                    <Book size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Boka</span>
                </NavLink>
            )}

            <NavLink to="/profile" className={getLinkClass}>
                <User size={24} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Profil</span>
            </NavLink>

            {/* Logout - skickar användaren till start */}
            <button 
                onClick={() => supabase.auth.signOut()}
                className="flex flex-col items-center text-red-500 hover:text-red-700 transition-colors"
            >
                <LogOut size={24} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Logga ut</span>
            </button>

        </nav>
    );
};

export default BottomNav;