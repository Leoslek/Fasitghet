import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState('2026-03-05');
  const slots = ["07:00 - 10:00", "10:00 - 13:00", "13:00 - 16:00", "16:00 - 19:00", "19:00 - 22:00"];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="p-6 bg-white border-b border-gray-100 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-600">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-blue-950">Book Laundry</h1>
      </header>

      <main className="p-6 space-y-6">
        {/* Datumväljare */}
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
            <CalendarIcon size={18} className="text-blue-600" /> Select Date
          </label>
          <input 
            type="date" 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </section>

        {/* Tidspass */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" /> Available Slots
          </h2>
          {slots.map((slot, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <span className="text-gray-800 font-medium">{slot}</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                Book
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default BookingPage;