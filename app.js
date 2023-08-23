const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");

const { PORT = 3000, DB_URL = "mongodb://127.0.0.1:27017/testdb" } =
  process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

mongoose.connect(DB_URL);

app.use((req, res, next) => {
  req.user = {
    _id: "64e38511c5eb656a0b8f4d1",
  };

  next();
});

app.use("/users", require("./routes/users"));
app.use("/cards", require("./routes/cards"));

app.use("*", (req, res) => {
  res.status(404).send({ message: "Cтраница не найдена." });
});

app.listen(PORT);
