const express = require('express');
const Comment = require('../models/Comment');
const auth = require('./authMiddleware');

const router = express.Router();

// Add a comment to a video
router.post('/:videoId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = new Comment({
      video: req.params.videoId,
      user: req.user.id,
      text,
    });
    await comment.save();
    res.status(201).json({ msg: 'Comment added', comment });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get comments for a video
router.get('/:videoId', async (req, res) => {
  try {
    const comments = await Comment.find({ video: req.params.videoId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
