const db = require("../models");

const { Op, fn, col } = db.Sequelize;
const {
  order: Order,
  orderDetail: OrderDetail,
  orderPayment: OrderPayment,
  paymentMethod: PaymentMethod,
  item: Item,
  account: Account,
  itemVariation: ItemVariation,
  accountUser: AccountUser,
  accountStaff: AccountStaff,
  orderStatus: OrderStatus,
  promotionItem: PromotionItem,
  promotion: Promotion,
  inventory: Inventory
} = db;

const { getItemFinalization } = require("./item.service");
const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");
const generateId = require("../utils/id.utils");
const { paymentConsts } = require("../configs/business.config");
const { loanCalculate, maxDownPayment } = require("../utils/payment.utils");

// GET: List of orders
exports.getOrders = async (query, page, size, sort, sortDesc, userId, verifier, statusId) => {
  // Declarations
  let orders = [["id", sortDesc ? "DESC" : "ASC"]];
  switch (sort) {
    default: {
      orders = [["createdAt", sortDesc ? "DESC" : "ASC"]];
      break;
    }
    case "id":
    case "userId":
    case "verifier":
    case "statusId":
    case "totalPrice":
    case "createdAt":
    case "updatedAt": {
      orders = [[sort, sortDesc ? "DESC" : "ASC"]];
      break;
    }
  }
  const includes = [
    {
      model: AccountUser,
      as: "Customer",
      include: [{ model: Account, as: "Account", attributes: ["username", "email"] }]
    },
    {
      model: AccountStaff,
      as: "Verifier",
      include: [{ model: Account, as: "Account", attributes: ["username", "email"] }]
    },
    {
      model: OrderStatus,
      as: "Status",
      required: true
    }
  ];
  const conditions = {
    [Op.and]: [
      {
        [Op.or]: {
          id: { [Op.substring]: query },
          userId: { [Op.substring]: query },
          verifier: { [Op.substring]: query },
          "$Customer.Account.username$": { [Op.substring]: query },
          "$Customer.Account.email$": { [Op.substring]: query },
          "$Verifier.Account.username$": { [Op.substring]: query },
          "$Verifier.Account.email$": { [Op.substring]: query }
        }
      },
      // userId
      { userId: userId || db.sequelize.literal("1=1") },
      // verifier
      { verifier: verifier || db.sequelize.literal("1=1") },
      // statusId
      { statusId: statusId || db.sequelize.literal("1=1") }
    ]
  };
  // Executions
  const { rows: ordersList, count } = await Order.findAndCountAll({
    include: includes,
    offset: (page - 1) * size,
    limit: size,
    where: conditions,
    distinct: true,
    order: orders
  });
  return { orders: ordersList, count };
};

// GET: Order detail
exports.getOrder = async orderId => {
  // Executions
  const includes = [
    {
      model: OrderDetail,
      as: "Items"
    },
    {
      model: AccountUser,
      as: "Customer",
      required: true
    },
    {
      model: AccountStaff,
      as: "Verifier"
    },
    {
      model: OrderStatus,
      as: "Status",
      required: true
    },
    {
      model: OrderDetail,
      as: "Items"
    },
    {
      model: OrderPayment,
      as: "OrderPayments",
      include: [{ model: PaymentMethod, as: "paymentMethod" }]
    }
  ];
  const order = await Order.findOne({
    include: includes,
    where: { id: orderId }
  });
  if (!order) {
    throw new HttpError(...ERRORS.INVALID.ORDER);
  }
  return order;
};

// GET: My orders list
exports.getMeOrders = async accountUserId => {
  // Executions
  const includes = [
    {
      model: OrderDetail,
      as: "Items"
    },
    {
      model: OrderStatus,
      as: "Status",
      required: true
    }
  ];
  const { rows: orders, count } = await Order.findAndCountAll({
    include: includes,
    where: { userId: accountUserId, statusId: { [Op.ne]: "rejected" } },
    distinct: true,
    order: [["createdAt", "DESC"]]
  });
  return { orders, count };
};

// GET: Detailed info of My Order
exports.getMeOrder = async (accountUserId, orderId) => {
  // Executions
  const includes = [
    {
      model: OrderDetail,
      as: "Items"
    },
    {
      model: OrderStatus,
      as: "Status",
      required: true
    },
    {
      model: OrderDetail,
      as: "Items"
    },
    {
      model: OrderPayment,
      as: "OrderPayments",
      include: [{ model: PaymentMethod, as: "paymentMethod" }]
    }
  ];
  const order = await Order.findOne({
    include: includes,
    where: { id: orderId, userId: accountUserId }
  });
  if (!order) {
    throw new HttpError(...ERRORS.INVALID.ORDER);
  }
  return order;
};

