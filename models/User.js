const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: "https://cs.pikabu.ru/images/def_avatar/def_avatar_80.png"
    },
    status: {
      type: String,
      default: "user"
    },
    rating: {
      type: Number,
      default: 0
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post"
      }
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
    ],
    subscribers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    subscribeTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    privateMessages: [
      {
        type: Schema.Types.ObjectId,
        ref: "PrivateMessage"
      }
    ],
    savedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post"
      }
    ],
    likedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post"
      }
    ],
    dislikedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post"
      }
    ],
    likedComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
    ],
    dislikedComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
    ],
    ignoredBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    ignoreList: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    // notesAboutUsers: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Note"
    //   }
    // ]
    notesAboutUsers: [
      {
        type: Object
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
