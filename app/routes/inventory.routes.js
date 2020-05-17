const express = require("express");

const router = express.Router();
const { check, query } = require("express-validator");

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
    check("itemId")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("variationId")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("identifiers")
      .isArray({ min: 1 })
      .withMessage("At least 1 identifier is required."),
    check("identifiers")
      .custom(value => {
        if (!value || !Array.isArray(value)) {
          return true;
        }
        const checkArr = value.filter(v => !v.includes(".") && !v.includes("/"));
        return checkArr.length === value.length;
      })
      .withMessage("All identifiers must have no special characters.")
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
