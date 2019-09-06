const express = require("express");

const commentRoutesController = require("../controllers/commentRoutesController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/answers-posts", isAuth, commentRoutesController.getPostsAnswers);

router.get("/answers-comments", isAuth, commentRoutesController.getCommentsAnswers);

router.get("/my-comments", isAuth, commentRoutesController.getMyComments);

module.exports = router;
