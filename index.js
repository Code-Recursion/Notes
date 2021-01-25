// local env will only work if the deployment is not on production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require("express");
const app = express();

// show static content React) using express's built-in middleware
app.use(express.static("build"));

//cors cross origin resource sharing
const cors = require("cors");
app.use(cors());

// json-parser
app.use(express.json());

// dot env library
require("dotenv").config();

// note model
const Note = require("./models/note");

// middleware for logging between req and res
const requestLogger = (request, response, next) => {
  console.log("Method", request.method);
  console.log("Path", request.path);
  console.log("Body", request.body);
  console.log("--------------");
  next();
};

// calling request logger middleware
app.use(requestLogger);

app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes.map((n) => n.toJSON()));
  });
});

app.get("/api/notes/:id", (request, response, next) => {
  //using mongoose's findById method for fetching individual notes

  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note).end();
      } else {
        response.status(404).end();
      }
    })
    // he error that is passed forwards is given to the next function as a parameter. If next was called without a parameter, then the execution would simply move onto the next route or middleware. If the next function is called with a parameter, then the execution will continue to the error handler middleware.
    .catch((error) => next(error));
  // errorHandler defined at the bottom
});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  Note.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/notes", (request, response, next) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({
      error: "content is missing",
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  });

  note
    .save()
    .then((savedNote) => savedNote.toJSON())
    .then((savedAndJsonForamttedNote) => {
      response.json(savedAndJsonForamttedNote);
    })
    .catch((error) => next(error));
});

app.put("/api/notes/:id", (request, response, next) => {
  const body = request.body;
  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

// if unknown end point is hit other than the ones defined above end points, hence calling this at bottom level
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unkown endpoint" });
};

app.use(unknownEndpoint);

// express error handler
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  // if the request is malformatted the findById will throw an error causing promise to be rejected
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformattted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
