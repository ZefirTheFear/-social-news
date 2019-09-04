const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.getPostsAnswers = async (req, res) => {
  const searchingForTargetComment = async (array, comment, targetCommentId) => {
    // console.log("comment._id", comment._id.toString());
    // console.log("targetCommentId", targetCommentId.toString());
    // console.log(
    //   "comment._id === targetCommentId",
    //   comment._id.toString() === targetCommentId.toString()
    // );
    if (comment._id.toString() === targetCommentId.toString()) {
      // console.log("array", array);
      // console.log("returned");
      return array;
    }
    const parentComment = await Comment.findById(comment.parentComment);
    const isLastChild =
      parentComment.children.indexOf(comment._id) === parentComment.children.length - 1;
    // console.log("isLastChild", isLastChild);
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
    // console.log("array", array);
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
        // console.log("returned");
        return array;
      } else if (isLastChild) {
        return searchingForTargetComment(array, parentComment, targetCommentId);
      } else {
        const nextSiblingIndex = parentComment.children.indexOf(comment._id) + 1;
        const nextSibling = await Comment.findById(
          parentComment.children[nextSiblingIndex]
        ).populate("creator", "name avatar");
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
  try {
    const answersWithChildren = [];
    const postsIds = await Post.find({ creator: req.userId }).select("_id");
    const answers = await Comment.find({ postId: { $in: postsIds }, parentComment: null })
      .sort({ createdAt: -1 })
      .populate("postId", "title")
      .populate("creator", "name avatar");
    for (const answer of answers) {
      const newArray = [];
      const answerWithChildren = await commentsThread(newArray, answer, answer._id);
      answersWithChildren.push(answerWithChildren);
    }
    return res.status(200).json(answersWithChildren);
  } catch (error) {
    console.log(error);
  }
};

exports.getCommentsAnswers = async (req, res) => {
  const searchingForTargetComment = async (array, comment, targetCommentId) => {
    // console.log("comment._id", comment._id.toString());
    // console.log("targetCommentId", targetCommentId.toString());
    // console.log(
    //   "comment._id === targetCommentId",
    //   comment._id.toString() === targetCommentId.toString()
    // );
    if (comment._id.toString() === targetCommentId.toString()) {
      // console.log("array", array);
      // console.log("returned");
      return array;
    }
    const parentComment = await Comment.findById(comment.parentComment);
    const isLastChild =
      parentComment.children.indexOf(comment._id) === parentComment.children.length - 1;
    // console.log("isLastChild", isLastChild);
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
    // console.log("array", array);
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
        // console.log("returned");
        return array;
      } else if (isLastChild) {
        return searchingForTargetComment(array, parentComment, targetCommentId);
      } else {
        const nextSiblingIndex = parentComment.children.indexOf(comment._id) + 1;
        const nextSibling = await Comment.findById(
          parentComment.children[nextSiblingIndex]
        ).populate("creator", "name avatar");
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
  try {
    const answersWithChildren = [];
    // const answers = await Comment.find({ creator: req.userId, children: { $size: !0 } })
    const answers = await Comment.find({ creator: req.userId, "children.0": { $exists: true } })
      .sort({ createdAt: -1 })
      .populate("postId", "title")
      .populate("creator", "name avatar");
    for (const answer of answers) {
      const newArray = [];
      const answerWithChildren = await commentsThread(newArray, answer, answer._id);
      answersWithChildren.push(answerWithChildren);
    }
    return res.status(200).json(answersWithChildren);
  } catch (error) {
    console.log(error);
  }
};
