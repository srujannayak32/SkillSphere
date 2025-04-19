import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { 
  BadgeCheck, Activity, Star, User, Award, TrendingUp,
  MessageSquare, Users, Clock, BookOpen
} from "lucide-react";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sessionsCompleted: 0,
    mentorsConnected: 0,
    hoursLearned: 0,
    coursesTaken: 0
  });
  const [notifications, setNotifications] = useState([]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { 
        withCredentials: true 
      });
      window.location.href = "/auth/login";
    } catch (error) {
      toast.error("Error logging out. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await axios.get("http://localhost:5000/api/auth/dashboard", { 
          withCredentials: true 
        });
        
        if (!userRes.data?._id) {
          throw new Error("User data not found");
        }

        setUser(userRes.data);

        // Fetch profile, stats, and notifications in parallel
        const [profileRes, statsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/profile/${userRes.data._id}`, { 
            withCredentials: true 
          }).catch(() => ({ data: null })), // Gracefully handle missing profile
          axios.get("http://localhost:5000/api/stats/user", {
            withCredentials: true
          }).catch(() => ({ data: {
            sessionsCompleted: 0,
            mentorsConnected: 0,
            hoursLearned: 0,
            coursesTaken: 0
          }}))
        ]);

        setProfile(profileRes.data);
        setStats(statsRes.data);
      } catch (error) {
        toast.error("Session expired. Please login again.");
        window.location.href = "/auth/login";
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/connections/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setNotifications(response.data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to fetch notifications');
      }
    };

    fetchUserData();
    fetchNotifications();
  }, []);

  const handleResponse = async (notificationId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/connections/respond/${notificationId}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      toast.success(`Connection request ${action}ed`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast.error('Failed to respond to connection request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center">
        <div className="text-white text-2xl">Loading Dashboard...</div>
      </div>
    );
  }

  const dashboardCards = [
    {
      icon: <User className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "Full Name",
      content: user?.fullName || "Not set",
      color: "from-cyan-600 to-cyan-800"
    },
    {
      icon: <BadgeCheck className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "Skills",
      content: profile?.skills?.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {profile.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="bg-cyan-800 px-3 py-1 rounded-full text-sm">
              {skill.name} (Lvl {skill.level})
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="bg-cyan-900 px-3 py-1 rounded-full text-sm">
              +{profile.skills.length - 3} more
            </span>
          )}
        </div>
      ) : (
        <span className="text-slate-400">No skills added yet</span>
      ),
      color: "from-purple-600 to-purple-800"
    },
    {
      icon: <Activity className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "Recent Activity",
      content: "Completed React challenge",
      color: "from-blue-600 to-blue-800"
    },
    {
      icon: <Users className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "Mentors Connected",
      content: stats.mentorsConnected,
      color: "from-violet-600 to-violet-800"
    },
    {
      icon: <Award className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "Badges",
      content: "🌟 Rising Star, 🔥 Fast Learner",
      color: "from-rose-600 to-rose-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white font-sans overflow-x-hidden">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back, <span className="text-cyan-400">{user?.username}</span> 
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {profile?.bio || "Update your profile to add a bio about yourself"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-br ${card.color} rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center mb-4">
                {card.icon}
                <h3 className="text-xl font-semibold ml-3">{card.title}</h3>
              </div>
              <div className="text-lg">
                {card.content}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Notifications</h2>
          {notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li key={notification._id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition">
                  <div>
                    <p className="text-white">{notification.message}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      From: {notification.sender.fullName}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResponse(notification._id, 'accept')}
                      className="bg-green-500 text-white px-4 py-1 rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponse(notification._id, 'reject')}
                      className="bg-red-500 text-white px-4 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No new notifications</p>
          )}
        </div>

        <motion.div 
          className="mt-12 text-center space-y-4 sm:space-y-0 sm:space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link 
            to="/create-room"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <Users className="mr-2" size={20} />
              Create Study Room
            </div>
          </Link>
          <Link 
            to="/join-room"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <MessageSquare className="mr-2" size={20} />
              Join a Room
            </div>
          </Link>
          <Link 
            to={`/profile/${user?._id}/edit`}
            className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-6 rounded-lg transition transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <User className="mr-2" size={20} />
              Edit Profile
            </div>
          </Link>
          <Link 
            to={`/profile/${user?._id}`}
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <BookOpen className="mr-2" size={20} />
              View Profile
            </div>
          </Link>
        </motion.div>

        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition flex items-center mx-auto"
          >
            <span>Logout</span>
          </button>
        </motion.div>

        <motion.div 
          className="mt-16 text-center text-lg text-slate-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p>Keep pushing your limits and building amazing things </p>
          <p className="mt-2 text-sm text-slate-400">
            Last active: {user?.lastActive ? new Date(user.lastActive).toLocaleDateString() : "N/A"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}