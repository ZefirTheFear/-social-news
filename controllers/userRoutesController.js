const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const deleteImgFromCloud = require("../utils/deleteImgFromCloud");
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
      password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
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
      return res.status(404).json({ errors: { email: { msg: "Нет такого пользователя" } } });
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const token = jwt.sign(
        {
          userId: user._id,
        },
        secretOrPrivateKey,
        { expiresIn: 3600 * 24 }
      );
      return res.status(200).json({ token: token, user: user });
    } else {
      return res.status(404).json({ errors: { password: { msg: "Неверный пароль" } } });
    }
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getUser = async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({
      name: { $regex: new RegExp("^" + username + "$", "i") },
    });
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.toggleSubscribeToUser = async (req, res) => {
  const subscribeToUserId = req.params.subscribeToUserId;

  try {
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    const subscribeToUser = await User.findById(subscribeToUserId);
    if (!subscribeToUser) {
      return res.status(404).json({ error: "there is no such user" });
    }

    if (user.ignoreList.find((item) => item.toString() === subscribeToUserId)) {
      return res.status(403).json("u cant do this");
    }

    const subscribe = user.subscribeTo.find(
      (subscribe) => subscribe.toString() === subscribeToUserId
    );
    if (!subscribe) {
      user.subscribeTo.push(subscribeToUserId);
      user = await user.save();
      subscribeToUser.subscribers.push(req.userId);
      await subscribeToUser.save();
      return res.status(200).json(user);
    } else {
      user.subscribeTo.pull(subscribeToUserId);
      user = await user.save();
      subscribeToUser.subscribers.pull(req.userId);
      await subscribeToUser.save();
      return res.status(200).json(user);
    }
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.toggleIgnoreUser = async (req, res) => {
  const ignoredUserId = req.params.ignoredUserId;

  try {
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    const ignoredUser = await User.findById(ignoredUserId);
    if (!ignoredUser) {
      return res.status(404).json({ error: "there is no such user" });
    }

    if (user.subscribeTo.find((item) => item.toString() === ignoredUserId)) {
      return res.status(403).json("u cant do this");
    }

    const ignore = user.ignoreList.find((ignore) => ignore.toString() === ignoredUserId);
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
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.setNoteAboutUser = async (req, res) => {
  const notedUserId = req.body.notedUserId;
  const noteBody = req.body.noteBody.trim();

  try {
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    const note = user.notesAboutUsers.find((note) => note.userId === notedUserId);
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
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.removeNoteAboutUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    let user = await User.findById(req.userId);
    user.notesAboutUsers = user.notesAboutUsers.filter((note) => note.userId !== userId);
    user = await user.save();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getSubscribeTo = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    if (user.subscribeTo.length === 0) {
      return res.status(200).json([]);
    }
    const users = await User.find({
      _id: { $in: [...user.subscribeTo] },
    }).select("name avatar");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getIgnoreList = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    if (user.ignoreList.length === 0) {
      return res.status(200).json([]);
    }
    const users = await User.find({
      _id: { $in: [...user.ignoreList] },
    }).select("name avatar");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    if (user.notesAboutUsers.length === 0) {
      return res.status(200).json([]);
    }

    const notes = [];
    for (const note of user.notesAboutUsers) {
      const notedUser = await User.findById(note.userId).select("name avatar");
      notes.push({ user: notedUser, body: note.body });
    }
    return res.status(200).json(notes);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.changeAvatar = async (req, res) => {
  try {
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    if (
      user.avatar.url !==
      "https://res.cloudinary.com/ztf/image/upload/v1573335637/social-news/avatars/default_avatar.png"
    ) {
      deleteImgFromCloud(user.avatar.public_id);
    }
    const avatar = JSON.parse(req.body.avatar);
    console.log(avatar);
    user.avatar = avatar;
    user = await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.deleteAvatar = async (req, res) => {
  try {
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    if (
      user.avatar.url !==
      "https://res.cloudinary.com/ztf/image/upload/v1573335637/social-news/avatars/default_avatar.png"
    ) {
      deleteImgFromCloud(user.avatar.public_id);
    }
    user.avatar = {
      url:
        "https://res.cloudinary.com/ztf/image/upload/v1573335637/social-news/avatars/default_avatar.png",
      public_id: null,
    };
    user = await user.save();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.changeSex = async (req, res) => {
  try {
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    user.sex = req.body;
    user = await user.save();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.setAboutMeNote = async (req, res) => {
  try {
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    user.aboutMe = req.body;
    user = await user.save();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.deleteNewAnswersForPost = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    user.newAnswers = user.newAnswers.filter((answer) => answer.type !== "answerForPost");
    const updatedUser = await user.save();
    return res.status(200).json(updatedUser._doc);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.deleteNewAnswersForComment = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "there is no such user" });
    }
    user.newAnswers = user.newAnswers.filter((answer) => answer.type !== "answerForComment");
    const updatedUser = await user.save();
    return res.status(200).json(updatedUser._doc);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};
