const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const EndUserModel = require('../models/endUser.model');
const getTenantModel = require('../utils/tenant.util'); // <- thêm dòng này

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // Kiểm tra header Authorization
        // Nếu không có header hoặc không đúng định dạng Bearer token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Kiểm tra user tồn tại
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user; // lưu user object vào request
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const authEndUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
      
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded?.id) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        // Lấy appId từ header để biết tenant collection
        const appId = req.headers["x-app-id"];

        if (!appId) {
            return res.status(400).json({ message: 'App ID header missing' });
        }

        // Lấy model EndUser của tenant
        const EndUser = getTenantModel(appId, 'users', EndUserModel);
        

        // Tìm user trong tenant DB
        const user = await EndUser.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'EndUser not found' });
        }

        // Lưu user object vào request
        req.user = user;
        req.appId = appId; // nếu cần dùng trong controller
        console.log(req.user);
        console.log(req.appId);
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { authMiddleware, authEndUser };