// GET: Order Statuses List
exports.getOrderStatuses = async () => {
  // Executions
  const { rows: orderStatuses, count } = await OrderStatus.findAndCountAll();
  return { orderStatuses, count };
};

// Add POS Order / Add Online Order
exports.addOrder = async (userId, billingDetails, loan, cart, options) => {
  const { orderId: _orderId, isPos } = options;
  // Validations
  const accountUser = await Account.findOne({
    include: [
      {
        model: AccountUser,
        as: "User",
        where: { id: userId },
        required: true
      }
    ]
  });
  if (!accountUser) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTUSER);
  }
  // Declarations
  let orderDetails;
  let totalPayment;
  let appliedPromotions;
  // eslint-disable-next-line
  try {
    const orderDetailsResult = await getOrderDetails(cart); // eslint-disable-line
    orderDetails = orderDetailsResult.orderDetails;
    totalPayment = orderDetailsResult.totalPayment;
    appliedPromotions = orderDetailsResult.appliedPromotions;
  } catch (e) {
    throw e;
  }
  // Loan Validations
  if (loan) {
    const maxDP = maxDownPayment(totalPayment);
    if (loan.downPayment > maxDP) {
      throw new HttpError(...ERRORS.MISC.ORDER_EXCEEDDOWNPAYMENT);
    }
  }
  // Get Financed Amount
  if (loan) {
    const { financedAmount } = loanCalculate(
      totalPayment,
      parseInt(loan.downPayment, 10),
      parseInt(loan.loanTerm, 10),
      paymentConsts.APR
    );
    totalPayment = financedAmount + parseInt(loan.downPayment, 10);
  }
  // Executions
  const orderId = _orderId || generateId({ isOrderId: true });
  db.sequelize.transaction(async t => {
    await Order.create(
      {
        id: orderId,
        userId,
        statusId: isPos ? "ordered" : "processing",
        totalPrice: totalPayment,
        appliedPromotion: appliedPromotions || null,
        // LOAN
        downPayment: loan ? loan.downPayment : undefined,
        loanTerm: loan ? parseInt(loan.loanTerm, 10) : undefined,
        apr: loan ? paymentConsts.APR : undefined,
        // PAYEE
        payee_lastName: billingDetails.lastName,
        payee_firstName: billingDetails.firstName,
        payee_email: billingDetails.email,
        payee_phone: billingDetails.phone
      },
      { transaction: t }
    );
    await OrderDetail.bulkCreate(
      orderDetails.map(orderDetail => ({
        orderId,
        item_id: orderDetail.id,
        item_variationId: cart.find(cItem => cItem.itemId === orderDetail.id).variationId,
        item_name: orderDetail.name,
        item_price: orderDetail.dataValues.priceSale,
        item_quantity: cart.find(cItem => cItem.itemId === orderDetail.id).quantity
      })),
      { transaction: t }
    );
    await OrderPayment.create(
      {
        orderId,
        paymentMethodId: isPos ? "cash" : "cc", // at POS, only accepts Cash unless prompted to pay with webapp
        paymentAmount: loan ? loan.downPayment : totalPayment,
        isPaid: !!isPos, // automatically PAID if created at POS, otherwise, wait for Stripe
        due: new Date(Date.now())
      },
      { transaction: t }
    );
  });

  return { orderDetails, totalPayment, appliedPromotions };
};

// PATCH: Verify Order (select inventory item)
exports.verifyOrder = async (orderId, orderDetails, verifier) => {
  // Validations
  const checkingOrder = await Order.findOne({ where: { id: orderId } });
  if (!checkingOrder) {
    throw new HttpError(...ERRORS.INVALID.ORDER);
  }
  if (checkingOrder.statusId !== "ordered") {
    throw new HttpError(...ERRORS.MISC.ORDER_FORBIDDEN);
  }
  const accountStaff = await Account.findOne({
    include: [
      {
        model: AccountStaff,
        as: "Staff",
        where: { id: verifier },
        required: true
      }
    ]
  });
  if (!accountStaff) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTUSER);
  }
  /* variationId check */
  const checkingOrderDetails = await OrderDetail.findAll({
    where: {
      orderId,
      [Op.or]: orderDetails.map(oD => ({
        item_variationId: oD.variationId
      }))
    }
  });
  if (checkingOrderDetails.length !== orderDetails.length) {
    throw new HttpError(...ERRORS.MISC.ORDERDETAIL_MISMATCH);
  }
  /* inventoryId check */
  const seqVariations = await ItemVariation.findAll({
    include: [
      {
        model: Inventory,
        as: "Inventory"
      }
    ],
    where: {
      [Op.or]: orderDetails.map(oD => ({
        id: oD.variationId
      }))
    }
  });
  for (let i = 0; i < orderDetails.length; i += 1) {
    const checkingInventoryItems = seqVariations.find(
      varia => varia.id === orderDetails[i].variationId
    ).Inventory;
    if (!checkingInventoryItems.map(inv => inv.id).includes(orderDetails[i].inventoryId)) {
      throw new HttpError(...ERRORS.MISC.INVENTORY_INCORRECTVARIATION);
    }
    const inventoryDetail = checkingInventoryItems.find(
      inv => inv.id === orderDetails[i].inventoryId
    );
    if (inventoryDetail.available === false || inventoryDetail.bought === true) {
      throw new HttpError(...ERRORS.MISC.INVENTORY_UNAVAILABLE);
    }
  }
  // Executions
  db.sequelize.transaction(async t => {
    await Order.update({ verifier, statusId: "verified" }, { where: { id: orderId } });
    for (let i = 0; i < orderDetails.length; i += 1) {
      // eslint-disable-next-line
      await OrderDetail.update(
        {
          item_inventoryId: orderDetails[i].inventoryId
        },
        {
          where: {
            orderId,
            item_variationId: orderDetails[i].variationId
          }
        },
        { transaction: t }
      );
      // eslint-disable-next-line
      await Inventory.update({ bought: true }, { where: { id: orderDetails[i].inventoryId } });
    }
  });
};

