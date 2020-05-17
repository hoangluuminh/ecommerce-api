const express = require("express");
const _ = require("lodash");

const router = express.Router();
const { check, query } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

const orderInfoChecks = [
  check("userId")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("billingDetails")
    .custom(value => {
      if (!_.isEqual(Object.keys(value), ["lastName", "firstName", "email", "phone"])) {
        return false;
      }
      return true;
    })
    .withMessage("Billing Details must include name, email, phone"),
  check("loan")
    .custom(value => {
      if (!value) {
        return true;
      }
      if (!_.isEqual(Object.keys(value), ["downPayment", "loanTerm"])) {
        return false;
      }
      return true;
    })
    .withMessage("Loan options must include downpayment, loan term"),
  check("cart")
    .isArray({ min: 1 })
    .withMessage("At least 1 item is required."),
  check("cart")
    .custom(value => {
      if (!value || !Array.isArray(value)) {
        return true;
      }
      for (let i = 0; i < value.length; i += 1) {
        if (!_.isEqual(Object.keys(value[i]), ["itemId", "variationId", "quantity"])) {
          return false;
        }
      }
      return true;
    })
    .withMessage("All item must include itemId, variationId and quantity.")
];

// GET: List of orders
router.get(
  "/",
  isAuth,
  hasRole(["merchandiser"]),
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
      .matches(/^(id|userId|verifier|statusId|totalPrice|createdAt|updatedAt)$/)
      .withMessage("value is not valid"),
    query("sortDesc").toBoolean(),
    //
    query("userId").optional(),
    query("verifier").optional(),
    query("statusId").optional()
  ],
  orderController.getOrders
);

// GET: My orders list
router.get("/me", isAuth, hasRole(["user"]), orderController.getMeOrders);

// GET: Detailed info of My Order
router.get("/me/:orderId", isAuth, hasRole(["user"]), orderController.getMeOrder);

// GET: Order Statuses List
router.get("/statuses", isAuth, orderController.getOrderStatuses);

// GET: Order detail
router.get("/:orderId", orderController.getOrder);

// POST: Add POS Order
router.post("/", isAuth, hasRole(["merchandiser"]), orderInfoChecks, orderController.addPosOrder);

// PATCH: Verify Order (select inventory item)
router.patch(
  "/:orderId/verify",
  isAuth,
  hasRole(["merchandiser"]),
  [
    check("orderDetails")
      .isArray({ min: 1 })
      .withMessage("At least 1 item is required."),
    check("orderDetails")
      .custom(value => {
        if (!value || !Array.isArray(value)) {
          return true;
        }
        for (let i = 0; i < value.length; i += 1) {
          if (!_.isEqual(Object.keys(value[i]), ["variationId", "inventoryId"])) {
            return false;
          }
        }
        return true;
      })
      .withMessage("All item must include variationId and inventoryId.")
  ],
  orderController.verifyOrder
);

// PATCH: Updating Order's status to "Delivered"
router.patch(
  "/:orderId/complete",
  isAuth,
  hasRole(["merchandiser"]),
  orderController.completeOrder
);

// PATCH: Cancel Order
router.patch("/:orderId/cancel", isAuth, hasRole(["merchandiser"]), orderController.cancelOrder);

module.exports = router;
