import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import roomRoutes from './routes/roomRoutes.js'; // Import roomRoutes
import path from 'path'; // Import path module
import { fileURLToPath } from 'url'; // Import fileURLToPath
import connectionRoutes from './routes/connectionRoutes.js'; // Ensure this is imported
import statsRoutes from './routes/statsRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; // Import AI routes
import messageRoutes from './routes/messageRoutes.js'; // Import messageRoutes

const app = express();
const server = createServer(app);

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Ensure this serves the correct directory
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles'))); // Serve profile photos

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
const rooms = {};

io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, userName }) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ id: socket.id, userName });

    socket.join(roomId);

    // Notify others in the room
    socket.to(roomId).emit('user-joined', userName);

    socket.on('chat-message', ({ roomId, message, userName }) => {
      io.to(roomId).emit('chat-message', { message, userName });
    });

    socket.on('disconnect', () => {
      rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id);
      socket.to(roomId).emit('user-left', userName);
    });
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/rooms', roomRoutes); // Register roomRoutes
app.use('/api/connections', connectionRoutes); // Ensure this is registered
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes); // Register AI routes
app.use('/api/messages', messageRoutes); // Register messageRoutes

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
