const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const makerController = require("../controllers/maker.controller");

const makerInfoChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("description").optional()
];

// GET: List of makers
router.get("/", makerController.getMakers);

// GET: Maker detail
router.get("/:makerId", makerController.getMaker);

// POST: Add Maker
router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  makerInfoChecks,
  [
    check("id")
      .not()
      .isEmpty()
      .custom(value => !value.includes("."))
      .custom(value => !value.includes("/"))
      .escape()
      .withMessage("Must not include special characters.")
  ],
  makerController.addMaker
);

// PUT: Update Maker
router.put("/:makerId", isAuth, hasRole(["manager"]), makerInfoChecks, makerController.updateMaker);

// PATCH: Swap Makers
router.patch(
  "/:maker1Id/swap",
  isAuth,
  hasRole(["manager"]),
  [
    check("maker2Id")
      .not()
      .isEmpty()
      .withMessage("Required.")
  ],
  makerController.swapMakers
);

// DELETE: Delete Maker
router.delete("/:makerId", isAuth, hasRole(["manager"]), makerController.deleteMaker);

module.exports = router;
