const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

const authMiddleware = (req, res, next) => {
    console.log("middleware");

    // Get token from request headers
    const authHeader = req.headers.authorization;

    console.log("authHeader", authHeader);

    // Check if token is provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'No token provided' });
    }

    // Extract token from Authorization header
    const token = authHeader.split(' ')[1];

    console.log("token", token);

    try {
        // Verify token
        console.log("JWT_SECRET", process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Log the decoded token data (for debugging purposes)
        console.log('Decoded token data:', decoded);

        // Attach user ID to request object for further processing
        req.userId = decoded.userId;

        // Call next middleware or route handler
        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
