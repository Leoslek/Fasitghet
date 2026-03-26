import React, { useState, useEffect } from 'react';
import { supabase } from "./supabaseClient";
import { Users, Search, UserPlus, Mail, Phone, Loader2, Home, MapPin } from 'lucide-react';

const ResidentsManagement = () => {
    const [residents, setResidents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchResidents = async () => {
        setLoading(true);
        try{

            const { data, error: supabaseError } = await supabase
                .from('users')
                .select(`
                    id,
                    full_name,
                    email,
                    phone,
                    role,
                    apartments (
                        apt_number,
                        building_adress
                        )
                    `)
                .eq('role', 'Boende');

            if (supabaseError) throw supabaseError;
            setResidents(data);
        }   catch (err) {
            setError("Kunde inte ladda boende: " + err.message);
        }   finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    const filteredResidents = residents.filter(r =>{
        const search = searchTerm.toLowerCase();
        return (
            r.full_name?.toLowerCase().includes(search) ||
            r.email?.toLowerCase().includes(search) ||
            r.apartments?.apt_number?.includes(search)
            );
       });
       
    return (
        <div className='p-8 bg-gray-50 min-h-screen'>
            <div className='flex justify-between items-center mb-8'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>Hantera Boende</h1>
                    <p className='text-gray-500'>Hämtat direkt från databasen</p>
                </div>
                <button className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition shadow-sm'>
                    <UserPlus size={18} className='mr-2' /> Registrera ny boende
                </button>
            </div>

            <div className='mb-6 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                    type='text'
                    placeholder='Sök på namn eller lägenhetsnummer...'
                    className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none bg-white shadow-sm'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />  
            </div>

            {loading ? (
                <div className='flex flex-col items-center justify-center h-64 text-gray-500'>
                    <Loader2 className='animate-spin mb-2' size={32} />
                    <p>Hämtar boende...</p>
                 </div>
            ) : error ?(
                <div className='p-4 bg-red-50 text-red-600 rounded-lg border border-red-200'>{error}</div>
            ) : (
                <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hiddem'>
                    <table className='w-full text-left'>
                        <thead className='bg-gray-50 border-b border-gray-200'>
                            <tr>
                                <th className='px-6 py-4 text-sm font-semibold text-gray-600'>Namn</th>
                                <th className='px-6 py-4 text-sm font-semibold text-gray-600'>Bostad</th>
                                <th className='px-6 py-4 text-sm font-semibold text-gray-600'>Kontakt</th>
                                <th className='px-6 py-4 text-sm font-semibold text-gray-600'>Åtgärd</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                            {filteredResidents.length > 0 ? (
                                filteredResidents.map((r) => (
                                    <tr key={r.id} className='hover:bg-blue-50/30 transition'>
                                        <td className='px-6 py-4 font-medium text-gray-900'>{r.full_name || "Inget namn"}</td>
                                        <td className='px-6 py-4 text-gray-600'>
                                            <div className='flex items-center'><Mail size={14} className='mr-1'/>{r.email}</div>
                                            <div className='flex items-center mt-1'><Phone size={14} className='mr-1'/>{r.phone}</div>
                                        </td>
                                        <td className='px-6 py-4 text-right'>
                                            <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>Redigera</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className='px-6 py-10 text-center text-gray-400 italic'>Inga boende hittades</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResidentsManagement 