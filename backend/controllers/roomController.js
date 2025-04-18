import Room from '../models/Room.js';
import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const rooms = {}; // In-memory storage for room participants

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle joining a room
    socket.on('join-room', ({ roomId, userId, name, isHost }) => {
      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId].push({ id: socket.id, userId, name, isHost });

      socket.join(roomId);
      console.log(`${name} joined room: ${roomId}`);
      io.to(roomId).emit('update-participants', rooms[roomId]); // Notify all participants of the updated list
    });

    // Handle sending a chat message
    socket.on('send-message', ({ roomId, message }) => {
      console.log(`Message sent to room ${roomId}:`, message);
      io.to(roomId).emit('receive-message', message); // Broadcast message to all participants in the room
    });

    // Handle disconnecting
    socket.on('disconnect', () => {
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id);
        io.to(roomId).emit('update-participants', rooms[roomId]); // Notify all participants of the updated list
      }
      console.log('User disconnected:', socket.id);
    });
  });
};

export const createRoom = async (req, res) => {
  try {
    const { name, password, maxParticipants, duration } = req.body;

    const room = new Room({
      name,
      password,
      maxParticipants,
      duration,
      host: req.user._id
    });

    await room.save();

    console.log('Room created:', room); // Debugging log

    res.status(201).json({ meetingId: room.meetingId, message: 'Room created successfully' });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Failed to create room' });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { meetingId, password } = req.body;

    const room = await Room.findOne({ meetingId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.password && room.password !== password) {
      return res.status(403).json({ message: 'Incorrect password' });
    }

    res.status(200).json({ room });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ message: 'Failed to join room' });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findOne({ meetingId: id });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ room });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Failed to fetch room' });
  }
};