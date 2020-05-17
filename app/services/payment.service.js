const db = require("../models");
const stripe = require("../configs/stripe.config");

const { order: Order, orderPayment: OrderPayment } = db;

const { addOrder } = require("./order.service");
const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");
const generateId = require("../utils/id.utils");
const { loanCalculate, currencyConvert } = require("../utils/payment.utils");
const { paymentConsts } = require("../configs/business.config");

// GET: Start Payment (Retrieve ClientSecret)
exports.startPayment = async (userId, billingDetails, loan, cart) => {
  const orderId = generateId(); // unique id (need no isOrderId) which will be changed after receiving paymentIntent from Stripe
  let totalPayment;
  // eslint-disable-next-line
  try {
    // Add order
    const result = await addOrder(userId, billingDetails, loan, cart, { orderId, isPos: false });
    totalPayment = result.totalPayment;
  } catch (e) {
    throw e;
  }
  try {
    const paymentAmount = loan ? loan.downPayment : totalPayment;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: currencyConvert(paymentAmount, 10), // TODO: TEMPORARY SOLUTION
      currency: "usd"
    });
    // Change orderId with paymentIntentId from Stripe
    await Order.update({ id: paymentIntent.id.split("_")[1] }, { where: { id: orderId } });
    return paymentIntent.client_secret;
  } catch (e) {
    throw new HttpError(...ERRORS.UNKNOWN.PAYMENT);
  }
};

exports.chargedPayment = async paymentIntentId => {
  const orderId = paymentIntentId.split("_")[1];
  db.sequelize.transaction(async t => {
    await Order.update({ statusId: "ordered" }, { where: { id: orderId } }, { transaction: t });
    await OrderPayment.update({ isPaid: true }, { where: { orderId } }, { transaction: t });
    // if isLoan: Create additional OrderPayment for first month
    const thisOrder = await Order.findOne({ where: { id: orderId } });
    const isLoan = !!thisOrder.downPayment && !!thisOrder.loanTerm && !!thisOrder.apr;
    if (isLoan) {
      const { loanPayment } = loanCalculate(
        thisOrder.totalPrice,
        thisOrder.downPayment,
        thisOrder.loanTerm,
        thisOrder.apr
      );
      const dueDate = new Date(Date.now());
      dueDate.setMonth(dueDate.getMonth() + 1);
      await OrderPayment.create(
        {
          orderId,
          paymentMethodId: "cc",
          paymentAmount: loanPayment,
          isPaid: false,
          due: dueDate
        },
        { transaction: t }
      );
    }
  });
};

exports.rejectPayment = async paymentIntentId => {
  const orderId = paymentIntentId.split("_")[1];
  await Order.update({ statusId: "rejected" }, { where: { id: orderId } });
  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
    return true;
  } catch (e) {
    throw new HttpError(...ERRORS.UNKNOWN.PAYMENT);
  }
};

exports.cancelPayment = async paymentIntentId => {
  const orderId = paymentIntentId.split("_")[1];
  await Order.update({ statusId: "canceled" }, { where: { id: orderId } });
  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
    return true;
  } catch (e) {
    throw new HttpError(...ERRORS.UNKNOWN.PAYMENT);
  }
};

// GET: Get Payment's constant values (LoanTerms, APR)
exports.getPaymentConsts = async () => {
  return {
    loanTerms: [48, 60, 72],
    apr: 2.99
  };
};

// POST: Calculate Loan (Financed Amount, Loan Payment)
exports.performLoanCalculate = async (price, downPayment, loanTerm) => {
  // price is "local state" of ui, different from totalPayment which is fetched from startPayment
  const { financedAmount, loanPayment } = loanCalculate(
    price,
    downPayment,
    loanTerm,
    paymentConsts.APR
  );
  return { financedAmount, loanPayment };
};
