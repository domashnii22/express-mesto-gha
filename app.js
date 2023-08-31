const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { errors } = require("celebrate");
const auth = require("./middlewares/auth");
const errorHandler = require("./middlewares/error-handler");
const NotFoundError = require("./errors/NotFoundError");

const { PORT = 3000, DB_URL = "mongodb://127.0.0.1:27017/testdb" } =
  process.env;

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(limiter);

mongoose.connect(DB_URL);

app.use("/signup", require("./routes/signup"));
app.use("/signin", require("./routes/signin"));

app.use(auth);

app.use("/users", require("./routes/users"));
app.use("/cards", require("./routes/cards"));

app.use("*", (req, res, next) => {
  next(new NotFoundError("Страница не найдена"));
});

app.use(errors());

app.use(errorHandler);

app.listen(PORT);
