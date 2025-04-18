import User from '../models/User.js';

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.session;
    const { targetUserId } = req.params;

    if (userId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: "Cannot connect with yourself" });
    }

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if connection already exists
    const existingConnection = user.connections.find(
      conn => conn.user.toString() === targetUserId.toString()
    );

    if (existingConnection) {
      return res.status(400).json({ message: "Connection request already exists" });
    }

    // Add connection to both users
    user.connections.push({
      user: targetUserId,
      status: 'pending',
      initiatedBy: userId
    });

    targetUser.connections.push({
      user: userId,
      status: 'pending',
      initiatedBy: userId
    });

    // Add notification
    targetUser.notifications.push({
      from: userId,
      type: 'connection',
      message: `${user.fullName} wants to connect with you`
    });

    await Promise.all([user.save(), targetUser.save()]);

    res.status(200).json({ message: "Connection request sent" });
  } catch (err) {
    console.error("Connection Error:", err);
    res.status(500).json({ message: "Failed to send connection request" });
  }
};

// Respond to connection request
export const respondToConnection = async (req, res) => {
  try {
    const { userId } = req.session;
    const { targetUserId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update connection status in both users
    const userConnection = user.connections.find(
      conn => conn.user.toString() === targetUserId.toString()
    );
    
    const targetConnection = targetUser.connections.find(
      conn => conn.user.toString() === userId.toString()
    );

    if (!userConnection || !targetConnection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    if (action === 'accept') {
      userConnection.status = 'accepted';
      targetConnection.status = 'accepted';
      
      // Add notification to requester
      targetUser.notifications.push({
        from: userId,
        type: 'connection',
        message: `${user.fullName} accepted your connection request`
      });
    } else {
      userConnection.status = 'rejected';
      targetConnection.status = 'rejected';
    }

    await Promise.all([user.save(), targetUser.save()]);

    res.status(200).json({ message: `Connection request ${action}ed` });
  } catch (err) {
    console.error("Connection Response Error:", err);
    res.status(500).json({ message: "Failed to process connection request" });
  }
};

// Get user connections
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.session;
    const user = await User.findById(userId)
      .populate('connections.user', 'fullName photo role')
      .populate('connections.initiatedBy', 'fullName');

    const connections = user.connections
      .filter(conn => conn.status === 'accepted')
      .map(conn => ({
        ...conn.toObject(),
        isInitiator: conn.initiatedBy.toString() === userId.toString()
      }));

    res.status(200).json(connections);
  } catch (err) {
    console.error("Get Connections Error:", err);
    res.status(500).json({ message: "Failed to get connections" });
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