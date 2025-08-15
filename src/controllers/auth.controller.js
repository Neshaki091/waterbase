// src/controllers/auth.controller.js
const getTenantModel = require("../utils/tenant.util")
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.util');

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
            userId: newUser._id,
            role: newUser.role,
            apps: newUser.apps,
        });

    } catch (err) {
        console.error('Register owner error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Đăng ký End-User (qua owner ID)
 */
const registerEndUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const appId = req.headers['x-app-id'];
        const ownerId = req.headers['x-owner-id']; // đặt tên rõ ràng
        console.log(appId);
        console.log(ownerId);
        console.log(role);
        if (!ownerId || !appId) {
            return res.status(400).json({ message: 'Thiếu ownerId hoặc appId trong headers' });
        }

        // 1. Tìm owner từ DB
        const OwnerModel = require('../models/user.model'); // model của Owner
        const owner = await OwnerModel.findById(ownerId);

        if (!owner) {
            return res.status(404).json({ message: 'Owner không tồn tại' });
        }

        // 2. Kiểm tra app có trong owner hay không
        const app = owner.apps.find(a => a._id.toString() === appId);
        if (!app) {
            return res.status(404).json({ message: 'App không tồn tại trong Owner này' });
        }

        // 3. Tạo model EndUser cho tenant (app)
        const EndUser = getTenantModel(appId, `_users`, require('../models/endUser.model'));

        // 4. Kiểm tra email đã tồn tại chưa
        const existingUser = await EndUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: appId });
        }

        // 5. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 6. Tạo EndUser mới
        const newUser = await EndUser.create({
            email,
            password: hashedPassword,
            role: role,
            parentOwnerId: ownerId,
            accountType: 'end-user',
            appId: appId,
        });

        // 7. Tạo token
        const refreshToken = generateRefreshToken(newUser._id);
        const accessToken = generateAccessToken(newUser._id);
        newUser.refreshToken = refreshToken;

        newUser.save();

        res.status(201).json({
            message: 'Đăng ký end-user thành công',
            user: { email: newUser.email, role: newUser.role },
            accessToken: accessToken,
        });

    } catch (error) {
        console.error('Lỗi register end-user:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};


/**
 * OWNER LOGIN
 */
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
 * END-USER LOGIN
 */
const endUserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const ownerId = req.headers["x-owner-id"];
        const appId = req.headers["x-app-id"];
        if (!ownerId) {
            return res.status(400).json({ message: 'Missing owner ID' });
        }
        const ownerModel = require('../models/user.model');
        const owner = await ownerModel.findById(ownerId)
        if (!owner) { return res.status(404).json({ message: 'owner is not exist' }) };

        const app = owner.apps.find(a => a._id.toString() === appId);
        if (!app) { return res.status(404).json({ message: 'App is not exist' }) };

        const EndUser = getTenantModel(appId, `_users`, require("../models/endUser.model"));

        const user = await EndUser.findOne({ email });
        if (!user) { return res.status(400).json({ message: 'Email is not exist' }) };

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).json({ message: "Password is not match" }) };

        const refreshToken = generateRefreshToken(user._id);
        const accessToken = generateAccessToken(user._id);

        user.refreshToken = refreshToken;

        await user.save();

        res.status(200).json({
            message: 'login complete',
            user: { email: user.email, role: user.role, },
            accessToken: accessToken,
        })
    } catch (error) {
        console.log('End user login error: ', error);
        res.status(500).json({ message: 'server error' });
    }

};

/**
 * LOGIN LOGIC DÙNG CHUNG
 */
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
    logout
};
