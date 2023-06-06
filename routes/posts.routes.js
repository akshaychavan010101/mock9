const express = require("express");
require("dotenv").config();
const { Post } = require("../models/posts.models");
const { User } = require("../models/users.models");
const { authenticate } = require("../middlewares/authenticate");

const PostRouter = express.Router();

PostRouter.get("/api/posts", authenticate, async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

PostRouter.post("/api/posts", authenticate, async (req, res) => {
  try {
    const payload = req.body;
    payload.user = req.userid;
    const newPost = await Post(payload);
    await newPost.save();

    const postId = newPost._id;

    const user = await User.findById(req.userid);
    user.posts.push(postId);
    await user.save();
    res.status(201).json({ msg: "Post created successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

PostRouter.patch("/api/posts/:id", authenticate, async (req, res) => {
  try {
    const payload = req.body;

    const post = await Post.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(204).json({ msg: "Post edited successfully", post });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

PostRouter.get("/api/posts/:id", async (req, res) => {
  try {
    const posts = await Post.find({ _id: req.params.id });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

PostRouter.post("/api/posts/:id/like", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    let post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const isLiked = post.likes.includes(req.userid);
    if (isLiked) {
      const index = post.likes.indexOf(req.userid);
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.userid);
    }
    await post.save();
    res.status(201).json({ msg: "Post liked successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

PostRouter.post("/api/posts/:id/comment", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    payload.user = req.userid;
    let post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    post.comments.push(payload);
    await post.save();
    res.status(201).json({ msg: "Commented successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

PostRouter.delete("/api/posts/:id", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.findByIdAndDelete(id);
    res.status(202).json({ msg: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = { PostRouter };
