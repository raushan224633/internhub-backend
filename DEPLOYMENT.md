# InternHub Backend - Render Deployment

## 🚀 Live Backend
Backend is deployed on Render: [Your Render URL will be here]

## 📝 Deployment Steps

### 1. Prerequisites
- MongoDB Atlas account (free tier works)
- Render account (free tier available)
- GitHub account

### 2. MongoDB Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

### 3. Render Deployment

#### Option A: Deploy from GitHub (Recommended)
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: internhub-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Option B: Deploy via Render CLI
```bash
# Install Render CLI
npm install -g render-cli

# Deploy
render deploy
```

### 4. Environment Variables
Add these in Render Dashboard → Environment:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/internhub?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
CORS_ORIGIN=https://internshell.com
```

**Important**: 
- Replace `MONGODB_URI` with your actual MongoDB connection string
- Generate a strong random string for `JWT_SECRET`
- Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 5. Update Frontend
Update your frontend API URL to point to Render backend:
```javascript
// In frontend/src/config.js or similar
const API_URL = 'https://your-backend.onrender.com/api';
```

### 6. Test Deployment
```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Root endpoint
curl https://your-backend.onrender.com/
```

## 🔧 Configuration

### CORS Setup
The backend is configured to accept requests from:
- https://internshell.com (your live frontend)
- http://localhost:3000 (local development)

### File Uploads
Render's free tier has ephemeral storage. For production file uploads, consider:
- AWS S3
- Cloudinary
- DigitalOcean Spaces

## 📊 Monitoring

### Render Dashboard
- View logs in real-time
- Monitor resource usage
- Check deployment status

### Health Endpoint
`GET /api/health` - Returns server status

## 🔄 Auto-Deploy
Render automatically deploys when you push to your main branch on GitHub.

## 💡 Tips

1. **Cold Starts**: Free tier spins down after inactivity. First request may take 30-60s.
2. **Logs**: Use Render dashboard to view logs
3. **Database**: Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) in Network Access
4. **Environment**: Always use production-grade secrets for JWT_SECRET

## 🆘 Troubleshooting

### Common Issues

**500 Error on startup:**
- Check MongoDB connection string
- Verify environment variables are set
- Check Render logs for details

**CORS Errors:**
- Ensure CORS_ORIGIN matches your frontend URL
- Check frontend is sending requests to correct backend URL

**Database Connection Failed:**
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check username/password in connection string
- Ensure cluster is running

## 📚 Resources
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
