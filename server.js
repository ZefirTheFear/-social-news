const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

// Для CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyparser.text());
// app.use(bodyparser.urlencoded({ extended: false })); // x-www-form-urlencoded <form>
app.use(bodyparser.json()); // парсим json. application/json

app.use("/uploads/images", express.static(path.join(__dirname, "uploads", "images"))); // static(путь)- можем раздавать файлы. __dirname - глобальная переменная. The directory name of the current module

app.use("/uploads/avatars", express.static(path.join(__dirname, "uploads", "avatars")));

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);

const port = process.env.port || 5001;

// connect to MongoDB
const db = require("./config/keys").mongoURI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDb connected");
    const server = app.listen(port, () => console.log(`Server running on ${port}`));
  })
  .catch(err => console.log(err));
