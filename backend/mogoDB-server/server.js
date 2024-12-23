require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth');
// const movieRoutes = require('./routes/movie');
const listRoutes = require('./routes/list');
const cookieParser = require('cookie-parser');
const app = express();

// Allow requests from 'http://localhost:5173'
app.use(
  cors({
    origin: 'http://localhost:5173', // Replace with your client URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    credentials: true, // Include credentials (e.g., cookies)
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: 'lax', // Adjust based on your use case
    },
  })
);

app.use(express.json());
app.use(cookieParser());

const sessionOptions = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
  },
});

app.use(sessionOptions);

// Routes
app.use('/auth', authRoutes);
// app.use('/movies', movieRoutes);
app.use('/lists', listRoutes);

// Connect to MongoDB and Start Server
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() =>
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
  )
  .catch((err) => console.error(err));
