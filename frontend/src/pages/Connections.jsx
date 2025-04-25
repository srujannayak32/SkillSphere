import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConnectionsTabs from '../components/ConnectionsTabs';
import Navbar from '../components/Navbar';
import { FiSend, FiPaperclip, FiSmile, FiImage, FiFile, FiX, FiDownload } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("You need to be logged in to view connections");
          setLoading(false);
          return;
        }

        // Clear the new connections notification
        localStorage.removeItem('hasNewConnections');

        // Get user data from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setCurrentUserId(userData._id);
        } else {
          try {
            const userRes = await axios.get("http://localhost:5000/api/auth/me", {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            });
            setCurrentUserId(userRes.data._id);
          } catch (userErr) {
            console.error("Error fetching user data:", userErr);
          }
        }

        // Fetch connections
        const { data } = await axios.get("http://localhost:5000/api/connections/all", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        
        // Set up connections with unread message indicators
        const connectionsWithUnreadState = await Promise.all(
          data.map(async (conn) => {
            try {
              // Check for unread messages
              const res = await axios.get(`http://localhost:5000/api/messages/unread-count/${conn.userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              });
              return {
                ...conn,
                hasUnreadMessages: res.data.count > 0,
                unreadCount: res.data.count
              };
            } catch (err) {
              return { ...conn, hasUnreadMessages: false, unreadCount: 0 };
            }
          })
        );
        
        setConnections(connectionsWithUnreadState);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching connections:", err);
        toast.error("Failed to fetch connections.");
        setLoading(false);
      }
    };

    fetchConnections();

    // Listen for new messages through a polling mechanism
    const intervalId = setInterval(() => {
      if (currentUserId) {
        checkForNewMessages();
      }
    }, 5000); // Check every 5 seconds

    // Listen for connection accepted events to refresh the list
    const handleConnectionAccepted = () => {
      fetchConnections();
    };

    window.addEventListener('connectionAccepted', handleConnectionAccepted);

    return () => {
      window.removeEventListener('connectionAccepted', handleConnectionAccepted);
      clearInterval(intervalId);
    };
  }, [currentUserId]);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkForNewMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`http://localhost:5000/api/messages/check-new`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (data.hasNewMessages) {
        // Update connection with new message indicators
        setConnections((prev) =>
          prev.map((conn) =>
            data.senders.includes(conn.userId) ? 
              { ...conn, hasUnreadMessages: true, unreadCount: (conn.unreadCount || 0) + 1 } : 
              conn
          )
        );

        // If the user with new messages is the active chat, fetch those messages
        if (activeChat && data.senders.includes(activeChat)) {
          fetchMessages(activeChat);
        }
      }
    } catch (err) {
      console.error("Error checking for new messages:", err);
    }
  };

  const openChat = async (userId) => {
    try {
      setActiveChat(userId);
      const token = localStorage.getItem("token");

      // Fetch messages
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
          conn.userId === userId ? { ...conn, hasUnreadMessages: false, unreadCount: 0 } : conn
        )
      );
    } catch (err) {
      console.error("Error opening chat:", err);
      toast.error("Failed to open chat.");
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`http://localhost:5000/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setMessages(data);

      // Mark messages as seen if this is the active chat
      if (activeChat === userId) {
        await axios.put(`http://localhost:5000/api/messages/mark-seen/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        // Update unread status in connections
        setConnections((prev) =>
          prev.map((conn) =>
            conn.userId === userId ? { ...conn, hasUnreadMessages: false, unreadCount: 0 } : conn
          )
        );
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !activeChat) return;

    try {
      const token = localStorage.getItem("token");
      
      if (selectedFile) {
        setIsUploading(true);
        // Handle file upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('receiver', activeChat);
        
        const { data: fileData } = await axios.post(
          "http://localhost:5000/api/messages/send-file",
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
          }
        );
        
        setMessages((prev) => [...prev, fileData.data]);
        setSelectedFile(null);
        setIsUploading(false);
      }
      
      if (newMessage.trim()) {
        const { data } = await axios.post(
          "http://localhost:5000/api/messages/send",
          { receiver: activeChat, content: newMessage },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setMessages((prev) => [...prev, data.data]);
      }
      
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message.");
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.info(`File selected: ${e.target.files[0].name}`);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    
    if (imageExtensions.includes(extension)) {
      return <FiImage className="mr-2 text-blue-500" />;
    }
    return <FiFile className="mr-2 text-orange-500" />;
  };

  const renderFileName = (filePath) => {
    // Extract the filename from the path
    const fileName = filePath.split('/').pop();
    return fileName;
  };

  const isImageFile = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageExtensions.includes(extension);
  };

  const renderConnectionsList = () => {
    return (
      <div className="w-1/3 border-r overflow-y-auto bg-white">
        <h2 className="text-xl font-semibold p-4 border-b bg-white">Connections</h2>
        {connections.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No connections yet</p>
        ) : (
          <ul>
            {connections.map((conn) => (
              <li 
                key={conn.userId}
                className={`flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeChat === conn.userId ? "bg-blue-50" : ""
                }`}
                onClick={() => openChat(conn.userId)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={conn.avatar || "https://via.placeholder.com/40"}
                      alt={conn.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    {conn.hasUnreadMessages && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                        {conn.unreadCount > 9 ? '9+' : conn.unreadCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{conn.fullName}</h3>
                    <p className="text-sm text-gray-600">{conn.role || "User"}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderChatBox = () => {
    if (!activeChat) {
      return (
        <div className="w-2/3 flex items-center justify-center text-gray-500 bg-gray-50">
          <div className="text-center p-6">
            <div className="text-6xl mb-4 text-gray-300">💬</div>
            <h3 className="text-xl font-medium mb-2">Your Messages</h3>
            <p>Select a connection to start chatting</p>
          </div>
        </div>
      );
    }

    const activeConnection = connections.find((c) => c.userId === activeChat);

    return (
      <div className="w-2/3 flex flex-col h-full bg-white">
        <div className="border-b p-4 flex items-center space-x-3 bg-white shadow-sm">
          <img
            src={activeConnection?.avatar || "https://via.placeholder.com/40"}
            alt={activeConnection?.fullName}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <div>
            <h3 className="font-medium">{activeConnection?.fullName}</h3>
            <p className="text-sm text-gray-600">{activeConnection?.role || "User"}</p>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto bg-white"
          style={{ backgroundImage: 'radial-gradient(circle at center, #f3f4f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 ${
                  msg.sender === currentUserId ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block max-w-xs md:max-w-sm px-4 py-2 rounded-lg shadow-sm ${
                    msg.sender === currentUserId
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                  }`}
                >
                  {msg.content.startsWith('file:') ? (
                    <div>
                      <div className="flex items-center">
                        {getFileIcon(msg.content)}
                        <span className="text-sm font-medium overflow-hidden text-ellipsis">
                          {renderFileName(msg.content.substring(5))}
                        </span>
                      </div>
                      
                      {isImageFile(msg.content) && (
                        <div className="mt-2 rounded-lg overflow-hidden border">
                          <img 
                            src={`http://localhost:5000/uploads/messages/${msg.content.substring(5)}`} 
                            alt="Image preview" 
                            className="max-w-full h-auto max-h-48 object-contain bg-white"
                          />
                        </div>
                      )}
                      
                      <a 
                        href={`http://localhost:5000/uploads/messages/${msg.content.substring(5)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`mt-2 inline-flex items-center text-xs px-2 py-1 rounded ${
                          msg.sender === currentUserId 
                            ? "bg-blue-600 hover:bg-blue-700" 
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        }`}
                        download
                      >
                        <FiDownload className="mr-1" /> Download
                      </a>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <span className="text-xs opacity-75 block mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 bg-white">
          {selectedFile && (
            <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
              <div className="flex items-center overflow-hidden">
                {getFileIcon(selectedFile.name)}
                <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
              <button 
                onClick={() => setSelectedFile(null)} 
                className="text-red-500 hover:text-red-700 ml-2"
                title="Remove file"
              >
                <FiX />
              </button>
            </div>
          )}
          
          <div className="relative flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Type a message..."
              disabled={isUploading}
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <div className="flex border-t border-r border-b rounded-r-lg bg-white">
              <button 
                onClick={triggerFileInput} 
                className="px-3 py-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Attach file"
                disabled={isUploading}
              >
                <FiPaperclip />
              </button>
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                className="px-3 py-2 text-gray-500 hover:text-yellow-500 transition-colors"
                title="Add emoji"
                disabled={isUploading}
              >
                <FiSmile />
              </button>
              <button
                onClick={sendMessage}
                disabled={isUploading || (!newMessage.trim() && !selectedFile)}
                className={`px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors ${
                  isUploading || (!newMessage.trim() && !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? 
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span> 
                  : <FiSend />
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMessageSection = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-260px)] flex border border-gray-200">
        {renderConnectionsList()}
        {renderChatBox()}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">My Connections</h1>
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading connections...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">My Connections</h1>
        <div className="mb-6">
          <ConnectionsTabs 
            connections={connections} 
            onMessageClick={openChat} 
          />
        </div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Messages</h2>
        {renderMessageSection()}
      </div>
    </div>
  );
};

export default Connections;