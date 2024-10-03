const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  lawyerId: {
    type: String,
    required: true,
  },
  schedule: [{
    date: {
      type: Date, // Change type to Date for storing dates
      required: true,
    },
    dayName: {
      type: String,
      required: true,
    },
    selectedTimeSlots: {
      type: [String],
      required: true,
    },
  }],
  status: {
    type: String,
    enum: ['upcoming', 'past', 'cancelled'], // Add enum for specific status options
    default: 'upcoming', // Set default status to 'upcoming'
  },
});

const BookAppointment = mongoose.model('BookAppointment', scheduleSchema);

module.exports = BookAppointment;
