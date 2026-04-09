import React, { useState, useEffect } from 'react';
import { User, Phone, Home, Mail, Save, ChevronLeft, CheckCircle2, ShieldCheck, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import BottomNav from './BottomNav';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ show: false, message: '' });
    const [profile, setProfile] = useState({
        full_name: '',
        phone: '',
        role: '',
        email: '',
        apt_number: '',
        building_address: '',
        lantmateri_id: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Vi hämtar data och joinar med apartments (notera apt_number och building_address)
                const { data, error } = await supabase
                    .from('users')
                    .select(`
                        full_name, 
                        phone, 
                        role, 
                        email,
                        apartments (
                            apt_number,
                            building_address,
                            lantmateri_id
                        )
                    `)
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                
                setProfile({
                    full_name: data?.full_name || '',
                    phone: data?.phone || '',
                    role: data?.role || 'resident',
                    email: data?.email || user.email,
                    apt_number: data?.apartments?.apt_number || 'Ej tilldelad',
                    building_address: data?.apartments?.building_address || 'Adress saknas',
                    lantmateri_id: data?.apartments?.lantmateri_id || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone
                })
                .eq('id', user.id);

            if (error) throw error;
            setStatus({ show: true, message: 'Profilen har uppdaterats!' });
            setTimeout(() => setStatus({ show: false, message: '' }), 3000);
        } catch (error) {
            alert('Fel vid uppdatering: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen text-blue-950 font-bold">Hämtar din profil...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {status.show && (
                <div className="fixed top-4 left-4 right-4 bg-green-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 size={24} />
                    <p className="font-medium">{status.message}</p>
                </div>
            )}

            <header className="p-6 bg-white border-b border-gray-100 flex items-center gap-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-900 transition-colors"><ChevronLeft size={24} /></Link>
                <h1 className="text-xl font-bold text-blue-950 tracking-tight italic uppercase">Mina Sidor</h1>
            </header>

            <main className="p-6 space-y-6">
                {/* Personkort */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <User size={48} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 text-green-500">
                             <ShieldCheck size={20} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{profile.full_name}</h2>
                    <p className="text-gray-500 text-sm mb-3">{profile.email}</p>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-full tracking-widest border border-blue-100">
                        {profile.role}
                    </span>
                </div>

                {/* Lägenhetsinfo (Statisk data från databasen) */}
                <div className="bg-blue-950 rounded-3xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                    <Home className="absolute -right-4 -bottom-4 text-white/5" size={120} />
                    <h3 className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-4">Din Bostad</h3>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div>
                            <p className="text-white/60 text-[10px] uppercase font-bold">Lgh Nummer</p>
                            <p className="font-bold text-lg">{profile.apt_number}</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-[10px] uppercase font-bold">Lantmäteri ID</p>
                            <p className="font-bold text-lg">{profile.lantmateri_id || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-white/60 text-[10px] uppercase font-bold">Adress</p>
                            <p className="font-bold">{profile.building_address}</p>
                        </div>
                    </div>
                </div>

                {/* Redigerbara fält */}
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-tighter">Namn i huset</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                <input 
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-tighter">Mobilnummer</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                <input 
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-gray-700"
                                    placeholder="070-000 00 00"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {saving ? 'Sparar ändringar...' : <><Save size={20} /> Spara kontaktinfo</>}
                    </button>
                </form>
            </main>

            <BottomNav />
        </div>
    );
};

export default Profile;