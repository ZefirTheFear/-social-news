const path = require("path");
const fs = require("fs");

const { validationResult } = require("express-validator/check");

const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

exports.createPost = async (req, res) => {
  // console.log(req.files);
  // console.log(req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.files.length) {
      console.log(req.files.length);
      req.files.imgBlocksArray.forEach(item => {
        clearImage(item.path);
      });
    }
    return res.status(422).json({ errors: errors.mapped() });
  }

  const title = req.body.title;
  const textBlocksArray = JSON.parse(req.body.textBlocksArray);
  const dataOrder = JSON.parse(req.body.content);
  const body = [];
  let textBlockArrayIndex = 0;
  let imgBlockArrayIndex = 0;
  dataOrder.forEach(item => {
    if (item.type === "text") {
      body.push({ type: "text", content: textBlocksArray[textBlockArrayIndex], key: item.key });
      textBlockArrayIndex++;
    } else {
      // body.push({ type: "img", url: req.files[imgBlockArrayIndex].path.replace(/\\/g, "/") });
      body.push({
        type: "img",
        url: req.files.imgBlocksArray[imgBlockArrayIndex].path,
        key: item.key
      });
      imgBlockArrayIndex++;
    }
  });
  const tags = JSON.parse(req.body.tags);

  const newPost = new Post({
    title: title,
    body: body,
    tags: tags,
    creator: req.userId
  });

  try {
    await newPost.save();
    const user = await User.findById(req.userId);
    user.posts.push(newPost);
    await user.save();
    return res.status(201).json(newPost);
  } catch (error) {
    console.log(error);
  }
};

exports.editPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.files.length) {
      req.files.newImgBlocksArray.forEach(item => {
        clearImage(item.path);
      });
    }
    return res.status(422).json({ errors: errors.mapped() });
  }

  const postId = req.params.postId;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }
    if (user.status !== "admin" && user.status !== "moderator") {
      return res.status(403).json({ error: "u cant do this" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "There is no such post" });
    }

    const title = req.body.title;
    const textBlocksArray = JSON.parse(req.body.textBlocksArray);
    const oldImgBlocksArray = JSON.parse(req.body.oldImgBlocksArray);
    const dataOrder = JSON.parse(req.body.content);
    const body = [];
    let textBlockArrayIndex = 0;
    let oldImgBlockArrayIndex = 0;
    let newImgBlockArrayIndex = 0;
    dataOrder.forEach(item => {
      if (item.type === "text") {
        body.push({ type: "text", content: textBlocksArray[textBlockArrayIndex], key: item.key });
        textBlockArrayIndex++;
      } else if (item.type === "newImg") {
        // body.push({ type: "img", url: req.files[imgBlockArrayIndex].path.replace(/\\/g, "/") });
        body.push({
          type: "img",
          url: req.files.newImgBlocksArray[newImgBlockArrayIndex].path,
          key: item.key
        });
        newImgBlockArrayIndex++;
      } else {
        body.push({ type: "img", url: oldImgBlocksArray[oldImgBlockArrayIndex], key: item.key });
        oldImgBlockArrayIndex++;
      }
    });

    const tags = JSON.parse(req.body.tags);

    const oldImgs = [];
    post.body.forEach(item => {
      if (item.type === "img") {
        oldImgs.push(item.url);
      }
    });
    oldImgs.forEach(item => {
      if (oldImgBlocksArray.indexOf(item) === -1) {
        clearImage(item);
      }
    });

    post.title = title;
    post.body = body;
    post.tags = tags;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    return res.status(404).json({ error: "There is no such post" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("creator", "name avatar");
    if (!posts) {
      return res.json("There is no posts");
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
    const clearPosts = [];
    posts.forEach(post => {
      post._doc.hot = (post.rating + post.comments.length) * timeQ(post.createdAt);
      clearPosts.push(post._doc);
    });
    clearPosts.sort((a, b) => b.hot - a.hot);
    res.status(200).json(clearPosts);
  } catch (error) {
    console.log(error);
  }
};

exports.getPostsByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    const posts = await Post.find({ creator: userId }).populate("creator", "name avatar");
    if (!posts) {
      return res.json("There is no posts");
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
  }
};

exports.getBestPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("creator", "name avatar")
      .sort({ rating: -1 });
    if (!posts) {
      return res.json("There is no posts");
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
  }
};

exports.getNewPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("creator", "name avatar")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.json("There is no posts");
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
  }
};

exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const savedPosts = [];
    for (const post of user.savedPosts) {
      const savedPost = await Post.findById(post._id).populate("creator", "name avatar");
      savedPosts.unshift(savedPost);
    }
    if (savedPosts.length === 0) {
      return res.json("There is no posts");
    }
    res.status(200).json(savedPosts);
  } catch (error) {
    console.log(error);
  }
};

exports.getEstimatedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const estimatedPosts = await Post.find({
      _id: { $in: [...user.likedPosts, ...user.dislikedPosts] }
    })
      .sort({ createdAt: -1 })
      .populate("creator", "name avatar");
    if (estimatedPosts.length === 0) {
      return res.json("There is no posts");
    }
    res.status(200).json(estimatedPosts);
  } catch (error) {
    console.log(error);
  }
};

exports.getLikedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const likedPosts = await Post.find({ _id: { $in: [...user.likedPosts] } })
      .sort({ createdAt: -1 })
      .populate("creator", "name avatar");
    if (likedPosts.length === 0) {
      return res.json("There is no posts");
    }
    res.status(200).json(likedPosts);
  } catch (error) {
    console.log(error);
  }
};

exports.getDislikedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const dislikedPosts = await Post.find({ _id: { $in: [...user.dislikedPosts] } })
      .sort({ createdAt: -1 })
      .populate("creator", "name avatar");
    if (dislikedPosts.length === 0) {
      return res.json("There is no posts");
    }
    res.status(200).json(dislikedPosts);
  } catch (error) {
    console.log(error);
  }
};

exports.getPost = async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById({ _id: postId }).populate("creator", "name avatar");
    if (!post) {
      return res.status(404).json({ error: "There is no such post" });
    }
    res.status(200).json(post);
  } catch (error) {
    return res.status(404).json({ error: "There is no such post" });
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId).populate("comments");
    if (!post) {
      return res.status(404).json("there is no such post");
    }

    post.comments.forEach(async comment => {
      comment.body.forEach(item => {
        if (item.type === "img") {
          clearImage(item.url);
        }
      });
      console.log("cmt img cleared");

      const commentCreator = await User.findById(comment.creator);
      commentCreator.comments.pull(comment._id);
      await commentCreator.save();
      console.log("com creator cleared");

      if (comment.likes.length > 0) {
        comment.likes.forEach(async like => {
          const user = await User.findById(like);
          user.likedComments.pull(comment._id);
          await user.save();
          console.log("com liked cleared");
        });
      }
      if (comment.dislikes.length > 0) {
        comment.dislikes.forEach(async dislike => {
          const user = await User.findById(dislike);
          user.dislikedComments.pull(comment._id);
          await user.save();
          console.log("com disliked cleared");
        });
      }

      await Comment.findByIdAndDelete(comment._id);
      console.log(comment._id, "com deleted");
    });

    post.body.forEach(item => {
      if (item.type === "img") {
        clearImage(item.url);
      }
    });
    console.log("post img cleared");

    const postCreator = await User.findById(post.creator);
    postCreator.posts.pull(post._id);
    await postCreator.save();
    console.log("post creator cleared");

    if (post.likes.length > 0) {
      post.likes.forEach(async like => {
        const user = await User.findById(like);
        user.likedPosts.pull(post._id);
        await user.save();
        console.log("post liked cleared");
      });
    }
    if (post.dislikes.length > 0) {
      post.dislikes.forEach(async dislike => {
        const user = await User.findById(dislike);
        user.dislikedPosts.pull(post._id);
        await user.save();
        console.log("post disliked cleared");
      });
    }
    if (post.saves.length > 0) {
      post.saves.forEach(async save => {
        const user = await User.findById(save);
        user.savedPosts.pull(post._id);
        await user.save();
        console.log("post saved cleared");
      });
    }

    await Post.findByIdAndDelete(post._id);
    console.log(post._id, "post deleted");
    return res.status(200).json("post deleted");
  } catch (error) {
    console.log(error);
  }
};

