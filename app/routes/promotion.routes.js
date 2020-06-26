const express = require("express");

const router = express.Router();
const { check, query } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const promotionController = require("../controllers/promotion.controller");

const promotionInfoChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("timeStart")
    .isISO8601()
    .withMessage("Must be a date."),
  check("timeEnd")
    .isISO8601()
    .withMessage("Must be a date."),
  check("offPercent")
    .isNumeric()
    .toInt()
    .withMessage("Must be a number."),
  query("description").optional(),
  check("items")
    .isArray({ min: 1 })
    .withMessage("At least 1 item is required."),
  check("items")
    .custom(value => {
      if (!value || !Array.isArray(value)) {
        return true;
      }
      const checkArr = value.filter(v => !v.includes(".") && !v.includes("/"));
      return checkArr.length === value.length;
    })
    .withMessage("All items must have no special characters.")
];

// GET: List of Promotions
router.get(
  "/",
  isAuth,
  hasRole(["manager"]),
  [
    query("query").optional(),
    query("page")
      .custom(value => value > 0)
      .isNumeric({ no_symbols: true })
      .toInt()
      .withMessage("must be a number"),
    query("size")
      .isNumeric({ no_symbols: true })
      .toInt()
      .withMessage("must be a number"),
    query("sort")
      .matches(/^(id|name|timeStart|timeEnd|offPercent)$/)
      .withMessage("value is not valid"),
    query("sortDesc").toBoolean(),
    query("timeStart").optional(),
    query("timeEnd").optional()
  ],
  promotionController.getPromotions
);

// GET: Promotion details
router.get("/:promotionId", isAuth, hasRole(["manager"]), promotionController.getPromotion);

// POST: Add Promotion
router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  promotionInfoChecks,
  promotionController.addPromotion
);

// PUT: Update Promotion
router.put(
  "/:promotionId",
  isAuth,
  hasRole(["manager"]),
  promotionInfoChecks,
  promotionController.updatePromotion
);

// DELETE: Delete Promotion
router.delete("/:promotionId", isAuth, hasRole(["manager"]), promotionController.deletePromotion);

module.exports = router;
module.exports = router;
