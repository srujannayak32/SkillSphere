import Room from '../models/Room.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new meeting room
export const createRoom = async (req, res) => {
  try {
    const { meetingName, password, hostId, settings } = req.body;
    
    const room = new Room({
      meetingId: uuidv4().substring(0, 8).toUpperCase(),
      meetingName,
      password,
      hostId,
      ...settings
    });

    await room.save();
    res.status(201).json({
      success: true,
      roomId: room.meetingId,
      message: 'Room created successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Join an existing room
export const joinRoom = async (req, res) => {
  try {
    const { meetingId, password, userId, name } = req.body;
    
    const room = await Room.findOne({ meetingId });
    if (!room) {
      return res.status(404).json({ 
        success: false,
        error: 'Room not found' 
      });
    }

    if (room.password !== password) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid password' 
      });
    }

    if (room.activeParticipants.length >= room.maxParticipants) {
      return res.status(403).json({ 
        success: false,
        error: 'Room is full' 
      });
    }

    // Add participant to room
    room.activeParticipants.push({
      userId,
      name,
      socketId: req.socketId // Will be set by Socket.IO middleware
    });

    await room.save();

    res.status(200).json({ 
      success: true,
      room,
      message: 'Joined room successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get room details
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ meetingId: req.params.id });
    if (!room) {
      return res.status(404).json({ 
        success: false,
        error: 'Room not found' 
      });
    }
    res.status(200).json({ 
      success: true,
      room 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update participant status
export const updateParticipant = async (req, res) => {
  try {
    const { meetingId, userId, updates } = req.body;
    
    const room = await Room.findOne({ meetingId });
    if (!room) {
      return res.status(404).json({ 
        success: false,
        error: 'Room not found' 
      });
    }

    const participant = room.activeParticipants.find(p => p.userId === userId);
    if (!participant) {
      return res.status(404).json({ 
        success: false,
        error: 'Participant not found' 
      });
    }

    Object.assign(participant, updates);
    await room.save();

    res.status(200).json({ 
      success: true,
      participant,
      message: 'Participant updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Leave room
export const leaveRoom = async (req, res) => {
  try {
    const { meetingId, userId } = req.body;
    
    const room = await Room.findOne({ meetingId });
    if (!room) {
      return res.status(404).json({ 
        success: false,
        error: 'Room not found' 
      });
    }

    room.activeParticipants = room.activeParticipants.filter(
      p => p.userId !== userId
    );
    await room.save();

    res.status(200).json({ 
      success: true,
      message: 'Left room successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};
