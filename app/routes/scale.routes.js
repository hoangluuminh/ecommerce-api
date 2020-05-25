const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const scaleController = require("../controllers/scale.controller");

const scaleInfoChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("description").optional()
];

// GET: List of scales
router.get("/", scaleController.getScales);

// GET: Scale detail
router.get("/:scaleId", scaleController.getScale);

// POST: Add Scale
router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  scaleInfoChecks,
  [
    check("id")
      .not()
      .isEmpty()
      .custom(value => !value.includes("."))
      .custom(value => !value.includes("/"))
      .escape()
      .withMessage("Must not include special characters.")
  ],
  scaleController.addScale
);

// PUT: Update Scale
router.put("/:scaleId", isAuth, hasRole(["manager"]), scaleInfoChecks, scaleController.updateScale);

// PATCH: Swap Scales
router.patch(
  "/:scale1Id/swap",
  isAuth,
  hasRole(["manager"]),
  [
    check("scale2Id")
      .not()
      .isEmpty()
      .withMessage("Required.")
  ],
  scaleController.swapScales
);

// DELETE: Delete Scale
router.delete("/:scaleId", isAuth, hasRole(["manager"]), scaleController.deleteScale);

module.exports = router;
