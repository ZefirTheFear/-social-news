const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

exports.getPostAnswers = async (req, res) => {
  try {
    const posts = await Post.find({ creator: req.userId }).sort({ createdAt: -1 });
    const answers = [];
    for (const post of posts) {
      const comments = await Comment.find({ postId: post._id, parentComment: null })
        .sort({ createdAt: -1 })
        .populate("postId", "title")
        .populate("creator", "name avatar");
      if (comments.length > 0) {
        answers.push(...comments);
      }
    }
    return res.status(200).json(answers);
  } catch (error) {
    console.log(error);
  }
};
