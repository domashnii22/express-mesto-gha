const { HTTP_STATUS_OK, HTTP_STATUS_CREATED } = require("http2").constants;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(HTTP_STATUS_OK).send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error("NotValidId"))
    .then((user) => {
      res.status(HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Некорректный _id"));
      } else if (err.message === "NotValidId") {
        next(new NotFoundError("Пользователь по указанному _id не найден"));
      } else {
        next(err);
      }
    });
};

module.exports.editUserData = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: "true", runValidators: true },
  )
    .orFail(new Error("NotValidId"))
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Некорректный _id"));
      } else if (err.message === "NotValidId") {
        next(new NotFoundError("Пользователь по указанному _id не найден"));
      } else {
        next(err);
      }
    });
};

module.exports.editUserAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: "true", runValidators: true },
  )
    .orFail(new Error("NotValidId"))
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError(err.message));
      } else if (err.message === "NotValidId") {
        next(new NotFoundError("Пользователь по указанному _id не найден"));
      } else {
        next(err);
      }
    });
};

module.exports.addUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10).then((hash) => User.create({
    name,
    about,
    avatar,
    email,
    password: hash,
  })
    .then((user) => res.status(HTTP_STATUS_CREATED).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
      _id: user._id,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        next(
          new ConflictError(
            `Пользователь c email: ${email} уже зарегистрирован`,
          ),
        );
      } else if (err.name === "ValidationError") {
        next(new BadRequestError(err.message));
      } else {
        next(err);
      }
    }));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, "some-secret-key", {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch(next);
};

module.exports.getMeUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch(next);
};
