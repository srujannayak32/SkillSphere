import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ConnectionsTabs from '../components/ConnectionsTabs';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const { data } = await axios.get('/api/connections/connections', {
          withCredentials: true
        });
        setConnections(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching connections:', err);
        navigate('/auth/login');
      }
    };
    
    fetchConnections();
  }, [navigate]);

  if (loading) return <div className="flex justify-center py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Connections</h1>
          <p className="text-gray-600">Manage your professional network</p>
        </div>
        
        <ConnectionsTabs connections={connections} />
      </div>
    </div>
  );
};

export default Connections;