// backend/controllers/statsController.js
import User from '../models/User.js';

export const getUserStats = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId)
      .populate('connections.user', 'role')
      .populate('sessions.mentor sessions.mentee');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate sessions completed
    const sessionsCompleted = user.sessions.length;

    // Calculate mentors connected
    const mentorsConnected = user.connections.filter(
      conn => conn.status === 'accepted' && 
      (conn.user.role === 'mentor' || conn.user.role === 'both')
    ).length;

    // Calculate courses taken (sessions with specific skills)
    const coursesTaken = new Set(
      user.sessions.flatMap(session => session.skillsPracticed)
    ).size;

    // Calculate level progress
    const xpNeeded = Math.pow(user.level.levelNumber, 2) * 100;
    const progress = Math.floor((user.xpPoints / xpNeeded) * 100);

    res.status(200).json({
      sessionsCompleted,
      mentorsConnected,
      coursesTaken,
      xpPoints: user.xpPoints,
      level: user.level.levelNumber,
      progress
    });
  } catch (err) {
    console.error("Get Stats Error:", err);
    res.status(500).json({ message: "Failed to get user stats" });
  }
};