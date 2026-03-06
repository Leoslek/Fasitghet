import { Home, ClipboardList, Book, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {

    const getLinkClass = ({ isActive }) =>
        `flex flex-col items-center transition-colors ${isActive ? 'text-blue' : 'text-gray-400'}`;
return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        
        <NavLink to="/dashboard" className={getLinkClass}>
            <Home size={24} /><span className="text-[10px]">Home</span>
        </NavLink>

        <NavLink to="/issues" className={getLinkClass}>
            <ClipboardList size={24} /><span className="text-[10px]">Issues</span>
        </NavLink>

        <NavLink to="/booking" className={getLinkClass}>
            <Book size={24} /><span className="text-[10px]">Book</span>
        </NavLink>

        <NavLink to="/" className="flex flex-col items-center text-red-500">
            <LogOut size={24} /><span className="text-[10px]">Exit</span>
        </NavLink>

    </nav>

    );
};
export default BottomNav