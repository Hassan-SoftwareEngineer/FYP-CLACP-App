const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the TimeSlot schema
const timeSlotSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  dayName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  selectedTimeSlots: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create and export the model
const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
module.exports = TimeSlot;
