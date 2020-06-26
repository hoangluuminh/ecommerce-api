const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const brandController = require("../controllers/brand.controller");

const brandInfoChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("description").optional()
];

// GET: List of brands
router.get("/", brandController.getBrands);

// GET: Brand detail
router.get("/:brandId", brandController.getBrand);

// POST: Add Brand
router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  brandInfoChecks,
  [
    check("id")
      .not()
      .isEmpty()
      .custom(value => !value.includes("."))
      .custom(value => !value.includes("/"))
      .escape()
      .withMessage("Must not include special characters.")
  ],
  brandController.addBrand
);

// PUT: Update Brand
router.put("/:brandId", isAuth, hasRole(["manager"]), brandInfoChecks, brandController.updateBrand);

// PATCH: Swap Brands
router.patch(
  "/:brand1Id/swap",
  isAuth,
  hasRole(["manager"]),
  [
    check("brand2Id")
      .not()
      .isEmpty()
      .withMessage("Required.")
  ],
  brandController.swapBrands
);

// DELETE: Delete Brand
router.delete("/:brandId", isAuth, hasRole(["manager"]), brandController.deleteBrand);

module.exports = router;
