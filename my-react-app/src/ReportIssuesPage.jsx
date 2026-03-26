import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from './supabaseClient';

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState({ show: false, message: '' });

  // Form states
  const [category, setCategory] = useState('water');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || loading) return;

    setLoading(true);
    try {
      // 1. Skapa ticket i databasen
      const { data: ticket, error: ticketError } = await supabase
  .from('tickets')
  .insert([{
    creator_id: user.id,
    category: category,
    description: description,
    status: 'registered' // Ändrat från 'open' till 'registered'
  }])
  .select()
  .single();

      if (ticketError) throw ticketError;

      // 2. Om det finns en bild, ladda upp den till Storage
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`; // Viktigt: UserID först för policyn!

        const { error: uploadError } = await supabase.storage
          .from('ticket-attachments')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        // 3. Skapa en referens i ticket_attachments-tabellen
        const { error: attachmentError } = await supabase
          .from('ticket_attachments')
          .insert([{
            ticket_id: ticket.id,
            file_url: filePath // Vi sparar sökvägen här
          }]);

        if (attachmentError) throw attachmentError;
      }

      setStatus({ show: true, message: 'Felanmälan skickad!' });
      setTimeout(() => navigate('/issues'), 2000);

    } catch (err) {
      alert('Kunde inte skicka: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {status.show && (
        <div className="fixed top-4 left-4 right-4 bg-green-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={24} /> <p className="font-bold">{status.message}</p>
        </div>
      )}

      <header className="p-6 bg-white border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-600"><ChevronLeft size={24} /></button>
        <h1 className="text-xl font-bold text-blue-950">Ny anmälan</h1>
      </header>

      <main className="p-6 space-y-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
            
            {/* Kategori */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vad gäller felet?</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
              >
                <option value="">Välj kategori...</option>
                <option value="el">El</option>
                <option value="vatten">Vatten</option>
                <option value="hiss">Hiss</option>
                <option value="allmänt">Allmänt</option>
                <option value="störning">Störning</option>
                <option value="lägenhet">Lägenhet</option>
              </select>
            </div>

            {/* Beskrivning */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Beskrivning</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] font-medium"
                placeholder="Skriv så tydligt du kan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Bilaga */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bifoga bild (valfritt)</label>
              <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Camera size={32} />
                    <span className="text-xs font-bold mt-2 uppercase">Välj bild</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Skickar..." : <div className="flex items-center justify-center gap-2"><Send size={18}/> Skicka anmälan</div>}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ReportIssuePage;