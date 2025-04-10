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
        'http://localhost:5000/api/reset-password',
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
      alert('❌ Invalid OTP or session expired. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <form
          onSubmit={handleReset}
          className="w-full max-w-md bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl space-y-6 border border-white/10"
        >
          <h2 className="text-3xl font-bold text-center text-pink-400">🔐 Reset Password</h2>

          <input
            name="otp"
            placeholder="Enter OTP"
            onChange={handleChange}
            className="w-full p-3 bg-slate-700/70 border border-slate-600 rounded-lg placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            onChange={handleChange}
            className="w-full p-3 bg-slate-700/70 border border-slate-600 rounded-lg placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full p-3 bg-slate-700/70 border border-slate-600 rounded-lg placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 transition-all duration-200 p-3 rounded-lg font-bold shadow hover:scale-[1.02] active:scale-95"
          >
            {loading ? '⏳ Updating...' : '🔁 Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
