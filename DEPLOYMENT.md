# 🚀 Bihar Vihaan Deployment Guide

## 📋 Prerequisites
- GitHub repository with the code
- MongoDB Atlas cluster
- Render/Railway account for backend
- Vercel/Netlify account for frontend

---

## 🔧 STEP 1: BACKEND DEPLOYMENT

### 🌐 Deploy to Render

#### 1. Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select repository: `bihar-vihan`
5. Build Settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

#### 2. Environment Variables
Add these in Render Dashboard:
```
MONGODB_URI=mongodb+srv://kaushikkishorgupta_db_user:biharvihaan123@biharvihaan.t9v4jsq.mongodb.net/bihar-vihan
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=https://your-frontend-url.vercel.app
PORT=3000
```

#### 3. Deploy
- Click "Create Web Service"
- Wait for deployment (2-3 minutes)
- Your backend URL: `https://your-app-name.onrender.com`

---

## 🌐 STEP 2: FRONTEND DEPLOYMENT

### 📱 Deploy to Vercel

#### 1. Create New Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select repository: `bihar-vihan`

#### 2. Build Settings
- **Framework Preset**: `Other`
- **Root Directory**: `public`
- **Build Command**: Leave empty
- **Output Directory**: Leave empty
- **Install Command**: Leave empty

#### 3. Environment Variables
Add in Vercel Dashboard:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

#### 4. Deploy
- Click "Deploy"
- Wait for deployment (1-2 minutes)
- Your frontend URL: `https://your-project-name.vercel.app`

---

## 🔗 STEP 3: CONNECT FRONTEND TO BACKEND

### 📝 Update API URLs

#### 1. Update api.js
```javascript
// public/assets/js/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

#### 2. Update admin.js
```javascript
// public/assets/js/admin.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

#### 3. Update destinations-ui.js
```javascript
// public/assets/js/destinations-ui.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

---

## 🧪 STEP 4: DEPLOYMENT FILES

### 📄 Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### 📄 Create render.yaml
```yaml
services:
  - type: web
    name: bihar-vihan-api
    env: node
    repo: https://github.com/your-username/bihar-vihan
    rootDir: backend
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: MONGODB_URI
        value: mongodb+srv://kaushikkishorgupta_db_user:biharvihaan123@biharvihaan.t9v4jsq.mongodb.net/bihar-vihan
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        value: your-super-secret-jwt-key-change-this-in-production
      - key: FRONTEND_URL
        value: https://your-project-name.vercel.app
```

---

## 🧪 TESTING DEPLOYMENT

### 🌐 Test Backend
```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/api/health

# Test login
curl -X POST https://your-backend-url.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 📱 Test Frontend
1. Open: `https://your-project-name.vercel.app`
2. Test destinations section
3. Test admin panel: `https://your-project-name.vercel.app/admin.html`

---

## 🔐 SECURITY NOTES

### 🛡️ Production Security
1. **Strong Passwords**: Change admin credentials
2. **Environment Variables**: Never expose secrets
3. **MongoDB Access**: Restrict IP if needed
4. **HTTPS**: Ensure all connections use HTTPS
5. **Rate Limiting**: Consider adding rate limiting

### 📋 Monitoring
- Monitor Render logs for errors
- Check Vercel deployments
- Monitor MongoDB Atlas usage
- Set up alerts for downtime

---

## 🎯 FINAL URLS

### 🌐 Live Website
```
Frontend: https://your-project-name.vercel.app
Backend:  https://your-backend-url.onrender.com
API:      https://your-backend-url.onrender.com/api
Admin:    https://your-project-name.vercel.app/admin.html
```

### 🧪 Test Endpoints
```
Health:    https://your-backend-url.onrender.com/api/health
Login:     https://your-backend-url.onrender.com/api/admin/login
Destinations: https://your-backend-url.onrender.com/api/destinations
```

---

## 🎉 DEPLOYMENT COMPLETE

Your Bihar Vihaan website is now live on the internet! 🚀

### ✅ What's Working:
- **Frontend**: Live on Vercel
- **Backend**: Live on Render
- **Database**: MongoDB Atlas connected
- **Admin Panel**: Fully functional
- **CRUD Operations**: All working
- **Authentication**: JWT-based secure system

### 🌟 Next Steps:
1. **Custom Domain**: Add custom domain
2. **SSL Certificate**: Auto-provided by Vercel/Render
3. **Analytics**: Add Google Analytics
4. **SEO**: Optimize for search engines
5. **Performance**: Monitor and optimize

---

## 📞 Support

For deployment issues:
- Check Render logs
- Check Vercel deployments
- Verify environment variables
- Test API endpoints individually

**🎉 Congratulations! Your Bihar Vihaan website is now live! 🌍**
