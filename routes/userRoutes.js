const express = require("express");
const multer = require("multer");
const { body } = require("express-validator/check");

const User = require("../models/User");

const userRoutesController = require("../controllers/userRoutesController");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

const upload = multer();

router.post(
  "/register",
  [
    body("name", "Надо от 1 до 25 символов")
      .isLength({ min: 1, max: 25 })
      .custom(async (value) => {
        const user = await User.findOne({
          name: { $regex: new RegExp("^" + value + "$", "i") },
        });
        if (user) {
          return Promise.reject("Пользователь с таким именем уже есть");
        }
      }),
    body("email", "Введите email")
      .normalizeEmail()
      .isEmail()
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("Пользователь с таким email уже есть");
        }
      }),
    body("password", "От 8 до 20 символов. 1 заглавный и 1 спецсимвол")
      .not()
      .isAlphanumeric()
      .not()
      .isLowercase()
      .isLength({ min: 8, max: 15 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Пароль должен совпадать");
      }
      return true;
    }),
  ],
  userRoutesController.registerUser
);

router.post(
  "/login",
  [body("email", "Введите email").normalizeEmail().isEmail()],
  userRoutesController.loginUser
);

router.get("/user/:username", userRoutesController.getUser);

router.patch(
  "/toggle-subscribe-to-user/:subscribeToUserId",
  isAuth,
  userRoutesController.toggleSubscribeToUser
);

router.patch("/toggle-ignore/:ignoredUserId", isAuth, userRoutesController.toggleIgnoreUser);

router.patch("/set-note", isAuth, userRoutesController.setNoteAboutUser);

router.patch("/remove-note/:userId", isAuth, userRoutesController.removeNoteAboutUser);

router.get("/get-subscribe-to", isAuth, userRoutesController.getSubscribeTo);

router.get("/get-ignore-list", isAuth, userRoutesController.getIgnoreList);

router.get("/get-notes", isAuth, userRoutesController.getNotes);

router.post("/change-avatar", isAuth, upload.none(), userRoutesController.changeAvatar);

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
