import React, { useState, useEffect } from "react";
import { ArrowLeft, Megaphone, Plus, Trash2, X, Building, Loader2, Send } from "lucide-react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";
import AdminBottomNav from "./AdminBottomNav";

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        target_building: "Alla"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        
        // Hämta alla nyheter
        const { data: newsData } = await supabase
            .from("announcements")
            .select("*")
            .order("created_at", { ascending: false });
            
        // Hämta alla unika adresser från lägenhetstabellen
        const { data: aptData } = await supabase
            .from("apartments")
            .select("building_address");
            
        if (newsData) setAnnouncements(newsData);
        
        if (aptData) {
            // Filtrera fram unika adresser så vi inte får "Jättegrytsgatan 1 A" 18 gånger i listan
            const uniqueAddresses = [...new Set(aptData.map(a => a.building_address))];
            setBuildings(uniqueAddresses);
        }
        
        setLoading(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setIsSending(true);

        try {
            // Hämta inloggad admin
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) throw new Error("Du måste vara inloggad.");

            const payload = {
                title: formData.title,
                content: formData.content,
                target_building: formData.target_building,
                author_id: user.id
            };

            const { error } = await supabase.from("announcements").insert([payload]);
            if (error) throw error;

            setIsModalOpen(false);
            setFormData({ title: "", content: "", target_building: "Alla" });
            fetchData();
        } catch (error) {
            alert("Kunde inte skicka meddelande: " + error.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Vill du ta bort detta meddelande? Det försvinner direkt från de boendes app.")) return;
        
        const { error } = await supabase.from("announcements").delete().eq("id", id);
        if (!error) fetchData();
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen pb-24">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center">
                    <Link to="/admindashboard" className="mr-4 p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-black uppercase italic">Anslagstavlan</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg cursor-pointer"
                >
                    <Megaphone size={16} className="mr-2" /> Nytt Utskick
                </button>
            </div>

            {/* LISTA MED TIDIGARE UTSKICK */}
            <div className="max-w-3xl mx-auto">
                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
                ) : announcements.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm">
                        <Megaphone size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Inga meddelanden skickade</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((news) => (
                            <div key={news.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative group">
                                <button 
                                    onClick={() => handleDelete(news.id)}
                                    className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                    title="Ta bort"
                                >
                                    <Trash2 size={18} />
                                </button>
                                
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${news.target_building === 'Alla' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {news.target_building === 'Alla' ? 'Alla Hus' : news.target_building}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {new Date(news.created_at).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-black uppercase italic text-slate-900 mb-2">{news.title}</h3>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{news.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SKAPA NYTT MEDDELANDE-MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-black uppercase italic text-slate-900">Skapa Utskick</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-slate-900 cursor-pointer"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSend} className="p-8 flex flex-col gap-5">
                            
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Mottagare</label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select 
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-slate-900 font-bold cursor-pointer appearance-none"
                                        value={formData.target_building} 
                                        onChange={e => setFormData({ ...formData, target_building: e.target.value })}
                                    >
                                        <option value="Alla">Alla hus (Hela beståndet)</option>
                                        {buildings.map(address => (
                                            <option key={address} value={address}>Bara {address}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Rubrik</label>
                                <input 
                                    required 
                                    placeholder="T.ex. Vattnet stängs av på onsdag"
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:border-slate-900 outline-none font-bold"
                                    value={formData.title} 
                                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Meddelande</label>
                                <textarea 
                                    required 
                                    rows="5"
                                    placeholder="Skriv din information här..."
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:border-slate-900 outline-none font-medium resize-none"
                                    value={formData.content} 
                                    onChange={e => setFormData({ ...formData, content: e.target.value })} 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSending}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest mt-2 hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50 cursor-pointer"
                            >
                                {isSending ? <Loader2 className="animate-spin" size={20} /> : <><Send size={16} className="mr-2" /> Skicka Meddelande</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <AdminBottomNav />
        </div>
    );
};

export default AdminAnnouncements;