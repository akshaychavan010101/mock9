const express = require("express");
const { User } = require("../models/users.models");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { authenticate } = require("../middlewares/authenticate");

const UserRouter = express.Router();

UserRouter.post("/api/register", async (req, res) => {
  try {
    const payload = req.body;
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(200).json({ msg: "User already exists, Please login" });
    }

    const newUser = await User(payload);
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

UserRouter.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ msg: "User does not exists" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ msg: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({ msg: "Login Successful", token });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

UserRouter.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

UserRouter.get("/api/users/:id/friends", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");

    const friends = user.friends;

    res.status(200).json({ friends });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

UserRouter.post("/api/users/:id/friends", authenticate, async (req, res) => {
  try {
    const userId = req.userid;
    const user = await User.findById(userId);

    const followid = req.params.id;
    const followuser = await User.findById(followid);

    user.friendRequests.push(followid);
    followuser.friendRequests.push(userId);

    await user.save();
    await followuser.save();

    res.status(201).json({ msg: "Request sent successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

UserRouter.patch(
  "/api/users/:id/friends/:friendId",
  authenticate,
  async (req, res) => {
    try {
      const {type} = req.body;

      const userId = req.params.id;
      const friendId = req.params.friendId;

      const user = await User.findById(userId);
      const followuser = await User.findById(friendId);

      const friend = user.friendRequests.find((friend) => friend == friendId);
      if (!friend) {
        return res.status(200).json({ msg: "No friend request found" });
      }

      const followfriend = followuser.friendRequests.find(
        (friend) => friend == userId
      );
      if (!followfriend) {
        return res.status(200).json({ msg: "No friend request found" });
      }

      const index = user.friendRequests.indexOf(friend);
      const followindex = followuser.friendRequests.indexOf(followfriend);

      user.friendRequests.splice(index, 1);
      followuser.friendRequests.splice(followindex, 1);

      if (type == "accept") {
        user.friends.push(friend);
        followuser.friends.push(followfriend);
        await user.save();
        await followuser.save();
      } else {
        await user.save();
        await followuser.save();
        return res.status(204).json({ msg: "Friend request rejected" });
      }

      res.status(204).json({ msg: "Friend added successfully" });
    } catch (error) {
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

module.exports = { UserRouter };
