const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const userFavItemController = require("../controllers/userFavItem.controller");

const userFavItemInfoChecks = [
  check("itemId")
    .not()
    .isEmpty()
    .withMessage("Required.")
];

// GET: List of userFavItems (by userId)
router.get("/", isAuth, hasRole(["user"]), userFavItemController.getUserFavItems);

// POST: Add UserFavItem
router.post(
  "/",
  isAuth,
  hasRole(["user"]),
  userFavItemInfoChecks,
  userFavItemController.addUserFavItem
);

// DELETE: Delete UserFavItem (based on itemId)
router.delete("/:itemId", isAuth, hasRole(["user"]), userFavItemController.deleteUserFavItem);

module.exports = router;
