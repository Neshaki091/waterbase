const userSchema = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.util');

// Đăng ký
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra user đã tồn tại
        const existingUser = await userSchema.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const createdAt = new Date();
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới (chưa có token)
        const newUser = new userSchema({ email, password: hashedPassword, createdAt, });
        await newUser.save();

        // Hash _id rồi tạo token

        const refreshToken = generateRefreshToken(newUser._id);
        const accessToken = generateAccessToken(newUser._id);

        // Gán token vào user
        newUser.refreshToken = refreshToken;
        await newUser.save();
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // Chỉ set secure=true nếu dùng HTTPS
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 năm
        });
        // Trả kết quả
        res.status(201).json({
            accessToken,
        });
        
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userSchema.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

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
            secure: false, // Chỉ set secure=true nếu dùng HTTPS
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 năm
        });
        // Trả kết quả
        res.status(201).json({
            accessToken,
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }
    const user = await userSchema.findOne({ refreshToken });
    if (!user) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        const newAccessToken = generateAccessToken(decoded.id);
        res.status(200).json({ accessToken: newAccessToken });
    });
};
const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
};
module.exports = { register, login, refreshToken, logout}; 
