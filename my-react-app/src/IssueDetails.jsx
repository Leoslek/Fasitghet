import React, { useState, useEffect, useCallback } from 'react'; // Lade till useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Paperclip, ShieldCheck, Clock } from 'lucide-react';
import { supabase } from './supabaseClient';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // 1. FLYTTA UPP FUNKTIONEN OCH ANVÄND CALLBACK (Fixar ESLint-felen)
  const fetchDetails = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

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

  // 2. NU KAN USEEFFECT ANROPA FUNKTIONEN SÄKERT
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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('ticket_messages').insert([{
      ticket_id: id,
      sender_id: currentUserId,
      message: newMessage,
      is_internal: false
    }]);

    if (!error) setNewMessage("");
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center font-black text-blue-900 uppercase italic animate-pulse">
        Laddar konversation...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-4">
      <header className="p-4 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-blue-900">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="font-black text-blue-950 uppercase text-[10px] tracking-widest leading-none">
            {ticket?.category || 'Ärende'}
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">
            ID: {ticket?.id?.slice(0, 8)}
          </p>
        </div>
      </header>

      <div className="p-6 bg-white border-b border-gray-100 shadow-sm">
        <p className="text-sm text-gray-700 font-medium leading-relaxed">{ticket?.description}</p>
        {attachments.length > 0 && (
          <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
            {attachments.map((file, i) => (
              <div key={i} className="min-w-35 h-28 bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-inner">
                <img 
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/ticket-attachments/${file.file_url}`} 
                  alt="Bifogad bild" 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${
                isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                {!isMe && (
                  <div className="flex items-center gap-1 mb-1 border-b border-gray-50 pb-1 mr-4">
                    <ShieldCheck size={12} className="text-blue-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Förvaltning</span>
                  </div>
                )}
                <p className="text-sm font-medium leading-snug">{msg.message}</p>
                <div className={`flex items-center gap-1 mt-2 opacity-40 ${isMe ? 'justify-end' : 'justify-start'}`}>
                   <Clock size={8} />
                   <span className="text-[8px] font-bold uppercase tracking-tighter">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={sendMessage} className="mx-4 p-2 bg-white border border-gray-200 rounded-3xl shadow-lg flex gap-2">
        <button type="button" className="p-3 text-gray-400 hover:text-blue-600 transition-colors">
          <Paperclip size={20} />
        </button>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Skriv ett svar..."
          className="flex-1 bg-transparent border-none outline-none font-medium text-sm px-2"
        />
        <button type="submit" className="p-3 bg-blue-600 text-white rounded-2xl shadow-md hover:bg-blue-700 active:scale-95 transition-all">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default IssueDetails;