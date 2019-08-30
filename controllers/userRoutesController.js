const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const secretOrPrivateKey = require("../config/keys").secretOrKey;

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json("We are sorry. Something went wrong :(");
    console.log(error);
  }
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ errors: { email: { msg: "There is no such user" } } });
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const token = jwt.sign(
        {
          userId: user._id
        },
        secretOrPrivateKey,
        { expiresIn: 3600 * 24 }
      );
      return res.status(200).json({ token: token, user: user });
    } else {
      return res.status(404).json({ errors: { password: { msg: "wrong password" } } });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong :(");
  }
};

exports.getUser = async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ name: username });
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
};

exports.toggleSubscribeToUser = async (req, res) => {
  const subscribedUserId = req.params.subscribedUserId;

  try {
    let user = await User.findById(req.userId);
    const subscribedUser = await User.findById(subscribedUserId);

    const subscribe = user.subscribeTo.find(subscribe => subscribe.toString() === subscribedUserId);
    if (!subscribe) {
      user.subscribeTo.push(subscribedUserId);
      user = await user.save();
      subscribedUser.subscribers.push(req.userId);
      await subscribedUser.save();
      return res.status(200).json(user);
    } else {
      user.subscribeTo.pull(subscribedUserId);
      user = await user.save();
      subscribedUser.subscribers.pull(req.userId);
      await subscribedUser.save();
      return res.status(200).json(user);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.toggleIgnoreUser = async (req, res) => {
  const ignoredUserId = req.params.ignoredUserId;

  try {
    let user = await User.findById(req.userId);
    const ignoredUser = await User.findById(ignoredUserId);

    const ignore = user.ignoreList.find(ignore => ignore.toString() === ignoredUserId);
    if (!ignore) {
      user.ignoreList.push(ignoredUserId);
      user = await user.save();
      ignoredUser.ignoredBy.push(req.userId);
      await ignoredUser.save();
      return res.status(200).json(user);
    } else {
      user.ignoreList.pull(ignoredUserId);
      user = await user.save();
      ignoredUser.ignoredBy.pull(req.userId);
      await ignoredUser.save();
      return res.status(200).json(user);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.setNoteAboutUser = async (req, res) => {
  const notedUserId = req.body.notedUserId;
  const noteBody = req.body.noteBody.trim();

  try {
    let user = await User.findById(req.userId);
    const note = user.notesAboutUsers.find(note => note.userId === notedUserId);
    if (!note) {
      user.notesAboutUsers.push({ userId: notedUserId, body: noteBody });
      user = await user.save();
      return res.status(200).json(user);
    } else if (noteBody === "") {
      user.notesAboutUsers.pull(note);
      user = await user.save();
      return res.status(200).json(user);
    } else {
      user.notesAboutUsers.pull(note);
      user.notesAboutUsers.push({ userId: notedUserId, body: noteBody });
      user = await user.save();
      return res.status(200).json(user);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.removeNoteAboutUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    let user = await User.findById(req.userId);
    user.notesAboutUsers = user.notesAboutUsers.filter(note => note.userId !== userId);
    user = await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
};

exports.getSubscribeTo = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.subscribeTo.length === 0) {
      return res.status(404).json({ error: "there is no subscribeTo users" });
    }
    const users = await User.find({
      _id: { $in: [...user.subscribeTo] }
    }).select("name avatar");
    if (!users) {
      return res.status(404).json({ error: "there is no subscribeTo users" });
    }
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
  }
};

exports.getIgnoreList = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.ignoreList.length === 0) {
      return res.status(404).json({ error: "there is no ignored users" });
    }
    const users = await User.find({
      _id: { $in: [...user.ignoreList] }
    }).select("name avatar");
    if (!users) {
      return res.status(404).json({ error: "there is no ignored users" });
    }
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
  }
};

exports.getNotes = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const notes = [];
    if (user.notesAboutUsers.length === 0) {
      return res.status(404).json({ error: "there is no notes about users" });
    }

    for (const note of user.notesAboutUsers) {
      const notedUser = await User.findById(note.userId).select("name avatar");
      notes.push({ user: notedUser, body: note.body });
    }
    if (notes.length === 0) {
      return res.status(404).json({ error: "there is no notes about users" });
    }
    return res.status(200).json(notes);
  } catch (error) {
    console.log(error);
  }
};
