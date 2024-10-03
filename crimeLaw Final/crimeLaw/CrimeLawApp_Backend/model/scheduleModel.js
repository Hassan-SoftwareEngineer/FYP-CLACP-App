// scheduleModel.js

const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  schedule: [{
    dayName: {
      type: String,
      required: true,
    },
    selectedTimeSlots: {
      type: [String], // Assuming selectedTimeSlots is an array of strings
      required: true,
    },
  }],
});

const ScheduleLawyer= mongoose.model('ScheduleLawyer', scheduleSchema);

module.exports = ScheduleLawyer;
