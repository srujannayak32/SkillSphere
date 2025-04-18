import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { Peer } from 'peerjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, 
  FiMessageSquare, FiSend, FiUsers, FiX, FiCopy, 
  FiUser, FiMessageCircle, FiSmile
} from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import Confetti from 'react-confetti';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket']
});

const RoomId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [peers, setPeers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userStream, setUserStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const userVideoRef = useRef();
  const peersRef = useRef([]);
  const messagesEndRef = useRef();
  const mediaStreamRef = useRef(null);

  const copyMeetingId = useCallback(() => {
    if (room?.meetingId) {
      navigator.clipboard.writeText(room.meetingId)
        .then(() => {
          toast.success('Meeting ID copied to clipboard!');
        })
        .catch((error) => {
          console.error('Failed to copy Meeting ID:', error);
          toast.error('Failed to copy Meeting ID. Please try again.');
        });
    } else {
      toast.error('Meeting ID not available');
    }
  }, [room]);

  // Fetch room details and check if user is host
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);

        const { data: roomData } = await axios.get(`http://localhost:5000/api/rooms/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        console.log('Room data:', roomData);

        setRoom(roomData.room);
      } catch (error) {
        console.error('Error fetching room data:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch room details');
        navigate('/auth/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, navigate]);

  // Initialize media and socket connection
  useEffect(() => {
    if (!room) return;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        mediaStreamRef.current = stream;
        setUserStream(stream);

        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }

        socket.emit('join-room', { 
          roomId: room.meetingId, 
          userId: isHost ? room.host : `participant_${Date.now()}`,
          name: isHost ? room.hostName : 'Participant',
          isHost 
        });

        return () => {
          cleanupMedia();
        };
      } catch (error) {
        toast.error('Media access denied: ' + error.message);
        console.error('Media error:', error);
      }
    };

    const handleReceiveMessage = (message) => {
      console.log('Message received:', message); // Debugging log
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    };

    const handleUpdateParticipants = (participants) => {
      console.log('Participants updated:', participants); // Debugging log
      setPeers(participants);
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('update-participants', handleUpdateParticipants);

    initMedia();

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('update-participants', handleUpdateParticipants);
      socket.emit('leave-room', { roomId: room.meetingId });
      cleanupMedia();
    };
  }, [room, isHost]);

  const cleanupMedia = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    peersRef.current.forEach(({ peer }) => peer.destroy());
    peersRef.current = [];
    setPeers([]);
  }, []);

  const connectToNewUser = useCallback((userId, stream) => {
    if (peersRef.current.some(p => p.socketId === userId.socketId)) return;

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });

    peer.on('signal', signal => {
      socket.emit('send-signal', { userId, callerId: socket.id, signal });
    });

    peer.on('stream', stream => {
      setPeers(prev => [...prev, { 
        socketId: userId.socketId, 
        name: userId.name, 
        stream 
      }]);
    });

    peer.on('close', () => {
      removePeer(userId.socketId);
    });

    peersRef.current.push({ socketId: userId.socketId, peer });
  }, []);

  const removePeer = useCallback((socketId) => {
    const peerObj = peersRef.current.find(p => p.socketId === socketId);
    if (peerObj) peerObj.peer.destroy();

    peersRef.current = peersRef.current.filter(p => p.socketId !== socketId);
    setPeers(prev => prev.filter(p => p.socketId !== socketId));
  }, []);

  const toggleAudio = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setMuted(!audioTrack.enabled);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoOff(!videoTrack.enabled);
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    try {
      let newStream;

      if (screenSharing) {
        newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } else {
        newStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        newStream.getVideoTracks()[0].onended = () => toggleScreenShare();
      }

      mediaStreamRef.current = newStream;
      userVideoRef.current.srcObject = newStream;
      setUserStream(newStream);

      peersRef.current.forEach(({ peer }) => {
        const videoTrack = newStream.getVideoTracks()[0];
        peer.replaceTrack(peer.streams[0].getVideoTracks()[0], videoTrack, newStream);
      });

      setScreenSharing(!screenSharing);
    } catch (error) {
      toast.error('Screen share failed: ' + error.message);
    }
  }, [screenSharing]);

  const sendMessage = useCallback(() => {
    if (!message.trim()) return;

    const newMessage = {
      sender: isHost ? room.hostName : 'You',
      text: message,
      timestamp: new Date(),
      isHost
    };

    socket.emit('send-message', { roomId: room.meetingId, message: newMessage });
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    scrollToBottom();
  }, [message, room, isHost]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const joinRoomById = useCallback(() => {
    const roomId = prompt('Enter Room ID:');
    const name = prompt('Enter Your Name:');
    if (roomId && name) {
      navigate(`/room/${roomId}`, { state: { name } });
    } else {
      toast.error('Room ID and Name are required to join');
    }
  }, [navigate]);

  const leaveMeeting = useCallback(() => {
    cleanupMedia();
    navigate('/auth/dashboard');
  }, [navigate, cleanupMedia]);

  const addEmoji = useCallback((emoji) => {
    setMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  }, []);

  const toggleChat = useCallback(() => {
    setShowChat(!showChat);
  }, [showChat]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading meeting...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Room not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}

      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">{room?.name || 'Meeting Room'}</h1>
          <button
            onClick={copyMeetingId}
            className="ml-4 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded flex items-center text-sm"
          >
            <FiCopy className="mr-1" /> {room?.meetingId || 'Loading...'}
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
          >
            <FiUsers className="mr-1" /> {room?.participants?.length || 0}
          </button>
          <button
            onClick={leaveMeeting}
            className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded flex items-center"
          >
            <FiX className="mr-1" /> Leave
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Grid */}
        <div className={`flex-1 ${showParticipants || showChat ? 'lg:w-3/4' : 'w-full'} p-4 overflow-auto`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Local Video */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-800 rounded-lg overflow-hidden relative aspect-video"
            >
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 flex justify-between items-center">
                <span className="font-medium truncate">{isHost ? room?.hostName : 'You'}</span>
                <div className="flex space-x-2">
                  {muted ? (
                    <span className="bg-red-500 rounded-full p-1">
                      <FiMicOff size={14} />
                    </span>
                  ) : (
                    <span className="bg-green-500 rounded-full p-1">
                      <FiMic size={14} />
                    </span>
                  )}
                  {videoOff ? (
                    <span className="bg-red-500 rounded-full p-1">
                      <FiVideoOff size={14} />
                    </span>
                  ) : (
                    <span className="bg-green-500 rounded-full p-1">
                      <FiVideo size={14} />
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Remote Videos */}
            <AnimatePresence>
              {peers.map((peer) => (
                <motion.div
                  key={peer.socketId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gray-800 rounded-lg overflow-hidden relative aspect-video"
                >
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(videoRef) => videoRef && (videoRef.srcObject = peer.stream)}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                    <span className="font-medium truncate">{peer.name}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="hidden lg:block w-1/4 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <FiUsers className="mr-2" /> Participants ({room?.participants?.length || 0})
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center p-2 bg-gray-700 rounded">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <FiUser />
                </div>
                <div>
                  <p className="font-medium truncate">{room?.hostName || 'Host'}</p>
                  <p className="text-xs text-gray-400">Host</p>
                </div>
              </li>
              {room?.participants?.filter(p => p._id !== room?.host?._id).map(participant => (
                <li key={participant._id} className="flex items-center p-2 hover:bg-gray-700 rounded">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <FiUser />
                  </div>
                  <p className="truncate">{participant.fullName}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="hidden lg:block w-1/4 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <FiMessageCircle className="mr-2" /> Chat
            </h2>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-3">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2 rounded-lg ${msg.isHost ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    <p className="text-sm font-medium">{msg.sender}</p>
                    <p>{msg.text}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="mt-4 flex items-center">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-white"
                  aria-label="Emoji picker"
                >
                  <FiSmile />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-0 z-10">
                    <EmojiPicker onEmojiClick={addEmoji} />
                  </div>
                )}
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="ml-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  aria-label="Send message"
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center items-center space-x-6">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${muted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <FiMicOff size={20} /> : <FiMic size={20} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${videoOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
          aria-label={videoOff ? 'Turn on video' : 'Turn off video'}
        >
          {videoOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full ${screenSharing ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}
          aria-label={screenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <FiMonitor size={20} />
        </button>

        <button
          onClick={toggleChat}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
          aria-label="Chat"
        >
          <FiMessageSquare size={20} />
        </button>

        <button
          onClick={joinRoomById}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
          aria-label="Join Room"
        >
          <FiUser size={20} />
        </button>
      </div>
    </div>
  );
};

export default RoomId;
