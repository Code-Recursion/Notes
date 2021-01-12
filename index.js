const express = require("express");
const app = express();

// show static content using express's built-in middleware
app.use(express.static('build'))

//cors
const cors = require("cors");
app.use(cors());

// json-parser
app.use(express.json());

// middleware
const requestLogger = (request, response, next) => {
  console.log("Method", request.method);
  console.log("Path", request.path);
  console.log("Body", request.body);
  console.log("--------------");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unkown endpoint" });
};

// middleware
app.use(requestLogger);

let notes = [
  {
    id: 1,
    content: "HTML is not a programming language",
    date: "2019-05-30T17:30:31.098Z",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true,
  },
  {
    id: 4,
    content: "useless note",
    date: "2019-05-30T19:20:14.298Z",
    important: false,
  },
];

app.get("/", (request, response) => {
  response.send("<h1>hello world</h1>");
});

app.get("/api/notes/", (request, response) => {
  response.json(notes);
});

app.get("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((note) => note.id != id);
  response.status(204).end();
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((note) => note.id)) : 0;
  return maxId + 1;
};

app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content is missing",
    });
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  };

  notes = notes.concat(note);
  console.log(note);
  response.json(note);
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
