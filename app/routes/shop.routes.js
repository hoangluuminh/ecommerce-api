const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const shopController = require("../controllers/shop.controller");

const shopInfoChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("locationLng")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("locationLat")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("address")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("phone")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("description").optional()
];

// GET: Shop Info
router.get("/", shopController.getShop);

// PUT: Update Shop Info
router.put("/", isAuth, hasRole(["manager"]), shopInfoChecks, shopController.updateShop);

module.exports = router;
