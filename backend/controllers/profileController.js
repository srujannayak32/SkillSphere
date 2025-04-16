import Profile from '../models/Profile.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const uniqueId = uuidv4();
    cb(null, `profile-${uniqueId}${fileExt}`);
  }
});

export const uploadAssets = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
    }
  }
}).single('avatar');

/**
 * Create or update a user profile
 */
export const upsertProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    let updateData = { userId };

    if (req.file) {
      updateData.avatar = req.file.filename;
    } else {
      console.error('No file uploaded'); // Debugging log
    }

    if (req.body) {
      if (req.body.bio) updateData.bio = req.body.bio;
      if (req.body.skills) {
        updateData.skills = req.body.skills
          .filter(skill => skill.name.trim() !== '')
          .map(skill => ({
            name: skill.name,
            level: skill.level || 1,
            endorsements: skill.endorsements || 0
          }));
      }
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      updateData,
      { 
        new: true, 
        upsert: true,
        populate: { path: 'userId', select: 'fullName email username avatar' }
      }
    );

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error in upsertProfile:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
};

/**
 * Get a user's profile
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ userId })
      .populate('userId', 'fullName email username avatar');
    
    if (!profile) {
      return res.status(200).json({
        userId,
        skills: [],
        bio: '',
        avatar: '',
        experience: [],
        education: []
      });
    }
    
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: error.message 
    });
  }
};

/**
 * Endorse a specific skill for a user
 */
export const endorseSkill = async (req, res) => {
  try {
    const { userId, skillName } = req.body;
    
    if (!userId || !skillName) {
      return res.status(400).json({ error: 'userId and skillName are required' });
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId, 'skills.name': skillName },
      { $inc: { 'skills.$.endorsements': 1 } },
      { new: true, populate: { path: 'userId', select: 'fullName email username avatar' } }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: 'Skill not found for this user' });
    }

    res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error in endorseSkill:', error);
    res.status(500).json({ 
      error: 'Failed to endorse skill',
      details: error.message 
    });
  }
};

/**
 * Get potential matches based on skills
 */
export const getMatches = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userSkills = userProfile.skills.map(skill => skill.name);
    if (userSkills.length === 0) {
      return res.status(200).json({ matches: [] });
    }

    const matches = await Profile.find({
      userId: { $ne: userId },
      'skills.name': { $in: userSkills }
    })
    .populate('userId', 'fullName email avatar')
    .limit(20); // Limit to 20 matches

    res.status(200).json({ matches });
  } catch (error) {
    console.error('Error in getMatches:', error);
    res.status(500).json({ 
      error: 'Failed to find matches',
      details: error.message 
    });
  }
};

/**
 * Get mentors by specific skill
 */
export const getMentorsBySkill = async (req, res) => {
  try {
    const { skill } = req.params;
    
    if (!skill) {
      return res.status(400).json({ error: 'Skill parameter is required' });
    }

    const mentors = await Profile.find({ 
      'skills.name': { $regex: new RegExp(skill, 'i') },
      'skills.level': { $gte: 3 } // Only show mentors with skill level 3 or higher
    })
    .populate('userId', 'fullName email avatar')
    .sort({ 'skills.level': -1 }); // Sort by skill level descending

    res.status(200).json({ mentors });
  } catch (error) {
    console.error('Error in getMentorsBySkill:', error);
    res.status(500).json({ 
      error: 'Failed to fetch mentors',
      details: error.message 
    });
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Example statistics
    const stats = {
      totalSkills: profile.skills.length,
      endorsements: profile.skills.reduce((total, skill) => total + skill.endorsements, 0),
      bio: profile.bio,
      avatar: profile.avatar
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user statistics',
      details: error.message 
    });
  }
};
