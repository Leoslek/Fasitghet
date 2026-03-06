import { Home, ClipboardList, Book, LogOut, User } from 'lucide-react'; // Lade till User här
import { NavLink } from 'react-router-dom';

const BottomNav = () => {

    const getLinkClass = ({ isActive }) =>
        `flex flex-col items-center transition-colors ${isActive ? 'text-blue-900' : 'text-gray-400'}`;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
            
            <NavLink to="/dashboard" className={getLinkClass}>
                <Home size={24} /><span className="text-[10px]">Hem</span>
            </NavLink>

            <NavLink to="/issues" className={getLinkClass}>
                <ClipboardList size={24} /><span className="text-[10px]">Ärenden</span>
            </NavLink>

            <NavLink to="/booking" className={getLinkClass}>
                <Book size={24} /><span className="text-[10px]">Boka</span>
            </NavLink>

            <NavLink to="/profile" className={getLinkClass}>
                <User size={24} /><span className="text-[10px]">Profil</span>
            </NavLink>

            <NavLink to="/" className="flex flex-col items-center text-red-500 hover:text-red-700 transition-colors">
                <LogOut size={24} /><span className="text-[10px]">Logga ut</span>
            </NavLink>

        </nav>
    );
};

export default BottomNav;