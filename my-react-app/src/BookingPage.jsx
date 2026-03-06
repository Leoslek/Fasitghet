import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; 
import BottomNav from './BottomNav';

const BookingPage = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [showStatus, setShowStatus] = useState({ show: false, message: '', type: '' });
  const [userId, setUserId] = useState(null);
  const [monthBookings, setMonthBookings] = useState([]);

  const slots = [
    { start: "08:00", end: "12:00" },
    { start: "12:00", end: "16:00" },
    { start: "16:00", end: "20:00" }
  ];

  // Hjälpfunktion för att hitta start och slut på veckan för ett specifikt datum
  const getWeekRange = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 (sön) till 6 (lör)
    // Justera så måndag är dag 1, söndag dag 7
    const diff = date.getDate() - (day === 0 ? 6 : day - 1); 
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  };

  const isTimePast = (dateStr, slotStart) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (dateStr < today) return true;
    if (dateStr === today) {
      const [hour] = slotStart.split(':');
      return now.getHours() >= parseInt(hour);
    }
    return false;
  };

  const fetchMonthStatus = useCallback(async () => {
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).toISOString();
    const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('bookings')
      .select('id, start_time, user_id')
      .eq('resource_id', '1353191a-15fa-4900-9c94-bdff49f45c69')
      .eq('status', 'confirmed')
      .gte('start_time', firstDay)
      .lte('start_time', lastDay);

    if (error) console.error("Database error:", error.message);
    if (data) setMonthBookings(data);
  }, [viewDate]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      fetchMonthStatus();
    };
    init();
  }, [fetchMonthStatus]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i);

  const getDots = (day) => {
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayBookings = monthBookings.filter((b) => b.start_time.startsWith(dateStr));

    const availableCount = slots.reduce((acc, slot) => {
      const isBooked = dayBookings.some(b => b.start_time.includes(`T${slot.start}`));
      const isPast = isTimePast(dateStr, slot.start);
      return (!isBooked && !isPast) ? acc + 1 : acc;
    }, 0);

    if (availableCount === 0) return null;
    let dotColor = "bg-green-500"; 
    if (availableCount === 2) dotColor = "bg-orange-400";
    if (availableCount === 1) dotColor = "bg-red-500";

    return (
      <div className="flex gap-0.5 justify-center mt-1">
        {Array.from({ length: availableCount }, (_, i) => (
          <div key={i} className={`w-1.5 h-1.5 ${dotColor} rounded-full`}></div>
        ))}
      </div>
    );
  };

  const handleBook = async (slot) => {
    if (!userId || isTimePast(selectedDate, slot.start)) return;

    // KONTROLL: Max 2 pass per vecka
    const { monday, sunday } = getWeekRange(selectedDate);
    const myWeekBookings = monthBookings.filter(b => {
        const bDate = new Date(b.start_time);
        return b.user_id === userId && bDate >= monday && bDate <= sunday;
    });

    if (myWeekBookings.length >= 2) {
        setShowStatus({ show: true, message: 'Max 2 pass per vecka tillåtna.', type: 'error' });
        setTimeout(() => setShowStatus({ show: false, message: '', type: '' }), 3000);
        return;
    }

    setLoading(true);
    const startTime = `${selectedDate}T${slot.start}:00`;
    const endTime = `${selectedDate}T${slot.end}:00`;

    try {
      const { error } = await supabase.from('bookings').insert([{ 
          resource_id: '1353191a-15fa-4900-9c94-bdff49f45c69', 
          user_id: userId,
          start_time: startTime,
          end_time: endTime,
          status: 'confirmed'
      }]);
      if (error) throw error;
      setShowStatus({ show: true, message: 'Bokning bekräftad!', type: 'success' });
      fetchMonthStatus(); 
    } catch (err) {
      setShowStatus({ show: true, message: 'Kunde inte boka.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setShowStatus({ show: false, message: '', type: '' }), 3000);
    }
  };

  const handleCancel = async (bookingId) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
      if (error) throw error;
      setShowStatus({ show: true, message: 'Bokningen avbokad.', type: 'success' });
      fetchMonthStatus();
    } catch (err) {
      setShowStatus({ show: true, message: 'Kunde inte avboka.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setShowStatus({ show: false, message: '', type: '' }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {showStatus.show && (
        <div className={`fixed top-4 left-4 right-4 p-4 rounded-xl shadow-lg flex items-center gap-3 z-50 ${showStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {showStatus.type === 'success' && <CheckCircle2 size={24} />}
          <p className="font-medium">{showStatus.message}</p>
        </div>
      )}

      <header className="p-6 bg-white border-b border-gray-100 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-600 hover:text-blue-900"><ChevronLeft size={24} /></Link>
        <h1 className="text-xl font-bold text-blue-950">Boka tvättstuga</h1>
      </header>

      <main className="p-4 space-y-6">
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="font-bold text-gray-800 capitalize">
              {viewDate.toLocaleString('sv-SE', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-4">
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}><ChevronLeft size={20}/></button>
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}><ChevronRight size={20}/></button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center mb-2">
            {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map(d => <span key={d} className="text-[10px] font-bold text-gray-400">{d}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center">
            {blanks.map(b => <div key={`b-${b}`}></div>)}
            {days.map(day => {
                const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                const isPastDay = dateStr < new Date().toISOString().split('T')[0];
                return (
                  <button 
                    key={day} 
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative flex flex-col items-center py-2 rounded-xl transition-all ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50'}`}
                  >
                    <span className={`text-sm font-semibold ${isPastDay && !isSelected ? 'text-gray-300' : ''}`}>{day}</span>
                    <div className="h-2">{!isSelected && getDots(day)}</div>
                  </button>
                )
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2 px-2">
            <Clock size={18} className="text-blue-600" /> 
            Tider för {new Date(selectedDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}
          </h2>
          
          {slots.map((slot, index) => {
            const booking = monthBookings.find(b => b.start_time.startsWith(`${selectedDate}T${slot.start}`));
            const isMine = booking?.user_id === userId;
            const isPast = isTimePast(selectedDate, slot.start);
            
            // UI-Kontroll för veckogräns
            const { monday, sunday } = getWeekRange(selectedDate);
            const myWeekCount = monthBookings.filter(b => {
                const bDate = new Date(b.start_time);
                return b.user_id === userId && bDate >= monday && bDate <= sunday;
            }).length;

            const hasReachedLimit = myWeekCount >= 2;
            const isDisabled = loading || booking || isPast || (hasReachedLimit && !isMine);

            return (
              <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <span className={`font-medium ${booking || isPast ? 'text-gray-300 italic' : 'text-gray-800'}`}>
                  {slot.start} - {slot.end} {isMine ? "(Din tid)" : booking ? "(Bokad)" : isPast ? "(Passerad)" : ""}
                </span>
                {isMine ? (
                  <button onClick={() => handleCancel(booking.id)} disabled={loading} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors">Avboka</button>
                ) : (
                  <button onClick={() => handleBook(slot)} disabled={isDisabled} className={`${isDisabled ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'} px-6 py-2 rounded-lg text-sm font-semibold transition-all`}>
                    {booking ? 'Bokad' : isPast ? 'Stängd' : hasReachedLimit ? 'Veckogräns' : 'Boka'}
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