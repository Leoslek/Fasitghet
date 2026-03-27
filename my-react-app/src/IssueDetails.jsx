import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Paperclip, ShieldCheck, User, Phone, EyeOff, MapPin } from 'lucide-react';
import { supabase } from './supabaseClient';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [resident, setResident] = useState(null); // NY: Sparar info om boende
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false); // NY: Toggle för intern anteckning
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); 
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchDetails = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
      setUserRole(profile?.role);

      const [ticketRes, messagesRes, attachmentsRes] = await Promise.all([
        supabase.from('tickets').select('*').eq('id', id).single(),
        supabase.from('ticket_messages').select('*').eq('ticket_id', id).order('created_at', { ascending: true }),
        supabase.from('ticket_attachments').select('*').eq('ticket_id', id)
      ]);

      setTicket(ticketRes.data);
      setMessages(messagesRes.data || []);
      setAttachments(attachmentsRes.data || []);

      // NYTT: Hämta uppgifter om personen som skapade ärendet
      if (ticketRes.data?.creator_id) {
        const { data: residentData } = await supabase.from('users').select('*').eq('id', ticketRes.data.creator_id).single();
        setResident(residentData);
      }

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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${id}` }, 
        (payload) => setMessages(prev => [...prev, payload.new])
      ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [id, fetchDetails]);

  const isAdmin = ['landlord', 'admin', 'Fastighetsskötare', 'Styrelse'].includes(userRole);

  const handleBack = () => { isAdmin ? navigate('/admindashboard') : navigate('/dashboard'); };

  const updateStatus = async (newStatus) => {
    const { error } = await supabase.from('tickets').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setTicket({ ...ticket, status: newStatus });
      await sendMessage(null, `System: Status ändrad till ${newStatus}`, true);
    }
  };

  const sendMessage = async (e, customMsg = null, forceInternal = false) => {
    if (e) e.preventDefault();
    const msgContent = customMsg || newMessage;
    if (!msgContent.trim()) return;

    // Kollar om det är en intern anteckning
    const isInternal = forceInternal || isInternalNote;

    const { error } = await supabase.from('ticket_messages').insert([{
      ticket_id: id,
      sender_id: currentUserId,
      message: msgContent,
      is_internal: isInternal
    }]);

    if (!error && !customMsg) {
      setNewMessage("");
      setIsInternalNote(false); // Återställ toggle
    }
  };

  if (loading) return <div className="p-20 text-center font-black italic uppercase animate-pulse">Laddar...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="font-black text-blue-950 uppercase text-[10px] tracking-widest leading-none">{ticket?.category}</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-tighter">ID: {ticket?.id.slice(0, 8)}</p>
          </div>
        </div>
      </header>

      {/* NYTT: Förvaltarpanel med information om den boende */}
      {isAdmin && (
        <div className="bg-slate-900 border-b border-slate-800 flex flex-col">
          {/* Action-raden */}
          <div className="p-4 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Förvaltarvy</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateStatus('in_progress')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${ticket?.status === 'in_progress' ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}>Hanteras</button>
              <button onClick={() => updateStatus('resolved')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${ticket?.status === 'resolved' ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}>Markera löst</button>
            </div>
          </div>
          
          {/* Boende-info */}
          {resident && (
            <div className="p-4 flex gap-4 text-slate-300 text-sm bg-slate-900/50">
              <div className="flex items-center gap-2"><User size={14} className="text-slate-500"/> <span className="font-medium">{resident.full_name}</span></div>
              {resident.apartment_number && <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-500"/> <span className="font-medium text-xs">Lgh {resident.apartment_number}</span></div>}
            </div>
          )}
        </div>
      )}

      {/* Ärendebeskrivning */}
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
          // Säkerhet: Dölj interna meddelanden för boende
          if (msg.is_internal && !isAdmin) return null;

          const isMe = msg.sender_id === currentUserId;
          const isInternalMsg = msg.is_internal;
          const showAdminLabel = !isMe && !isAdmin && !isInternalMsg;

          // Stylar interna meddelanden annorlunda (Gult)
          const bubbleColors = isInternalMsg 
            ? 'bg-amber-100 text-amber-900 border border-amber-300 rounded-br-none' // Intern design
            : isMe 
              ? 'bg-blue-600 text-white rounded-tr-none' // Min egen design
              : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'; // Någon annans design

          return (
            <div key={i} className={`flex ${isMe || isInternalMsg ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm relative ${bubbleColors}`}>
                
                {/* Etikett för Intern anteckning */}
                {isInternalMsg && (
                  <div className="flex items-center gap-1 mb-1 border-b border-amber-200 pb-1">
                    <EyeOff size={10} className="text-amber-600" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">Intern Anteckning</span>
                  </div>
                )}

                {showAdminLabel && (
                  <div className="flex items-center gap-1 mb-1 border-b border-gray-50 pb-1 mr-4">
                    <ShieldCheck size={10} className="text-blue-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-600">Förvaltning</span>
                  </div>
                )}
                
                <p className="text-sm font-medium leading-snug">{msg.message}</p>
                <p className={`text-[8px] mt-2 opacity-50 uppercase font-black italic ${(isMe || isInternalMsg) ? 'text-right' : 'text-left'}`}>
                   {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={(e) => sendMessage(e)} className="mx-4 mb-4 p-2 bg-white border border-gray-200 rounded-3xl shadow-xl flex gap-2 items-center">
        
        {/* NYTT: Knapp för intern anteckning (Bara för admins) */}
        {isAdmin && (
          <button 
            type="button" 
            onClick={() => setIsInternalNote(!isInternalNote)}
            className={`p-2.5 rounded-xl transition-all ${isInternalNote ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:bg-gray-50'}`}
            title="Intern anteckning"
          >
            <EyeOff size={18} />
          </button>
        )}

        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isInternalNote ? "Skriv dold anteckning..." : isAdmin ? "Svara hyresgästen..." : "Skriv meddelande..."}
          className={`flex-1 bg-transparent border-none rounded-2xl px-2 py-3 text-sm outline-none font-medium ${isInternalNote ? 'text-amber-900 placeholder-amber-400' : 'text-slate-900'}`}
        />
        <button type="submit" className={`p-3 rounded-2xl shadow-md active:scale-95 transition-all text-white ${isInternalNote ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default IssueDetails;