import React, { useState, useEffect } from "react";
import { Search, Plus, MessageSquare, Paperclip, ChevronRight, ClipboardList, ArrowLeft} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";

const IssuesPage = ({ isAdmin }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [userRole, setUserRole] = useState(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
      setUserRole(profile?.role);

      let query = supabase.from('tickets').select('*, ticket_messages(count), ticket_attachments(count)');
      
      // Om man inte är admin, visa BARA ens egna ärenden
      if (!isAdmin) {
        query = query.eq('creator_id', user.id);
      }

      const { data, error } = await query
        .order('priority', { ascending: false }) 
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); }, [isAdmin]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'registered': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-orange-100 text-orange-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen pb-24">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link
            to={isAdmin ? "/admindashboard" : "/dashboard"}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition hover:cursor-pointer"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-black uppercase italic ">
              {isAdmin ? "Alla Ärenden" : "Mina Ärenden"}
          </h1>
        </div>
        
        {/* Visa bara knappen "Nytt problem" för boende */}
        {!isAdmin && (
          <Link to="/report-issues" className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center text-sm font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-lg hover:cursor-pointer">
            <Plus size={20} /> Nytt problem
          </Link>
        )}
      </div>

      {isAdmin ? (
         <p className="text-gray-500 mb-6 text-sm font-medium italic">
          Hantera fastighetens felanmälningar.
         </p>
      ) : (
         <p className="text-gray-500 mb-6 text-sm font-medium italic">
          Följ status på dina ärenden.
         </p>
      )}

      {/* Sök & Filtersektion */}
      <div className="p-4 space-y-3">
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

        {/* DE NYA FILTER-KNAPPARNA */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: 'all', label: 'Alla' },
            { id: 'registered', label: 'Nya' },
            { id: 'in_progress', label: 'Pågår' },
            { id: 'resolved', label: 'Lösta' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border cursor-pointer ${
                statusFilter === f.id 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {loading ? (
          <div className="text-center py-20 font-black italic uppercase text-slate-300 animate-pulse">Synkar...</div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <ClipboardList className="mx-auto text-gray-200 mb-2" size={48} />
            <p className="text-gray-400 font-bold uppercase text-[10px]">Inga ärenden matchar</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <Link to={`/issue/${issue.id}`} key={issue.id} className="block bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(issue.status)}`}>
                    {issue.status === 'registered' ? 'Ny' : issue.status === 'in_progress' ? 'Pågår' : 'Klart'}
                  </span>
                  {issue.priority === 4 && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 border border-red-200 animate-pulse"> Akut</span>}
                  {issue.priority === 3 && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 border border-orange-200">Hög prio</span>}
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase italic">{new Date(issue.created_at).toLocaleDateString('sv-SE')}</span>
              </div>
              <h3 className="font-black text-gray-800 text-lg leading-tight mb-1 uppercase tracking-tighter italic">{issue.category}</h3>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50 text-gray-400">
                <div className="flex items-center gap-1.5"><MessageSquare size={14} className="text-blue-500" /><span className="text-xs font-bold text-gray-700">{issue.ticket_messages?.[0]?.count || 0}</span></div>
                <div className="flex items-center gap-1.5"><Paperclip size={14} className="text-blue-500" /><span className="text-xs font-bold text-gray-700">{issue.ticket_attachments?.[0]?.count || 0}</span></div>
                <div className="ml-auto flex items-center gap-1 text-blue-600 text-[10px] font-black uppercase tracking-tighter">
                    {isAdmin ? "Hantera" : "Detaljer"} <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
  
     

    </div>
  );
};

export default IssuesPage;