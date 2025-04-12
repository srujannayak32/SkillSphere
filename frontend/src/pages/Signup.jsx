import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
      await axios.post('http://localhost:5000/api/auth/signup', form);
      setOtpSent(true);
    } catch (err) {
      alert("Signup failed: " + err.response?.data?.message || "Try again");
    }
  };
  

  const verifyAndRegister = async (e) => {
  e.preventDefault();
  try {
    await axios.post('http://localhost:5000/api/auth/verify-otp', {
      email: form.email,
      otp: otp,
      fullName: form.fullName,
      username: form.username,
      password: form.password,
    });

    toast.success('Registration successful! Redirecting to login...', {
      position: 'top-center',
      autoClose: 1500,
    });

    setTimeout(() => {
      navigate('/auth/login');
    }, 1500);
  } catch (err) {
    toast.error("OTP failed or Registration failed", {
      position: 'top-center',
    });
    console.error(err);
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
