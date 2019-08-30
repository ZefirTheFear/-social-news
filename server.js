const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const multer = require("multer");

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

// app.use(bodyparser.urlencoded({ extended: false })); // x-www-form-urlencoded <form>
app.use(bodyparser.json()); // парсим json. application/json

// Для multer
const fileStorage = multer.diskStorage({
  // конфижим multer.
  destination: (req, file, cb) => {
    // фция, которая определяет где сохраняем
    cb(null, "uploads/images/");
  },
  filename: (req, file, cb) => {
    // фция, которая определяет как сохраняем (название)
    cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname); // дата для уникальности + оригинильное имя файла
  }
});
const fileFilter = (req, file, cb) => {
  // фция, которая определяет файлы какого типа сохраняем
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).array("imgBlocksArray"));
// app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).array("newImgBlocksArray"));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
    { name: "imgBlocksArray" },
    { name: "newImgBlocksArray" }
  ])
);

app.use("/uploads/images", express.static(path.join(__dirname, "uploads", "images"))); // static(путь)- можем раздавать файлы. __dirname - глобальная переменная. The directory name of the current module

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
