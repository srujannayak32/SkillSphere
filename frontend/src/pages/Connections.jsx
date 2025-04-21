import React, { useState, useEffect } from "react";
import axios from "axios";
import UserCard from "../components/UserCard";
import { toast } from "react-toastify";

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeChat, setActiveChat] = useState(null); // Track active chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null); // Track logged-in user ID

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/connections/all", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setConnections(data);

        // Fetch current user ID
        const userRes = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setCurrentUserId(userRes.data._id);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching connections:", err);
        toast.error("Failed to fetch connections.");
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const openChat = async (userId) => {
    if (!userId) {
      console.error("Invalid userId passed to openChat:", userId);
      toast.error("Failed to open chat. Invalid user ID.");
      return;
    }

    setActiveChat(userId);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`http://localhost:5000/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setMessages(data);

      // Mark messages as seen
      await axios.put(`http://localhost:5000/api/messages/mark-seen/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      // Update unread status in connections
      setConnections((prev) =>
        prev.map((conn) =>
          conn.userId === userId ? { ...conn, hasUnreadMessages: false } : conn
        )
      );
    } catch (err) {
      console.error("Error opening chat:", err);
      toast.error("Failed to open chat.");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/messages/send",
        { receiver: activeChat, content: newMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setMessages((prev) => [...prev, data.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message.");
    }
  };

  const filteredConnections = connections.filter((conn) => {
    if (activeFilter === "all") return true;
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
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("student")}
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === "student" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveFilter("mentor")}
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === "mentor" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
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
              <div key={index} className="relative bg-white rounded-lg shadow-md p-4">
                <UserCard
                  user={profile}
                  hideConnectButton={true}
                  hideMessageButton={true}
                />
                <button
                  onClick={() => openChat(profile.userId)}
                  className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded relative"
                >
                  Message
                  {profile.hasUnreadMessages && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeChat && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Chat</h2>
              <button onClick={() => setActiveChat(null)} className="text-red-500">Close</button>
            </div>
            <div className="h-64 overflow-y-auto border-t mt-2 pt-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 ${
                    msg.senderId === currentUserId ? "text-right" : "text-left"
                  }`}
                >
                  <p
                    className={`inline-block px-3 py-1 rounded ${
                      msg.senderId === currentUserId
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex mt-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border px-3 py-2 rounded"
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;