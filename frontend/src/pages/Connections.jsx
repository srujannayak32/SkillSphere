import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserCard from '../components/UserCard';
import { toast } from 'react-toastify';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // Track the active filter

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching connections with token:', token);

        const { data } = await axios.get('http://localhost:5000/api/connections/all', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        console.log('Connections data received:', data);

        setConnections(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching connections:', err);
        toast.error('Failed to fetch connections.');
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const filteredConnections = connections.filter((conn) => {
    if (activeFilter === 'all') return true;
    return conn.role === activeFilter;
  });

  if (loading) return <div className="flex justify-center py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Connections</h1>
          <p className="text-gray-600">View all your connections</p>
        </div>

        <div className="border-b mb-4">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('student')}
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === 'student' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveFilter('mentor')}
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === 'mentor' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
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