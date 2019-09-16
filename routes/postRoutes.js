const express = require("express");
const multer = require("multer");
const { body } = require("express-validator/check");

const postRoutesController = require("../controllers/postRoutesController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// Для multer
const fileStorage = multer.diskStorage({
  // конфижим multer.
  destination: (req, file, cb) => {
    // фция, которая определяет где сохраняем
    cb(null, "uploads/images/");
  },
  filename: (req, file, cb) => {
    // фция, которая определяет как сохраняем (название)
    cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname); // дата для уникальности + оригинильное имя файла
  }
});
const fileFilter = (req, file, cb) => {
  // фция, которая определяет файлы какого типа сохраняем
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
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
//     { name: "imgBlocksArray" },
//     { name: "newImgBlocksArray" }
//   ])
// );

router.get("/", postRoutesController.getPosts);

router.get("/userposts/:userId", postRoutesController.getPostsByUser);

router.get("/best", postRoutesController.getBestPosts);

router.get("/new", postRoutesController.getNewPosts);

router.get("/desired/:desired", postRoutesController.getDesiredPosts);

router.get("/subs", isAuth, postRoutesController.getSubsPosts);

router.get("/saved", isAuth, postRoutesController.getSavedPosts);

router.get("/estimates", isAuth, postRoutesController.getEstimatedPosts);

router.get("/liked", isAuth, postRoutesController.getLikedPosts);

router.get("/disliked", isAuth, postRoutesController.getDislikedPosts);

router.post(
  "/new-post",
  isAuth,
  upload.fields([{ name: "imgBlocksArray" }, { name: "newImgBlocksArray" }]),
  [
    body("title", "Please use min 1 char and max 30 chars")
      .trim()
      .isLength({ min: 1, max: 30 }),
    body("content").custom((value, { req }) => {
      const content = JSON.parse(value);
      if (content.length === 0) {
        throw new Error("Please add some content");
      }
      if (content.length > 5) {
        throw new Error("Please max 5 blocks");
      }
      return true;
    }),
    body("tags").custom((value, { req }) => {
      const content = JSON.parse(value);
      if (content.length === 0) {
        throw new Error("Please add some tags");
      }
      if (content.length > 5) {
        throw new Error("Please max 5 tags");
      }
      return true;
    })
  ],
  postRoutesController.createPost
);

router.patch(
  "/:postId/edit",
  isAuth,
  [
    body("title", "Please use min 1 char and max 30 chars")
      .trim()
      .isLength({ min: 1, max: 30 }),
    body("content").custom((value, { req }) => {
      const content = JSON.parse(value);
      if (content.length === 0) {
        throw new Error("Please add some content");
      }
      if (content.length > 5) {
        throw new Error("Please max 5 blocks");
      }
      return true;
    }),
    body("tags").custom((value, { req }) => {
      const content = JSON.parse(value);
      if (content.length === 0) {
        throw new Error("Please add some tags");
      }
      if (content.length > 5) {
        throw new Error("Please max 5 tags");
      }
      return true;
    })
  ],
  postRoutesController.editPost
);

router.get("/:postId", postRoutesController.getPost);

router.delete("/:postId/delete", isAuth, postRoutesController.deletePost);

router.patch("/:postId/like", isAuth, postRoutesController.likePost);

router.patch("/:postId/dislike", isAuth, postRoutesController.dislikePost);

router.patch("/:postId/save", isAuth, postRoutesController.savePost);

router.get("/:postId/comments", postRoutesController.getComments);

router.post(
  "/:postId/add-comment",
  isAuth,
  [
    body("content").custom((value, { req }) => {
      const content = JSON.parse(value);
      if (content.length === 0) {
        throw new Error("Please add some content");
      }
      if (content.length > 5) {
        throw new Error("Please max 5 blocks");
      }
      return true;
    })
  ],
  postRoutesController.createComment
);

router.get("/comments/:commentId", postRoutesController.getComment);

router.patch("/comments/:commentId/like", isAuth, postRoutesController.likeComment);

router.patch("/comments/:commentId/dislike", isAuth, postRoutesController.dislikeComment);

router.patch(
  "/comments/:commentId/edit",
  isAuth,
  [
    body("content").custom((value, { req }) => {
      const content = JSON.parse(value);
      if (content.length === 0) {
        throw new Error("Please add some content");
      }
      if (content.length > 5) {
        throw new Error("Please max 5 blocks");
      }
      return true;
    })
  ],
  postRoutesController.editComment
);

router.delete("/comments/:commentId/delete", isAuth, postRoutesController.deleteComment);

module.exports = router;
