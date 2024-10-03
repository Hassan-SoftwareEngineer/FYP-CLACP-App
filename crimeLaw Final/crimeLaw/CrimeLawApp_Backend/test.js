require('dotenv').config();
const mongoose = require('mongoose');

const mongoURL = process.env.MONGO_URL || 'mongodb+srv://ahmedclacp:admin@cluster0.x4m1dq5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
