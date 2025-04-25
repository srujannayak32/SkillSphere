import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Signup() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [activeField, setActiveField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/signup', form);
      setOtpSent(true);
    } catch (err) {
      toast.error("Signup failed: " + err.response?.data?.message || "Try again", {
        position: 'top-center',
        icon: '🚫'
      });
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
        icon: '🎉'
      });

      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
    } catch (err) {
      toast.error("OTP verification failed", {
        position: 'top-center',
        icon: '❌'
      });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 overflow-hidden relative">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -left-20 top-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -right-20 top-40 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(40px, -40px); }
          66% { transform: scale(0.9) translate(-40px, 40px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <Navbar />
      
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md relative">
          {/* Glow effect container */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur-sm p-1 opacity-70"></div>
          
          {/* Card */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                {otpSent ? "Verify Account" : "Create Account"}
              </h2>
              <p className="text-gray-500 text-sm">
                {otpSent ? "Enter the OTP sent to your email" : "Join our amazing community today"}
              </p>
            </div>
            
            {/* Form */}
            <form 
              onSubmit={otpSent ? verifyAndRegister : sendOtp} 
              className="space-y-5"
            >
              {!otpSent ? (
                <>
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="text-blue-500 mr-2">✦</span> Full Name
                    </label>
                    <div className={`relative group transition-all duration-300 ${activeField === 'fullName' ? 'scale-[1.02]' : ''}`}>
                      <input 
                        name="fullName" 
                        onChange={handleChange} 
                        onFocus={() => setActiveField('fullName')}
                        onBlur={() => setActiveField(null)}
                        placeholder="Your full name" 
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 opacity-0 group-hover:opacity-70 -z-10 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  
                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="text-purple-500 mr-2">✦</span> Username
                    </label>
                    <div className={`relative group transition-all duration-300 ${activeField === 'username' ? 'scale-[1.02]' : ''}`}>
                      <input 
                        name="username" 
                        onChange={handleChange} 
                        onFocus={() => setActiveField('username')}
                        onBlur={() => setActiveField(null)}
                        placeholder="Choose a username" 
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all duration-300" 
                      />
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 opacity-0 group-hover:opacity-70 -z-10 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="text-indigo-500 mr-2">✦</span> Email
                    </label>
                    <div className={`relative group transition-all duration-300 ${activeField === 'email' ? 'scale-[1.02]' : ''}`}>
                      <input 
                        name="email" 
                        onChange={handleChange} 
                        onFocus={() => setActiveField('email')}
                        onBlur={() => setActiveField(null)}
                        placeholder="Your email address" 
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all duration-300" 
                      />
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-100 via-cyan-100 to-indigo-100 opacity-0 group-hover:opacity-70 -z-10 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="text-blue-500 mr-2">✦</span> Password
                    </label>
                    <div className={`relative group transition-all duration-300 ${activeField === 'password' ? 'scale-[1.02]' : ''}`}>
                      <input 
                        type="password" 
                        name="password" 
                        onChange={handleChange} 
                        onFocus={() => setActiveField('password')}
                        onBlur={() => setActiveField(null)}
                        placeholder="Create a secure password" 
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all duration-300" 
                      />
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-100 via-blue-100 to-cyan-100 opacity-0 group-hover:opacity-70 -z-10 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center justify-center text-center mb-4">
                    <span className="text-xl animate-pulse">✉️</span> 
                    <span className="ml-2">We've sent a verification code to your email</span>
                  </label>
                  <div className={`relative group transition-all duration-300 ${activeField === 'otp' ? 'scale-[1.02]' : ''}`}>
                    <input 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                      onFocus={() => setActiveField('otp')}
                      onBlur={() => setActiveField(null)}
                      placeholder="Enter verification code" 
                      className="w-full px-4 py-3 text-center text-lg tracking-widest font-mono rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all duration-300" 
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 opacity-0 group-hover:opacity-70 -z-10 transition-opacity duration-300"></div>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg mt-8 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {otpSent ? (
                  <>
                    <span className="mr-2"></span> Verify & Complete
                  </>
                ) : (
                  <>
                    <span className="mr-2"></span> Send Verification Code
                  </>
                )}
              </button>
              
              {/* Login link */}
              <div className="text-center mt-6">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <a href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Sign In
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <ToastContainer theme="light" />
    </div>
  );
}