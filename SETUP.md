# 🛡️ CyberShield IDS - Complete Setup Guide

## 📋 Prerequisites

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **Python** >= 3.9 ([Download](https://www.python.org/downloads/))
- **MongoDB** >= 6.x ([Download](https://www.mongodb.com/try/download/community))
- **Git** (optional)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install

# ML Service
cd ../ml-service
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
# Backend
cd server
copy .env.example .env
# Edit .env with your MongoDB URI if needed

# Frontend
cd ../client
copy .env.example .env
```

### Step 3: Start MongoDB

```bash
# Windows (if installed as service)
net start MongoDB

# Or run manually
mongod --dbpath C:\data\db
```

### Step 4: Seed Database

```bash
cd server
npm run seed
```

### Step 5: Run All Services

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Terminal 3 - ML Service:**
```bash
cd ml-service
uvicorn main:app --reload --port 5001
```

### Step 6: Access Dashboard

Open browser: **http://localhost:5173**

**Login Credentials:**
- Admin: `admin@cybershield.io` / `Admin@123`
- Analyst: `analyst@cybershield.io` / `Analyst@123`
- Viewer: `viewer@cybershield.io` / `Viewer@123`

---

## 🎯 What's Included

### ✅ Backend (Node.js + Express)
- JWT authentication with refresh tokens
- Role-based access control (Admin/Analyst/Viewer)
- Real-time Socket.IO integration
- MongoDB models for threats, alerts, logs, users
- RESTful API with validation
- Security middleware (helmet, rate limiting, sanitization)
- Threat detection engine with rules
- Network event ingestion
- Attack simulation endpoints
- Comprehensive logging system

### ✅ Frontend (React + Tailwind + Framer Motion)
- Modern dark-themed cyber security UI
- Real-time dashboard with live updates
- Interactive charts (Recharts)
- Smooth animations (Framer Motion)
- Responsive design
- Toast notifications
- Socket.IO client integration
- Zustand state management
- React Query for data fetching

### ✅ Features Implemented
- ✅ User authentication & authorization
- ✅ Real-time threat detection
- ✅ Live alerts system
- ✅ Network monitoring
- ✅ Analytics dashboard
- ✅ Threat intelligence
- ✅ Logs explorer with export
- ✅ User management (admin)
- ✅ Reports generation
- ✅ Attack simulation
- ✅ Geo-location tracking
- ✅ AI/ML integration ready
- ✅ WebSocket real-time updates
- ✅ Role-based access control
- ✅ 2FA support
- ✅ Password reset
- ✅ Session management

---

## 📁 Project Structure

```
intrusion-detection-system/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database, logger, socket config
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── scripts/       # Seed script
│   │   └── index.js       # Entry point
│   ├── logs/              # Application logs
│   ├── package.json
│   └── .env.example
│
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── lib/           # API client, utilities
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── ml-service/            # Python ML microservice
│   ├── main.py            # FastAPI app
│   ├── models/            # ML models
│   ├── requirements.txt
│   └── .env.example
│
├── docker/                # Docker configs
├── docs/                  # Documentation
├── README.md
└── SETUP.md
```

---

## 🔧 Configuration

### Backend Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cybershield
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
ML_SERVICE_URL=http://localhost:5001
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=CyberShield IDS
```

---

## 🧪 Testing the System

### 1. Test Authentication
- Register a new user
- Login with demo credentials
- Test logout and session refresh

### 2. Test Threat Detection
- Navigate to Network Monitor
- Click "Simulate Attack"
- Choose attack type (Port Scan, Brute Force, DDoS, SQL Injection)
- Watch threats appear in real-time

### 3. Test Real-Time Updates
- Open dashboard in two browser windows
- Simulate attack in one window
- See live updates in both windows

### 4. Test Alerts
- Critical/High threats automatically create alerts
- Check Alerts Center for notifications
- Acknowledge and resolve alerts

### 5. Test Analytics
- View Overview dashboard for statistics
- Check Analytics page for trends
- View Threat Intelligence for geo-location data

---

## 🐳 Docker Deployment (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access services
Frontend: http://localhost:3000
Backend: http://localhost:5000
ML Service: http://localhost:5001
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Threats
- `GET /api/threats` - List threats (paginated)
- `GET /api/threats/:id` - Get threat details
- `POST /api/threats` - Create threat
- `PUT /api/threats/:id/resolve` - Resolve threat
- `GET /api/threats/stats` - Threat statistics

### Alerts
- `GET /api/alerts` - List alerts
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/alerts/:id/resolve` - Resolve alert
- `POST /api/alerts/:id/notes` - Add note

### Network
- `GET /api/network/events` - Network events
- `POST /api/network/ingest` - Ingest event
- `GET /api/network/stats` - Network statistics
- `POST /api/network/simulate` - Simulate attack

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/trends` - Threat trends
- `GET /api/analytics/geo` - Geo-location data
- `GET /api/analytics/ml-metrics` - ML metrics

---

## 🎨 UI Features

### Dashboard Pages
1. **Overview** - Real-time statistics and charts
2. **Threat Detection** - All detected threats with filters
3. **Alerts Center** - Alert management
4. **Network Monitor** - Live network activity
5. **Analytics** - Trends and visualizations
6. **Threat Intelligence** - Geo-location and attack patterns
7. **Logs Explorer** - System logs with export
8. **AI Insights** - ML model metrics
9. **Reports** - Generate reports (Analyst+)
10. **User Management** - Manage users (Admin)
11. **Settings** - User preferences

### UI Components
- Glass-morphism cards
- Neon cyber theme
- Smooth animations
- Real-time counters
- Interactive charts
- Live notifications
- Responsive tables
- Search and filters
- Severity badges
- Status indicators

---

## 🔐 Security Features

- JWT authentication with refresh tokens
- Password hashing (bcrypt)
- Rate limiting
- Input sanitization
- XSS protection
- CORS configuration
- Helmet security headers
- Session management
- Account lockout after failed attempts
- 2FA support (TOTP)
- Password reset flow
- Role-based access control

---

## 🚨 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
net start MongoDB
```

### Port Already in Use
```bash
# Change ports in .env files
# Backend: PORT=5001
# Frontend: Update vite.config.js
```

### ML Service Not Starting
```bash
# Install Python dependencies
pip install fastapi uvicorn scikit-learn pandas numpy

# Run manually
python ml-service/main.py
```

### Socket.IO Not Connecting
- Check CORS settings in server/src/index.js
- Verify CLIENT_URL in server/.env
- Check browser console for errors

---

## 📈 Next Steps

1. **Customize** - Modify colors, branding, features
2. **Deploy** - Use Docker or cloud platforms
3. **Integrate** - Connect real network sensors
4. **Train ML** - Use actual cybersecurity datasets
5. **Scale** - Add load balancing, caching
6. **Monitor** - Set up logging and monitoring
7. **Secure** - Enable HTTPS, harden security

---

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Socket.IO Docs](https://socket.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review error logs in `server/logs/`
3. Check browser console for frontend errors
4. Verify all services are running

---

**Built with ❤️ for cybersecurity professionals**
