const router = require("express").Router();
const {
  addCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
} = require("../controllers/cards");

router.get("/", getCards);
router.delete("/:cardId", deleteCard);
router.post("/", addCard);
router.put("/:cardId/likes", likeCard);
router.patch("/:cardId/likes", dislikeCard);

module.exports = router;
