import React, { useState } from "react"; // Lagt till useState
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient"; // Importera din klient

const LoginPage = ({ role }) => {
  const isLandlord = role === "landlord";
  const navigate = useNavigate();

  // State för inputfälten och felmeddelanden
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Supabase auth-anrop
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Fel e-post eller lösenord. Försök igen.");
      console.error("Login error:", authError.message);
    } else {
      console.log("Loggar in som:", role, "Användar-ID:", data.user.id);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {isLandlord ? "Admin portalen" : "Boendeportal"}
          </h2>
          <p className="text-gray-500">Logga in som {isLandlord ? "admin" : "boende"}</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Visa felmeddelande om inloggningen misslyckas */}
          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              E-post
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ange din e-post"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Lösenord
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ange ditt lösenord"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Logga in
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Har du inget konto?{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Registrera dig
          </a>
        </p>

        <div className="mt-6 text-center text-sm">
          <Link to="/" className="text-blue-900 font-semibold hover:underline">
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;