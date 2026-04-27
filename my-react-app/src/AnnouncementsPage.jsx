import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, AlertTriangle, Loader2 } from 'lucide-react';
import BottomNav from "./BottomNav";
import { supabase } from "./supabaseClient";

const AnnouncementsPage = () => {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            // 1. Vem är inloggad?
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 2. Hämta den inloggades adress
            const { data: userData } = await supabase
                .from("users")
                .select(`
                    apartments (
                        building_address
                    )
                `)
                .eq("id", user.id)
                .single();

            const userBuilding = userData?.apartments?.building_address;

            // 3. Hämta meddelanden (som riktar sig till "Alla" eller till användarens specifika adress)
            let query = supabase
                .from("announcements")
                .select("*")
                .order("created_at", { ascending: false });

            if (userBuilding) {
                // Letar efter inlägg riktade till "Alla" eller husets adress
                query = query.in("target_building", ["Alla", userBuilding]);
            } else {
                // Om användaren inte har en kopplad lägenhet, visa bara allmänna utskick
                query = query.eq("target_building", "Alla");
            }

            const { data: newsData, error } = await query;
            if (error) throw error;

            setAnnouncements(newsData || []);
        } catch (error) {
            console.error("Fel vid hämtning av anslag:", error);
        } finally {
            setLoading(false);
        }
    };

    // Smart funktion för att automatiskt välja röd/blå ikon baserat på rubriken
    const getStyles = (title) => {
        const lowerTitle = (title || "").toLowerCase();
        if (lowerTitle.includes("viktigt") || lowerTitle.includes("avstängt") || lowerTitle.includes("reparation")) {
            return { bg: "bg-red-50", icon: <AlertTriangle className="text-red-600" size={24} /> };
        }
        return { bg: "bg-blue-50", icon: <Info className="text-blue-600" size={24} /> };
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:cursor-pointer transition">
                    <ArrowLeft size={20}/>
                </button>
                <h1 className="text-2xl font-bold text-blue-950">Meddelanden</h1>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
                ) : announcements.length > 0 ? (
                    announcements.map((item) => {
                        const style = getStyles(item.title);
                        return (
                            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${style.bg}`}>
                                        {style.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap ml-2">
                                                {new Date(item.created_at).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                            {item.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center p-10 bg-white rounded-2xl border border-gray-100">
                        <Info size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500 font-medium">Inga nya meddelanden.</p>
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
};

export default AnnouncementsPage;