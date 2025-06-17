const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  if (!password || password.length < 3) {
    return response.status(400).json({
      error: "password must be at least 3 characters long",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    if (error.name === "ValidationError") {
      return response.status(400).json({ error: error.message });
    }
    response.status(500).json({ error: "something went wrong" });
  }
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("notes", { content: 1, date: 1 });
  response.json(users);
});

module.exports = usersRouter;
