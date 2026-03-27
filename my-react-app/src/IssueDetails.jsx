import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Paperclip, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { supabase } from './supabaseClient';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); 
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchDetails = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      setUserRole(profile?.role);

      const [ticketRes, messagesRes, attachmentsRes] = await Promise.all([
        supabase.from('tickets').select('*').eq('id', id).single(),
        supabase.from('ticket_messages').select('*').eq('ticket_id', id).order('created_at', { ascending: true }),
        supabase.from('ticket_attachments').select('*').eq('ticket_id', id)
      ]);

      setTicket(ticketRes.data);
      setMessages(messagesRes.data || []);
      setAttachments(attachmentsRes.data || []);
    } catch (err) {
      console.error("Error fetching details:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
    const channel = supabase
      .channel(`chat-${id}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${id}` }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [id, fetchDetails]);

  const isAdmin = userRole === 'landlord' || userRole === 'admin' || userRole === 'Fastighetsskötare' || userRole === 'Styrelse';

  // SMART NAVIGERING: Skickar användaren till rätt dashboard
  const handleBack = () => {
    if (isAdmin) {
      navigate('/admindashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const updateStatus = async (newStatus) => {
    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setTicket({ ...ticket, status: newStatus });
      await sendMessage(null, `System: Status ändrad till ${newStatus}`, true);
    }
  };

  const sendMessage = async (e, customMsg = null, isInternal = false) => {
    if (e) e.preventDefault();
    const msgContent = customMsg || newMessage;
    if (!msgContent.trim()) return;

    const { error } = await supabase.from('ticket_messages').insert([{
      ticket_id: id,
      sender_id: currentUserId,
      message: msgContent,
      is_internal: isInternal
    }]);

    if (!error && !customMsg) setNewMessage("");
  };

  if (loading) return <div className="p-20 text-center font-black italic uppercase animate-pulse">Laddar...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header med Smart Back-knapp */}
      <header className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="font-black text-blue-950 uppercase text-[10px] tracking-widest leading-none">{ticket?.category}</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-tighter">ID: {ticket?.id.slice(0, 8)}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
          ticket?.status === 'registered' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
          ticket?.status === 'in_progress' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
          'bg-green-50 text-green-600 border-green-100'
        }`}>
          {ticket?.status}
        </div>
      </header>

      {/* Admin Kontroller */}
      {isAdmin && (
        <div className="bg-slate-900 p-4 flex items-center justify-between shadow-inner text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Förvaltarvy</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => updateStatus('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${ticket?.status === 'in_progress' ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
            >
              Hanteras
            </button>
            <button 
              onClick={() => updateStatus('resolved')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${ticket?.status === 'resolved' ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
            >
              Markera löst
            </button>
          </div>
        </div>
      )}

      {/* Innehåll */}
      <div className="p-6 bg-white border-b border-gray-100 shadow-sm">
        <p className="text-sm font-medium text-gray-700 leading-relaxed">{ticket?.description}</p>
        <div className="flex gap-2 overflow-x-auto mt-4">
            {attachments.map((file, i) => (
            <div key={i} className="min-w-[160px] h-28 rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                <img src={supabase.storage.from('ticket-attachments').getPublicUrl(file.file_url).data.publicUrl} alt="Bifogad" className="w-full h-full object-cover" />
            </div>
            ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId;
          // Logik för att visa om avsändaren var en admin (om det inte är jag själv)
          const showAdminLabel = !isMe && !isAdmin; 

          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                {showAdminLabel && (
                  <div className="flex items-center gap-1 mb-1 border-b border-gray-50 pb-1 mr-4">
                    <ShieldCheck size={10} className="text-blue-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-600">Förvaltning</span>
                  </div>
                )}
                <p className="text-sm font-medium leading-snug">{msg.message}</p>
                <p className={`text-[8px] mt-2 opacity-40 uppercase font-black italic ${isMe ? 'text-right' : 'text-left'}`}>
                   {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={(e) => sendMessage(e)} className="mx-4 mb-4 p-2 bg-white border border-gray-200 rounded-3xl shadow-xl flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isAdmin ? "Svara hyresgästen..." : "Skriv meddelande..."}
          className="flex-1 bg-transparent border-none rounded-2xl px-4 py-3 text-sm outline-none font-medium"
        />
        <button type="submit" className="bg-blue-600 text-white p-3 rounded-2xl shadow-md hover:bg-blue-700 active:scale-95 transition-all">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default IssueDetails;