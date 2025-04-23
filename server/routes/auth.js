const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ msg: 'Missing fields' });
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ msg: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hash });
    await user.save();
    res.status(201).json({ msg: 'User registered' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '2h' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get current user info (with subscriptions)
const auth = require('./authMiddleware');
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('subscriptions', 'username avatar');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      subscriptions: user.subscriptions.map(u => u._id),
      subscriptionUsers: user.subscriptions,
      subscribers: user.subscribers,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get profile info for a user (by id or 'me')
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const Video = require('../models/Video');
    const userId = req.params.id === 'me' ? req.user.id : req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const videos = await Video.find({ user: user._id });
    const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
    res.json({
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      subscribers: user.subscribers,
      videos: videos.map(v => ({
        id: v._id,
        title: v.title,
        views: v.views || 0,
        createdAt: v.createdAt
      })),
      videoCount: videos.length,
      totalViews,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
