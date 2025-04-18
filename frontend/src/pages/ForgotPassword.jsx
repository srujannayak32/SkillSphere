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
      await axios.post(
        'http://localhost:5000/api/auth/forgot-password',
        form,
        { withCredentials: true }
      );
      navigate('/auth/reset-password');
      
    } catch (err) {
      alert('❌ User not found or an error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="w-full max-w-md p-1 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500">
          <form
            onSubmit={handleSubmit}
            className="w-full h-full bg-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-6 border border-white/10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                Forgot Password
              </h2>
              <p className="text-slate-300 text-sm">
                Enter your details below to receive an OTP
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 pl-1">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    👤
                  </span>
                  <input
                    name="username"
                    placeholder="Enter your username"
                    onChange={handleChange}
                    className="w-full p-3 pl-10 bg-slate-700/70 border border-slate-600 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 pl-1">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    ✉️
                  </span>
                  <input
                    name="email"
                    placeholder="Enter your email"
                    onChange={handleChange}
                    className="w-full p-3 pl-10 bg-slate-700/70 border border-slate-600 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all duration-300 p-3 rounded-lg font-bold shadow-lg hover:shadow-pink-500/20 transform hover:translate-y-[-2px] active:translate-y-[1px]"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🚀</span>
                Send OTP
              </span>
            </button>
            
            <div className="text-center mt-4">
              <a href="/auth/login" className="text-sm text-slate-400 hover:text-pink-400 transition-colors">
                Remember your password? Back to login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}