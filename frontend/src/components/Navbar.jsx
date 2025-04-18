import React from 'react';
import { Link } from 'react-router-dom';
import NotificationBadge from './NotificationBadge';

export default function Navbar() {
  return (
    <nav className="bg-white/10 backdrop-blur-md shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-white">SkillSphere</Link>
      <div className="flex gap-6 text-white font-medium">
        <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
        <Link to="/auth/login" className="hover:text-emerald-400 transition-colors">Login</Link>
        <Link to="/auth/signup" className="hover:text-emerald-400 transition-colors">Signup</Link>
        <Link to="/auth/dashboard" className="text-white hover:text-emerald-400 transition-colors">Dashboard</Link>
        <Link to="/explore" className="text-white hover:text-emerald-400 transition-colors">Explore</Link>
        <Link to="/connections" className="text-white hover:text-emerald-400 transition-colors">Connections</Link>        
        <NotificationBadge />
      </div>
    </nav>
  );
}
