// ✅ models/User.js (ESM)
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  email: String,
  password: String,
  verified: {
    type: Boolean,
    default: false, // New users are unverified until OTP is confirmed
  },
  photo: String,
  skills: [String],
  badges: [String],
  activity: [String],
});

const User = mongoose.model("User", userSchema);
export default User;
