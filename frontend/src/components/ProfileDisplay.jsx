import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProfileDisplay = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
          withCredentials: true
        });
        setProfile(response.data);
        console.log('Fetched profile:', response.data); // Debugging log
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="profile-display p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {profile.userId?.fullName || 'User'}'s Profile
      </h2>
      
      {profile.avatar && (
        <img 
          src={`${API_BASE_URL.replace('/api', '')}/uploads/${profile.avatar}`} 
          alt="Profile" 
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
      )}

      {profile.bio && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">About</h3>
          <p className="text-gray-700">{profile.bio}</p>
        </div>
      )}

      {profile.skills?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Skills</h3>
          <div className="space-y-2">
            {profile.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-medium">{skill.name}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${skill.level * 20}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Level {skill.level}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileDisplay;
