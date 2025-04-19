import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function ResetPassword() {
  const [form, setForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      alert('❌ Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/auth/reset-password',
        {
          otp: form.otp,
          newPassword: form.newPassword,
        },
        { withCredentials: true }
      );
      alert('✅ Password updated! Please log in.');
      navigate('/auth/login');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || '❌ Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 text-white">
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-80px)] px-4">
        <form
          onSubmit={handleReset}
          className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.3)] space-y-6 border border-indigo-500/20"
        >
          <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-400 mb-8">🔐 Reset Password</h2>

          <div className="space-y-4">
            <div className="relative">
              <input
                name="otp"
                placeholder="Enter OTP"
                onChange={handleChange}
                className="w-full p-4 pl-5 bg-slate-800/80 border border-indigo-500/30 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300 shadow-md"
              />
            </div>
            
            <div className="relative">
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                onChange={handleChange}
                className="w-full p-4 pl-5 bg-slate-800/80 border border-indigo-500/30 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300 shadow-md"
              />
            </div>
            
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                className="w-full p-4 pl-5 bg-slate-800/80 border border-indigo-500/30 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300 shadow-md"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 p-4 rounded-xl font-bold shadow-lg hover:shadow-indigo-500/40 transform hover:translate-y-[-2px] active:translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              '🔁 Reset Password'
            )}
          </button>
          
          <div className="text-center text-sm text-slate-400 mt-4 hover:text-slate-300">
            <a href="/auth/login" className="transition-colors duration-300">Remember your password? Sign in</a>
          </div>
        </form>
      </div>
    </div>
  );
}