import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get doctor profile
// @route   GET /api/doctors/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Error fetching doctor profile:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;
