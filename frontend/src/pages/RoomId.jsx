import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const RoomId = () => {
  const { id } = useParams(); // Get the room ID from the URL
  const navigate = useNavigate(); // To redirect if the room ID is invalid
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const socket = useRef(null);

  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [raisedHands, setRaisedHands] = useState({});
  const [recordingUsers, setRecordingUsers] = useState([]);
  const [reactions, setReactions] = useState({});
  const [sharedFiles, setSharedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorder = useRef(null);

  useEffect(() => {
    if (!id) {
      console.error('Room ID is missing!');
      navigate('/'); // Redirect to home if the room ID is missing
      return;
    }

    // Initialize socket connection
    socket.current = io('http://localhost:5000');

    // Join room
    socket.current.emit('join-room', { roomId: id });

    // Set up event handlers
    socket.current.on('chat-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.current.on('participants-updated', (users) => {
      setParticipants(users);
    });

    socket.current.on('raise-hand', ({ userId, isRaised }) => {
      setRaisedHands((prev) => ({ ...prev, [userId]: isRaised }));
    });

    socket.current.on('recording-started', (userId) => {
      setRecordingUsers((prev) => [...prev, userId]);
    });

    socket.current.on('recording-stopped', (userId) => {
      setRecordingUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.current.on('reaction-sent', ({ userId, emoji }) => {
      setReactions((prev) => ({ ...prev, [userId]: emoji }));
      setTimeout(() => {
        setReactions((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }, 3000);
    });

    socket.current.on('file-shared', (file) => {
      setSharedFiles((prev) => [...prev, file]);
    });

    // Initialize WebRTC
    const initWebRTC = async () => {
      try {
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;
    
        // Create peer connection
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
    
        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });
    
        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          remoteVideoRef.current.srcObject = event.streams[0];
        };
    
        // Handle ICE candidates
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.current.emit('ice-candidate', {
              candidate: event.candidate,
              roomId: id,
            });
          }
        };
    
        // Set up signaling handlers
        socket.current.on('offer', async (offer) => {
          await peerConnection.current.setRemoteDescription(offer);
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.current.emit('answer', { answer, roomId: id });
        });
    
        socket.current.on('answer', async (answer) => {
          await peerConnection.current.setRemoteDescription(answer);
        });
    
        socket.current.on('ice-candidate', async (candidate) => {
          try {
            await peerConnection.current.addIceCandidate(candidate);
          } catch (e) {
            console.error('Error adding ICE candidate', e);
          }
        });
      } catch (error) {
        if (error.name === 'NotReadableError') {
          console.error('Error initializing WebRTC: Device is already in use.');
          alert('Your camera or microphone is already in use by another application or browser tab. Please close it and try again.');
        } else {
          console.error('Error initializing WebRTC:', error);
        }
      }
    };

    initWebRTC();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [id, navigate]);

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isSharingScreen) {
        // Stop screen share and restore camera
        screenStream.getTracks().forEach((track) => track.stop());
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        localVideoRef.current.srcObject = stream;
        setLocalStream(stream);
        replaceTrack(stream.getVideoTracks()[0]);
      } else {
        // Start screen share
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        setScreenStream(stream);
        localVideoRef.current.srcObject = stream;
        replaceTrack(stream.getVideoTracks()[0]);

        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare(); // Auto-stop when user ends sharing
        };
      }
      setIsSharingScreen(!isSharingScreen);
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const replaceTrack = (newTrack) => {
    const sender = peerConnection.current
      .getSenders()
      .find((s) => s.track.kind === newTrack.kind);
    sender.replaceTrack(newTrack);
  };

  const leaveRoom = () => {
    window.location.href = '/';
  };

  // Define the missing raiseHand function
  const raiseHand = () => {
    const isRaised = !raisedHands[socket.current?.id];
    socket.current.emit('raise-hand', { roomId: id, isRaised });
    setRaisedHands((prev) => ({ ...prev, [socket.current?.id]: isRaised }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 relative">
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          {isChatOpen ? 'Close Chat' : 'Open Chat'}
        </button>
        <button
          onClick={raiseHand}
          className={`px-4 py-2 rounded-lg ${
            raisedHands[socket.current?.id] ? 'bg-yellow-500' : 'bg-gray-600'
          }`}
        >
          ✋
        </button>
      </div>

      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Room: {id}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
          <div className="bg-gray-800 rounded-lg p-2">
            <h2 className="text-center mb-2">You</h2>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto rounded-lg"
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-2">
            <h2 className="text-center mb-2">Participant</h2>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomId;