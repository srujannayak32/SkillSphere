import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreateRoom = () => {
  const [formData, setFormData] = useState({
    meetingName: '',
    meetingId: '', // Now required
    password: '',
    participants: 10,
    duration: 60,
    isPrivate: true,
    waitingRoom: true,
    muteOnEntry: false,
    allowRecording: true,
    enableChat: true,
    enableReactions: true,
    recurring: false,
    schedule: null
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const meetingId = formData.meetingId || 
      Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${meetingId}?host=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
      >
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          Create New Meeting
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Meeting Name</label>
              <input
                type="text"
                name="meetingName"
                value={formData.meetingName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Meeting ID </label>
              <input
                type="text"
                name="meetingId"
                value={formData.meetingId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Max Participants</label>
              <select
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2, 5, 10, 20, 50, 100].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="15"
                max="240"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-300">Private Meeting</label>
            </div>
          </div>

          {/* Advanced Options Section */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Advanced Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="waitingRoom"
                  checked={formData.waitingRoom}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-300">Enable Waiting Room</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="muteOnEntry"
                  checked={formData.muteOnEntry}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-300">Mute Participants on Entry</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="allowRecording"
                  checked={formData.allowRecording}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-300">Allow Recording</label>
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
            </div>
          </div>

          {/* Recurring Meeting Section */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                name="recurring"
                checked={formData.recurring}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label className="text-lg font-semibold text-gray-300">Recurring Meeting</label>
            </div>
            {formData.recurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Schedule</label>
                  <input
                    type="datetime-local"
                    name="schedule"
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Recurrence</label>
                  <select className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Create Meeting
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateRoom;
