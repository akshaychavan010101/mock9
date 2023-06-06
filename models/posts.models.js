const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true, trim: true },
      createdAt: { type: Date, default: Date.now() },
    },
  ],
});

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
