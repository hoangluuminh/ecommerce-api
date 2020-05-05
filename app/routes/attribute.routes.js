const express = require("express");

const router = express.Router();
const { check, query } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const attributeController = require("../controllers/attribute.controller");

const attributeInfoChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("description").optional()
];

// GET: List of attributes
router.get("/", attributeController.getAttributes);

// GET: Attribute detail
router.get("/:attributeId", attributeController.getAttribute);

// POST: Add Attribute
router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  attributeInfoChecks,
  [
    check("id")
      .not()
      .isEmpty()
      .custom(value => !value.includes("."))
      .custom(value => !value.includes("/"))
      .escape()
      .withMessage("Must not include special characters."),
    check("valueType")
      .isIn(["static", "dynamic"])
      .withMessage("Must be either static or dynamic.")
  ],
  attributeController.addAttribute
);

// PUT: Update Attribute
router.put(
  "/:attributeId",
  isAuth,
  hasRole(["manager"]),
  attributeInfoChecks,
  attributeController.updateAttribute
);

// PATCH: Swap Attributes
router.patch(
  "/:attribute1Id/swap",
  isAuth,
  hasRole(["manager"]),
  [
    check("attribute2Id")
      .not()
      .isEmpty()
      .withMessage("Required.")
  ],
  attributeController.swapAttributes
);

// DELETE: Delete Attribute
router.delete("/:attributeId", isAuth, hasRole(["manager"]), attributeController.deleteAttribute);

module.exports = router;
