import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import VideoPage from './pages/VideoPage';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './auth';
import Subscriptions from './pages/Subscriptions';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
          <Route path="/video/:id" element={<VideoPage />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
