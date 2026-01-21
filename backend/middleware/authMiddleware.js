import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized, no token',
        expired: false 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the full user object from the database (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        expired: false 
      });
    }
    
    // Attach the full user object to req.user
    req.user = user;

    next();
  } catch (err) {
    // Handle token expiration specifically
    if (err.name === 'TokenExpiredError') {
      console.log('Token expired, user needs to login again');
      return res.status(401).json({ 
        message: 'Your session has expired. Please login again.',
        expired: true 
      });
    }
    
    // Handle other JWT errors
    if (err.name === 'JsonWebTokenError') {
      console.log('Invalid token');
      return res.status(401).json({ 
        message: 'Invalid token. Please login again.',
        expired: false 
      });
    }
    
    console.error('Error in protect middleware:', err);
    res.status(401).json({ 
      message: 'Not authorized',
      expired: false 
    });
  }
};
