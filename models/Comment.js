const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      default: 0
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    body: [
      {
        type: Object,
        required: true
      }
    ],
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
    ],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Comment", commentSchema);
