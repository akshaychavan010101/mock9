const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: "Unauthorized" });
      } else {
        req.userid = decoded.id;
        next();
      }
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = { authenticate };
