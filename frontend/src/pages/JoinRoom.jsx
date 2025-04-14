import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const JoinRoom = () => {
  const [formData, setFormData] = useState({
    meetingId: '',
    password: '',
    username: '',
    enableChat: true,
    enableReactions: true
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.meetingId || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    navigate(`/room/${formData.meetingId}?username=${encodeURIComponent(formData.username || 'Guest')}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
      >
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-500">
          Join Meeting
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Meeting ID</label>
              <input
                type="text"
                name="meetingId"
                value={formData.meetingId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter meeting code"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Your Name (optional)</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your display name"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="enableChat"
                checked={formData.enableChat}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-300">Enable Chat</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="enableReactions"
                checked={formData.enableReactions}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-300">Enable Reactions</label>
            </div>
          </div>

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Join Meeting
            </motion.button>
          </div>
        </form>

        <div className="mt-6 text-center text-gray-400">
          <p>Don't have a meeting? <a href="/create" className="text-pink-400 hover:underline">Create one</a></p>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinRoom;
