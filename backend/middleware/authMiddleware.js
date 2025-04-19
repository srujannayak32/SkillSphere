import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token received in protect middleware:', token);

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.id };
    console.log('Decoded user:', req.user);

    next();
  } catch (err) {
    console.error('Error in protect middleware:', err);
    res.status(401).json({ message: 'Not authorized' });
  }
};
