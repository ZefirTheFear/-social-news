const express = require("express");
const { body } = require("express-validator/check");

const postRoutesController = require("../controllers/postRoutesController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", postRoutesController.getPosts);

router.get("/userposts/:userId", postRoutesController.getPostsByUser);

router.get("/best", postRoutesController.getBestPosts);

router.get("/new", postRoutesController.getNewPosts);

router.get("/saved", isAuth, postRoutesController.getSavedPosts);

router.get("/estimates", isAuth, postRoutesController.getEstimatedPosts);

router.get("/liked", isAuth, postRoutesController.getLikedPosts);

router.get("/disliked", isAuth, postRoutesController.getDislikedPosts);

router.post(
  "/new-post",
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
