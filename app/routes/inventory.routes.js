const express = require("express");

const router = express.Router();
const { check, query } = require("express-validator");
const { isInt } = require("validator");
const _ = require("lodash");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const inventoryController = require("../controllers/inventory.controller");

// GET: List of inventories
router.get(
  "/",
  isAuth,
  hasRole(["manager", "merchandiser"]),
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
      .matches(/^(id|itemId|variationId|available|bought|createdAt|updatedAt)$/)
      .withMessage("value is not valid"),
    query("sortDesc").toBoolean(),
    query("itemId").optional()
  ],
  inventoryController.getInventories
);

// GET: Inventory detail
router.get("/:inventoryId", isAuth, hasRole(["manager"]), inventoryController.getInventory);

// POST: Add Inventories
router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  [
    check("inventories")
      .isArray({ min: 1 })
      .withMessage("At least 1 row of item is required."),
    check("inventories")
      .custom(value => {
        if (!value || !Array.isArray(value)) {
          return false;
        }
        for (let i = 0; i < value.length; i += 1) {
          if (
            !["itemId", "variationName", "quantity"].every(v => Object.keys(value[i]).includes(v))
          ) {
            return false;
          }
        }
        return true;
      })
      .withMessage("All item must include itemId, variationName and quantity."),
    check("inventories")
      .custom(value => {
        for (let i = 0; i < value.length; i += 1) {
          if (!(isInt(value[i].quantity.toString()) && value[i].quantity >= 1)) {
            return false;
          }
        }
        return true;
      })
      .withMessage("Quantity must be a number and >= 1."),
    check("inventories")
      .custom(value => {
        const uniqInvs = _.uniqWith(
          value.map(inv => ({
            itemId: inv.itemId,
            variationName: inv.variationName
          })),
          _.isEqual
        );
        return uniqInvs.length === value.length;
      })
      .withMessage("Pair of itemId and variationName must be unique.")
  ],
  inventoryController.addInventories
);

// PUT: Update Inventory
router.put(
  "/:inventoryId",
  isAuth,
  hasRole(["manager"]),
  [
    check("variationId")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("available")
      .isBoolean()
      .withMessage("Must be boolean.")
  ],
  inventoryController.updateInventory
);

module.exports = router;
