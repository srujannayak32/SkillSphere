import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserCard from '../components/UserCard';
import { toast } from 'react-toastify';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // Track the active tab

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/connections/all', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        setConnections(data.map(conn => conn.profileData)); // Extract profile data
        setLoading(false);
      } catch (err) {
        console.error('Error fetching connections:', err);
        toast.error('Failed to fetch connections.');
      }
    };

    fetchConnections();
  }, []);

  const filteredConnections = connections.filter((conn) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'students') return conn.role === 'student';
    if (activeTab === 'mentors') return conn.role === 'mentor';
    return false;
  });

  if (loading) return <div className="flex justify-center py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Connections</h1>
          <p className="text-gray-600">View and manage your connections</p>
        </div>

        <div className="border-b mb-4">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'students' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('mentors')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'mentors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
            >
              Mentors
            </button>
          </nav>
        </div>

        {filteredConnections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No connections found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnections.map((profile, index) => (
              <UserCard
                key={index}
                user={profile} // Pass the profile data
                connectionStatus="accepted" // Optional: Indicate connection status
                hideConnectButton={true} // Hide the "Connect" button
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;