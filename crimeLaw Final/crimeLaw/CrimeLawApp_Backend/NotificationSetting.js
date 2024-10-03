const mongoose = require('mongoose');

// Define the schema for user notification settings
const notificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true, // Each user should have only one entry for notification settings
  },
  notificationsEnabled: {
    type: Boolean,
    default: true, // Default value for notificationsEnabled is true
  },
  soundEnabled: {
    type: Boolean,
    default: true, // Default value for soundEnabled is true
  },
  vibrationEnabled: {
    type: Boolean,
    default: true, // Default value for vibrationEnabled is true
  },
});

// Create a model for the notification settings schema
const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings;
