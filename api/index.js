const config = require("../utils/config");
const express = require("express");
const cors = require("cors");
const notesRouter = require("../controllers/notes");
const loginRouter = require("../controllers/login");
const usersRouter = require("../controllers/users");
const middleware = require("../utils/middleware");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

const app = express();

// DB Connect
mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection failed:", error.message));

// CORS
const allowedOrigins = [
  "http://localhost:3001",
  "https://next-notes-mu.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.options("*", cors());

// Static (optional; might not work on Vercel as expected)
app.use(express.static("build"));

// JSON parsing
app.use(express.json());

// Middlewares
app.use(middleware.requestLogger);

// Routes
app.get("/status", (req, res) => {
  res.send(`<h1>Server is up!</h1><p>Request made on - ${new Date()}</p>`);
});
app.get("api/test", (req, res) => {
  res.send(`<h1>test server is up!</h1><p>Request made on - ${new Date()}</p>`);
});
app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);
app.use("/api/notes", notesRouter);

// Error handlers
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

// ✅ THIS is the correct export for Vercel serverless:
module.exports = app;
