const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: { type: String, required: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true, trim: true },
  bio: { type: String, required: true, trim: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 5);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
