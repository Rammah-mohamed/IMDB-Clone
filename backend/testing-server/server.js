// server.js (Express Server)
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Allow requests from 'http://localhost:5173'
app.use(
  cors({
    origin: 'http://localhost', // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable cookies if needed
  })
);

app.use(express.json()); // To parse JSON data

// API endpoint to receive web vitals data
app.post('/log-web-vitals', (req, res) => {
  console.log('Web Vitals Data:', req.body);
  app.post('/log-web-vitals', (req, res) => {
    res.json({ message: 'Data received' });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
