import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import jwt from 'jsonwebtoken';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, userType, bloodGroup, hospitalName, licenseNumber, location, lastDonationDate } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    userType,
    bloodGroup: userType === 'donor' ? bloodGroup : undefined,
    lastDonationDate: userType === 'donor' ? (lastDonationDate || '') : undefined,
    hospitalName: userType === 'doctor' ? hospitalName : undefined,
    licenseNumber: userType === 'doctor' ? licenseNumber : undefined,
    ...(userType === 'donor' && location?.lat && location?.lng ? {
      location: { lat: location.lat, lng: location.lng, updatedAt: new Date() }
    } : {})
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password, userType, location } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check user type
  if (user.userType !== userType) {
    return next(new ErrorResponse(`Please login as a ${userType}`, 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Optionally update donor location
  if (userType === 'donor' && location?.lat && location?.lng) {
    user.location = { lat: location.lat, lng: location.lng, updatedAt: new Date() };
    await user.save({ validateBeforeSave: false });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });
};
