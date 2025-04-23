const express = require('express');
const multer = require('multer');
const Video = require('../models/Video');
const auth = require('./authMiddleware');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Set up multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload video
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const video = new Video({
      title,
      description,
      videoUrl: `/uploads/${req.file.filename}`,
      user: req.user.id
    });
    await video.save();
    res.status(201).json({ msg: 'Video uploaded', video });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().populate('user', 'username avatar').sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get a single video by ID
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('user', 'username avatar');
    if (!video) return res.status(404).json({ msg: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Like a video
router.post('/:id/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ msg: 'Video not found' });
    if (video.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already liked' });
    }
    video.likes.push(req.user.id);
    await video.save();
    res.json({ msg: 'Liked', likes: video.likes.length });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Unlike a video
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ msg: 'Video not found' });
    video.likes = video.likes.filter(uid => uid.toString() !== req.user.id);
    await video.save();
    res.json({ msg: 'Unliked', likes: video.likes.length });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Subscribe to a user (fully dynamic and persistent)
router.post('/:id/subscribe', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('user');
    if (!video) return res.status(404).json({ msg: 'Video not found' });
    const User = require('../models/User');
    const creator = await User.findById(video.user._id);
    const subscriber = await User.findById(req.user.id);
    if (!creator || !subscriber) return res.status(404).json({ msg: 'User not found' });
    // Only add if not already subscribed
    if (subscriber.subscriptions.some(uid => uid.toString() === creator._id.toString())) {
      return res.status(400).json({ msg: 'Already subscribed' });
    }
    subscriber.subscriptions.push(creator._id);
    creator.subscribers = (creator.subscribers || 0) + 1;
    await subscriber.save();
    await creator.save();
    res.json({ msg: 'Subscribed', subscriptions: subscriber.subscriptions });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Unsubscribe from a user (fully dynamic and persistent)
router.post('/:id/unsubscribe', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('user');
    if (!video) return res.status(404).json({ msg: 'Video not found' });
    const User = require('../models/User');
    const creator = await User.findById(video.user._id);
    const subscriber = await User.findById(req.user.id);
    if (!creator || !subscriber) return res.status(404).json({ msg: 'User not found' });
    subscriber.subscriptions = subscriber.subscriptions.filter(
      uid => uid.toString() !== creator._id.toString()
    );
    creator.subscribers = Math.max((creator.subscribers || 1) - 1, 0);
    await subscriber.save();
    await creator.save();
    res.json({ msg: 'Unsubscribed', subscriptions: subscriber.subscriptions });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all videos from users I am subscribed to
router.get('/subscriptions/list', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).populate('subscriptions', 'username avatar');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const videos = await Video.find({ user: { $in: user.subscriptions.map(u => u._id) } })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json({ videos, creators: user.subscriptions });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get recommended videos (by tag, user, or similar title)
router.get('/:id/recommend', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('user');
    if (!video) return res.status(404).json({ msg: 'Video not found' });
    // Recommend: same user, similar title, or most liked
    const similarTitle = video.title.split(' ')[0];
    const recs = await Video.find({
      _id: { $ne: video._id },
      $or: [
        { user: video.user._id },
        { title: { $regex: similarTitle, $options: 'i' } }
      ]
    }).populate('user', 'username avatar').sort({ likes: -1, createdAt: -1 }).limit(8);
    res.json(recs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Count a genuine view (only once per user per session)
router.post('/:id/view', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ msg: 'Video not found' });
    // Track views per user (simple approach: store user ids in a Set in memory or, for production, use a separate collection)
    // Here, we use a Set in memory for demo; in production, use Redis or a View model.
    if (!global._viewedVideos) global._viewedVideos = {};
    if (!global._viewedVideos[video._id]) global._viewedVideos[video._id] = new Set();
    if (!global._viewedVideos[video._id].has(req.user.id)) {
      video.views = (video.views || 0) + 1;
      global._viewedVideos[video._id].add(req.user.id);
      await video.save();
    }
    res.json({ views: video.views });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
