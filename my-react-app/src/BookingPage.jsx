import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, Bell, BellRing } from 'lucide-react';
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
  const [myWaitlist, setMyWaitlist] = useState([]);

  const slots = [
    { start: "08:00", end: "12:00" },
    { start: "12:00", end: "16:00" },
    { start: "16:00", end: "20:00" }
  ];

  // --- HJÄLPFUNKTIONER ---
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

  const getWeekRange = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - (day === 0 ? 6 : day - 1); 
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { monday, sunday };
  };

  const fetchMonthStatus = useCallback(async () => {
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).toISOString();
    const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, start_time, user_id')
      .eq('resource_id', '1353191a-15fa-4900-9c94-bdff49f45c69')
      .eq('status', 'confirmed')
      .gte('start_time', firstDay)
      .lte('start_time', lastDay);

    if (bookings) setMonthBookings(bookings);

    if (userId) {
      const { data: waitlist } = await supabase
        .from('waitlist')
        .select('start_time')
        .eq('user_id', userId);
      setMyWaitlist(waitlist?.map(w => w.start_time) || []);
    }
  }, [viewDate, userId]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      fetchMonthStatus();
    };
    init();
  }, [fetchMonthStatus]);

  // --- KALENDERBERÄKNINGAR (Flyttade för att undvika ESLint-fel) ---
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }).map((_, i) => i);

  // --- HANDLERS ---
  const handleBook = async (slot) => {
    const { monday, sunday } = getWeekRange(selectedDate);
    const myWeekBookings = monthBookings.filter(b => {
      const bDate = new Date(b.start_time);
      return b.user_id === userId && bDate >= monday && bDate <= sunday;
    });

    if (myWeekBookings.length >= 2) {
      setShowStatus({ show: true, message: 'Max 2 pass per vecka.', type: 'error' });
      return setTimeout(() => setShowStatus({ show: false }), 3000);
    }

    setLoading(true);
    const { error } = await supabase.from('bookings').insert([{ 
      resource_id: '1353191a-15fa-4900-9c94-bdff49f45c69', 
      user_id: userId,
      start_time: `${selectedDate}T${slot.start}:00`,
      end_time: `${selectedDate}T${slot.end}:00`,
      status: 'confirmed'
    }]);

    if (!error) {
      setShowStatus({ show: true, message: 'Bokad!', type: 'success' });
      fetchMonthStatus();
    }
    setLoading(false);
    setTimeout(() => setShowStatus({ show: false }), 3000);
  };

  const handleCancel = async (bookingId, slotStart) => {
    const now = new Date();
    const startTime = new Date(`${selectedDate}T${slotStart}:00`);
    const isLastMinute = (startTime - now) / (1000 * 60) < 60;

    if (!window.confirm(isLastMinute ? "Frisläpp tiden till grannarna?" : "Avboka tiden?")) return;

    setLoading(true);
    await supabase.from('bookings').delete().eq('id', bookingId);
    fetchMonthStatus();
    setLoading(false);
  };

  const handleWaitlist = async (slot) => {
    const startTime = `${selectedDate}T${slot.start}:00`;
    
    // Dubbelkoll för att förhindra flera bevakningar på samma tid
    if (myWaitlist.includes(startTime)) {
        setShowStatus({ show: true, message: 'Du bevakar redan denna tid.', type: 'error' });
        return setTimeout(() => setShowStatus({ show: false }), 3000);
    }

    setLoading(true);
    const { error } = await supabase.from('waitlist').insert([{
      user_id: userId,
      resource_id: '1353191a-15fa-4900-9c94-bdff49f45c69',
      start_time: startTime
    }]);

    if (!error) {
      setShowStatus({ show: true, message: 'Vi meddelar dig om tiden blir ledig!', type: 'success' });
      setMyWaitlist(prev => [...prev, startTime]); // Uppdatera UI lokalt
      fetchMonthStatus();
    }
    setLoading(false);
    setTimeout(() => setShowStatus({ show: false }), 3000);
  };

  const getDots = (day) => {
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayBookings = monthBookings.filter((b) => b.start_time.startsWith(dateStr));
    const availableCount = slots.reduce((acc, slot) => {
      const isBooked = dayBookings.some(b => b.start_time.includes(`T${slot.start}`));
      return (!isBooked && !isTimePast(dateStr, slot.start)) ? acc + 1 : acc;
    }, 0);

    if (availableCount === 0) return null;
    const colors = ["", "bg-red-500", "bg-orange-400", "bg-green-500"];
    return (
      <div className="flex gap-0.5 justify-center mt-1">
        {Array.from({ length: availableCount }).map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 ${colors[availableCount]} rounded-full`} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {showStatus.show && (
        <div className={`fixed top-4 left-4 right-4 p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 ${showStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          <CheckCircle2 size={24} /> <p className="font-medium">{showStatus.message}</p>
        </div>
      )}

      <header className="p-6 bg-white border-b border-gray-100 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-600"><ChevronLeft size={24} /></Link>
        <h1 className="text-xl font-bold text-blue-950">Boka tvättstuga</h1>
      </header>

      <main className="p-4 space-y-6">
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="font-bold text-gray-800 capitalize">{viewDate.toLocaleString('sv-SE', { month: 'long', year: 'numeric' })}</h2>
            <div className="flex gap-4">
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}><ChevronLeft size={20}/></button>
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}><ChevronRight size={20}/></button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center gap-y-2">
            {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map(d => <span key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>)}
            {blanks.map((_, i) => <div key={`blank-${i}`} />)}
            {days.map((day) => {
              const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              return (
                <button key={day} onClick={() => setSelectedDate(dateStr)} className={`py-2 rounded-xl transition-all flex flex-col items-center ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50'}`}>
                  <span className="text-sm font-semibold">{day}</span>
                  <div className="h-2">{!isSelected && getDots(day)}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2 px-2"><Clock size={18} className="text-blue-600" /> Tider för {new Date(selectedDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}</h2>
          {slots.map((slot, index) => {
            const timeStr = `${selectedDate}T${slot.start}:00`;
            const booking = monthBookings.find(b => b.start_time.startsWith(timeStr));
            const isMine = booking?.user_id === userId;
            const isPast = isTimePast(selectedDate, slot.start);
            const isWatching = myWaitlist.includes(timeStr);
            
            const { monday, sunday } = getWeekRange(selectedDate);
            const weekCount = monthBookings.filter(b => b.user_id === userId && new Date(b.start_time) >= monday && new Date(b.start_time) <= sunday).length;
            const limitReached = weekCount >= 2;

            return (
              <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className={`font-medium ${booking || isPast ? 'text-gray-300' : 'text-gray-800'}`}>{slot.start} - {slot.end}</span>
                  {isMine && <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Din bokning</span>}
                </div>
                
                {isMine ? (
                  <button onClick={() => handleCancel(booking.id, slot.start)} disabled={loading} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                    {isPast ? 'Frisläpp' : 'Avboka'}
                  </button>
                ) : booking ? (
                  <button 
                    onClick={() => handleWaitlist(slot)} 
                    disabled={isWatching || isPast || loading} 
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 ${isWatching ? 'bg-gray-100 text-gray-400' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
                  >
                    {isWatching ? <BellRing size={16} className="text-blue-400" /> : <Bell size={16}/>} 
                    {isWatching ? 'Bevakar' : 'Bevaka'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleBook(slot)} 
                    disabled={isPast || limitReached || loading} 
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${isPast || limitReached ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white'}`}
                  >
                    {isPast ? 'Stängd' : limitReached ? 'Veckogräns' : loading ? '...' : 'Boka'}
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