import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone, Info, AlertTriangle } from 'lucide-react';
import BottomNav from "./BottomNav";

const AnnouncementsPage = () => {
    const navigate = useNavigate();

    const announcements = [
        {
            id: 1,
            title: "Rör underhåll",
            content: "Vatten kommer vara avstängt mellan 10:00 och 14:00 på tisdag på grund av rör reperation.",
            date: "Oct 24, 2025",
            type: "Viktigt",
            icon: <AlertTriangle className="text-red-600" size={24} />
        },
        {
            id: 2,
            title: "Nya soptunnor",
            content: "Vi har satt in nya sop tunnor i källaren.",
            date: "Oct 20, 2025",
            type: "Info",
            icon: <Info className="text-blue-600" size={24} />
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:cursor-pointer">
                    <ArrowLeft size={20}/>
                </button>
                <h1 className="text-2xl font-bold text-blue-950">Meddelande</h1>
            </div>

            <div className="space-y-4">
                {announcements.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${item.type === 'Viktigt' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.date}</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {item.content}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <BottomNav />
        </div>
    )
}
export default AnnouncementsPage;