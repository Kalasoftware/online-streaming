# YouTube Clone - Node.js + React + MongoDB

This is a full-stack YouTube clone project. 

## Features
- User registration/login (JWT)
- Video upload, playback, like, comment, subscribe
- MongoDB database
- Responsive React frontend
- RESTful API (Express.js)

## Getting Started

### 1. Backend (server)
- Install dependencies:
  ```
  cd server
  npm install
  ```
- Set up MongoDB (local or Atlas). Optionally create a `.env`:
  ```
  MONGO_URI=mongodb://localhost:27017/youtube_clone
  JWT_SECRET=your_jwt_secret
  ```
- Start the server:
  ```
  npm run dev
  ```
  Server runs on http://localhost:4000

### 2. Frontend (client)
- Will be in `client/` (to be created)
- Install dependencies:
  ```
  cd client
  npm install
  ```
- Start the React app:
  ```
  npm start
  ```
  Frontend runs on http://localhost:3000

## Directory Structure
```
livestream/
  server/
    controllers/
    models/
    routes/
    uploads/
    app.js
    config.js
    package.json
  client/
    public/
    src/
      components/
      pages/
      App.js
      index.js
    package.json
```

---

## Next Steps
- Implement authentication (register/login)
- Video upload/playback endpoints
- Comment/like/subscribe APIs
- Build React frontend

---

**This is a work in progress.**
