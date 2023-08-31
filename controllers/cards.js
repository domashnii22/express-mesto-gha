const { HTTP_STATUS_OK, HTTP_STATUS_CREATED } = require("http2").constants;
const Card = require("../models/card");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

module.exports.addCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .orFail(new Error("NotValidCardId"))
        .populate("owner")
        .then((data) => res.status(HTTP_STATUS_CREATED).send(data))
        .catch((err) => {
          if (err.name === "CastError") {
            next(new NotFoundError("Карточка с указанным _id не найдена"));
          } else {
            next(err);
          }
        });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError(err.message));
      } else {
        next(err);
      }
    });
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(["owner", "likes"])
    .then((cards) => res.status(HTTP_STATUS_OK).send(cards))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError("Карточка другого пользователя");
      }
      Card.deleteOne(card)
        .orFail(new Error("NotValidCardId"))
        .then(() => {
          res.status(HTTP_STATUS_OK).send({ message: "Карточка удалена" });
        })
        .catch((err) => {
          if (err.name === "CastError") {
            next(new BadRequestError("Некорректный _id карточки"));
          } else if (err.message === "NotValidCardId") {
            next(new NotFoundError("Карточка с указанным _id не найдена"));
          } else {
            next(err);
          }
        });
    })
    .catch((err) => {
      if (err.name === "TypeError") {
        next(new NotFoundError("Карточка с указанным _id не найдена"));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("NotValidCardId"))
    .populate(["owner", "likes"])
    .then((card) => {
      res.status(HTTP_STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Некорректный _id карточки"));
      } else if (err.message === "NotValidCardId") {
        next(new NotFoundError("Карточка с указанным _id не найдена"));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("NotValidCardId"))
    .populate(["owner", "likes"])
    .then((card) => {
      res.status(HTTP_STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Некорректный _id карточки"));
      } else if (err.message === "NotValidCardId") {
        next(new NotFoundError("Карточка с указанным _id не найдена"));
      } else {
        next(err);
      }
    });
};
