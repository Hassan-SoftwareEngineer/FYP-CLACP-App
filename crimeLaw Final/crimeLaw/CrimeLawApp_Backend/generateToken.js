const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

// Token received from the client
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWVjMTAwMDAwNWEyNTg1MjYxMzkyY2QiLCJpYXQiOjE3MTAwMjExNjYsImV4cCI6MTcxMDAyNDc2Nn0.RAlY2hrUC0pMiWjdnufQSnTFC5kbi_lIw3zjNJrM_R0';

// Verify and decode the token
const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

// Log the decoded token
console.log('Decoded Token:', decodedToken);
