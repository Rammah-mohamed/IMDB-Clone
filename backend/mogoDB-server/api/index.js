require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");

const authRoutes = require("../routes/auth");
const listRoutes = require("../routes/list");

const app = express();

app.set("trust proxy", 1); // trust first proxy (needed for secure cookies)

// CORS
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ---- SESSION SETUP ----
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // secure only in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/lists", listRoutes);

// ---- MongoDB connection caching ----
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URL);
  isConnected = true;
}

// ---- Export handler for Vercel ----
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res); // let Express handle the request
};
