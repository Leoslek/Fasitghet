import React, { useState, useContext } from 'react';
import { IssuesContext } from './IssuesContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './BottomNav';

const ReportIssuesPage = () => {
    const { addIssue } = useContext(IssuesContext);
    const navigate = useNavigate();
    const [issue, setIssue] = useState({ 
        title: '', 
        category: '', 
        priority: 'Medium',
        description: ''});

    const handleSubmit = (e) => {
        e.preventDefault();
        addIssue({ ...issue, id: Date.now(), date: new Date().toLocaleDateString(), status: 'Open'})
        console.log("Nytt ärende skapat:", issue);

        navigate('/issues');
    };

    return (
        <div className="min-h-screen bg-white p-8">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-500 hover:cursor-pointer hover:text-gray-700">
                <ArrowLeft size={20} className="mr-1" /> Tillbaka
            </button>

            <h1 className="text-2xl font-bold text-blue-950 mb-6">
                Rapportera nytt problem
                </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Titel
                    </label>
                    <input type="text" requierd className="w-full border rounded-lg p-2" onChange={(e) => setIssue({...issue, title: e.target.value})} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                    <select className="w-full border rounded-lg p-2" onChange={(e) => setIssue({...issue, category: e.target.value})}>
                        <option>Vatten</option>
                        <option>El</option>
                        <option>Allmänt</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Beskrivning</label>
                    <textarea
                        required
                        rows="4"
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Beskriv vad som är fel..."
                        onChange={(e) => setIssue({...issue, description: e.target.value})}
                    />
                </div>

                <button type="submit" className="w-full bg-blue-950 text-white p-3 rounded-lg font-bold mt-4 hover:cursor-pointer hover:bg-blue-900 transition">
                    Skicka
                </button>
            </form>
            <BottomNav/>
        </div>
    );
}
export default ReportIssuesPage