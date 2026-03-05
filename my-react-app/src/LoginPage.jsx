import React from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = ({ role }) => {
  const isLandlord = role === "landlord";
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Loggar in som:", isLandlord ? "Landlord" : "Resident");

    navigate("/dashboard");
  }

  return (
    // Tailwind-klasser för centrering och layout
    <div className="min-h-screen flex item-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLandlord ? "Admin portalen" : "Boendeportal"}
        </h2>
        <p className="text-gray-500">Logga in som {isLandlord ? "admin" : "boende"}</p>
        </div>
        

        <form className="space-y-4">
          {/* E-postfältet */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              E-post
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ange din e-post"
              required
            />
          </div>

          {/* Lösenordsfältet */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Lösenord
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ange ditt lösenord"
              required
            />
          </div>

          {/* Logga in-knappen */}
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
          <Link to="/" className="text-blue-900 font-semibold hover:underline" >
          Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
