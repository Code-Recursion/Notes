const notesRouter = require("express").Router();
const Note = require("../models/note");
const User = require("../models/user");

notesRouter.get("/:userId", async (request, response) => {
  try {
    const user = await User.findById(request.params.userId).populate("notes");
    console.log("user", user);
    response.json(user.notes);
  } catch (error) {
    response.status(500).json({ message: "Error fetching user notes" });
  }
  //return all notes from note collection
  // Note.find({}).then((notes) => {
  //   response.json(notes.map((n) => n.toJSON()));
  // });
});

notesRouter.get("/:id", (request, response, next) => {
  //using mongoose's findById method for fetching individual notes

  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note).end();
      } else {
        response.status(404).end();
      }
    })
    // the error that is passed forwards is given to the next function as a parameter. If next was called without a parameter, then the execution would simply move onto the next route or middleware. If the next function is called with a parameter, then the execution will continue to the error handler middleware.
    .catch((error) => next(error));
  // errorHandler defined at the bottom
});

notesRouter.delete("/:id", (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

notesRouter.post("/", async (request, response, next) => {
  const { content, important = false, user: userId } = request.body;

  if (!content || !userId) {
    return response.status(400).json({ error: "Missing content or user ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    const note = new Note({
      content,
      important,
      date: new Date(),
      user: user._id,
    });

    const savedNote = await note.save();

    user.notes.push(savedNote._id);
    await user.save();

    response.status(201).json(savedNote.toJSON());
  } catch (error) {
    next(error);
  }
});

notesRouter.put("/:id", (request, response, next) => {
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

module.exports = notesRouter;
