const express = require("express");
const _ = require("lodash");

const router = express.Router();
const { check, query } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const itemController = require("../controllers/item.controller");

const itemInfoChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("scale")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("type")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("maker")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("brand")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("year")
    .isNumeric()
    .toInt()
    .withMessage("Must be a number."),
  check("price")
    .isNumeric()
    .toInt()
    .withMessage("Must be a number."),
  check("blog").optional(),
  check("locked")
    .isBoolean()
    .optional()
    .withMessage("Must be boolean."),
  check("images")
    .isArray({ min: 1 })
    .withMessage("At least 1 image is required."),
  check("variations")
    .isArray({ min: 1 })
    .withMessage("At least 1 variation is required."),
  check("variations")
    .custom(value => {
      if (!value || !Array.isArray(value)) {
        return true;
      }
      for (let i = 0; i < value.length; i += 1) {
        if (!["name", "colors"].every(v => Object.keys(value[i]).includes(v))) {
          return false;
        }
      }
      return true;
    })
    .withMessage("All variation must include name and colors."),
  check("attributes")
    .custom(value => Object.prototype.toString.call(value) === "[object Object]")
    .withMessage("Must be an object.")
];

// GET: List of products
router.get(
  "/",
  [
    // query("query").optional(),
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
      .matches(/^(id|name|scale|type|maker|brand|year|price|createdAt|updatedAt)$/)
      .withMessage("value is not valid"),
    query("sortDesc").toBoolean(),
    query("special")
      .matches(/^(hot|new)$/)
      .optional()
      .withMessage("value is not valid"),
    query("scale").optional(),
    query("type").optional(),
    query("maker").optional(),
    query("brand").optional(),
    query("year").optional(),
    query("price").optional(),
    query("variationName").optional(),
    // Additional
    query("withHidden")
      .optional()
      .isBoolean()
      .withMessage("Must be boolean.")
    // query("attributes.*").optional()
  ],
  itemController.getItems
);

// GET: Search suggestion
router.get("/suggest", [query("query").optional()], itemController.getSuggestions);

// GET: Item filter values
router.get("/filterValues", itemController.getItemFilterValues);

// GET: Product detail
router.get(
  "/:itemId",
  [
    query("silent")
      .optional()
      .isBoolean()
      .withMessage("Must be boolean."),
    query("keepAttr")
      .optional()
      .isBoolean()
      .withMessage("Must be boolean.")
  ],
  itemController.getItem
);

// POST: Add Item
router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  [
    check("id")
      .not()
      .isEmpty()
      .custom(value => !value.includes("."))
      .custom(value => !value.includes("/"))
      .escape()
      .withMessage("Must not include special characters."),
    check("id")
      .not()
      .matches(/^(suggest|filterValues)$/)
      .withMessage("Forbidden item ID")
  ],
  itemInfoChecks,
  itemController.addItem
);

// PUT: Update Item
router.put("/:itemId", isAuth, hasRole(["manager"]), itemInfoChecks, itemController.updateItem);

// PATCH: Hide Item
router.patch(
  "/:itemId/hidden",
  isAuth,
  hasRole(["manager"]),
  [
    check("hidden")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("hidden")
      .isBoolean()
      .withMessage("Must be boolean.")
  ],
  itemController.hideItem
);

// DELETE: Delete Item
router.delete("/:itemId", isAuth, hasRole(["manager"]), itemController.deleteItem);

module.exports = router;
