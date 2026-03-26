import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

const LoginPage = ({ role }) => {
  const navigate = useNavigate();
  // isLandlord används här främst för att styra texterna i UI:t
  const isLandlord = role === "landlord";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Logga in med Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Fel e-post eller lösenord. Försök igen.");
        setLoading(false);
        return;
      }

      // 2. Hämta användarens faktiska roll från din 'users'-tabell
      // Detta är "Single Source of Truth" för säkerheten
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      const userRole = profile.role;
      console.log("Inloggad med roll:", userRole);

      // 3. Dirigera användaren baserat på rollen i databasen
      // Vi kollar både efter 'admin', 'landlord' eller 'Styrelse' för admindashboard
      if (userRole === 'admin' || userRole === 'landlord' || userRole === 'Styrelse') {
        navigate("/admindashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("Login/Profile error:", err.message);
      setError("Ett oväntat fel uppstod. Kontakta support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-gray-200">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-800 uppercase tracking-tight">
            {isLandlord ? "Fastighetsappen Admin" : "Fastighetsappen"}
          </h2>
          <p className="text-gray-500 text-sm">
            Logga in som {isLandlord ? "administratör" : "boende"}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100 animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">
              E-post
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 font-medium"
              placeholder="namn@epost.se"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">
              Lösenord
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 font-medium"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Validerar..." : "Logga in"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-sm text-gray-500">
            Har du inget konto?{" "}
            <a href="#" className="text-blue-600 font-bold hover:underline">
              Kontakta styrelsen
            </a>
          </p>
          <div className="mt-4">
            <Link to="/" className="text-xs text-gray-400 hover:text-blue-900 transition-colors uppercase font-bold tracking-tighter"> ← Tillbaka till startsidan</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;