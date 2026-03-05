import React from 'react';
import { Calendar, Megaphone, AlertCircle, Home, ClipboardList, Book, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import BottomNav from './BottomNav';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="p-8">
                <h1 className="text-3xl font-bold text-blue-950">Welcome back </h1>
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
                    <p className="text-gray-400 text-center py-4">No new announcements.</p>
                </section>

                {/* Upcoming Bookings Card*/}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <Calendar size={20} className="text-green-600" /> Upcoming Bookings
                    </h2>
                    <div className="text-center py-4">
                        <p className="text-gray-400 mb-4">No upcoming bookings.</p>
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
export default Dashboard