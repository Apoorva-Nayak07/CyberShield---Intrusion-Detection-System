# 🚀 CyberShield IDS - Quick Start Guide

## ✅ Installation Complete!

Your CyberShield IDS project has been successfully created with all files and dependencies installed.

---

## 📋 What's Included

### ✅ Backend (Node.js + Express)
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (Admin/Analyst/Viewer)
- ✅ Real-time Socket.IO integration
- ✅ MongoDB models and schemas
- ✅ RESTful API with validation
- ✅ Security middleware (helmet, rate limiting)
- ✅ Threat detection engine
- ✅ Network event ingestion
- ✅ Attack simulation
- ✅ Comprehensive logging

### ✅ Frontend (React + Tailwind + Framer Motion)
- ✅ Modern dark-themed cyber UI
- ✅ Real-time dashboard
- ✅ Interactive charts (Recharts)
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Socket.IO client
- ✅ Zustand state management
- ✅ React Query data fetching

### ✅ ML Service (Python FastAPI)
- ✅ FastAPI microservice
- ✅ Mock ML models (Isolation Forest, Random Forest, Autoencoder)
- ✅ Threat prediction API
- ✅ Model metrics endpoint
- ✅ Batch prediction support

### ✅ Docker Configuration
- ✅ Docker Compose setup
- ✅ MongoDB container
- ✅ Backend container
- ✅ Frontend container
- ✅ ML service container
- ✅ NGINX reverse proxy

---

## 🎯 Quick Start (3 Steps)

### Step 1: Start MongoDB

**Option A - Windows Service:**
```cmd
net start MongoDB
```

**Option B - Manual:**
```cmd
mongod --dbpath C:\data\db
```

### Step 2: Seed Database

```cmd
cd server
npm run seed
```

**Expected Output:**
```
✅ Connected to MongoDB
🗑️  Cleared existing data
👥 Created 4 users
🚨 Created 200 threats
🔔 Created 50 alerts
🌐 Created 500 network events
📋 Created 300 logs

📋 Login Credentials:
  Admin:   admin@cybershield.io / Admin@123
  Analyst: analyst@cybershield.io / Analyst@123
  Viewer:  viewer@cybershield.io / Viewer@123
```

### Step 3: Run All Services

**Terminal 1 - Backend:**
```cmd
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```cmd
cd client
npm run dev
```

**Terminal 3 - ML Service:**
```cmd
cd ml-service
python -m pip install -r requirements.txt
python main.py
```

---

## 🌐 Access the Application

| Service | URL | Status |
|---------|-----|--------|
| **Dashboard** | http://localhost:5173 | ✅ Ready |
| **Backend API** | http://localhost:5000 | ✅ Ready |
| **ML Service** | http://localhost:5001 | ✅ Ready |
| **API Docs** | http://localhost:5001/docs | ✅ Ready |

---

## 👤 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@cybershield.io | Admin@123 |
| **Analyst** | analyst@cybershield.io | Analyst@123 |
| **Viewer** | viewer@cybershield.io | Viewer@123 |

---

## 🎮 Try These Features

### 1. View Real-Time Dashboard
- Login with any credentials
- See live threat statistics
- Watch animated charts update

### 2. Simulate an Attack
- Go to **Network Monitor** page
- Select attack type (Port Scan, Brute Force, DDoS, SQL Injection)
- Click **"Simulate Attack"**
- Watch threats appear in real-time across all pages

### 3. Manage Alerts
- Go to **Alerts Center**
- View live alerts
- Acknowledge or resolve alerts
- Add analyst notes

### 4. Explore Analytics
- Go to **Analytics** page
- View threat trends over time
- See attack type distribution
- Analyze severity breakdown

### 5. Check AI Insights
- Go to **AI Insights** page
- View ML model performance
- See AI-generated recommendations
- Check model metrics

---

## 🐳 Docker Deployment (Alternative)

If you prefer Docker:

```cmd
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- ML Service: http://localhost:5001

---

## 📁 Project Structure

```
intrusion-detection-system/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database, logger, socket
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth, validation
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   └── scripts/       # Seed script
│   └── package.json
│
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   └── lib/           # API client
│   └── package.json
│
├── ml-service/            # Python ML microservice
│   ├── main.py            # FastAPI app
│   └── requirements.txt
│
├── docker-compose.yml     # Docker orchestration
├── README.md              # Full documentation
├── SETUP.md               # Detailed setup guide
└── QUICKSTART.md          # This file
```

---

## 🔧 Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cybershield
JWT_SECRET=cybershield-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:5001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚨 Troubleshooting

### MongoDB Connection Error
```cmd
# Check if MongoDB is running
mongod --version

# Start MongoDB
net start MongoDB
```

### Port Already in Use
- Backend (5000): Change `PORT` in `server/.env`
- Frontend (5173): Change port in `client/vite.config.js`
- ML Service (5001): Change port in `ml-service/main.py`

### Dependencies Not Installed
```cmd
# Backend
cd server && npm install

# Frontend
cd client && npm install

# ML Service
cd ml-service && pip install -r requirements.txt
```

### Socket.IO Not Connecting
- Check `CLIENT_URL` in `server/.env`
- Verify CORS settings in `server/src/index.js`
- Check browser console for errors

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Threats
- `GET /api/threats` - List threats
- `GET /api/threats/:id` - Get threat
- `POST /api/threats` - Create threat
- `PUT /api/threats/:id/resolve` - Resolve threat

### Alerts
- `GET /api/alerts` - List alerts
- `PUT /api/alerts/:id/acknowledge` - Acknowledge
- `PUT /api/alerts/:id/resolve` - Resolve

### Network
- `GET /api/network/events` - Network events
- `POST /api/network/simulate` - Simulate attack
- `GET /api/network/stats` - Network stats

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/trends` - Threat trends
- `GET /api/analytics/geo` - Geo-location data

### ML Service
- `POST /predict` - Predict threat
- `GET /metrics` - Model metrics
- `GET /health` - Health check

---

## 🎨 UI Features

### Dashboard Pages
1. **Overview** - Real-time statistics and charts
2. **Threat Detection** - All detected threats with filters
3. **Alerts Center** - Alert management
4. **Network Monitor** - Live network activity + attack simulation
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

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Session management
- ✅ Account lockout
- ✅ 2FA support
- ✅ Password reset
- ✅ Role-based access control

---

## 📚 Next Steps

1. **Customize** - Modify colors, branding, features
2. **Deploy** - Use Docker or cloud platforms
3. **Integrate** - Connect real network sensors
4. **Train ML** - Use actual cybersecurity datasets
5. **Scale** - Add load balancing, caching
6. **Monitor** - Set up logging and monitoring
7. **Secure** - Enable HTTPS, harden security

---

## 📖 Documentation

- **README.md** - Project overview
- **SETUP.md** - Detailed setup guide
- **QUICKSTART.md** - This file

---

## 🆘 Support

For issues or questions:
1. Check this documentation
2. Review error logs in `server/logs/`
3. Check browser console for frontend errors
4. Verify all services are running

---

## 🎉 Success!

Your CyberShield IDS is ready to use!

**Next:** Open http://localhost:5173 and login with demo credentials.

---

**Built with ❤️ for cybersecurity professionals**
