import React, { useEffect, useState } from 'react';
import { Calendar, Megaphone, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import BottomNav from './BottomNav';

const Dashboard = () => {
    const [userName, setUserName] = useState('');
    const [upcomingBooking, setUpcomingBooking] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // 1. Hämta användarnamn
                const { data: userData } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                setUserName(userData?.full_name || user.email);

                // 2. Hämta nästa bokning (endast framtida)
                const { data: bookingData } = await supabase
                    .from('bookings')
                    .select('start_time')
                    .eq('user_id', user.id)
                    .eq('status', 'confirmed')
                    .gte('start_time', new Date().toISOString())
                    .order('start_time', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                setUpcomingBooking(bookingData);

                // 3. Hämta de 2 senaste meddelandena
                const { data: infoData } = await supabase
                    .from('announcements')
                    .select('title, created_at')
                    .eq('is_archived', false)
                    .order('created_at', { descending: true })
                    .limit(2);

                setAnnouncements(infoData || []);
            } else {
                navigate('/');
            }
        };

        fetchDashboardData();
    }, [navigate]);

    // Hjälpfunktion för att formatera datum
const formatBooking = (isoString) => {
    const [datePart, timePart] = isoString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    
    const d = new Date(year, month - 1, day, hour, minute);
    
    return d.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' }) + 
           ' kl ' + hour + ':' + minute;
};

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="p-8">
                <h1 className="text-3xl font-bold text-blue-950">Welcome back {userName}</h1>
                <p className="text-gray-500">Here's what's happening in your bulding today. </p>
            </header>

            {/* Main Content */}
            <main className="px-6 space-y-6">

                {/* Announcements Card */}
                <section className="bg-white p-6 rounded-2xll shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Megaphone size={20}/> Announcements
                        </h2>
                        <Link to="/announcements" className="text-blue-600 text-sm font-medium">View All</Link>
                    </div>
                    {announcements.length > 0 ? (
                        <div className="space-y-3">
                            {announcements.map((ann, i) => (
                                <div key={i} className="border-l-4 border-blue-500 pl-3 py-1">
                                    <p className="text-sm font-medium text-gray-800">{ann.title}</p>
                                    <p className="text-xs text-gray-400">{new Date(ann.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">No new announcements.</p>
                    )}
                </section>

                {/* Upcoming Bookings Card*/}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <Calendar size={20} className="text-green-600" /> Upcoming Bookings
                    </h2>
                    <div className="text-center py-4">
                        {upcomingBooking ? (
                            <div className="mb-4 bg-green-50 p-3 rounded-xl border border-green-100">
                                <p className="text-green-800 font-bold">{formatBooking(upcomingBooking.start_time)}</p>
                                <p className="text-green-600 text-xs">Laundry Room</p>
                            </div>
                        ) : (
                            <p className="text-gray-400 mb-4">No upcoming bookings.</p>
                        )}
                        <Link to="/booking" className="inline-block border-2 border-gray-800 text-gray-800 px-6 py-2 rounded-lg font-medium text-center">
                            Book Laundry
                        </Link>
                    </div>
                </section>

                {/* My Issues Card */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <AlertCircle size={20} className="text-orange-500" /> My Issues
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <span className="text-gray-700">Vasken rinner över</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">Open</span>
                        </div>
                    </div>
                    <button className="text-gray-500 text-sm mt-4 w-full">View All</button>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}
export default Dashboard;