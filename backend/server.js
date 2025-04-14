import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import Room from './models/Room.js';


const app = express();
const server = createServer(app);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Configure CORS for Express
app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true
}));

// Configure Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());

// Database connection
mongoose.connect('mongodb://localhost:27017/skillsphere')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join room handler
  socket.on('join-room', async (data) => {
    const { roomId, userId, name } = data;
    try {
      socket.join(roomId);
      console.log(`${name} joined room ${roomId}`);
      
      socket.to(roomId).emit('participant-joined', {
        userId,
        name,
        socketId: socket.id,
        timestamp: new Date()
      });

      const room = await Room.findOne({ meetingId: roomId });
      socket.emit('room-data', room);
    } catch (error) {
      console.error('Join room error:', error);
    }
  });

  // Chat message handler
  socket.on('send-message', (data) => {
    socket.to(data.roomId).emit('receive-message', {
      ...data,
      timestamp: new Date()
    });
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
