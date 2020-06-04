const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const { isAuth } = require("../middlewares/auth.middleware");
const cartController = require("../controllers/cart.controller");

const cartListChecks = [
  check("cart")
    .custom(value => {
      if (!value || !Array.isArray(value)) {
        return false;
      }
      for (let i = 0; i < value.length; i += 1) {
        if (!["itemId", "variationId", "quantity"].every(v => Object.keys(value[i]).includes(v))) {
          return false;
        }
      }
      return true;
    })
    .withMessage("All cart item must include item, variation and quantity.")
];

const cartItemChecks = [
  check("itemId")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("variationId")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("quantity")
    .custom(value => value > 0)
    .isNumeric({ no_symbols: true })
    .toInt()
    .withMessage("must be a number")
];

// GET: User's cart details
router.get("/me", isAuth, cartController.getMeCartDetails);

// POST: Cart details from localStorage cart list
router.post("/localList", cartListChecks, cartController.getLocalCartDetails);

// POST: Sync localStorage's cart with user's cart from Redis
router.post("/sync", isAuth, cartListChecks, cartController.performSyncCart);

// POST: Add item to cart
router.post("/add", isAuth, cartItemChecks, cartController.addItemToCart);
router.post("/add-local", cartItemChecks, cartListChecks, cartController.addItemToCart);

// PATCH: Update quantity of item in cart
router.patch("/quantity", isAuth, cartItemChecks, cartController.updateItemCartQuantity);
router.patch(
  "/quantity-local",
  cartItemChecks,
  cartListChecks,
  cartController.updateItemCartQuantity
);

// DELETE: Remove item out of cart
router.delete(
  "/remove",
  isAuth,
  [
    check("itemId")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("variationId")
      .not()
      .isEmpty()
      .withMessage("Required.")
  ],
  cartController.deleteItemFromCart
);

// DELETE: Clear user's cart
router.delete("/clear", isAuth, cartController.clearMeCart);

module.exports = router;
