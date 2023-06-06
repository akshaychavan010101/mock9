const express = require("express");
require("dotenv").config();
const { connection } = require("./config/db");
const cors = require("cors");
const { UserRouter } = require("./routes/users.routes");
const { PostRouter } = require("./routes/posts.routes");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(UserRouter);
app.use(PostRouter);

app.listen(process.env.PORT, async () => {
  try {
    await connection;
  } catch (error) {
    console.log("Error in connecting to the database", error);
  }
  console.log(`App listening on port ${process.env.PORT}!`);
});
