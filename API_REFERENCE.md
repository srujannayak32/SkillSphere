# SkillSphere API Reference

## Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}

Response: { "message": "OTP sent to your email" }
```

#### 2. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

Response: { "message": "OTP verified. Account activated." }
```

#### 3. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": { "_id": "...", "fullName": "...", ... }
}
```

#### 4. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: { "_id": "...", "fullName": "...", "email": "...", ... }
```

#### 5. Get Dashboard Data
```http
GET /api/auth/dashboard
Authorization: Bearer <token>

Response: { user data with stats }
```

#### 6. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com"
}

Response: { "msg": "OTP sent to your email" }
```

#### 7. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "otp": "123456",
  "newPassword": "newpassword123"
}

Response: { "msg": "Password updated successfully." }
```

#### 8. Logout
```http
POST /api/auth/logout

Response: { "message": "Logged out successfully." }
```

---

### Profile Routes (`/api/profile`)

#### 1. Create/Update Profile
```http
POST /api/profile/:userId
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "role": "mentor",
  "bio": "Experienced developer",
  "skills": [
    { "name": "JavaScript", "level": "expert" },
    { "name": "React", "level": "advanced" }
  ]
}

Optional: avatar (file)

Response: { profile data }
```

#### 2. Get Profile
```http
GET /api/profile/:userId

Response: { profile data with user info }
```

#### 3. Endorse Skill
```http
POST /api/profile/:userId/endorse
Authorization: Bearer <token>
Content-Type: application/json

{
  "skillName": "JavaScript"
}

Response: { "message": "Skill endorsed successfully" }
```

#### 4. Get Matches (AI-based)
```http
POST /api/profile/matches
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id-here"
}

Response: { matches: [...] }
```

#### 5. Get Mentors by Skill
```http
GET /api/profile/mentors?skill=JavaScript

Response: { mentors: [...] }
```

#### 6. Get User Stats
```http
GET /api/profile/:userId/stats

Response: { sessions, badges, skills, etc. }
```

---

### Connection Routes (`/api/connections`)

#### 1. Send Connection Request
```http
POST /api/connections/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "user-id-here"
}

Response: { "message": "Connection request sent" }
```

#### 2. Get Pending Requests
```http
GET /api/connections/pending
Authorization: Bearer <token>

Response: { requests: [...] }
```

#### 3. Accept Request
```http
POST /api/connections/accept/:requestId
Authorization: Bearer <token>

Response: { "message": "Connection accepted" }
```

#### 4. Reject Request
```http
POST /api/connections/reject/:requestId
Authorization: Bearer <token>

Response: { "message": "Connection rejected" }
```

#### 5. Get Connections
```http
GET /api/connections
Authorization: Bearer <token>

Response: { connections: [...] }
```

---

### Room Routes (`/api/rooms`)

#### 1. Create Room
```http
POST /api/rooms/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "JavaScript Study Session",
  "description": "Learning React hooks",
  "maxParticipants": 10,
  "duration": 60,
  "isPrivate": false,
  "password": "optional-password"
}

Response: {
  "message": "Room created successfully",
  "room": { ... },
  "meetingId": "123456"
}
```

#### 2. Join Room
```http
POST /api/rooms/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "meetingId": "123456",
  "password": "optional"
}

Response: { room data }
```

#### 3. Get Room
```http
GET /api/rooms/:roomId
Authorization: Bearer <token>

Response: { room data }
```

#### 4. Get User Rooms
```http
GET /api/rooms/user/:userId
Authorization: Bearer <token>

Response: { rooms: [...] }
```

---

### Recording Routes (`/api/rooms`)

#### 1. Save Recording
```http
POST /api/rooms/recordings
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": "room-id-here",
  "title": "Session Recording",
  "duration": 3600,
  "fileUrl": "url-to-recording"
}

Response: { recording data }
```

#### 2. Get Recordings
```http
GET /api/rooms/recordings/:userId
Authorization: Bearer <token>

Response: { recordings: [...] }
```

#### 3. Delete Recording
```http
DELETE /api/rooms/recordings/:recordingId
Authorization: Bearer <token>

Response: { "message": "Recording deleted" }
```

---

### Message Routes (`/api/messages`)

#### 1. Send Message
```http
POST /api/messages/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "user-id-here",
  "content": "Hello!"
}

Response: { message data }
```

#### 2. Get Conversation
```http
GET /api/messages/:userId1/:userId2
Authorization: Bearer <token>

Response: { messages: [...] }
```

---

### AI Routes (`/api/ai`)

#### 1. Ask AI
```http
POST /api/ai/ask
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What is React?",
  "context": "learning"
}

Response: {
  "answer": "React is a JavaScript library..."
}
```

---

### Stats Routes (`/api/stats`)

#### 1. Get User Stats
```http
GET /api/stats/:userId
Authorization: Bearer <token>

Response: {
  "sessionsCompleted": 10,
  "mentorsConnected": 5,
  "skillsPracticed": 8,
  "xpPoints": 250,
  "level": { "levelNumber": 3, "progress": 45 }
}
```

---

### Notification Routes (`/api/notifications`)

#### 1. Get Notifications
```http
GET /api/notifications/:userId
Authorization: Bearer <token>

Response: { notifications: [...] }
```

#### 2. Mark as Read
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer <token>

Response: { "message": "Notification marked as read" }
```

---

## 🔌 Socket.IO Events

### Connection
```javascript
socket.on('connection', (socket) => { ... })
```

### Room Events

#### Join Room
```javascript
socket.emit('join-room', {
  roomId: 'room-id',
  userId: 'user-id',
  name: 'John Doe',
  isHost: false
})
```

#### User Joined
```javascript
socket.on('user-joined', ({ userId, name }) => { ... })
```

#### User Left
```javascript
socket.on('user-left', ({ userId }) => { ... })
```

#### Screen Share
```javascript
socket.emit('screen-share-started', { roomId, userId })
socket.on('screen-share-started', ({ userId }) => { ... })
socket.emit('screen-share-stopped', { roomId, userId })
socket.on('screen-share-stopped', ({ userId }) => { ... })
```

#### Chat Messages
```javascript
socket.emit('send-message', { roomId, message, sender })
socket.on('receive-message', ({ message, sender, timestamp }) => { ... })
```

#### Participants Update
```javascript
socket.on('update-participants', (participants) => { ... })
```

---

## 📝 Response Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 500  | Internal Server Error |

---

## 🔒 Security Notes

1. All passwords are hashed with bcrypt
2. JWT tokens expire after 24 hours
3. OTP codes expire after 10 minutes
4. CORS is configured for specific origins
5. File uploads are validated and limited to 5MB
6. Rate limiting should be implemented for production

---

## 📊 Rate Limits (Recommended for Production)

- Authentication: 5 requests per minute
- API endpoints: 100 requests per 15 minutes
- File uploads: 10 requests per hour

---

## 🐛 Error Responses

All errors follow this format:
```json
{
  "message": "Error message here",
  "error": "Detailed error (development only)"
}
```

---

## 🔧 Development Tips

1. Use Postman/Insomnia for API testing
2. Set Authorization header for protected routes
3. Check console logs for detailed errors
4. Use MongoDB Compass to inspect database
5. Enable CORS for development frontend URL

---

## 📞 Support

For API issues or questions, refer to:
- [Deployment Guide](DEPLOYMENT.md)
- [Main README](README.md)
- Project documentation

---

Last Updated: January 2026
Version: 1.0.0
