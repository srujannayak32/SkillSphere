import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserCard from '../components/UserCard';
import { toast } from 'react-toastify';

const Explore = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profile/explore', {
          params: {
            query: searchQuery,
            role: roleFilter !== 'all' ? roleFilter : undefined,
          },
          withCredentials: true,
        });
        setProfiles(response.data || []);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [searchQuery, roleFilter]);

  const handleConnect = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to connect.');
        return;
      }

      await axios.post(
        `http://localhost:5000/api/connections/connect/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      setPendingRequests((prev) => [...prev, userId]); // Mark as pending
      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error(error.response?.data?.message || 'Failed to send connection request');
    }
  };

  if (loading) return <div className="flex justify-center py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Profiles</h1>
          <p className="text-gray-600">Find mentors, students, and collaborators</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, bio, or skills..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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

          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No profiles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <UserCard
                  key={profile.userId._id}
                  user={{
                    avatar: profile.userId.avatar,
                    fullName: profile.userId.username,
                    bio: profile.bio,
                    role: profile.role,
                    skills: profile.skills // Pass skills to UserCard
                  }}
                  onConnect={() => handleConnect(profile.userId._id)}
                  isPending={pendingRequests.includes(profile.userId._id)}
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