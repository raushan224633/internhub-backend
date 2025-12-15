# InternHub Backend - Quick Setup Guide

## ✅ Git Repository Setup Complete!

Aapka backend code ab Git repository mein hai. Ab aapko yeh steps follow karne hain:

## 📋 Step 1: GitHub Repository Banaye

### Option A: GitHub Website se (Recommended for beginners)
1. **GitHub pe jaye**: https://github.com/new
2. **Repository details**:
   - Repository name: `internhub-backend`
   - Description: `Backend API for InternHub - Internship Management Platform`
   - Visibility: Public (ya Private agar chahein)
   - **❌ README, .gitignore ya license ADD MAT KARNA** (already hai)
3. **Create repository** button click kare
4. Next page pe aapko commands dikhenge, unhe copy kare

### Option B: GitHub CLI se (Fast)
```bash
# GitHub CLI install hai to
gh repo create internhub-backend --public --source=. --remote=origin --push
```

## 📋 Step 2: Remote Add aur Push

Website se repository banayi to yeh commands run kare:

```bash
cd /home/raushan/Downloads/recovered_data/freelance\ Project/internhub/backend

# Apne GitHub username use kare
git remote add origin https://github.com/YOUR_USERNAME/internhub-backend.git

# Push to GitHub
git push -u origin main
```

**Ya yeh script run kare** (pehle remote add karne ke baad):
```bash
./push-to-github.sh
```

## 📋 Step 3: Render pe Deploy

1. **Render Dashboard**: https://dashboard.render.com/
2. **"New +" click kare** → "Web Service" select kare
3. **Connect GitHub**: Apna `internhub-backend` repository select kare
4. **Settings configure kare**:
   ```
   Name: internhub-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```
5. **Environment Variables add kare** (Advanced section mein):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   CORS_ORIGIN=https://internshell.com
   ```

## 🔑 Important: Environment Variables Setup

### MongoDB URI kaise paye:
1. **MongoDB Atlas**: https://cloud.mongodb.com/
2. Database → Connect → Connect your application
3. Connection string copy kare
4. Format: `mongodb+srv://username:password@cluster.mongodb.net/internhub?retryWrites=true&w=majority`

### JWT Secret generate kare:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 Step 4: Frontend Update

Apke frontend ko backend URL update karna hoga:

**File**: `frontend/src/config.js` ya `frontend/src/services/api.js`

```javascript
// Old (local)
const API_URL = 'http://localhost:5000/api';

// New (production)
const API_URL = 'https://your-app-name.onrender.com/api';
```

## 🧪 Testing

Deploy hone ke baad test kare:

```bash
# Health check
curl https://your-app-name.onrender.com/api/health

# Root endpoint
curl https://your-app-name.onrender.com/
```

## ⚠️ Important Notes

1. **Free Tier Limitations**:
   - Cold starts: 30-60 seconds pehle request pe
   - Spins down after 15 minutes inactivity
   - File uploads ephemeral (restart pe delete ho jayenge)

2. **MongoDB Atlas**:
   - Network Access: 0.0.0.0/0 allow kare (allow from anywhere)
   - Database user create kare with read/write permissions

3. **Security**:
   - Strong JWT secret use kare
   - Environment variables kabhi code mein mat rakhe
   - .env file GitHub pe push mat kare

## 📚 Complete Documentation

Detailed guide ke liye dekhe: `DEPLOYMENT.md`

## 🆘 Help Needed?

Common issues aur solutions `DEPLOYMENT.md` mein hai.

## 🎉 Success!

Backend successfully setup ho gaya hai! Ab bas:
1. GitHub pe push kare
2. Render pe deploy kare
3. Environment variables set kare
4. Frontend update kare

All the best! 🚀
