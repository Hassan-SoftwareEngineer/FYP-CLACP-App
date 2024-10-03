// models/Lawyer.js

const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lawyerCategory: {
    type: String,
    required: true,
  },
  courtLevel: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  consultationFee: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Lawyer', lawyerSchema);
