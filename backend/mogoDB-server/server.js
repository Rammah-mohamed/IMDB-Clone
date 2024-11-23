require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movie');
const listRoutes = require('./routes/list');
const cors = require('cors');

const app = express();

// Allow requests from 'http://localhost:5173'
app.use(
  cors({
    origin: 'http://localhost:5173', // Replace with your client URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    credentials: true, // Include credentials (e.g., cookies)
  })
);

app.use(express.json());

const sessionOptions = session({
  secret: process.env.REACT_APP_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.REACT_APP_MONGODB_URL }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
});

app.use(sessionOptions);

// Routes
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/lists', listRoutes);

// Connect to MongoDB and Start Server
mongoose
  .connect(process.env.REACT_APP_MONGODB_URL)
  .then(() =>
    app.listen(process.env.REACT_APP_PORT, () =>
      console.log(`Server running on port ${process.env.REACT_APP_PORT}`)
    )
  )
  .catch((err) => console.error(err));
