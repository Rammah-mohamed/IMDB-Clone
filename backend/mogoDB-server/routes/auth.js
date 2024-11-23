const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const usernameExist = await User.findOne({ username });
    const emailExist = await User.findOne({ email });

    if (usernameExist || emailExist) {
      return res.status(401).send('Invalid credentials: Email or Password has been used');
    }

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send('User registered successfully.');
  } catch (err) {
    res.status(500).send('Error registering user.');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials: Email or Password Was Incorrect.');
  }

  req.session.userId = user._id;
  res.send('Logged in successfully.');
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send('Logged out successfully.');
  });
});

// Delete
router.delete('/delete', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials.');
  }

  await user.deleteOne();
  res.send('Deleted successfully.');
});

module.exports = router;
