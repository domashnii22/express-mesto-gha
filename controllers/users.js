const { HTTP_STATUS_OK, HTTP_STATUS_CREATED } = require("http2").constants;
const User = require("../models/user");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");

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
        next(new BadRequestError("Некорректный _id"));
      } else if (err.message === "NotValidId") {
        next(new NotFoundError("Пользователь по указанному _id не найден"));
      } else {
        next(err);
      }
    });
};

module.exports.addUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(HTTP_STATUS_CREATED).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Некорректный _id"));
      } else {
        next(err);
      }
    });
};
