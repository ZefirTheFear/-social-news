const express = require("express");

const commentRoutesController = require("../controllers/commentRoutesController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/answers-posts", isAuth, commentRoutesController.getPostAnswers);

module.exports = router;
