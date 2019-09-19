const express = require("express");
const multer = require("multer");
const { body } = require("express-validator/check");

const User = require("../models/User");

const userRoutesController = require("../controllers/userRoutesController");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

// @route     POST /users/register
// @ desc     Register user
// @ access   Public
router.post(
  "/register",
  [
    body("name", "Please use min 1 char and max 15 chars")
      .isLength({ min: 1, max: 15 })
      .custom(async value => {
        const user = await User.findOne({
          name: { $regex: new RegExp("^" + value + "$", "i") }
        });
        if (user) {
          return Promise.reject("user with such name already exists");
        }
      }),
    body("email", "Please use email here")
      .normalizeEmail()
      .isEmail()
      .custom(async value => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("user with such email already exists");
        }
      }),
    body("password", "Please not alphanumeric and not lowercase")
      .not()
      .isAlphanumeric()
      .not()
      .isLowercase()
      .isLength({ min: 8, max: 15 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        // return Promise.reject("Passwords have to match"); // можно и так
        throw new Error("Passwords have to match");
      }
      return true;
    })
  ],
  userRoutesController.registerUser
);

router.post(
  "/login",
  [
    body("email", "its not even email")
      .normalizeEmail()
      .isEmail()
  ],
  userRoutesController.loginUser
);

router.get("/user/:username", userRoutesController.getUser);

router.patch(
  "/toggle-subscribe-to-user/:subscribedUserId",
  isAuth,
  userRoutesController.toggleSubscribeToUser
);

router.patch("/toggle-ignore/:ignoredUserId", isAuth, userRoutesController.toggleIgnoreUser);

router.patch("/set-note", isAuth, userRoutesController.setNoteAboutUser);

router.patch("/remove-note/:userId", isAuth, userRoutesController.removeNoteAboutUser);

router.get("/get-subscribe-to", isAuth, userRoutesController.getSubscribeTo);

router.get("/get-ignore-list", isAuth, userRoutesController.getIgnoreList);

router.get("/get-notes", isAuth, userRoutesController.getNotes);

router.post("/change-avatar", isAuth, upload.single("avatar"), userRoutesController.changeAvatar);

router.patch("/delete-avatar", isAuth, userRoutesController.deleteAvatar);

router.patch("/change-sex", isAuth, userRoutesController.changeSex);

router.patch("/set-about-me-note", isAuth, userRoutesController.setAboutMeNote);

router.patch("/delete-new-answers-for-posts", isAuth, userRoutesController.deleteNewAnswersForPost);

router.patch(
  "/delete-new-answers-for-comments",
  isAuth,
  userRoutesController.deleteNewAnswersForComment
);

module.exports = router;
