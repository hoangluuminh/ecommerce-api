const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const typeController = require("../controllers/type.controller");

const typeInfoChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("description").optional()
];

// GET: List of types
router.get("/", typeController.getTypes);

// GET: Type detail
router.get("/:typeId", typeController.getType);

// POST: Add Type
router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  typeInfoChecks,
  [
    check("id")
      .not()
      .isEmpty()
      .custom(value => !value.includes("."))
      .custom(value => !value.includes("/"))
      .escape()
      .withMessage("Must not include special characters.")
  ],
  typeController.addType
);

// PUT: Update Type
router.put("/:typeId", isAuth, hasRole(["manager"]), typeInfoChecks, typeController.updateType);

// PATCH: Swap Types
router.patch(
  "/:type1Id/swap",
  isAuth,
  hasRole(["manager"]),
  [
    check("type2Id")
      .not()
      .isEmpty()
      .withMessage("Required.")
  ],
  typeController.swapTypes
);

// DELETE: Delete Type
router.delete("/:typeId", isAuth, hasRole(["manager"]), typeController.deleteType);

module.exports = router;
