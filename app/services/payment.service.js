const db = require("../models");
const stripe = require("../configs/stripe.config");

const { order: Order, orderPayment: OrderPayment } = db;

const orderService = require("./order.service");
const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");
const generateId = require("../utils/id.utils");
const { loanCalculate } = require("../utils/payment.utils");
const { paymentConsts } = require("../configs/business.config");

// GET: Start Payment (Retrieve ClientSecret)
exports.startPayment = async (userId, billingDetails, loan, cart) => {
  const orderId = generateId();
  let totalPayment;
  // eslint-disable-next-line
  try {
    // Add order
    const result = await orderService.addOrder(userId, billingDetails, loan, cart, {
      orderId,
      isPos: false
    });
    totalPayment = result.totalPayment;
    // Cart Validation
    await orderService.assignInventoryItemsToOrderDetails(orderId, { validateOnly: true });
  } catch (e) {
    throw e;
  }
  try {
    const paymentAmount = loan ? loan.downPayment : totalPayment;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(paymentAmount, 10),
      currency: "vnd"
    });
    // Change orderId with paymentIntentId from Stripe
    await Order.update({ paymentIntentId: paymentIntent.id }, { where: { id: orderId } });
    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  } catch (e) {
    throw new HttpError(...ERRORS.UNKNOWN.PAYMENT);
  }
};

// DELETE: Terminate Order (Invalid Card Number, ...)
exports.terminateOrder = async (userId, paymentIntentId) => {
  await Order.destroy({ where: { paymentIntentId, userId, statusId: "processing" } });
  return true;
};

exports.chargedPayment = async paymentIntentId => {
  const order = await Order.findOne({ where: { paymentIntentId } });
  /* STEP 1: Assign Inventory Items to OrderDetails */
  await orderService.assignInventoryItemsToOrderDetails(order.id);
  /* STEP 2: Update Order's status and OrderPayment */
  db.sequelize.transaction(async t => {
    await Order.update({ statusId: "ordered" }, { where: { paymentIntentId } }, { transaction: t });
    await OrderPayment.update(
      { isPaid: true },
      { where: { orderId: order.id } },
      { transaction: t }
    );
    // if isLoan: Create additional OrderPayment for first month
    const thisOrder = await Order.findOne({ where: { id: order.id } });
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
          orderId: order.id,
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
  await Order.update({ statusId: "rejected" }, { where: { paymentIntentId } });
  // const order = Order.findOne({ where: { paymentIntentId } });
  try {
    // await cancelOrder(order.id);
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
