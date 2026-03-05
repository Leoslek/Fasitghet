import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; 
import BottomNav from './BottomNav';

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [showStatus, setShowStatus] = useState({ show: false, message: '', type: '' });
  const [userId, setUserId] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);

  const slots = [
    { start: "08:00", end: "12:00" },
    { start: "12:00", end: "16:00" },
    { start: "16:00", end: "20:00" }
  ];

  const isTimePast = (slotStart) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (selectedDate < today) return true;
    if (selectedDate === today) {
      const [hour] = slotStart.split(':');
      return now.getHours() >= parseInt(hour);
    }
    return false;
  };

  useEffect(() => {
    const initPage = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) console.error("Error fetching user:", userError.message);
      if (user) setUserId(user.id);
      fetchBookings();
    };
    initPage();
  }, [selectedDate]);

  const fetchBookings = async () => {
    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select('id, start_time, user_id') // Hämtar även id och vem som bokat
      .eq('resource_id', '1353191a-15fa-4900-9c94-bdff49f45c69')
      .eq('status', 'confirmed');

    if (fetchError) console.error("Error fetching bookings:", fetchError.message);
    if (data) setExistingBookings(data);
  };

  const handleBook = async (slot) => {
    if (!userId || isTimePast(slot.start)) return;
    setLoading(true);
    const startTime = `${selectedDate}T${slot.start}:00`;
    const endTime = `${selectedDate}T${slot.end}:00`;

    try {
      const { error: insertError } = await supabase
        .from('bookings')
        .insert([{ 
            resource_id: '1353191a-15fa-4900-9c94-bdff49f45c69', 
            user_id: userId,
            start_time: startTime,
            end_time: endTime,
            status: 'confirmed'
          }]);
      if (insertError) throw insertError;
      setShowStatus({ show: true, message: 'Bokning bekräftad!', type: 'success' });
      fetchBookings(); 
    } catch (err) {
      console.error("Booking failed:", err.message);
      setShowStatus({ show: true, message: 'Kunde inte boka.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setShowStatus({ show: false, message: '', type: '' }), 3000);
    }
  };

  // NY FUNKTION: Hantera avbokning
  const handleCancel = async (bookingId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      setShowStatus({ show: true, message: 'Bokningen avbokad.', type: 'success' });
      fetchBookings();
    } catch (err) {
      console.error("Cancel failed:", err.message);
      setShowStatus({ show: true, message: 'Kunde inte avboka.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setShowStatus({ show: false, message: '', type: '' }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
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
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" /> Tillgängliga tider
          </h2>
          {slots.map((slot, index) => {
            // Hitta om det finns en bokning för denna tid
            const bookingForSlot = existingBookings.find(b => 
              b.start_time.includes(`${selectedDate}T${slot.start}`)
            );
            
            const isBooked = !!bookingForSlot;
            const isMine = isBooked && bookingForSlot.user_id === userId;
            const isPast = isTimePast(slot.start);

            return (
              <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <span className={`font-medium ${isBooked || isPast ? 'text-gray-300 italic' : 'text-gray-800'}`}>
                  {slot.start} - {slot.end} {isMine ? "(Din bokning)" : isBooked ? "(Upptagen)" : isPast ? "(Passerad)" : ""}
                </span>
                
                {isMine ? (
                  <button 
                    onClick={() => handleCancel(bookingForSlot.id)}
                    disabled={loading}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-all"
                  >
                    Avboka
                  </button>
                ) : (
                  <button 
                    onClick={() => handleBook(slot)}
                    disabled={loading || isBooked || isPast}
                    className={`${
                      isBooked || isPast ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                    } px-6 py-2 rounded-lg text-sm font-semibold transition-all`}
                  >
                    {isBooked ? 'Upptagen' : isPast ? 'Stängd' : loading ? 'Bokar...' : 'Boka'}
                  </button>
                )}
              </div>
            );
          })}
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default BookingPage;