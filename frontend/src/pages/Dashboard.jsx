import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { BadgeCheck, Activity, Star, User, Award, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch {
        alert("Session expired. Please login again.");
        window.location.href = "/login";
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white font-sans overflow-x-hidden">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
        <h2 className="text-5xl font-bold mb-12 text-center">
          Welcome back, <span className="text-cyan-400">{user?.username}</span> 👋
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-[#1c1f26] hover:scale-105 transition-all duration-300 ease-in-out rounded-2xl shadow-xl p-6">
            <User className="text-cyan-400 w-10 h-10 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Full Name</h3>
            <p className="text-slate-300">{user?.fullName}</p>
          </div>

          <div className="bg-[#1c1f26] hover:scale-105 transition-all duration-300 ease-in-out rounded-2xl shadow-xl p-6">
            <BadgeCheck className="text-cyan-400 w-10 h-10 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Skills</h3>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-cyan-800 px-3 py-1 rounded-full text-sm">React</span>
              <span className="bg-cyan-800 px-3 py-1 rounded-full text-sm">Node.js</span>
              <span className="bg-cyan-800 px-3 py-1 rounded-full text-sm">MongoDB</span>
            </div>
          </div>

          <div className="bg-[#1c1f26] hover:scale-105 transition-all duration-300 ease-in-out rounded-2xl shadow-xl p-6">
            <Activity className="text-cyan-400 w-10 h-10 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
            <p className="text-slate-300">Completed a project challenge</p>
          </div>

          <div className="bg-[#1c1f26] hover:scale-105 transition-all duration-300 ease-in-out rounded-2xl shadow-xl p-6">
            <Award className="text-cyan-400 w-10 h-10 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Badges</h3>
            <p className="text-slate-300">🌟 Rising Dev, 🔥 Consistent Learner</p>
          </div>

          <div className="bg-[#1c1f26] hover:scale-105 transition-all duration-300 ease-in-out rounded-2xl shadow-xl p-6">
            <Star className="text-cyan-400 w-10 h-10 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Points</h3>
            <p className="text-slate-300">1200 XP</p>
          </div>

          <div className="bg-[#1c1f26] hover:scale-105 transition-all duration-300 ease-in-out rounded-2xl shadow-xl p-6">
            <TrendingUp className="text-cyan-400 w-10 h-10 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Progress</h3>
            <p className="text-slate-300">Intermediate Level</p>
          </div>
        </div>

        <div className="mt-16 text-center text-lg text-slate-400">
          Keep pushing your limits and building amazing things 🚀
        </div>
      </div>
    </div>
  );
}