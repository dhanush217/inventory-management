# 🚀 Deployment Guide

This guide covers deploying the Inventory Management System to various cloud platforms.

## 📋 Prerequisites

- GitHub repository: https://github.com/dhanush217/inventory-management
- Node.js (v14 or higher)
- npm or yarn

## 🌐 Platform Options

### Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

#### Frontend Deployment (Vercel)

1. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

2. **Configure Frontend**
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Set Environment Variables**
   ```bash
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

#### Backend Deployment (Railway)

1. **Connect to Railway**
   - Go to [Railway](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Deploy from GitHub repo

2. **Configure Backend**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Port: `3001`

3. **Environment Variables**
   ```bash
   PORT=3001
   NODE_ENV=production
   ```

4. **Deploy**
   - Railway will automatically deploy your backend

### Option 2: Heroku (Full Stack)

1. **Install Heroku CLI**
   - Download from [Heroku](https://devcenter.heroku.com/articles/heroku-cli)

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set PORT=3001
   heroku config:set NODE_ENV=production
   ```

4. **Configure for Monorepo**
   Create `package.json` in root:
   ```json
   {
     "name": "inventory-management",
     "version": "1.0.0",
     "scripts": {
       "start": "cd backend && npm start",
       "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\""
     },
     "devDependencies": {
       "concurrently": "^7.6.0"
     }
   }
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: Netlify + Render

#### Frontend (Netlify)

1. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Connect GitHub repository
   - Build settings:
     - Build command: `cd frontend && npm run build`
     - Publish directory: `frontend/build`

2. **Environment Variables**
   ```bash
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

#### Backend (Render)

1. **Create Web Service**
   - Connect to GitHub
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=3001
   ```

### Option 4: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean Apps
   - Create from GitHub
   - Select repository

2. **Configure Components**

   **Frontend Component:**
   ```yaml
   name: frontend
   source_dir: /frontend
   github:
     repo: dhanush217/inventory-management
     branch: main
   build_command: npm run build
   run_command: npx serve -s build -l 3000
   ```

   **Backend Component:**
   ```yaml
   name: backend
   source_dir: /backend
   github:
     repo: dhanush217/inventory-management
     branch: main
   build_command: npm install
   run_command: npm start
   ```

3. **Environment Variables**
   - Set `REACT_APP_API_URL` for frontend
   - Set `NODE_ENV=production` for backend

### Option 5: AWS (EC2 + S3)

#### Backend (EC2)

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - t2.micro (free tier)
   - Configure security group (port 3001)

2. **Setup Backend**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Clone repository
   git clone https://github.com/dhanush217/inventory-management.git
   cd inventory-management/backend
   
   # Install dependencies
   npm install
   
   # Start with PM2
   sudo npm install -g pm2
   pm2 start server.js --name inventory-backend
   pm2 startup
   pm2 save
   ```

#### Frontend (S3 + CloudFront)

1. **Build Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync build/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront**
   - Create distribution
   - Point to S3 bucket
   - Enable React Router (configure redirects)

## 🔧 Environment Configuration

### Frontend (.env.local)
```bash
REACT_APP_API_URL=http://localhost:3001/api
```

### Backend (.env)
```bash
PORT=3001
NODE_ENV=production
```

## 🛡️ Security Considerations

1. **Environment Variables**
   - Never commit sensitive data
   - Use platform-specific environment variables

2. **CORS Configuration**
   - Update CORS settings for production domains
   - Update `frontend/src/services/api.js` with production API URL

3. **Database**
   - SQLite is not suitable for production
   - Consider migrating to PostgreSQL or MySQL

## 📊 Monitoring & Logging

1. **Application Monitoring**
   - Use PM2 for process management
   - Setup error tracking (Sentry)

2. **Database Monitoring**
   - Monitor connection pool
   - Set up alerts for high usage

## 🔄 CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend && npm install
        cd ../frontend && npm install
        
    - name: Build frontend
      run: |
        cd frontend
        npm run build
        
    - name: Deploy to platform
      # Add your deployment commands here
```

## 📝 Database Migration for Production

For production deployments, consider migrating from SQLite to PostgreSQL:

1. **Install pg**
   ```bash
   npm install pg
   ```

2. **Update connection**
   ```javascript
   // backend/config/database.js
   const { Pool } = require('pg');
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
   });
   
   module.exports = pool;
   ```

3. **Run migrations**
   ```bash
   # Create database schema
   psql -d your_database -f schema.sql
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Port Issues**
   - Ensure correct port configuration
   - Check platform-specific port requirements

2. **CORS Errors**
   - Update API base URLs for production
   - Configure CORS in backend for production domains

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **Database Connection**
   - Ensure database URL is correct
   - Check network connectivity
   - Verify SSL settings for production

### Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement code splitting

2. **Backend**
   - Enable compression middleware
   - Add caching headers
   - Optimize database queries

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally before deploying
4. Use staging environment for testing

---

**Deployment Complete!** 🎉

Your Inventory Management System is now ready for production use across multiple platforms.