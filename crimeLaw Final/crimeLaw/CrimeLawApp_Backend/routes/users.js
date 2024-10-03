// routes/users.js
const express = require('express');
const router = express.Router();
const UserInfo = require('../model/UserDetails');

// Endpoint to retrieve only citizen users
router.get('/citizens', async (req, res) => {
  try {
    const citizens = await UserInfo.find({ type: 'citizen' }); // Filter users by type
    res.status(200).json({ status: 'ok', users: citizens });
  } catch (error) {
    console.error('Error fetching citizens:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch citizens' });
  }
});

// Endpoint to retrieve only lawyer users
router.get('/lawyers', async (req, res) => {
  try {
    const lawyers = await UserInfo.find({ type: 'lawyer' }); // Filter users by type
    res.status(200).json({ status: 'ok', users: lawyers });
  } catch (error) {
    console.error('Error fetching lawyers:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch lawyers' });
  }
});

// Endpoint to update a citizen user
router.put('/citizens/:id', async (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  try {
    const user = await UserInfo.findByIdAndUpdate(userId, updatedUser, { new: true });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'ok', user });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to update user' });
  }
});

// Endpoint to update a lawyer user
router.put('/lawyers/:id', async (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  try {
    const user = await UserInfo.findByIdAndUpdate(userId, updatedUser, { new: true });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'ok', user });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to update user' });
  }
});

// Endpoint to delete a citizen user
router.delete('/citizens/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await UserInfo.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'ok', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete user' });
  }
});

// Endpoint to delete a lawyer user
router.delete('/lawyers/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await UserInfo.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'ok', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete user' });
  }
});



module.exports = router;
