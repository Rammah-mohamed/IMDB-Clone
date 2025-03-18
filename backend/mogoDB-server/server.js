require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const authRoutes = require("./routes/auth");
const listRoutes = require("./routes/list");
const cookieParser = require("cookie-parser");
const app = express();

app.set("trust proxy", 1); // trust first proxy

// Define allowed origin explicitly
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

const sessionOptions = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: true, // for dev (true in prod)
    sameSite: "none", // "none" in prod
  },
});

app.use(sessionOptions);

// Routes
app.use("/auth", authRoutes);
app.use("/lists", listRoutes);

// Connect to MongoDB and Start Server
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() =>
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`)),
  )
  .catch((err) => console.error(err));
