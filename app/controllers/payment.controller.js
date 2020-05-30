const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const paymentService = require("../services/payment.service");

const controllerName = "[payment.controller]";

// GET: Start Payment (Retrieve ClientSecret)
exports.startPayment = async (req, res, next) => {
  const actionName = "startPayment";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId } = req.jwtDecoded.data;
  const { billingDetails, loan, cart } = req.body;
  // Executions
  try {
    const clientSecret = await paymentService.startPayment(
      accountUserId,
      billingDetails,
      loan,
      cart
    );
    return res.json({ client_secret: clientSecret });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.INVALID.ACCOUNTUSER[0],
        ERRORS.INVALID.ITEM[0],
        ERRORS.INVALID.ITEMVARIATION[0],
        ERRORS.MISC.ORDER_EXCEEDDOWNPAYMENT[0],
        ERRORS.MISC.ORDER_CARTVARIATION[0],
        ERRORS.MISC.ORDER_QUANTITY[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.PAYMENT));
  }
};

// GET: Get Payment's constant values (LoanTerms, APR)
exports.getPaymentConsts = async (req, res, next) => {
  const actionName = "getPaymentConsts";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    const paymentConsts = await paymentService.getPaymentConsts();
    return res.json({ paymentConsts });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Calculate Loan (Financed Amount, Loan Payment)
exports.performLoanCalculate = async (req, res, next) => {
  const actionName = "performLoanCalculate";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { price, downPayment, loanTerm } = req.body;
  // Executions
  try {
    const { financedAmount, loanPayment } = await paymentService.performLoanCalculate(
      price,
      downPayment,
      loanTerm
    );
    return res.json({ financedAmount, loanPayment });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Webhook
exports.webhookControl = async (req, res) => {
  const actionName = "webhookControl";
  // Declarations
  let event;
  let paymentIntent;
  let paymentMethod;
  let charge;

  // Executions
  try {
    event = req.body;
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        paymentIntent = event.data.object;
        console.log("PaymentIntent was successful!", paymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        paymentIntent = event.data.object;
        console.log("Payment Failed, proceed cancelling payment", paymentIntent);
        await paymentService.rejectPayment(paymentIntent.id);
        break;
      }
      case "payment_method.attached": {
        paymentMethod = event.data.object;
        console.log("PaymentMethod was attached to a Customer!", paymentMethod);
        break;
      }
      case "charge.succeeded": {
        charge = event.data.object;
        console.log("Charge successful!", charge);
        await paymentService.chargedPayment(charge.payment_intent);
        break;
      }
      // ... handle other event types
      default: {
        // Unexpected event type
        return res.status(400).end();
      }
    }
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return res.status(400).end();
  }

  // Return a 200 response to acknowledge receipt of the event
  return res.json({ received: true });
};
