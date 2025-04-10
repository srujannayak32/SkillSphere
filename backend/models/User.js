// ✅ models/User.js (ESM)
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  email: String,
  password: String,
  photo: String,
  skills: [String],
  badges: [String],
  activity: [String],
});

const User = mongoose.model("User", userSchema);
export default User;
