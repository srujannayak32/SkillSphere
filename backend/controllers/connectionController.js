import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Profile from '../models/Profile.js';

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.user?._id; // Ensure req.user exists
    const { targetUserId } = req.params;

    console.log('sendConnectionRequest called with targetUserId:', targetUserId);

    if (!userId || !targetUserId) {
      return res.status(400).json({ message: 'User ID or Target User ID is missing' });
    }

    if (userId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const targetProfile = await Profile.findOne({ userId: targetUserId }).populate('userId', 'username');

    console.log('targetProfile found:', targetProfile);

    if (!targetProfile) {
      return res.status(404).json({ message: "Target user's profile not found" });
    }

    const existingConnection = await Connection.findOne({
      userId,
      connectedProfileId: targetProfile._id,
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection request already exists' });
    }

    const connection = new Connection({
      userId,
      connectedProfileId: targetProfile._id,
      status: 'pending',
      avatar: targetProfile.avatar, // Save avatar
      username: targetProfile.userId.username, // Save username
      skills: targetProfile.skills, // Save skills
      bio: targetProfile.bio, // Save bio
    });

    await connection.save();

    res.status(200).json({ message: 'Connection request sent' });
  } catch (err) {
    console.error('Connection Error:', err);
    res.status(500).json({ message: 'Failed to send connection request' });
  }
};

// Respond to connection request
export const respondToConnection = async (req, res) => {
  try {
    const userId = req.user?._id; // Ensure req.user exists
    const { targetUserId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    console.log(`Responding to connection request: userId=${userId}, targetUserId=${targetUserId}, action=${action}`);

    const targetProfile = await Profile.findOne({ userId: targetUserId });

    if (!targetProfile) {
      return res.status(404).json({ message: "Target user's profile not found" });
    }

    const connection = await Connection.findOne({
      userId,
      connectedProfileId: targetProfile._id,
    });

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (action === 'accept') {
      connection.status = 'connected'; // Update status to 'connected'
      console.log('Connection request accepted:', connection);
    } else if (action === 'reject') {
      connection.status = 'rejected'; // Update status to 'rejected'
      console.log('Connection request rejected:', connection);
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await connection.save();

    res.status(200).json({ message: `Connection request ${action}ed` });
  } catch (err) {
    console.error('Error responding to connection request:', err);
    res.status(500).json({ message: 'Failed to respond to connection request' });
  }
};

// Get user connections
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user?._id; // Ensure req.user exists
    console.log('Fetching all connections for userId:', userId);

    const connections = await Connection.find({ userId })
      .populate({
        path: 'connectedProfileId',
        populate: { path: 'userId', select: 'fullName username avatar' }, // Populate user details
      })
      .populate('userId', 'fullName email username'); // Populate user details

    console.log('Connections fetched:', connections);

    const formattedConnections = connections.map((conn) => ({
      avatar: conn.connectedProfileId?.userId?.avatar || '',
      fullName: conn.connectedProfileId?.userId?.fullName || 'Unknown User',
      username: conn.connectedProfileId?.userId?.username || 'No username',
      bio: conn.connectedProfileId?.bio || '',
      role: conn.connectedProfileId?.role || '',
      skills: conn.connectedProfileId?.skills || [],
    }));

    res.status(200).json(formattedConnections);
  } catch (err) {
    console.error('Error fetching connections:', err);
    res.status(500).json({ message: 'Failed to fetch connections' });
  }
};

// Get pending connections
export const getPendingConnections = async (req, res) => {
  try {
    const { userId } = req.session;
    const user = await User.findById(userId)
      .populate('connections.user', 'fullName photo role')
      .populate('connections.initiatedBy', 'fullName');

    const pending = user.connections
      .filter(conn => conn.status === 'pending' && conn.initiatedBy.toString() !== userId.toString())
      .map(conn => conn.toObject());

    res.status(200).json(pending);
  } catch (err) {
    console.error("Get Pending Connections Error:", err);
    res.status(500).json({ message: "Failed to get pending connections" });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { userId } = req.session;
    const { query, role } = req.query;

    const searchConditions = {
      _id: { $ne: userId }, // Exclude current user
      verified: true
    };

    if (role && ['student', 'mentor', 'both'].includes(role)) {
      searchConditions.role = role;
    }

    if (query) {
      searchConditions.$or = [
        { fullName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { 'skills.name': { $regex: query, $options: 'i' } }
      ];
    }

    const users = await User.find(searchConditions)
      .select('fullName photo role skills bio')
      .limit(20);

    res.status(200).json(users);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Failed to search users" });
  }
};