const notesRouter = require("express").Router();
const Note = require("../models/note");
const User = require("../models/user");

// get all user notes
notesRouter.get("/user/:userId", async (request, response) => {
  try {
    const queyrObj = request.query;
    console.log("queyrObj", queyrObj);
    const { userId } = request.params;
    const { sortBy } = request.query; // default to createdAt
    const user = await User.findById(userId).populate({
      path: "notes",
      match: { isArchive: { $ne: true } },
      options: { sort: { [sortBy]: -1 } },
    });
    // console.log("user", user);
    response.json(user.notes);
  } catch (error) {
    response.status(500).json({ message: "Error fetching user notes" });
  }
});

//return all notes from note collection
notesRouter.get("/", async (request, response) => {
  Note.find({ isArchive: { $ne: true } })
    .sort({ updatedAt: -1 })
    .then((notes) => {
      response.json(notes.map((n) => n.toJSON()));
    });
});

notesRouter.get("/:id", async (request, response, next) => {
  // console.log("request", request);
  //using mongoose's findById method for fetching individual notes
  try {
    const note = await Note.findById(request.params.id);
    // console.log("note", note);
    if (!note || note.isArchive) {
      return response.status(404).json({ error: "Note not found" });
    }
    console.log("fta");
    return response.json(note).end();
  } catch (error) {
    console.log("fAT GAYA");
    next(error);
  }
});

notesRouter.delete("/:id", (request, response, next) => {
  Note.findByIdAndUpdate(request.params.id, {
    isArchive: true,
  })
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

notesRouter.post("/", async (request, response, next) => {
  const { content, title, important = false, user: userId } = request.body;

  if (!title || !content || !userId) {
    return response
      .status(400)
      .json({ error: "Missing content or user ID or title" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    const note = new Note({
      content,
      important,
      user: user._id,
      title: title,
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
  console.log("yo", request.params);
  const body = request.body;
  const note = {
    title: body.title,
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(request.params.id, note, { new: false })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

module.exports = notesRouter;
