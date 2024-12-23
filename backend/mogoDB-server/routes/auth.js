const express = require('express');
const bcrypt = require('bcrypt');
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

//Get users
router.get('/', requireAuth, async (req, res) => {
  try {
    // Retrieve all movies created by the authenticated user
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Error fetching users.');
  }
});

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
    res.status(201).send({ message: 'User registered successfully.', username, email });
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
  res.send({ message: 'Logged in successfully.', username: user.username, email: user.email });
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
