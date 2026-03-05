import { Home, ClipboardList, Book, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        
        <Link to="/dashboard" className="flex flex-col items-center text-blue-900">
            <Home size={24} /><span className="text-[10px]">Home</span>
        </Link>

        <Link to="/issues" className="flex flex-col items-center text-gray-400">
            <ClipboardList size={24} /><span className="text-[10px]">Issues</span>
        </Link>

        <Link to="/booking" className="flex flex-col items-center text-gray-400">
            <Book size={24} /><span className="text-[10px]">Book</span>
        </Link>

        <Link to="/exit" className="flex flex-col items-center text-gray-400">
            <LogOut size={24} /><span className="text-[10px]">Exit</span>
        </Link>

    </nav>
)
export default BottomNav