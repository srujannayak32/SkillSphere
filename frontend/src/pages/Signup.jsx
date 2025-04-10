import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Signup() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/send-otp', { email: form.email });
      setOtpSent(true);
    } catch {
      alert("Failed to send OTP");
    }
  };

  const verifyAndRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/verify-otp', { email: form.email, otp });
      await axios.post('http://localhost:5000/api/register', form);
      navigate('/auth/login'); // ✅ This is now correct
    } catch {
      alert("OTP failed or Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <Navbar />
      <form onSubmit={otpSent ? verifyAndRegister : sendOtp} className="max-w-md mx-auto mt-16 space-y-4">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        {!otpSent ? (
          <>
            <input name="fullName" onChange={handleChange} placeholder="Full Name" className="w-full p-2 rounded bg-slate-700" />
            <input name="username" onChange={handleChange} placeholder="Username" className="w-full p-2 rounded bg-slate-700" />
            <input name="email" onChange={handleChange} placeholder="Email" className="w-full p-2 rounded bg-slate-700" />
            <input type="password" name="password" onChange={handleChange} placeholder="Password" className="w-full p-2 rounded bg-slate-700" />
          </>
        ) : (
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full p-2 rounded bg-slate-700" />
        )}
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded w-full">
          {otpSent ? "Verify OTP & Register" : "Send OTP"}
        </button>
      </form>
    </div>
  );
}
