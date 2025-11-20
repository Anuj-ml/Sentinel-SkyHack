# Sentinel - Deployment Guide

## 🚀 Quick Launch Instructions

### Production Build Created ✓
Your production build is ready in `frontend/dist/`

### Option 1: Deploy to Vercel (FASTEST)
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy frontend:
   ```bash
   cd frontend
   vercel --prod
   ```

3. Deploy backend (separate):
   ```bash
   cd ../backend
   vercel --prod
   ```

4. Update frontend API URL to point to backend Vercel URL

### Option 2: Deploy to Netlify
1. Drag & drop `frontend/dist` folder to https://app.netlify.com/drop
2. Deploy backend to Railway/Render

### Option 3: Local Preview
```bash
cd frontend
npx serve dist -p 5000
```

Then open http://localhost:5000

### Backend Must Be Running
Make sure backend is accessible. For production, deploy to:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io

## 🎯 Features Implemented:
✅ Multiple collision warnings (4-10 per satellite)
✅ Safe signal when no collisions
✅ Maneuver recommendations with Delta-V calculations
✅ Nearby satellite alert broadcast
✅ Real-time distance and time-to-collision
✅ Satellite-on-satellite collision detection
✅ Material You design aesthetic
✅ Time scrubbing and playback controls

## Production URLs needed:
1. Update `API_BASE_URL` in frontend to production backend URL
2. Ensure CORS is configured on backend for production domain

Good luck with your Women in Tech submission! 🎊👩‍💻
