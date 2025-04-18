import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';

const Explore = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [connectionsRes, pendingRes, usersRes] = await Promise.all([
          axios.get('/api/connections/connections', { withCredentials: true }),
          axios.get('/api/connections/pending', { withCredentials: true }),
          axios.get('/api/connections/search', { 
            params: { query: searchQuery, role: roleFilter !== 'all' ? roleFilter : undefined },
            withCredentials: true 
          })
        ]);
        
        setConnections(connectionsRes.data);
        setPendingConnections(pendingRes.data);
        setUsers(usersRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        navigate('/auth/login');
      }
    };
    
    fetchData();
  }, [searchQuery, roleFilter, navigate]);

  const handleConnect = async (userId) => {
    try {
      await axios.post(`/api/connections/connect/${userId}`, {}, {
        withCredentials: true
      });
      
      // Update UI without another fetch
      setPendingConnections(prev => [...prev, { user: { _id: userId } }]);
    } catch (err) {
      console.error('Error sending connection:', err);
    }
  };

  const handleRespond = async (userId, action) => {
    try {
      await axios.post(`/api/connections/respond/${userId}`, { action }, {
        withCredentials: true
      });
      
      // Update UI
      if (action === 'accept') {
        const acceptedUser = users.find(u => u._id === userId);
        setConnections(prev => [...prev, { user: acceptedUser }]);
      }
      
      setPendingConnections(prev => prev.filter(conn => conn.user._id !== userId));
    } catch (err) {
      console.error('Error responding to connection:', err);
    }
  };

  const getConnectionStatus = (userId) => {
    if (connections.some(conn => conn.user._id === userId)) {
      return 'accepted';
    }
    if (pendingConnections.some(conn => conn.user._id === userId && conn.initiatedBy._id !== userId)) {
      return 'respond';
    }
    if (pendingConnections.some(conn => conn.user._id === userId)) {
      return 'pending';
    }
    return 'none';
  };

  if (loading) return <div className="flex justify-center py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore SkillSphere</h1>
          <p className="text-gray-600">Find mentors, students, and collaborators</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, username, or skills..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-600">Filter by:</label>
              <select
                className="border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="mentor">Mentors</option>
              </select>
            </div>
          </div>
          
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(user => (
                <UserCard
                  key={user._id}
                  user={user}
                  connectionStatus={getConnectionStatus(user._id)}
                  onConnect={handleConnect}
                  onRespond={handleRespond}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;