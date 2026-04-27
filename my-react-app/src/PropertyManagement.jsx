import React, { useState, useEffect } from "react";
import { Plus, Edit, Layout, Activity, X, ArrowLeft, Percent, Loader2, Search, SlidersHorizontal, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "./supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import AdminBottomNav from "./AdminBottomNav";

const PropertyManagement = () => {
    const navigate = useNavigate();
    const [apartments, setApartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Håller koll på vilka adresser som är utfällda i listan
    const [expandedAddresses, setExpandedAddresses] = useState({});
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        apt_number: "",
        building_address: "",
        specification: "",
        monthly_rent: "",
        status: "Ledig"
    });

    const [isPercentModalOpen, setIsPercentModalOpen] = useState(false);
    const [percentValue, setPercentValue] = useState("");
    const [isApplyingPercent, setIsApplyingPercent] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    // När vi hämtar lägenheter, fäll ut alla adresser automatiskt från början
    useEffect(() => {
        if (apartments.length > 0) {
            const uniqueAddresses = [...new Set(apartments.map(a => a.building_address))];
            const initialExpanded = {};
            uniqueAddresses.forEach(addr => initialExpanded[addr] = true);
            setExpandedAddresses(initialExpanded);
        }
    }, [apartments]);

    const fetchData = async () => {
        setLoading(true);
        const { data } = await supabase.from("apartments").select("*").order("building_address");
        if (data) setApartments(data);
        setLoading(false);
    };

    const toggleAddress = (address) => {
        setExpandedAddresses(prev => ({
            ...prev,
            [address]: !prev[address]
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            apt_number: formData.apt_number,
            building_address: formData.building_address,
            specification: formData.specification,
            monthly_rent: parseInt(formData.monthly_rent) || 0,
            status: formData.status
        };

        if (editingId) {
            const { error } = await supabase.from("apartments").update(payload).eq("id", editingId);
            if (!error) closeAndRefresh();
        } else {
            const { error } = await supabase.from("apartments").insert([payload]);
            if (!error) closeAndRefresh();
        }
    };

    const handleMassPercentIncrease = async (e) => {
        e.preventDefault();
        const percent = parseFloat(percentValue.replace(",", "."));
        if (isNaN(percent) || percent <= 0) return alert("Ange en giltig procentsats.");
        if (!window.confirm(`Höja alla hyror med ${percent}%?`)) return;

        setIsApplyingPercent(true);
        try {
            const apartmentsWithRent = apartments.filter(apt => apt.monthly_rent > 0);
            const updatePromises = apartmentsWithRent.map(apt => {
                const newRent = Math.round(apt.monthly_rent * (1 + (percent / 100)));
                return supabase.from("apartments").update({ monthly_rent: newRent }).eq("id", apt.id);
            });
            await Promise.all(updatePromises);
            setIsPercentModalOpen(false);
            setPercentValue("");
            fetchData();
        } catch (error) {
            alert("Fel: " + error.message);
        } finally {
            setIsApplyingPercent(false);
        }
    };

    const closeAndRefresh = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ apt_number: "", building_address: "", specification: "", monthly_rent: "", status: "Ledig" });
        fetchData();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Uthyrd": return "bg-green-100 text-green-700 border-green-200";
            case "Ledig": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Renovering": return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // --- LOGIK FÖR ATT GRUPPERA PÅ ADRESS OCH VÅNING ---
    
    // 1. Filtrera baserat på sökning
    const filteredApartments = apartments.filter(apt => 
        apt.building_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.apt_number?.includes(searchTerm)
    );

    // 2. Gruppera lägenheter på gatuadress
    const groupedByAddress = filteredApartments.reduce((acc, apt) => {
        const addr = apt.building_address || "Okänd adress";
        if (!acc[addr]) acc[addr] = [];
        acc[addr].push(apt);
        return acc;
    }, {});

    // 3. Hjälpfunktioner för att översätta 10xx, 11xx till våningsnamn
    const getFloorLevel = (aptNumber) => {
        if (!aptNumber || aptNumber.length < 4) return 0;
        return parseInt(aptNumber.substring(0, 2)) || 0;
    };

    const getFloorName = (level) => {
        if (level === 10) return "Bottenplan";
        if (level > 10) return `Våning ${level - 10}`;
        if (level === 9) return "Källarplan";
        return `Våningsplan ${level}`;
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen pb-24">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <Link to="/admindashboard" className="mr-4 p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-black uppercase italic">Fastighetshantering</h1>
                </div>
                <button
                    onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                    className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg"
                >
                    <Plus size={18} className="mr-2" /> Ny Enhet
                </button>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <QuickStat title="Totalt antal enheter" value={apartments.length} icon={<Layout size={20}/>} />
                <QuickStat title="Lediga för uthyrning" value={apartments.filter(a => a.status === "Ledig").length} icon={<Activity size={20} className="text-blue-600"/>} />
                <QuickStat title="Under renovering" value={apartments.filter(a => a.status === "Renovering").length} icon={<Activity size={20} className="text-orange-600" />} />
            </div>

            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 px-2 gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Sök adress eller lgh..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setIsPercentModalOpen(true)}
                    className="flex items-center text-gray-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition group bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
                >
                    <SlidersHorizontal size={14} className="mr-2 text-slate-400 group-hover:text-slate-900" />
                    Hyresjustering (%)
                </button>
            </div>

            {/* LISTA MED ADRESSER (ACCORDIONS) */}
            {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
            ) : Object.keys(groupedByAddress).length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400 italic">Inga lägenheter hittades.</div>
            ) : (
                Object.entries(groupedByAddress).map(([address, apts]) => {
                    
                    // Gruppera lägenheterna på den aktuella adressen i våningsplan
                    const floorGroups = apts.reduce((acc, apt) => {
                        const level = getFloorLevel(apt.apt_number);
                        if (!acc[level]) acc[level] = [];
                        acc[level].push(apt);
                        return acc;
                    }, {});

                    // Sortera våningsplanen från lägst (t.ex. 10 = Bottenplan) till högst (15 = Våning 5)
                    const sortedFloors = Object.keys(floorGroups).map(Number).sort((a, b) => a - b);

                    return (
                        <div key={address} className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* ADRESS-HUVUD (Klickbart för att fälla in/ut) */}
                            <button
                                onClick={() => toggleAddress(address)}
                                className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                            >
                                <div className="flex items-center">
                                    <MapPin className="text-slate-400 mr-3" size={24} />
                                    <h2 className="text-lg font-black uppercase italic text-slate-900">{address}</h2>
                                    <span className="ml-4 px-3 py-1 bg-white rounded-full text-[10px] font-black text-gray-400 border border-gray-200">
                                        {apts.length} enheter
                                    </span>
                                </div>
                                {expandedAddresses[address] ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                            </button>

                            {/* TABELLEN SOM VISAS NÄR ADRESSEN ÄR UTFÄLLD */}
                            {expandedAddresses[address] && (
                                <div className="border-t border-gray-100">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                                                <th className="px-6 py-4">Lgh nummer</th>
                                                <th className="px-6 py-4">Specifikation</th>
                                                <th className="px-6 py-4">Månadshyra</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                                <th className="px-6 py-4 text-right">Åtgärd</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sortedFloors.map(floorLevel => (
                                                <React.Fragment key={floorLevel}>
                                                    {/* VÅNINGS-RUBRIK (Mjuk och subtil istället för mörk) */}
                                                    <tr className="bg-slate-50/80 border-b border-gray-100">
                                                        <td colSpan="5" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            {getFloorName(floorLevel)}
                                                        </td>
                                                    </tr>
                                                    
                                                    {/* LÄGENHETER PÅ DETTA VÅNINGSPLAN */}
                                                    {floorGroups[floorLevel].sort((a,b) => a.apt_number.localeCompare(b.apt_number)).map(apt => (
                                                        <tr key={apt.id} className="hover:bg-blue-50/50 transition">
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-slate-900">Lgh {apt.apt_number}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                                                {apt.specification || "-"}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-black text-slate-800">
                                                                {apt.monthly_rent ? `${apt.monthly_rent.toLocaleString('sv-SE')} kr` : "Ej satt"}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(apt.status)}`}>
                                                                    {apt.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button 
                                                                    onClick={() => {
                                                                        setEditingId(apt.id);
                                                                        setFormData({ ...apt, monthly_rent: apt.monthly_rent || "" });
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    className="p-2 text-gray-300 hover:text-slate-900 transition cursor-pointer"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {/* PERCENT MODAL */}
            {isPercentModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-white/20">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-900">Hyresjustering</h2>
                            <button onClick={() => setIsPercentModalOpen(false)} className="text-gray-400 hover:text-slate-900 cursor-pointer"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleMassPercentIncrease} className="p-8">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Ange höjning i procent</label>
                            <div className="relative mb-6">
                                <input 
                                    autoFocus
                                    className="w-full p-5 text-3xl font-black italic bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-slate-900 transition"
                                    placeholder="0.0"
                                    value={percentValue} 
                                    onChange={e => setPercentValue(e.target.value)} 
                                />
                                <Percent className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={28} />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isApplyingPercent}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
                            >
                                {isApplyingPercent ? "Uppdaterar..." : "Verkställ för alla"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL (Individual) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-black uppercase italic">{editingId ? "Redigera Enhet" : "Ny Enhet"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="cursor-pointer"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 grid grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase text-gray-400">Gatuadress</label>
                                <input required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 focus:border-slate-900 outline-none font-bold"
                                    value={formData.building_address} onChange={e => setFormData({ ...formData, building_address: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400">Lgh nummer</label>
                                <input required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 focus:border-slate-900 outline-none font-bold"
                                    value={formData.apt_number} onChange={e => setFormData({ ...formData, apt_number: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400">Månadshyra</label>
                                <input required type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 focus:border-slate-900 outline-none font-bold"
                                    value={formData.monthly_rent} onChange={e => setFormData({ ...formData, monthly_rent: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase text-gray-400">Specifikation (3 rok, 75 kvm etc)</label>
                                <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 focus:border-slate-900 outline-none font-medium"
                                    value={formData.specification} onChange={e => setFormData({ ...formData, specification: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase text-gray-400">Status</label>
                                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 outline-none focus:border-slate-900 font-bold cursor-pointer"
                                    value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Ledig">Ledig</option>
                                    <option value="Uthyrd">Uthyrd</option>
                                    <option value="Renovering">Renovering</option>
                                </select>
                            </div>
                            <button type="submit" className="col-span-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-blue-600 transition cursor-pointer">Spara</button>
                        </form>
                    </div>
                </div>
            )}
            <AdminBottomNav />
        </div>
    );
};

const QuickStat = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center shadow-sm">
        <div className="p-3 bg-gray-50 rounded-xl mr-4 text-slate-400">{icon}</div>
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black italic text-slate-900">{value}</p>
        </div>
    </div>
);

export default PropertyManagement;