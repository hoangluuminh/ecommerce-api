const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const { check } = require("express-validator");

const router = express.Router();

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const paymentController = require("../controllers/payment.controller");

// POST: Start Payment (Retrieve ClientSecret)
router.post(
  "/start",
  isAuth,
  hasRole(["user"]),
  [
    check("billingDetails")
      .custom(value => {
        if (
          !["lastName", "firstName", "email", "phone"].every(v => Object.keys(value).includes(v))
        ) {
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
        if (!["downPayment", "loanTerm"].every(v => Object.keys(value).includes(v))) {
          return false;
        }
        return true;
      })
      .withMessage("Loan options must include downpayment, loan term"),
    check("cart")
      .isArray({ min: 1 })
      .withMessage("At least 1 item in cart is required."),
    check("cart")
      .custom(value => {
        if (!value || !Array.isArray(value)) {
          return true;
        }
        for (let i = 0; i < value.length; i += 1) {
          if (
            !["itemId", "variationId", "quantity"].every(v => Object.keys(value[i]).includes(v))
          ) {
            return false;
          }
        }
        return true;
      })
      .withMessage("All item must include itemId, variationId and quantity.")
  ],
  paymentController.startPayment
);

// GET: Get payment's constant values (LoanTerms, APR)
router.get("/consts", paymentController.getPaymentConsts);

// POST: Calculate Loan (Financed Amount, Loan Payment)
router.post(
  "/loanCal",
  [
    check("price")
      .isNumeric()
      .toInt()
      .withMessage("Must be a number."),
    check("downPayment")
      .isNumeric()
      .toInt()
      .withMessage("Must be a number."),
    check("loanTerm")
      .isNumeric()
      .toInt()
      .withMessage("Must be a number.")
  ],
  paymentController.performLoanCalculate
);

// POST: Webhook
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  paymentController.webhookControl
);

module.exports = router;
