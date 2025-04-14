import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  meetingId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  meetingName: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  hostId: { 
    type: String, 
    required: true 
  },
  participants: { 
    type: Number, 
    default: 10 
  },
  maxParticipants: { 
    type: Number, 
    default: 100 
  },
  duration: { 
    type: Number, 
    default: 60 
  },
  isPrivate: { 
    type: Boolean, 
    default: true 
  },
  waitingRoom: { 
    type: Boolean, 
    default: true 
  },
  muteOnEntry: { 
    type: Boolean, 
    default: false 
  },
  allowRecording: { 
    type: Boolean, 
    default: true 
  },
  enableChat: { 
    type: Boolean, 
    default: true 
  },
  enableReactions: { 
    type: Boolean, 
    default: true 
  },
  recurring: { 
    type: Boolean, 
    default: false 
  },
  schedule: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  activeParticipants: [{
    userId: String,
    socketId: String,
    name: String,
    isMuted: { 
      type: Boolean, 
      default: false 
    },
    videoOff: { 
      type: Boolean, 
      default: false 
    },
    raisedHand: { 
      type: Boolean, 
      default: false 
    }
  }]
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