exports.createComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const postId = req.params.postId;

  const textBlocksArray = JSON.parse(req.body.textBlocksArray);
  const dataOrder = JSON.parse(req.body.content);
  const body = [];
  let textBlockArrayIndex = 0;
  let imgBlockArrayIndex = 0;
  dataOrder.forEach(item => {
    if (item.type === "text") {
      body.push({ type: "text", content: textBlocksArray[textBlockArrayIndex], key: item.key });
      textBlockArrayIndex++;
    } else {
      // body.push({ type: "img", url: req.files[imgBlockArrayIndex].path.replace(/\\/g, "/") });
      body.push({
        type: "img",
        url: req.files.imgBlocksArray[imgBlockArrayIndex].path,
        key: item.key
      });
      imgBlockArrayIndex++;
    }
  });

  const newComment = new Comment({
    body: body,
    creator: req.userId,
    postId: postId,
    parentComment: req.body.parentCommentId ? req.body.parentCommentId : null
  });

  try {
    await newComment.save();
    const user = await User.findById(req.userId);
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
    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
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

    const textBlocksArray = JSON.parse(req.body.textBlocksArray);
    const oldImgBlocksArray = JSON.parse(req.body.oldImgBlocksArray);
    const dataOrder = JSON.parse(req.body.content);
    const body = [];
    let textBlockArrayIndex = 0;
    let oldImgBlockArrayIndex = 0;
    let newImgBlockArrayIndex = 0;
    dataOrder.forEach(item => {
      if (item.type === "text") {
        body.push({ type: "text", content: textBlocksArray[textBlockArrayIndex], key: item.key });
        textBlockArrayIndex++;
      } else if (item.type === "newImg") {
        // body.push({ type: "img", url: req.files[imgBlockArrayIndex].path.replace(/\\/g, "/") });
        body.push({
          type: "img",
          url: req.files.newImgBlocksArray[newImgBlockArrayIndex].path,
          key: item.key
        });
        newImgBlockArrayIndex++;
      } else {
        body.push({ type: "img", url: oldImgBlocksArray[oldImgBlockArrayIndex], key: item.key });
        oldImgBlockArrayIndex++;
      }
    });

    const oldImgs = [];
    comment.body.forEach(item => {
      if (item.type === "img") {
        oldImgs.push(item.url);
      }
    });
    oldImgs.forEach(item => {
      if (oldImgBlocksArray.indexOf(item) === -1) {
        clearImage(item);
      }
    });

    comment.body = body;
    await comment.save();
    return res.status(200).json(comment);
  } catch (error) {
    console.log(error);
  }
};

exports.deleteComment = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "There is no such user" });
    }

    const delCom = async (comId, targetComId) => {
      const comment = await Comment.findById(comId);
      if (!comment) {
        return res.status(404).json({ error: "There is no such comment" });
      }

      console.log(comment.children.length);
      if (comment.children.length > 0) {
        comment.children.forEach(async chilCom => {
          await delCom(chilCom, targetComId);
        });
      } else {
        comment.body.forEach(item => {
          if (item.type === "img") {
            clearImage(item.url);
          }
        });
        console.log("img cleared");

        const creator = await User.findById(comment.creator);
        creator.comments.pull(comId);
        await creator.save();
        console.log("creator cleared");

        const post = await Post.findById(comment.postId);
        post.comments.pull(comId);
        await post.save();
        console.log("post cleared");

        if (comment.likes.length > 0) {
          comment.likes.forEach(async like => {
            const user = await User.findById(like);
            user.likedComments.pull(comId);
            await user.save();
            console.log("liked cleared");
          });
        }
        if (comment.dislikes.length > 0) {
          comment.dislikes.forEach(async dislike => {
            const user = await User.findById(dislike);
            user.dislikedComments.pull(comId);
            await user.save();
            console.log("disliked cleared");
          });
        }

        const parentCommentId = comment.parentComment;
        let delParent = null;
        if (parentCommentId) {
          const parentComment = await Comment.findById(parentCommentId);

          console.log(parentComment.children);
          console.log("comId index", parentComment.children.indexOf(comId));
          console.log("last index", parentComment.children.length - 1);
          if (parentComment.children.indexOf(comId) === parentComment.children.length - 1) {
            delParent = true;
          }

          parentComment.children.pull(comId);
          await parentComment.save();
          console.log("parentComment cleared");
        }
        await Comment.findByIdAndDelete(comId);
        console.log(comId, "deleted");
        console.log("comId", comId);
        console.log("targetComId", targetComId);
        console.log(comId.toString() === targetComId.toString());
        if (comId.toString() === targetComId.toString()) {
          console.log("response");
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
    console.log(error);
  }
};

exports.getComments = async (req, res) => {
  const postId = req.params.postId;

  try {
    const comments = await Comment.find({ postId: postId }).populate("creator", "name avatar");
    // .sort({ createdAt: -1 });
    if (!comments) {
      return res.json("There is no comments");
    }
    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
  }
};

exports.getComment = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const comment = await Comment.findById(commentId).populate("creator", "name avatar");
    if (!comment) {
      return res.json("There is no comments");
    }
    res.status(200).json(comment);
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
    console.log(error);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, err => console.log(err));
};
