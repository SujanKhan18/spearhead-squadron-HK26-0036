# 🚀 Deploying SafeSphere on Render

This project is configured for seamless deployment on [Render](https://render.com) as a **Full-Stack Web Service** (Unified Frontend + Backend) with zero CORS issues and full Socket.IO real-time capabilities on the free tier.

---

## ⚡ Option 1: One-Click Blueprint Deployment (Recommended)

1. **Push your code to GitHub** (already pushed to `https://github.com/SujanKhan18/spearhead-squadron-HK26-0036`).
2. Log in to [dashboard.render.com](https://dashboard.render.com/).
3. Click **"New +"** in the top right and select **"Blueprint"**.
4. Connect your GitHub repository: `SujanKhan18/spearhead-squadron-HK26-0036`.
5. Render will automatically detect [`render.yaml`](./render.yaml).
6. Fill in the required secret environment variable:
   - **`MONGODB_URI`**: Your MongoDB Atlas connection string (e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/safe-era?retryWrites=true&w=majority`).
7. Click **"Apply"** / **"Deploy"**.
8. Render will install all dependencies, build the React SPA, launch the Express API, and provide your live HTTPS URL (e.g., `https://safesphere-app.onrender.com`).

---

## 🛠️ Option 2: Manual Web Service Deployment

If you prefer setting up the Web Service manually in Render without Blueprints:

1. Go to [dashboard.render.com](https://dashboard.render.com/).
2. Click **"New +"** -> **"Web Service"**.
3. Select **"Build and deploy from a Git repository"** and choose `spearhead-squadron-HK26-0036`.
4. Configure the settings:
   - **Name**: `safesphere`
   - **Region**: Closest to you (e.g., `Singapore` or `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank for repository root)*
   - **Runtime**: `Node`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGODB_URI` | `mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/safe-era?retryWrites=true&w=majority` |
   | `JWT_SECRET` | *(Any random 32-character string)* |
   | `ICCC_PASSCODE` | `COMMAND112` |
   | *(Optional)* `TWILIO_ACCOUNT_SID` | *(Your Twilio SID if using real SMS)* |
   | *(Optional)* `TWILIO_AUTH_TOKEN` | *(Your Twilio Auth Token)* |
   | *(Optional)* `TWILIO_PHONE_NUMBER` | *(Your Twilio Phone Number)* |
6. Click **"Create Web Service"**.

---

## 🌐 Option 3: Separate Services (Backend API + Frontend Static Site)

If you wish to deploy backend and frontend independently:

### 1. Backend Web Service
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `MONGODB_URI`: `your-mongo-uri`
  - `JWT_SECRET`: `your-jwt-secret`
  - `FRONTEND_URL`: `https://your-frontend.onrender.com`

### 2. Frontend Static Site
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://your-backend.onrender.com`
- **Redirects / Rewrites**:
  - Source: `/*` -> Destination: `/index.html` (Action: `Rewrite`)

---

## 🔍 Verification & Health Check

Once deployed, you can verify your service status:
- Health check: `https://<your-app>.onrender.com/api/health` -> returns `{ "status": "healthy" }`
- Web Application: `https://<your-app>.onrender.com/` -> Loads SafeSphere Home
- Emergency SOS: `https://<your-app>.onrender.com/sos`
- Safety Map: `https://<your-app>.onrender.com/map`
- Command Center: `https://<your-app>.onrender.com/iccc` (Passcode: `COMMAND112`)
