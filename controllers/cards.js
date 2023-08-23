const Card = require("../models/card");

module.exports.addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .populate("owner")
        .then((data) => res.status(201).send(data))
        .catch(() => res
          .status(500)
          .send({ message: "Карточка с указанным _id не найдена." }));
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({ message: err.message });
      } else {
        res.status(500).send({ message: "На сервере произошла ошибка" });
      }
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(["owner", "likes"])
    .then((cards) => res.send(cards))
    .catch(() => res.status(500).send({ message: "На сервере произошла ошибка" }));
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error("NotValidCardId"))
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({ message: "Некорректный _id карточки" });
      } else if (err.message === "NotValidCardId") {
        res
          .status(404)
          .send({ message: "Карточка с указанным _id не найдена" });
      } else {
        res.status(500).send({ message: "На сервере произошла ошибка" });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("NotValidCardId"))
    .populate(["owner", "likes"])
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({ message: "Некорректный _id карточки" });
      } else if (err.message === "NotValidCardId") {
        res
          .status(404)
          .send({ message: "Карточка с указанным _id не найдена" });
      } else {
        res.status(500).send({ message: "На сервере произошла ошибка" });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("NotValidCardId"))
    .populate(["owner", "likes"])
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: "Карточка с указанным _id не найден" });
        return;
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({ message: "Некорректный _id карточки" });
      } else if (err.message === "NotValidCardId") {
        res
          .status(404)
          .send({ message: "Карточка с указанным _id не найдена" });
      } else {
        res.status(500).send({ message: "На сервере произошла ошибка" });
      }
    });
};
