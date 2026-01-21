# SkillSphere: A Comprehensive Skill Development Platform

<div align="center">
  <h3>🎓 Connect · Learn · Grow · Collaborate</h3>
  <p>A comprehensive platform connecting students, mentors, and professionals for skill development and networking</p>
</div>

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

SkillSphere is a comprehensive platform designed to connect students, mentors, and professionals, fostering skill development, networking, and collaboration. Built using the MERN stack (MongoDB, Express.js, React.js, Node.js), the platform integrates real-time communication, profile management, mentorship features, and AI-driven insights to create a seamless and interactive user experience.

### Key Highlights
- 🔐 Secure authentication with OTP verification
- 👤 Rich profile management with skill tracking
- 🤝 Mentor-mentee connection system
- 🎥 Real-time video conferencing rooms
- 💬 Live chat functionality
- 🤖 AI-powered chatbot assistance
- 📊 Dashboard with user statistics
- 🎯 Skill endorsements and recommendations

---

## ✨ Features

### 1. User Authentication
- **Signup with OTP Verification**: Email verification using secure OTPs sent via Nodemailer
- **Secure Login**: Passwords hashed with bcrypt.js, JWT-based session management
- **Forgot Password**: OTP-based password reset flow

### 2. Profile Management
- Create and edit comprehensive user profiles
- Add bio, role (student/mentor/both), and skills with levels
- Upload profile pictures with validation
- View profiles with skill endorsements
- Experience and achievements tracking

### 3. Connections and Mentorship
- **Explore Profiles**: Search for mentors, students, or collaborators by skills, bio, or role
- **Connection Requests**: Send, accept, or reject connection requests
- **Skill Endorsements**: Endorse skills of connections to highlight expertise
- **Smart Matching**: AI-suggested connections based on skills

### 4. Real-Time Communication
- **Virtual Rooms**: Create or join rooms for meetings or collaborative sessions
  - Password-protected rooms
  - Participant limits
  - Session duration tracking
- **Video Conferencing**: WebRTC-based video and audio
- **Screen Sharing**: Share your screen with participants
- **Real-time Chat**: Socket.IO powered messaging
- **Recording**: Save and replay sessions

### 5. Dashboard
- Personalized user dashboard
- User statistics (sessions, mentors, skills practiced)
- Notifications for connection requests
- Recent activity and badges earned
- XP points and level progression

### 6. AI-Driven Insights
- **OpenAI Integration**: Personalized insights using Google Gemini AI
- **Skill-Based Matches**: AI suggests mentors or collaborators
- **Learning Recommendations**: Get personalized learning paths

### 7. Advanced Features
- **Responsive Design**: Fully responsive across all devices
- **File Uploads**: Secure profile picture and asset management
- **Custom Animations**: Engaging UI with Framer Motion
- **Toast Notifications**: User feedback with React Toastify

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js 19
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **UI Components**: Lucide React, Hero Icons
- **Real-time**: Socket.IO Client
- **Video**: PeerJS for WebRTC
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt.js
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **File Upload**: Multer
- **AI**: Google Generative AI (Gemini)
- **Session**: Express Session

### Database
- **MongoDB**: NoSQL database for flexible data storage
- **Models**: User, Profile, Room, Recording, Connection, Message, Session, OTP

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SkillSphere
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure Backend Environment**
   
   Create `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/skillsphere
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   SESSION_SECRET=your-super-secret-session-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```

4. **Configure Frontend Environment**
   
   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

5. **Start MongoDB**
   ```bash
   mongod --dbpath "C:\data\db"  # Windows
   # OR
   sudo systemctl start mongodb   # Linux
   ```

6. **Run the application**
   
   **Option 1: Run both together (recommended)**
   ```bash
   npm run dev
   ```

   **Option 2: Run separately**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## 📁 Project Structure

```
SkillSphere/
├── backend/                    # Backend server
│   ├── controllers/           # Route controllers
│   │   ├── authController.js     # Authentication logic
│   │   ├── profileController.js  # Profile management
│   │   ├── roomController.js     # Room and Socket.IO
│   │   ├── connectionController.js
│   │   ├── messageController.js
│   │   ├── statsController.js
│   │   └── aiController.js       # AI chatbot
│   ├── models/                # Database models
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── Room.js
│   │   ├── Recording.js
│   │   ├── Connection.js
│   │   ├── Message.js
│   │   ├── Session.js
│   │   └── Otp.js
│   ├── routes/                # API routes
│   ├── middleware/            # Auth middleware
│   ├── uploads/               # File uploads
│   ├── server.js              # Entry point
│   └── package.json
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── ProfileEditor.jsx
│   │   │   └── ...
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Explore.jsx
│   │   │   ├── CreateRoom.jsx
│   │   │   ├── RoomId.jsx
│   │   │   └── ...
│   │   ├── api/              # API configuration
│   │   ├── context/          # React context
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   ├── vite.config.js        # Vite configuration
│   └── package.json
│
├── DEPLOYMENT.md             # Deployment guide
├── README.md                 # This file
└── package.json              # Root package.json
```

---

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)**: Comprehensive deployment instructions
- **[API Documentation](#)**: Coming soon
- **[Contributing Guide](#)**: Coming soon

---

## 🔧 Configuration

### Gmail Setup for OTP
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use the 16-character password in `EMAIL_PASS`

### MongoDB Setup
- **Local**: Start MongoDB on port 27017
- **Cloud**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

---

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

### Build for Production
```bash
npm run build
```

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify port 27017 is not blocked

**Email OTP Not Sending**
- Verify Gmail credentials
- Generate new App Password
- Check 2FA is enabled

**Port Already in Use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

For more troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)

---

## 🚀 Deployment

The application can be deployed to various platforms:

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Render, Railway, Heroku, VPS
- **Database**: MongoDB Atlas

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- React.js and the amazing React community
- MongoDB for flexible data storage
- Socket.IO for real-time communication
- Google Gemini AI for intelligent insights
- All open-source contributors

---

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for common issues
- Review the troubleshooting section

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Course marketplace
- [ ] Gamification features
- [ ] API for third-party integrations
- [ ] Advanced search filters
- [ ] Group video rooms (>2 participants)
- [ ] Screen recording with annotations
- [ ] Integration with GitHub/LinkedIn

---

## 📊 Status

- **Version**: 1.0.0
- **Status**: ✅ Production Ready
- **Last Updated**: January 2026

---

<div align="center">
  <p>Made with ❤️ by the SkillSphere Team</p>
  <p>⭐ Star us on GitHub if you find this helpful!</p>
</div>
