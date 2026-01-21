# SkillSphere Deployment Guide

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd SkillSphere
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory (or copy from `.env.example`):
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/skillsphere

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (Change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret (Change in production!)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Gemini AI Configuration (already in code)
GEMINI_API_KEY=your-gemini-api-key
```

#### Gmail Setup for OTP Emails
1. Go to [Google Account](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Use the 16-character app password (no spaces) in EMAIL_PASS

#### Start MongoDB
Ensure MongoDB is running on your system:
```bash
# Windows
mongod --dbpath "C:\data\db"

# Mac/Linux
sudo systemctl start mongodb
# OR
mongod --dbpath /usr/local/var/mongodb
```

#### Start Backend Server
```bash
npm start
# OR for development with auto-reload
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `frontend` directory:
```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Socket.IO URL
VITE_SOCKET_URL=http://localhost:5000
```

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application
Open your browser and navigate to:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📦 Production Deployment

### Option 1: Deploy to Vercel (Frontend) + Render/Railway (Backend)

#### Frontend (Vercel)
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your backend production URL
   - `VITE_SOCKET_URL`: Your backend production URL

#### Backend (Render/Railway/Heroku)

##### Render Deployment
1. Create a `render.yaml` file in the backend directory (already provided)
2. Push your code to GitHub
3. Connect your repository to Render
4. Set environment variables in Render dashboard

##### Railway Deployment
1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Deploy:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. Add environment variables in Railway dashboard

### Option 2: Deploy to Heroku

#### Backend
```bash
cd backend
heroku create skillsphere-backend
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-secret>
heroku config:set SESSION_SECRET=<your-secret>
heroku config:set EMAIL_USER=<your-email>
heroku config:set EMAIL_PASS=<your-app-password>
git push heroku main
```

#### Frontend
```bash
cd frontend
# Update .env with production backend URL
npm run build
# Deploy the dist folder to Netlify/Vercel/GitHub Pages
```

### Option 3: Deploy to VPS (AWS/DigitalOcean/Linode)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Clone and Setup
```bash
git clone <your-repo-url>
cd SkillSphere

# Backend
cd backend
npm install
# Create .env file with production values
pm2 start server.js --name skillsphere-backend

# Frontend
cd ../frontend
npm install
npm run build
```

#### 3. Setup Nginx
```bash
sudo apt install nginx -y
```

Create Nginx configuration:
```nginx
# /etc/nginx/sites-available/skillsphere
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/SkillSphere/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/skillsphere /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Setup SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

#### 5. PM2 Startup
```bash
pm2 startup
pm2 save
```

---

## 🗄️ Database Setup

### Local MongoDB
```bash
# Start MongoDB
mongod --dbpath "C:\data\db"
```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get connection string
4. Update MONGODB_URI in .env:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/skillsphere?retryWrites=true&w=majority
   ```

---

## 🔧 Environment Variables Reference

### Backend (.env)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| MONGODB_URI | MongoDB connection string | Yes | mongodb://localhost:27017/skillsphere |
| PORT | Backend server port | Yes | 5000 |
| NODE_ENV | Environment mode | Yes | development/production |
| JWT_SECRET | Secret for JWT tokens | Yes | random-secret-key-123 |
| SESSION_SECRET | Secret for sessions | Yes | random-session-key-456 |
| EMAIL_USER | Gmail account for OTP | Yes | your-email@gmail.com |
| EMAIL_PASS | Gmail app password | Yes | abcd efgh ijkl mnop |
| GEMINI_API_KEY | Google Gemini AI key | No | Already hardcoded |

### Frontend (.env)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| VITE_API_URL | Backend API base URL | Yes | http://localhost:5000 |
| VITE_SOCKET_URL | Socket.IO server URL | Yes | http://localhost:5000 |

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] User registration with OTP
- [ ] Email verification
- [ ] User login
- [ ] Password reset flow
- [ ] Profile creation and editing
- [ ] Room creation
- [ ] Room joining
- [ ] Video/audio in rooms
- [ ] Screen sharing
- [ ] Chat functionality
- [ ] Connection requests
- [ ] Skill endorsements
- [ ] AI chatbot functionality
- [ ] File uploads
- [ ] Recording storage and playback

---

## 🔒 Security Checklist

### Before Production:
- [ ] Change all default secrets (JWT_SECRET, SESSION_SECRET)
- [ ] Use environment-specific .env files
- [ ] Enable CORS only for your frontend domain
- [ ] Set up HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Set secure cookie options
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Keep dependencies updated
- [ ] Set up proper MongoDB authentication
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security audits

---

## 📊 Monitoring & Logs

### PM2 Logs
```bash
pm2 logs skillsphere-backend
pm2 monit
```

### Application Logs
Backend logs are stored in console output. Consider using:
- Winston for structured logging
- LogRocket for frontend monitoring
- Sentry for error tracking

---

## 🔄 Updates & Maintenance

### Update Dependencies
```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

### Database Backup
```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/skillsphere" --out=/backup/$(date +%Y%m%d)

# Restore MongoDB
mongorestore --uri="mongodb://localhost:27017/skillsphere" /backup/20240101
```

---

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify MongoDB port (default: 27017)
- Check firewall settings

#### Email OTP Not Sending
- Verify EMAIL_USER and EMAIL_PASS
- Ensure 2FA is enabled on Gmail
- Generate new App Password
- Check Gmail security settings

#### Socket.IO Connection Issues
- Ensure backend server is running
- Check CORS settings in server.js
- Verify VITE_SOCKET_URL in frontend .env
- Check browser console for errors

#### Frontend Build Errors
- Clear node_modules and reinstall
- Check for missing dependencies
- Verify all imports are correct
- Run `npm run lint` to check for errors

#### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review console logs for errors

---

## 🎉 Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB running and accessible
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server starts without errors
- [ ] Frontend builds successfully
- [ ] Gmail SMTP configured for OTP
- [ ] Test user registration flow
- [ ] Test login flow
- [ ] Test room creation
- [ ] Test real-time features
- [ ] SSL certificate configured (production)
- [ ] Domain configured (production)
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Security audit completed

---

## 📝 Version History
- v1.0.0 - Initial release with all core features

---

## 🏆 Credits
Developed by the SkillSphere Team
