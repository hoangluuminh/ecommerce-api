const express = require("express");

const router = express.Router();
const { query } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const reportController = require("../controllers/report.controller");

// GET: Monthly Sales Report
router.get(
  "/monthly",
  isAuth,
  hasRole(["manager"]),
  [
    query("year")
      .isNumeric()
      .toInt()
      .withMessage("Must be a number.")
  ],
  reportController.getMonthlySalesReport
);

// GET: Product Sales Report
router.get(
  "/product",
  isAuth,
  hasRole(["manager"]),
  [
    query("timeStart")
      .isISO8601()
      .withMessage("Must be a date."),
    query("timeEnd")
      .isISO8601()
      .withMessage("Must be a date.")
  ],
  reportController.getProductSalesReport
);

// GET: Category Sales Report
router.get(
  "/category/:category",
  isAuth,
  hasRole(["manager"]),
  [
    query("timeStart")
      .isISO8601()
      .withMessage("Must be a date."),
    query("timeEnd")
      .isISO8601()
      .withMessage("Must be a date.")
  ],
  reportController.getCategorySalesReport
);

module.exports = router;
