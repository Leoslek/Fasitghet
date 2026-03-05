import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck, Building2 } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/*Navbar*/}
      <nav className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-2">
          {/*Enkel logotyp-placeholder*/}
          <div className="bg-blue-900 p-2 rounded-lg text-white">
            <Building2 size={25} />
          </div>
          <span className="font-bold text-xl text-blue-950">Brf Portal</span>
        </div>

        {/* De två knapparna */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login/landlord" className="bg-blue-950 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-900 hover:cursor-pointer transition">
            Admin Login
          </Link>
          <Link to="/login/resident" className="bg-blue-950 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-900 hover:cursor-pointer transition">
            Boende Login
          </Link>
        </div>
      </nav>

      {/* Hero Section*/}
      <main className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 bg-gray-100">
        <h1 className="text-5xl md:text-7xl font-bold text-blue-950 mb-6 tracking-tight">
          Modern living made <br /> simple.
        </h1>

        <p className="max-w-xl text-lg md:text-xl text-gray-600 mb-10">
          Manage your housing association tasks with ease. Book laundry times,
          report issues, and stay updated with community announcement.
        </p>

        <button className="flex items-center gap-2 bg-blue-950 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-900 hover:cursor-pointer transition shadow-lg">
          Get started
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            ></path>
          </svg>
        </button>
      </main>

      {/* Features Section [cite: 3, 4] */}
      <section className="max-w-3xl mx-auto px-8 py-12 space-y-16">
        {/* Issue Tracking */}
        <div className="flex gap-6">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-900 h-fit">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Issue Tracking</h2>
            <p className="text-gray-600">
              Report maintance issues directly to the caretaker and track their
              status in real-time
            </p>
          </div>
        </div>

        {/* Community Hub */}
        <div className="flex gap-6">
          <div className="bg-green-100 p-4 rounded-xl text-green-700 h-fit">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Community Hub</h2>
            <p className="text-gray-600">
              Stay connected with board announcements and access important
              documents securely
            </p>
          </div>
        </div>

        {/* Secure Access */}
        <div className="flex gap-6">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-700 h-fit">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Secure Access</h2>
            <p className="text-gray-600">
              Role-based access ensures residents, board member, and caretakers
              see exctly what they need.
            </p>
          </div>
        </div>
      </section>

      {/* Footer [cite: 4] */}
      <footer className="py-12 text-center text-gray-500 text-sm bg-gray-100">
        <p>© 2026 Housing Association Portal. All rights reserved</p>
      </footer>
    </div>
  );
};

export default LandingPage;
