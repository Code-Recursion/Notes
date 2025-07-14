const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const notesRouter = require("./controllers/notes");
const loginRouter = require("./controllers/login");
const usersRouter = require("./controllers/users");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

// logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("MogonDB conection failed", error.message);
  });

//cors cross origin resource sharing
// app.use(cors());

const allowedOrigins = [
  "http://localhost:3001",
  "https://next-notes-mu.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow curl/postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.options("*", cors()); // handle preflight

// show static content React) using express's built-in middleware
app.use(express.static("build"));

// json-parser
app.use(express.json());

// request logger middleware must be called before routes
app.use(middleware.requestLogger);

app.get("/status", (req, res) => {
  res.send(`<h1>Server is up!</h1><p>Request made on - ${new Date()}</p>`);
});

app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);
app.use("/api/notes", notesRouter);

// calling middlewares
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
