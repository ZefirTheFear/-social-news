const { validationResult } = require("express-validator/check");

const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const deleteImgFromCloud = require("../utils/deleteImgFromCloud");

exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }

    const title = req.body.title;
    const body = JSON.parse(req.body.content);
    const tags = JSON.parse(req.body.tags);

    const newPost = new Post({
      title: title,
      body: body,
      tags: tags,
      creator: req.userId
    });

    await newPost.save();
    user.posts.push(newPost);
    await user.save();
    return res.status(201).json(newPost);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.editPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }
    if (user.status !== "admin" && user.status !== "moderator") {
      return res.status(403).json({ error: "u cant do this" });
    }
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: "There is no such post" });
    }

    const title = req.body.title;
    const body = JSON.parse(req.body.content);
    const tags = JSON.parse(req.body.tags);

    const oldImgs = [];
    post.body.forEach(item => {
      if (item.type === "image") {
        oldImgs.push(item.public_id);
      }
    });
    const newImgs = [];
    body.forEach(item => {
      if (item.type === "image") {
        newImgs.push(item.public_id);
      }
    });
    oldImgs.forEach(public_id => {
      if (newImgs.indexOf(public_id) === -1) {
        deleteImgFromCloud(public_id);
      }
    });

    post.title = title;
    post.body = body;
    post.tags = tags;
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getNewPosts = async (req, res) => {
  const currentPage = req.get("Page");
  const perPage = 5;
  try {
    const posts = await Post.find()
      .populate("creator", "name avatar")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    if (!posts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getBestPosts = async (req, res) => {
  const currentPage = req.get("Page");
  const perPage = 5;
  try {
    const posts = await Post.find()
      .populate("creator", "name avatar")
      .sort({ rating: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    if (!posts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getHotPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      createdAt: { $gte: new Date(new Date() - 5 * 24 * 60 * 60 * 1000) }
    }).populate("creator", "name avatar");
    if (!posts) {
      return res.status(200).json([]);
    }
    const timeQ = time => {
      const hoursPassed = Math.round((new Date().getTime() - new Date(time)) / (1000 * 60 * 60));
      if (hoursPassed < 12) {
        return 1000;
      } else if (hoursPassed > 12 && hoursPassed <= 24) {
        return 800;
      } else if (hoursPassed > 24 && hoursPassed <= 48) {
        return 500;
      } else if (hoursPassed > 48 && hoursPassed <= 72) {
        return 300;
      } else if (hoursPassed > 72 && hoursPassed <= 96) {
        return 100;
      } else if (hoursPassed > 96 && hoursPassed <= 120) {
        return 50;
      } else if (hoursPassed > 120 && hoursPassed <= 240) {
        return 1;
      } else if (hoursPassed > 240 && hoursPassed <= 480) {
        return 0.01;
      } else {
        return 0.0001;
      }
    };
    const hotPosts = [];
    posts.forEach(post => {
      post._doc.hot = (post.rating + post.comments.length) * timeQ(post.createdAt);
      hotPosts.push(post._doc);
    });
    hotPosts.sort((a, b) => b.hot - a.hot);
    return res.status(200).json(hotPosts);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getSubsPosts = async (req, res) => {
  const currentPage = req.get("Page");
  const perPage = 5;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }
    const posts = await Post.find({ creator: { $in: user.subscribeTo } })
      .populate("creator", "name avatar")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    if (!posts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getDesiredPosts = async (req, res) => {
  const desired = req.params.desired.toLowerCase();
  try {
    const posts = await Post.find()
      .populate("creator", "name avatar")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(200).json([]);
    }
    const desiredPosts = posts.filter(post => {
      for (const tag of post.tags) {
        if (tag.toLowerCase().includes(desired)) {
          return true;
        }
      }
    });
    return res.status(200).json(desiredPosts);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getPostsByUser = async (req, res) => {
  const userId = req.params.userId;
  const currentPage = req.get("Page");
  const perPage = 5;
  try {
    const posts = await Post.find({ creator: userId })
      .populate("creator", "name avatar")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    if (!posts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getEstimatedPosts = async (req, res) => {
  const currentPage = req.get("Page");
  const perPage = 5;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }
    const estimatedPosts = await Post.find({
      _id: { $in: [...user.likedPosts, ...user.dislikedPosts] }
    })
      .sort({ createdAt: -1 })
      .populate("creator", "name avatar")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    if (!estimatedPosts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(estimatedPosts);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getLikedPosts = async (req, res) => {
  const currentPage = req.get("Page");
  const perPage = 5;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .sort({ createdAt: -1 })
      .populate("creator", "name avatar")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    if (!likedPosts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(likedPosts);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getDislikedPosts = async (req, res) => {
  const currentPage = req.get("Page");
  const perPage = 5;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }
    const dislikedPosts = await Post.find({ _id: { $in: user.dislikedPosts } })
      .sort({ createdAt: -1 })
      .populate("creator", "name avatar")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    if (!dislikedPosts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(dislikedPosts);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getSavedPosts = async (req, res) => {
  const currentPage = req.get("Page");
  const perPage = 5;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }
    const savedPosts = await Post.find({
      _id: { $in: user.savedPosts }
    })
      .populate("creator", "name avatar")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    if (!savedPosts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(savedPosts);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getPost = async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId).populate("creator", "name avatar");
    if (!post) {
      return res.status(404).json({ error: "There is no such post" });
    }
    return res.status(200).json(post);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ error: "There is no such post" });
    }
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.likePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (post.creator.toString() === req.userId) {
      return res.status(403).json("cant like ur own post");
    }
    const postCreator = await User.findById(post.creator);
    const user = await User.findById(req.userId);
    const dislike = post.dislikes.find(dislike => dislike.toString() === req.userId);
    if (dislike) {
      post.dislikes.pull(req.userId);
      post.rating++;
      postCreator.rating++;
      user.dislikedPosts.pull(postId);
    }
    const like = post.likes.find(like => like.toString() === req.userId);
    if (!like) {
      post.likes.push(req.userId);
      post.rating++;
      await post.save();
      postCreator.rating++;
      await postCreator.save();
      user.likedPosts.push(postId);
      await user.save();
      return res.status(200).json("liked");
    } else {
      post.likes.pull(req.userId);
      post.rating--;
      await post.save();
      postCreator.rating--;
      await postCreator.save();
      user.likedPosts.pull(postId);
      await user.save();
      return res.status(200).json("unliked");
    }
  } catch (error) {
    return res.status(503).json("oops. some problems");
  }
};

exports.dislikePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (post.creator.toString() === req.userId) {
      return res.status(403).json("cant dislike ur own post");
    }
    const postCreator = await User.findById(post.creator);
    const user = await User.findById(req.userId);
    const like = post.likes.find(like => like.toString() === req.userId);
    if (like) {
      post.likes.pull(req.userId);
      post.rating--;
      postCreator.rating--;
      user.likedPosts.pull(postId);
    }
    const dislike = post.dislikes.find(dislike => dislike.toString() === req.userId);
    if (!dislike) {
      post.dislikes.push(req.userId);
      post.rating--;
      await post.save();
      postCreator.rating--;
      await postCreator.save();
      user.dislikedPosts.push(postId);
      await user.save();
      return res.status(200).json("disliked");
    } else {
      post.dislikes.pull(req.userId);
      post.rating++;
      await post.save();
      postCreator.rating++;
      await postCreator.save();
      user.dislikedPosts.pull(postId);
      await user.save();
      return res.status(200).json("undisliked");
    }
  } catch (error) {
    return res.status(503).json("oops. some problems");
  }
};

exports.savePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(req.userId);

    const save = post.saves.find(save => save.toString() === req.userId);
    if (!save) {
      post.saves.push(req.userId);
      await post.save();
      user.savedPosts.push(postId);
      await user.save();
      return res.status(200).json("saved");
    } else {
      post.saves.pull(req.userId);
      await post.save();
      user.savedPosts.pull(postId);
      await user.save();
      return res.status(200).json("unsaved");
    }
  } catch (error) {
    return res.status(503).json("oops. some problems");
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }
    if (user.status !== "admin" && user.status !== "moderator") {
      return res.status(403).json({ error: "u cant do this" });
    }

    const post = await Post.findById(postId).populate("comments");
    if (!post) {
      return res.status(404).json("there is no such post");
    }

    post.comments.forEach(async comment => {
      comment.body.forEach(item => {
        if (item.type === "image") {
          deleteImgFromCloud(item.public_id);
        }
      });

      const commentCreator = await User.findById(comment.creator);
      commentCreator.comments.pull(comment._id);
      await commentCreator.save();

      if (comment.likes.length > 0) {
        comment.likes.forEach(async like => {
          const user = await User.findById(like);
          user.likedComments.pull(comment._id);
          await user.save();
        });
      }
      if (comment.dislikes.length > 0) {
        comment.dislikes.forEach(async dislike => {
          const user = await User.findById(dislike);
          user.dislikedComments.pull(comment._id);
          await user.save();
        });
      }

      await Comment.findByIdAndDelete(comment._id);
    });

    post.body.forEach(item => {
      if (item.type === "image") {
        deleteImgFromCloud(item.public_id);
      }
    });

    const postCreator = await User.findById(post.creator);
    postCreator.posts.pull(post._id);
    await postCreator.save();

    if (post.likes.length > 0) {
      post.likes.forEach(async like => {
        const user = await User.findById(like);
        user.likedPosts.pull(post._id);
        await user.save();
      });
    }
    if (post.dislikes.length > 0) {
      post.dislikes.forEach(async dislike => {
        const user = await User.findById(dislike);
        user.dislikedPosts.pull(post._id);
        await user.save();
      });
    }
    if (post.saves.length > 0) {
      post.saves.forEach(async save => {
        const user = await User.findById(save);
        user.savedPosts.pull(post._id);
        await user.save();
      });
    }

    await Post.findByIdAndDelete(post._id);
    return res.status(200).json("post deleted");
  } catch (error) {
    return res.status(503).json("oops. some problems");
  }
};

exports.createComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const postId = req.params.postId;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }

    const body = JSON.parse(req.body.content);

    const newComment = new Comment({
      body: body,
      creator: req.userId,
      postId: postId,
      parentComment: req.body.parentCommentId ? req.body.parentCommentId : null
    });

    const createdComment = await newComment.save();
    const createdCommentExtra = await Comment.findById(createdComment._id).populate(
      "creator",
      "name avatar"
    );
    user.comments.push(newComment);
    await user.save();
    const post = await Post.findById(postId);
    post.comments.push(newComment);
    await post.save();
    if (req.body.parentCommentId) {
      const comment = await Comment.findById(req.body.parentCommentId);
      comment.children.push(newComment);
      await comment.save();
    }

    if (newComment.parentComment) {
      const parentComment = await Comment.findById(newComment.parentComment);
      const creator = await User.findById(parentComment.creator);
      creator.newAnswers.push({ type: "answerForComment" });
      await creator.save();
    } else {
      const creator = await User.findById(post.creator);
      creator.newAnswers.push({ type: "answerForPost" });
      await creator.save();
    }

    res.status(201).json(createdCommentExtra);
  } catch (error) {
    return res.status(503).json("oops. some problems");
  }
};

exports.editComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const commentId = req.params.commentId;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }
    if (user.status !== "admin" && user.status !== "moderator") {
      return res.status(403).json({ error: "u cant do this" });
    }
    const comment = await Comment.findById(commentId).populate("creator", "name avatar");
    if (!comment) {
      return res.status(404).json({ error: "There is no such comment" });
    }

    const body = JSON.parse(req.body.content);

    const oldImgs = [];
    comment.body.forEach(item => {
      if (item.type === "image") {
        oldImgs.push(item.public_id);
      }
    });
    const newImgs = [];
    body.forEach(item => {
      if (item.type === "image") {
        newImgs.push(item.public_id);
      }
    });
    oldImgs.forEach(public_id => {
      if (newImgs.indexOf(public_id) === -1) {
        deleteImgFromCloud(public_id);
      }
    });

    comment.body = body;
    await comment.save();
    return res.status(200).json(comment);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.deleteComment = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }
    if (user.status !== "admin" && user.status !== "moderator") {
      return res.status(403).json({ error: "u cant do this" });
    }

    const delCom = async (comId, targetComId) => {
      const comment = await Comment.findById(comId);
      if (!comment) {
        return res.status(404).json({ error: "There is no such comment" });
      }

      if (comment.children.length > 0) {
        comment.children.forEach(async childCom => {
          await delCom(childCom, targetComId);
        });
      } else {
        comment.body.forEach(item => {
          if (item.type === "image") {
            deleteImgFromCloud(item.public_id);
          }
        });

        const creator = await User.findById(comment.creator);
        creator.comments.pull(comId);
        await creator.save();

        const post = await Post.findById(comment.postId);
        post.comments.pull(comId);
        await post.save();

        if (comment.likes.length > 0) {
          comment.likes.forEach(async like => {
            const user = await User.findById(like);
            user.likedComments.pull(comId);
            await user.save();
          });
        }
        if (comment.dislikes.length > 0) {
          comment.dislikes.forEach(async dislike => {
            const user = await User.findById(dislike);
            user.dislikedComments.pull(comId);
            await user.save();
          });
        }

        const parentCommentId = comment.parentComment;
        let delParent = null;
        if (parentCommentId) {
          const parentComment = await Comment.findById(parentCommentId);

          if (parentComment.children.indexOf(comId) === parentComment.children.length - 1) {
            delParent = true;
          }

          parentComment.children.pull(comId);
          await parentComment.save();
        }
        await Comment.findByIdAndDelete(comId);
        if (comId.toString() === targetComId.toString()) {
          return res.status(200).json("deleted");
        } else {
          if (delParent) {
            delCom(parentCommentId, targetComId);
          }
        }
      }
    };
    delCom(commentId, commentId);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getComments = async (req, res) => {
  const postId = req.params.postId;

  try {
    const comments = await Comment.find({ postId: postId }).populate("creator", "name avatar");
    if (!comments) {
      return res.status(200).json([]);
    }
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.getComment = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const comment = await Comment.findById(commentId)
      .populate("creator", "name avatar")
      .populate("postId", "title");
    if (!comment) {
      return res.status(404).json("There is no such comment");
    }
    return res.status(200).json(comment);
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.likeComment = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const comment = await Comment.findById(commentId);
    if (comment.creator.toString() === req.userId) {
      return res.status(403).json("cant like ur own comment");
    }
    const commentCreator = await User.findById(comment.creator);
    const user = await User.findById(req.userId);
    const dislike = comment.dislikes.find(dislike => dislike.toString() === req.userId);
    if (dislike) {
      comment.dislikes.pull(req.userId);
      comment.rating++;
      commentCreator.rating++;
      user.dislikedComments.pull(commentId);
    }
    const like = comment.likes.find(like => like.toString() === req.userId);
    if (!like) {
      comment.likes.push(req.userId);
      comment.rating++;
      await comment.save();
      commentCreator.rating++;
      await commentCreator.save();
      user.likedComments.push(commentId);
      await user.save();
      return res.status(200).json("liked comment");
    } else {
      comment.likes.pull(req.userId);
      comment.rating--;
      await comment.save();
      commentCreator.rating--;
      await commentCreator.save();
      user.likedComments.pull(commentId);
      await user.save();
      return res.status(200).json("unliked comment");
    }
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};

exports.dislikeComment = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const comment = await Comment.findById(commentId);
    if (comment.creator.toString() === req.userId) {
      return res.status(403).json("cant dislike ur own comment");
    }
    const commentCreator = await User.findById(comment.creator);
    const user = await User.findById(req.userId);
    const like = comment.likes.find(like => like.toString() === req.userId);
    if (like) {
      comment.likes.pull(req.userId);
      comment.rating--;
      commentCreator.rating--;
      user.likedComments.pull(commentId);
    }
    const dislike = comment.dislikes.find(dislike => dislike.toString() === req.userId);
    if (!dislike) {
      comment.dislikes.push(req.userId);
      comment.rating--;
      await comment.save();
      commentCreator.rating--;
      await commentCreator.save();
      user.dislikedComments.push(commentId);
      await user.save();
      return res.status(200).json("disliked comment");
    } else {
      comment.dislikes.pull(req.userId);
      comment.rating++;
      await comment.save();
      commentCreator.rating++;
      await commentCreator.save();
      user.dislikedComments.pull(commentId);
      await user.save();
      return res.status(200).json("undisliked comment");
    }
  } catch (error) {
    return res.status(503).json({ error: "oops. some problems" });
  }
};
