import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Profile from '../models/Profile.js';
import Message from '../models/Message.js';

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

    // First find the target user's profile
    const targetProfile = await Profile.findOne({ userId: targetUserId });

    console.log('targetProfile found:', targetProfile);

    if (!targetProfile) {
      return res.status(404).json({ message: "Target user's profile not found" });
    }

    // Check if a connection already exists
    const existingConnection = await Connection.findOne({
      userId: userId,
      connectedProfileId: targetProfile._id
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection request already exists' });
    }

    // Get username from User model
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Create the new connection
    const connection = new Connection({
      userId: userId,
      connectedProfileId: targetProfile._id,
      status: 'pending',
      avatar: targetProfile.avatar || '', 
      username: targetUser.username || 'Unknown',
      skills: targetProfile.skills || [],
      bio: targetProfile.bio || ''
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
    const userId = req.user?._id;
    const { connectionId } = req.params; // Changed from targetUserId to connectionId
    const { action } = req.body; // 'accept' or 'reject'

    console.log(`Responding to connection with ID: ${connectionId}, action: ${action}`);

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject"' });
    }

    // Find the connection by ID
    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Verify that this connection request is for the current user's profile
    const userProfiles = await Profile.find({ userId });
    const userProfileIds = userProfiles.map(profile => profile._id.toString());
    
    if (!userProfileIds.includes(connection.connectedProfileId.toString())) {
      return res.status(403).json({ message: 'Not authorized to respond to this connection request' });
    }

    // Update connection status based on action
    if (action === 'accept') {
      connection.status = 'accepted';
      
      // Create a reverse connection so both users are connected to each other
      const senderProfile = await Profile.findOne({ userId: connection.userId });
      
      if (senderProfile) {
        // Check if reverse connection already exists
        const reverseConnection = await Connection.findOne({
          userId: userId,
          connectedProfileId: senderProfile._id
        });
        
        if (!reverseConnection) {
          // Create the reverse connection
          const newReverseConnection = new Connection({
            userId: userId,
            connectedProfileId: senderProfile._id,
            status: 'accepted',
            avatar: senderProfile.avatar,
            username: senderProfile.userId ? await User.findById(senderProfile.userId).then(u => u.username) : 'Unknown',
            skills: senderProfile.skills,
            bio: senderProfile.bio
          });
          
          await newReverseConnection.save();
        } else if (reverseConnection.status !== 'accepted') {
          // Update the status if it's not already accepted
          reverseConnection.status = 'accepted';
          await reverseConnection.save();
        }
      }
    } else {
      connection.status = 'rejected';
    }

    await connection.save();
    res.status(200).json({ message: `Connection request ${action}ed successfully` });
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

    // Only fetch accepted connections
    const connections = await Connection.find({ 
      userId,
      status: 'accepted' // Only show accepted connections
    })
      .populate({
        path: 'connectedProfileId',
        populate: { path: 'userId', select: 'fullName username avatar' }, // Populate user details
      })
      .populate('userId', 'fullName email username'); // Populate user details

    console.log('Connections fetched:', connections);

    const formattedConnections = connections.map((conn) => ({
      userId: conn.connectedProfileId?.userId?._id || conn.connectedProfileId?._id, // Include userId
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

// Mark messages as seen
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    // Update unseen messages to seen
    await Message.updateMany(
      { senderId: userId, receiverId: currentUserId, isSeen: false },
      { isSeen: true }
    );

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (err) {
    console.error("Error marking messages as seen:", err);
    res.status(500).json({ message: "Failed to mark messages as seen" });
  }
};

// Get connection notifications
export const getConnectionNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    // Find connection requests sent to this user (where they're the target)
    const targetProfiles = await Profile.find({ userId });
    if (!targetProfiles.length) {
      return res.status(200).json([]);
    }
    
    // Get connection requests where current user's profile is the target
    const targetProfileIds = targetProfiles.map(profile => profile._id);
    
    const pendingConnections = await Connection.find({
      connectedProfileId: { $in: targetProfileIds },
      status: 'pending'
    }).populate('userId');
    
    // Format the connections as notifications
    const notifications = pendingConnections.map(conn => {
      // Handle safely to prevent null reference errors
      const user = conn.userId || {};
      
      return {
        _id: conn._id,
        type: 'connection_request',
        message: `${user.fullName || user.username || 'Someone'} wants to connect with you`,
        sender: {
          _id: user._id || 'unknown',
          fullName: user.fullName || 'Unknown User',
          username: user.username || 'Unknown',
          avatar: user.avatar || ''
        },
        createdAt: conn.createdAt,
        read: false
      };
    });

    return res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching connection notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};