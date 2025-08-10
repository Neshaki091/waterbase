const jwt = require('jsonwebtoken');
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "365d" });
}
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
}
module.exports = {generateRefreshToken, generateAccessToken};