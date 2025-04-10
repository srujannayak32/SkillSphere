import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function ForgotPassword() {
  const [form, setForm] = useState({ username: '', email: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/forgot-password', form);
      navigate('/auth/reset-password');
    } catch (err) {
      alert('❌ User not found or an error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl space-y-6 border border-white/10"
        >
          <h2 className="text-3xl font-extrabold text-center text-pink-400 drop-shadow">Forgot Password</h2>

          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full p-3 bg-slate-700/70 border border-slate-600 rounded-lg placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 bg-slate-700/70 border border-slate-600 rounded-lg placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 transition-all duration-200 p-3 rounded-lg font-bold shadow hover:scale-[1.02] active:scale-95"
          >
            🚀 Send OTP
          </button>
        </form>
      </div>
    </div>
  );
}
