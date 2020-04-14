const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth-middleware");
const brandController = require("../controllers/brand-controller");

const brandChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("is required")
  // check('superTH').not().isEmpty().withMessage('is required'),
];

router.get("/:brandId", brandController.getBrand);
router.get("/", brandController.getBrands);

router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  [
    check("id")
      .not()
      .isEmpty()
      .withMessage("is required")
  ],
  brandChecks,
  brandController.addBrand
);

router.put("/:brandId", isAuth, hasRole(["manager"]), brandChecks, brandController.updateBrand);

router.patch(
  "/swap",
  isAuth,
  hasRole(["manager"]),
  [
    check("brand1Id")
      .not()
      .isEmpty()
      .withMessage("is required"),
    check("brand2Id")
      .not()
      .isEmpty()
      .withMessage("is required")
  ],
  brandController.swapBrands
);

router.delete("/:brandId", isAuth, hasRole(["manager"]), brandController.deleteBrand);

module.exports = router;
