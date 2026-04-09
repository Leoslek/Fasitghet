import React, { useState, useEffect } from "react";
import { Home, Plus, Edit, Trash2, MapPin, Layout, Activity, X, ArrowLeft } from "lucide-react";
import {supabase } from "./supabaseClient";
import {Link, useNavigate } from "react-router-dom";
import AdminBottomNav from "./AdminBottomNav";

const PropertyManagement = () => {
    const navigate = useNavigate();
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        apt_number: "",
        building_adress: "",
        sqm: "",
        rooms: "",
        rent: "",
        status: "Ledig"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data } = await supabase.from("apartments").select("*").order("building_adress");
        if (data) setApartments(data);
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from("apartments").insert([formData]);
        if (!error) {
            setIsModalOpen(false);
            setFormData({ apt_number: "", building_adress: "", sqm: "", rooms: "", rent: "", status: "Ledig"});
            fetchData();
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Uthyrd": return "bg-green-100 text-green-700 border-green-200";
            case "Ledig": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Renovering": return "bg-orange-100 text-range-700 border-orange-200";
            default: return "bg-gray-100 test-gray-700";
        }
    };

    return(
        <div className="p-8 bg-gray-50 min-h-screen pb-24">
            <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                        <Link
                        to ="/admindashboard" 
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full transistion hover:cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-black uppercase italic">Fastighetshantering</h1>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center text-sm font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-lg hover:cursor-pointer"
                    >
                        <Plus size={18} className="mr-2" /> Ny Enhet
                    </button>
            </div>   

                <main className="flex-1 overflow-y-auto p-8">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <QuickStat title="Totalt antal enheter" value={apartments.length} icon={<Layout className="text-slate-600"/>} />
                        <QuickStat title="Lediga för uthyrning" value={apartments.filter(a => a.status === "Ledig").length} icon={<Activity className="text-blue-600"/>} />
                        <QuickStat title="Under renovering" value={apartments.filter(a => a.status === "Renovering").length} icon={<Activity className="text-orange-600" />} />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                    <th className="px-6 py-4">Adress & Enhet</th>
                                    <th className="px-6 py-4">Specifikation</th>
                                    <th className="px-6 py-4">Månadshyra</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Åtgärd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {apartments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 uppercase italic leading-none">{apt.building_address}</div>
                                            <div className="text-xs text-gray-400 mt-1 font-medium">Lgh {apt.apt_number}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {apt.sqm} kvm • {apt.rooms} rok
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(apt.status)}`}>
                                                {apt.status || "Okänd"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-slate-900 transition"><Edit size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter">Hantera Enhet</h2>
                            <button className="hover:cursor-pointer" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="tetx-[10px] font-black uppercase text-gray-400 tracking-widest">Gatuadress</label>
                                <input required className="w-full p-3 bg-gray-100 border-none rounded-xl mt-1 focus:ring-2 focus:ring-slate-900 outline-none"
                                value={formData.building_adress} onChange={e => setFormData({...formData, building_adress: e.target.value})} />
                            </div>
                            <div>
                                <label className="tetx-[10px] font-black uppercase text-gray-400 tracking-widest">Lgh nummer</label>
                                <input required className="w-full p-3 bg-gray-100 border-none rounded-xl mt-1"
                                value={formData.apt_number} onChange={e => setFormData({...formData, apt_number: e.target.value})} />
                            </div>
                            <div>
                                <label className="tetx-[10px] font-black uppercase text-gray-400 tracking-widest">Yta (kvm)</label>
                                <input required className="w-full p-3 bg-gray-100 border-none rounded-xl mt-1"
                                value={formData.sqm} onChange={e => setFormData({...formData, sqm: e.target.value})} />
                            </div>
                            <div>
                                <label className="tetx-[10px] font-black uppercase text-gray-400 tracking-widest">Hyra</label>
                                <input required className="w-full p-3 bg-gray-100 border-none rounded-xl mt-1"
                                value={formData.rent} onChange={e => setFormData({...formData, rent: e.target.value})} />
                            </div>
                            <div>
                                <label className="tetx-[10px] font-black uppercase text-gray-400 tracking-widest">Status</label>
                                <select className="w-full p-3 bg-gray-100 border-none rounded-xl mt-1 outline-none hover:cursor-pointer"
                                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="Ledig">Ledig</option>
                                    <option value="Uthyrd">Uthyrd</option>
                                    <option value="Renovering">Renovering</option>
                                </select>
                            </div>
                            <button type="submit" className="col-span-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-slate-800 transition hover:cursor-pointer">
                                Spara Enhet
                            </button>
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
        <div className="p-3 bg-gray-50 rounded-xl mr-4">{icon}</div>
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black italic">{value}</p>
        </div>
    </div>
);

export default PropertyManagement;