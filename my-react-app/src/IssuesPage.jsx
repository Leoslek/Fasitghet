import React, { useState, useEffect } from "react";
import { Search, Filter, Plus, MessageSquare, Paperclip, ChevronRight, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import BottomNav from "./BottomNav";

const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Hämta användarens roll
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setUserRole(profile?.role);

      // 2. Bygg queryn baserat på roll
      let query = supabase
        .from('tickets')
        .select(`
          *,
          ticket_messages(count),
          ticket_attachments(count)
        `);

      const isAdminRole = ['landlord', 'admin', 'Fastighetsskötare', 'Styrelse'].includes(profile?.role);
      
      if (!isAdminRole) {
        // Om boende: Se bara egna
        query = query.eq('creator_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (err) {
      console.error("Kunde inte hämta ärenden:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const isAdmin = ['landlord', 'admin', 'Fastighetsskötare', 'Styrelse'].includes(userRole);

  const getStatusColor = (status) => {
    switch(status) {
      case 'registered': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-orange-100 text-orange-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredIssues = issues.filter(issue => 
    issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-slate-900">
      {/* Header - Anpassad efter roll */}
      <div className="p-8 bg-white border-b border-gray-100">
        <h1 className="text-3xl font-black text-blue-950 tracking-tight italic uppercase">
            {isAdmin ? "Alla Ärenden" : "Mina Ärenden"}
        </h1>
        <p className="text-gray-500 mt-2 mb-6 text-sm font-medium italic">
          {isAdmin 
            ? "Central hantering av alla inkomna felanmälningar." 
            : "Här kan du följa och chatta kring dina ärenden."}
        </p>

        {/* Endast boende ser "Rapportera"-knappen här, admin sköter det från dashboard */}
        {!isAdmin && (
          <Link 
            to="/report-issues" 
            className="w-full bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} /> Rapportera nytt problem
          </Link>
        )}
      </div>

      {/* Sök */}
      <div className="p-4">
        <div className="flex items-center border border-gray-100 rounded-2xl px-4 py-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Sök i ärenden..." 
            className="bg-transparent outline-none w-full text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 space-y-3">
        {loading ? (
          <div className="text-center py-20 font-black italic uppercase text-slate-300 animate-pulse">Synkar...</div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <ClipboardList className="mx-auto text-gray-200 mb-2" size={48} />
            <p className="text-gray-400 font-bold uppercase text-[10px]">Inga ärenden hittades</p>
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
                  {issue.status === 'registered' ? 'Ny' : issue.status === 'in_progress' ? 'Pågår' : 'Klart'}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase italic">
                  {new Date(issue.created_at).toLocaleDateString('sv-SE')}
                </span>
              </div>
              
              <h3 className="font-black text-gray-800 text-lg leading-tight mb-1 uppercase tracking-tighter italic">
                {issue.category}
              </h3>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50 text-gray-400">
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-blue-500" />
                  <span className="text-xs font-bold text-gray-700">
                    {issue.ticket_messages?.[0]?.count || 0}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1 text-blue-600 text-[10px] font-black uppercase tracking-tighter">
                    {isAdmin ? "Hantera & Svara" : "Visa detaljer"} <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Den smarta BottomNav som nu känner av om du är admin */}
      <BottomNav />
    </div>
  );
};

export default IssuesPage;