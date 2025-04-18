// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { 
  BadgeCheck, Activity, Star, User, Award, MessageSquare, 
  Users, BookOpen, Clock, TrendingUp, Zap, Heart, Shield
} from "lucide-react";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import NotificationBadge from '../components/NotificationBadge';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    sessionsCompleted: 0,
    mentorsConnected: 0,
    coursesTaken: 0,
    xpPoints: 0,
    level: 1,
    progress: 0
  });
  const [loading, setLoading] = useState(true);

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

  const fetchUserData = async () => {
    // console.log("hello")
    try {
      const [userRes, statsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/auth/dashboard", { 
          withCredentials: true 
        }),
        axios.get("http://localhost:5000/api/stats", {
          withCredentials: true
        })
      ]);
      console.log(userRes.data)
      console.log(statsRes.data)

      if (!userRes.data?._id) {        // await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate loading delay

        throw new Error("User data not found");
      }

      setUser(userRes.data);
      setStats(statsRes.data);
      
      // Update last active time
      await axios.put("http://localhost:5000/api/user/last-active", {}, {
        withCredentials: true
      });
    } catch (error) {
      toast.error("Session expired. Please login again.");
      // window.location.href = "/auth/login";
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchUserData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center">
        <div className="text-white text-2xl">Loading Dashboard...</div>
      </div>
    );
  }

  const getProgressLevel = () => {
    if (stats.xpPoints < 500) return "Beginner";
    if (stats.xpPoints < 1500) return "Intermediate";
    if (stats.xpPoints < 3000) return "Advanced";
    return "Expert";
  };

  const getBadges = () => {
    if (!user?.badges) return [];
    
    const badgeIcons = {
      'Fast Learner': <Zap className="inline mr-1" size={16} />,
      'Helpful Mentor': <Heart className="inline mr-1" size={16} />,
      'Session Expert': <Shield className="inline mr-1" size={16} />,
      'Level Up': <TrendingUp className="inline mr-1" size={16} />
    };
    
    return user.badges.slice(0, 4).map(badge => ({
      ...badge,
      icon: badgeIcons[badge.name] || <Award className="inline mr-1" size={16} />
    }));
  };

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
      content: user?.skills?.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {user.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="bg-cyan-800 px-3 py-1 rounded-full text-sm">
              {skill.name} (Lvl {skill.level})
            </span>
          ))}
          {user.skills.length > 3 && (
            <span className="bg-cyan-900 px-3 py-1 rounded-full text-sm">
              +{user.skills.length - 3} more
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
      content: user?.sessions?.length > 0 ? (
        `Completed session on ${user.sessions[0].skillsPracticed[0]}`
      ) : "No recent activity",
      color: "from-blue-600 to-blue-800"
    },
    {
      icon: <MessageSquare className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "Sessions Completed",
      content: stats.sessionsCompleted,
      color: "from-indigo-600 to-indigo-800"
    },
    {
      icon: <Users className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "Mentors Connected",
      content: stats.mentorsConnected,
      color: "from-violet-600 to-violet-800"
    },
    {
      icon: <BookOpen className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "Courses Taken",
      content: stats.coursesTaken,
      color: "from-fuchsia-600 to-fuchsia-800"
    },
    {
      icon: <Award className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "Badges",
      content: getBadges().length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {getBadges().map((badge, index) => (
            <span key={index} className="bg-yellow-600 px-2 py-1 rounded-full text-xs">
              {badge.icon} {badge.name}
            </span>
          ))}
        </div>
      ) : "No badges yet",
      color: "from-amber-600 to-amber-800"
    },
    {
      icon: <Star className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "XP Points",
      content: `${stats.xpPoints} XP (Level ${stats.level})`,
      color: "from-emerald-600 to-emerald-800"
    },
    {
      icon: <TrendingUp className="text-cyan-400 w-10 h-10 mb-4" />,
      title: "Progress Level",
      content: getProgressLevel(),
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
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, <span className="text-cyan-400">{user?.username}</span> 👋
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              {user?.bio || "Update your profile to add a bio about yourself"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBadge />
            <Link 
              to="/explore"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Users className="mr-2" size={20} />
              Explore
            </Link>
          </div>
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
            to="/connections"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <Users className="mr-2" size={20} />
              My Connections
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
          <p>Keep pushing your limits and building amazing things 🚀</p>
          <p className="mt-2 text-sm text-slate-400">
            Last active: {new Date(user?.lastActive).toLocaleString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}