# D-ID Video Generation Setup Guide

## 🎬 Overview
This application uses D-ID API to automatically generate talking avatar videos from job descriptions. When an employer posts a job, an AI avatar will explain the job opportunity in a professional video.

## 📋 Prerequisites
- D-ID API account
- API key from D-ID

## 🔑 Getting Your D-ID API Key

### Step 1: Create D-ID Account
1. Visit [https://studio.d-id.com](https://studio.d-id.com)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Get API Key
1. Log in to D-ID Studio
2. Navigate to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Copy your API key (it looks like: `Basic YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=`)

### Step 3: Add API Key to Backend

1. Go to your backend folder:
   ```bash
   cd backend
   ```

2. Create or edit `.env` file:
   ```bash
   nano .env
   ```

3. Add your D-ID API key:
   ```env
   # Existing environment variables...
   MONGODB_URI=mongodb://localhost:27017/internhub
   JWT_SECRET=your_jwt_secret_here
   PORT=5000

   # D-ID API Configuration
   DID_API_KEY=Basic YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=
   ```

4. Save and exit (Ctrl+X, then Y, then Enter)

## 🧪 Testing the Setup

### Test 1: Create a Test Job
1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Log in as an Employer
3. Create a new job posting
4. The video generation will start automatically in the background

### Test 2: Check Video Status
Monitor the backend console logs. You should see:
```
Video generation started for job: 507f1f77bcf86cd799439011
Video ready for job 507f1f77bcf86cd799439011: https://d-id-talks-prod.s3.us-west-2.amazonaws.com/...
```

### Test 3: View the Video
1. Go to Job Details page (as Employer or Intern)
2. Look for the "Watch Job Overview Video" button
3. Click to play the video

## 📊 D-ID Free Tier Limits
- **Free Trial**: 20 videos (1 minute each)
- **Pay-as-you-go**: $0.30 per video credit
- **Lite Plan**: $49/month for 150 video credits

## 🔧 How It Works

### Backend Flow:
1. **Job Created** → Employer posts a job
2. **Video Generation** → Backend calls D-ID API with job description
3. **Processing** → D-ID creates talking avatar video (30-60 seconds)
4. **Polling** → Backend checks status every 6 seconds
5. **Completion** → Video URL saved to MongoDB

### API Endpoints:
- `POST /api/internship` - Creates job & triggers video generation
- `GET /api/internship/:id/video-status` - Get video status and URL
- `GET /api/internship/:id` - Get job details (includes video data)

### Database Schema (Job Model):
```javascript
{
  // ... existing fields
  videoUrl: String,           // Video URL from D-ID
  videoStatus: String,        // 'pending' | 'processing' | 'completed' | 'failed'
  videoId: String             // D-ID video ID for tracking
}
```

## 🎨 Frontend Integration

### Video Button (Intern View):
- Displayed on "Apply Job" page
- Only shown if `videoStatus === 'completed'`
- Opens modal video player

### Video Section (Employer View):
- Displayed on "Job Details" page
- Shows video status badge
- Preview button when ready

## 🐛 Troubleshooting

### Issue: "Video generation failed"
**Solutions:**
1. Check if D-ID API key is correct in `.env`
2. Verify API key format starts with `Basic `
3. Check D-ID account credit balance
4. Review backend console logs for detailed errors

### Issue: Video stuck in "Processing"
**Solutions:**
1. D-ID typically takes 30-60 seconds
2. Wait up to 2 minutes
3. If timeout, status will change to "failed"
4. Check D-ID dashboard for API status

### Issue: Video button not showing
**Solutions:**
1. Refresh the page
2. Check if `videoStatus === 'completed'`
3. Verify job has `videoUrl` in database
4. Check browser console for errors

## 🔒 Security Best Practices

1. **Never commit `.env` file** to Git:
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment variables** for production:
   ```bash
   export DID_API_KEY="your_key_here"
   ```

3. **Rotate API keys** regularly

## 📚 Additional Resources

- [D-ID API Documentation](https://docs.d-id.com/)
- [D-ID Studio](https://studio.d-id.com)
- [D-ID Pricing](https://www.d-id.com/pricing/)

## 🚀 Production Deployment

### Environment Variables for Production:
```env
DID_API_KEY=Basic your_production_key
NODE_ENV=production
```

### Recommendations:
1. Use a paid D-ID plan for production
2. Implement rate limiting for job creation
3. Add webhook support for video completion
4. Cache video URLs in CDN
5. Monitor D-ID API usage

## 💡 Alternative Options

If D-ID doesn't meet your needs, consider:
- **HeyGen** - Similar features, better quality
- **Synthesia** - Enterprise-level, expensive
- **Pictory** - Text-to-video with slides
- **Eleven Labs** - Audio-only (no video)

---

**Need Help?** Contact support or check the main README.md
