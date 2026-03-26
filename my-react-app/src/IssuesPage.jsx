import React, { useState, useEffect } from "react";
import { Search, Filter, Plus, MessageSquare, Paperclip, ChevronRight, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import BottomNav from "./BottomNav";

const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Deklarera funktionen först för att undvika "access before declaration"
  const fetchMyIssues = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Hämtar tickets och räknar meddelanden/bilagor via joins
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_messages(count),
          ticket_attachments(count)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (err) {
      console.error("Kunde inte hämta ärenden:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Kör hämtningen när komponenten laddas
  useEffect(() => {
    fetchMyIssues();
  }, []);

  // Hjälpfunktion för status-färger
const getStatusColor = (status) => {
  switch(status) {
    case 'registered': return 'bg-blue-100 text-blue-700'; // Registrerad
    case 'in_progress': return 'bg-orange-100 text-orange-700'; // Pågående
    case 'resolved': return 'bg-green-100 text-green-700'; // Löst
    case 'closed': return 'bg-gray-100 text-gray-700'; // Stängd
    default: return 'bg-gray-100 text-gray-700';
  }
};

  // Filtrera listan baserat på sökning
  const filteredIssues = issues.filter(issue => 
    issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="p-8 bg-white border-b border-gray-100">
        <h1 className="text-3xl font-bold text-blue-950 tracking-tight italic uppercase">Felanmälningar</h1>
        <p className="text-gray-500 mt-2 mb-6 text-sm">
          Rapportera och spåra dina ärenden i huset.
        </p>

        <Link 
          to="/report-issues" 
          className="w-full bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} /> Rapportera problem
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-2 p-4">
        <div className="flex-1 flex items-center border border-gray-100 rounded-2xl px-4 py-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Sök på problem..." 
            className="bg-transparent outline-none w-full text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm text-gray-600 hover:bg-gray-50">
          <Filter size={18} />
        </button>
      </div>

      {/* Issues List Container */}
      <div className="px-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <ClipboardList className="mx-auto text-gray-200 mb-2" size={48} />
            <p className="text-gray-400 font-medium">Inga felanmälningar hittades.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <Link 
              to={`/issue/${issue.id}`} 
              key={issue.id} 
              className="block bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(issue.status)}`}>
                  {issue.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  {new Date(issue.created_at).toLocaleDateString('sv-SE')}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 uppercase tracking-tighter italic">
                {issue.category}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 font-medium">
                {issue.description}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-50 text-gray-400">
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-blue-400" />
                  <span className="text-xs font-bold text-gray-600">
                    {issue.ticket_messages?.[0]?.count || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Paperclip size={14} className="text-blue-400" />
                  <span className="text-xs font-bold text-gray-600">
                    {issue.ticket_attachments?.[0]?.count || 0}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1 text-blue-600 text-[10px] font-black uppercase tracking-tighter">
                   Visa detaljer <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default IssuesPage;