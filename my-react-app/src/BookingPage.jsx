import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Din nya klient!

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [showStatus, setShowStatus] = useState({ show: false, message: '', type: '' });

  const slots = [
    { start: "08:00", end: "12:00" },
    { start: "12:00", end: "16:00" },
    { start: "16:00", end: "20:00" }
  ];

  const handleBook = async (slot) => {
    setLoading(true);
    
    // 1. Skapa korrekt tidsformat för PostgreSQL (ISO 8601)
    const startTime = `${selectedDate}T${slot.start}:00Z`;
    const endTime = `${selectedDate}T${slot.end}:00Z`;

    try {
      // 2. Skicka bokningen till Supabase
      // OBS: Ersätt 'DIN_RESOURCE_ID' med ett UUID från din 'resources'-tabell
      const { error } = await supabase
        .from('bookings')
        .insert([
          { 
            resource_id: '1353191a-15fa-4900-9c94-bdff49f45c69', 
            user_id: 'DITT_USER_ID_HÄR', // Detta hämtas normalt från auth.user()
            start_time: startTime,
            end_time: endTime,
            status: 'confirmed'
          }
        ]);

      if (error) throw error;

      setShowStatus({ show: true, message: 'Bokning bekräftad!', type: 'success' });
    } catch (error) {
      console.error("Error booking:", error.message);
      setShowStatus({ show: true, message: 'Kunde inte boka. Försök igen.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setShowStatus({ show: false, message: '', type: '' }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Statusmeddelande */}
      {showStatus.show && (
        <div className={`fixed top-4 left-4 right-4 p-4 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-4 ${
          showStatus.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {showStatus.type === 'success' && <CheckCircle2 size={24} />}
          <p className="font-medium">{showStatus.message}</p>
        </div>
      )}

      <header className="p-6 bg-white border-b border-gray-100 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-600 hover:text-blue-900 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-blue-950">Boka tvättstuga</h1>
      </header>

      <main className="p-6 space-y-6">
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
            <CalendarIcon size={18} className="text-blue-600" /> Välj datum
          </label>
          <input 
            type="date" 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" /> Tillgängliga tider
          </h2>
          {slots.map((slot, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <span className="text-gray-800 font-medium">{slot.start} - {slot.end}</span>
              <button 
                onClick={() => handleBook(slot)}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? 'Bokar...' : 'Boka'}
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default BookingPage;