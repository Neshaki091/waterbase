// src/controllers/auth.controller.js
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.util');
const EndUser =require("../models/endUser.model")
/**
 * Đăng ký Owner (Waterbase)
 */
const registerOwner = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check tồn tại
        const existingUser = await User.findOne({ email, parentOwnerId: null });
        if (existingUser) {
            return res.status(400).json({ message: 'Owner already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Tạo user owner
        const newUser = new User({
            email,
            password: hashedPassword,
            role: 'owner',
            parentOwnerId: null,
        });

        // Token
        const refreshToken = generateRefreshToken(newUser._id);
        const accessToken = generateAccessToken(newUser._id);
        newUser.refreshToken = refreshToken;
        await newUser.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 365 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'Owner registered successfully',
            accessToken,
            ownerId: newUser._id,
            role: newUser.role,
            apps: newUser.apps,
        });

    } catch (err) {
        console.error('Register owner error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const ownerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, parentOwnerId: null }).populate('apps');
        if (!user || !['owner'].includes(user.role)) {
            return res.status(400).json({ message: 'Invalid owner credentials' });
        }

        return handleLogin(user, password, res);
    } catch (err) {
        console.error('Owner login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Đăng ký End-User (qua appId trực tiếp)
 */
const registerEndUser = async (req, res) => {
  try {
    const { email, password} = req.body;
    const appId = req.headers["x-app-id"];

    if (!appId || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // kiểm tra email trong app
    const exist = await EndUser.findOne({ email, appId });
    if (exist) return res.status(400).json({ message: 'Email đã tồn tại trong app' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await EndUser.create({
      appId,
      email,
      password: hashedPassword,
      createDate: new Date(),
      lastLogin: new Date()
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        userId: newUser._id,
        email: newUser.email,
        appId: newUser.appId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



/**
 * END-USER LOGIN (qua appId trực tiếp)
 */
const endUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const appId = req.headers["x-app-id"];

    if (!appId || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const user = await EndUser.findOne({ email, appId });
    if (!user) return res.status(400).json({ message: "Email không tồn tại trong app" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password không khớp" });

    const refreshToken = generateRefreshToken(user.userId);
    const accessToken = generateAccessToken(user.userId);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      message: "Login thành công",
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        appId: user.appId
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const updateEndUser = async (req, res) => {
  try {
    const { userId, profile } = req.body;
    const appId = req.headers["x-app-id"]; // bắt buộc truyền appId

    if (!appId || !userId || !profile) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔹 Tìm end-user theo userId và appId
    const user = await EndUser.findOne({ userId, appId });
    if (!user) {
      return res.status(404).json({ message: "End-user not found in this app" });
    }

    // 🔹 Update profile
    user.profile = { ...user.profile, ...profile };
    await user.save();

    res.status(200).json({
      message: "End-user profile updated successfully",
      user: {
        userId: user.userId,
        email: user.email,
        profile: user.profile,
        appId: user.appId
      }
    });
  } catch (err) {
    console.error("Update end-user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

async function handleLogin(user, password, res) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const refreshToken = generateRefreshToken(user._id);
    const accessToken = generateAccessToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 365 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        accessToken,
        userId: user._id,
        role: user.role,
        apps: user.apps
    });
}

/**
 * REFRESH TOKEN
 */
const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }
            const newAccessToken = generateAccessToken(decoded.id);
            res.status(200).json({ accessToken: newAccessToken, userId: decoded.id });
        });
    } catch (err) {
        console.error('Refresh token error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * LOGOUT
 */
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
        }
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerOwner,
    registerEndUser,
    ownerLogin,
    endUserLogin,
    refreshToken,
    logout,
    updateEndUser,
};