// PATCH: Updating Order's status to "Delivered"
exports.completeOrder = async orderId => {
  // Validations
  const checkingOrder = await Order.findOne({ where: { id: orderId } });
  if (!checkingOrder) {
    throw new HttpError(...ERRORS.INVALID.ORDER);
  }
  if (checkingOrder.statusId !== "verified") {
    throw new HttpError(...ERRORS.MISC.ORDER_FORBIDDEN);
  }
  // Executions
  const orderDetails = await OrderDetail.findAll({ where: { orderId } });
  db.sequelize.transaction(async t => {
    await Order.update({ statusId: "delivered" }, { where: { id: orderId } }, { transaction: t });
    for (let i = 0; i < orderDetails.length; i += 1) {
      // eslint-disable-next-line
      await Inventory.update(
        { available: false },
        { where: { id: orderDetails[i].item_inventoryId } },
        { transaction: t }
      );
    }
  });
};

// PATCH: Cancel Order
exports.cancelOrder = async orderId => {
  // Validations
  const checkingOrder = await Order.findOne({ where: { id: orderId } });
  if (!checkingOrder) {
    throw new HttpError(...ERRORS.INVALID.ORDER);
  }
  if (checkingOrder.statusId !== "ordered") {
    throw new HttpError(...ERRORS.MISC.ORDER_FORBIDDEN);
  }
  // Executions
  await Order.update({ statusId: "canceled" }, { where: { id: orderId } });
};

/* ---------- */
/* ULTILITIES */
const getOrderDetails = async cart => {
  const seqCartItemsDetail = await Item.findAll({
    include: [
      {
        model: PromotionItem,
        as: "PromotionItems",
        include: { model: Promotion, as: "Promotion" }
      },
      {
        model: ItemVariation,
        as: "Variations",
        include: { model: Inventory, as: "Inventory" },
        required: true,
        attributes: ["id", "name", "colors", "placing"]
      },
      {
        model: Inventory,
        as: "Inventory"
      }
    ],
    where: {
      [Op.or]: cart.map(i => ({
        id: i.itemId
      }))
    }
  });
  if (seqCartItemsDetail.length < 1 || seqCartItemsDetail.length !== cart.length) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  // "Finalizing" items
  let cartItemsDetail = seqCartItemsDetail;
  cartItemsDetail = cartItemsDetail.map(item => {
    return getItemFinalization(item, null, null, true); // eslint-disable-line
  });
  // Check quantity (based on specified variationId)
  for (let i = 0; i < cartItemsDetail.length; i += 1) {
    const checkingCartItem = cart.find(cartItem => cartItem.itemId === cartItemsDetail[i].id);
    const checkingVariation = cartItemsDetail[i].Variations.find(
      varia => varia.id === checkingCartItem.variationId
    );
    if (!checkingVariation) {
      throw new HttpError(...ERRORS.MISC.ORDER_CARTVARIATION);
    }
    if (checkingVariation.dataValues.inventorySize < checkingCartItem.quantity) {
      throw new HttpError(...ERRORS.MISC.ORDER_QUANTITY);
    }
  }

  // Calculate total payment
  const totalPayment = cartItemsDetail.reduce((finalVal, o) => {
    return finalVal + o.dataValues.priceSale * cart.find(i => i.itemId === o.id).quantity;
  }, 0);

  // get appliedPromotions
  const appliedPromotions = cartItemsDetail
    .filter(i => !!i.dataValues.AppliedPromotion)
    .map(i => i.dataValues.AppliedPromotion.id)
    .join(",");

  return { orderDetails: cartItemsDetail, totalPayment, appliedPromotions };
};
exports.getOrderDetails = getOrderDetails;
