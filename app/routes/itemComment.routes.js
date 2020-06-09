const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const itemCommentController = require("../controllers/itemComment.controller");

const itemCommentInfoChecks = [
  check("itemId")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("rating")
    .custom(value => value > 0)
    .isNumeric({ no_symbols: true })
    .toInt()
    .isInt({ min: 1, max: 5 })
    .withMessage("Must be a number between 1 and 5"),
  check("comment")
    .not()
    .isEmpty()
    .withMessage("Required.")
];

// GET: List of user's itemComments (by userId)
router.get("/me", isAuth, hasRole(["user"]), itemCommentController.getUserItemComments);

// GET: List of user's purchased items (by userId)
router.get("/bought", isAuth, hasRole(["user"]), itemCommentController.getUserPurchasedItems);

// POST: Add ItemComment
router.post(
  "/",
  isAuth,
  hasRole(["user"]),
  itemCommentInfoChecks,
  itemCommentController.addItemComment
);

// DELETE: Delete ItemComment (based on itemId)
router.delete(
  "/:itemCommentId",
  isAuth,
  hasRole(["user"]),
  itemCommentController.deleteItemComment
);

module.exports = router;
