const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.getPostsAnswers = async (req, res) => {
  try {
    const answersWithChildren = [];
    const postsIds = await Post.find({ creator: req.userId }).select("_id");
    if (!postsIds) {
      return res.status(200).json([]);
    }
    const answers = await Comment.find({ postId: { $in: postsIds }, parentComment: null })
      .sort({ createdAt: -1 })
      .populate("postId", "title")
      .populate("creator", "name avatar");
    if (!answers) {
      return res.status(200).json([]);
    }
    for (const answer of answers) {
      const answerWithChildren = await commentsThread([], answer, answer._id);
      answersWithChildren.push(answerWithChildren);
    }
    return res.status(200).json(answersWithChildren);
  } catch (error) {
    // console.log(error);
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getCommentsAnswers = async (req, res) => {
  try {
    const commentsWithChildren = [];
    // const comments = await Comment.find({ creator: req.userId, children: { $size: !0 } })
    const comments = await Comment.find({ creator: req.userId, "children.0": { $exists: true } })
      .sort({ createdAt: -1 })
      .populate("postId", "title")
      .populate("creator", "name avatar");
    if (!comments) {
      return res.status(200).json([]);
    }
    for (const comment of comments) {
      const commentWithChildren = await commentsThread([], comment, comment._id);
      commentsWithChildren.push(commentWithChildren);
    }
    return res.status(200).json(commentsWithChildren);
  } catch (error) {
    // console.log(error);
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getMyComments = async (req, res) => {
  try {
    const commentsWithChildren = [];
    const comments = await Comment.find({ creator: req.userId })
      .sort({ createdAt: -1 })
      .populate("postId", "title")
      .populate("creator", "name avatar");
    if (!comments) {
      return res.status(200).json([]);
    }
    for (const comment of comments) {
      const commentWithChildren = await commentsThread([], comment, comment._id);
      commentsWithChildren.push(commentWithChildren);
    }
    return res.status(200).json(commentsWithChildren);
  } catch (error) {
    // console.log(error);
    return res.status(503).json({ error: "oops. some problems" });
  }
};

const searchingForTargetComment = async (array, comment, targetCommentId) => {
  if (comment._id.toString() === targetCommentId.toString()) {
    return array;
  }
  const parentComment = await Comment.findById(comment.parentComment);
  const isLastChild =
    parentComment.children.indexOf(comment._id) === parentComment.children.length - 1;
  if (isLastChild) {
    return searchingForTargetComment(array, parentComment, targetCommentId);
  } else {
    const nextSiblingIndex = parentComment.children.indexOf(comment._id) + 1;
    const nextSibling = await Comment.findById(parentComment.children[nextSiblingIndex]).populate(
      "creator",
      "name avatar"
    );
    return commentsThread(
      array,
      nextSibling,
      targetCommentId,
      parentComment.children.indexOf(nextSibling._id) === parentComment.children.length - 1,
      parentComment
    );
  }
};

const commentsThread = async (array, comment, targetCommentId, isLastChild, parentComment) => {
  array.push(comment);
  if (comment.children.length > 0) {
    for (const child of comment.children) {
      const childComment = await Comment.findById(child).populate("creator", "name avatar");
      return commentsThread(
        array,
        childComment,
        targetCommentId,
        comment.children.indexOf(child) === comment.children.length - 1,
        comment
      );
    }
  } else {
    if (comment._id.toString() === targetCommentId.toString()) {
      return array;
    } else if (isLastChild) {
      return searchingForTargetComment(array, parentComment, targetCommentId);
    } else {
      const nextSiblingIndex = parentComment.children.indexOf(comment._id) + 1;
      const nextSibling = await Comment.findById(parentComment.children[nextSiblingIndex]).populate(
        "creator",
        "name avatar"
      );
      return commentsThread(
        array,
        nextSibling,
        targetCommentId,
        parentComment.children.indexOf(nextSibling._id) === parentComment.children.length - 1,
        parentComment
      );
    }
  }
};
