const _ = require("lodash");

const db = require("../models");

const { Op } = db.Sequelize;
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

// Add Cod Order / Add Online Order
exports.addOrder = async (userId, billingDetails, loan, cart, options) => {
  const { orderId: _orderId, isCod, isPos } = options;
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
    orderDetails = orderDetailsResult.orderDetails; // is ItemVariation
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
  const orderId = _orderId || generateId();
  await db.sequelize.transaction(async t => {
    await Order.create(
      {
        id: orderId,
        userId,
        statusId: isCod || isPos ? "ordered" : "processing",
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
        payee_phone: billingDetails.phone,
        payee_address: billingDetails.address
      },
      { transaction: t }
    );
    await OrderDetail.bulkCreate(
      orderDetails
        .reduce((newOrderDetails, oD) => {
          // Split by quantity
          const cartItemQuantity = cart.find(i => i.variationId === oD.dataValues.id).quantity;
          for (let i = 0; i < cartItemQuantity; i += 1) {
            newOrderDetails.push(oD);
          }
          return newOrderDetails;
        }, [])
        .map(orderDetail => ({
          orderId,
          item_id: orderDetail.Item.id,
          item_variationId: orderDetail.dataValues.id,
          item_name: `${orderDetail.Item.name} (${
            // Get variation name from Item.Variations based on cart
            orderDetail.Item.Variations.find(
              varia =>
                varia.id ===
                cart.find(cI => cI.variationId === orderDetail.dataValues.id).variationId
            ).name
          })`,
          item_price: orderDetail.Item.dataValues.priceSale
        })),
      { transaction: t }
    );
    await OrderPayment.create(
      // at POS, only accepts Cash unless prompted to pay with webapp
      {
        orderId,
        paymentMethodId: isCod || isPos ? "cash" : "cc",
        paymentAmount: loan ? loan.downPayment : totalPayment,
        isPaid: !!isPos, // automatically PAID if created at POS, otherwise, wait for Stripe (if online) or wait for completeOrder (COD)
        due: new Date(Date.now())
      },
      { transaction: t }
    );
  });

  /* execute assignInventoryItemsToOrderDetails */

  return { orderId, orderDetails, totalPayment, appliedPromotions };
};

// Assigning Inventory Items to OrderDetails of Order
const assignInventoryItemsToOrderDetails = async (orderId, options) => {
  // CONTINUATION OF addOrder
  /* STEP 1: Get orDeWithInventoryIds, explained down below */
  // Validations
  const order = await Order.findOne({
    include: [
      {
        model: OrderDetail,
        as: "Items"
      }
    ],
    where: { id: orderId }
  });
  if (!order) {
    throw new HttpError(...ERRORS.INVALID.ORDER);
  }
  const orderDetails = order.Items;
  // Executions
  // Get list of Inventory items containing variationId of orderDetails
  const inventoryItems = await Inventory.findAll({
    where: {
      available: true,
      bought: false,
      [Op.or]: orderDetails.map(orderDetail => ({
        [Op.and]: {
          itemId: orderDetail.item_id,
          variationId: orderDetail.item_variationId
        }
      }))
    }
  });
  // Get list of Inventory items GROUPED BY variationId (hashing)
  const invItemsGroupedByVaria = inventoryItems.reduce((_groupeds, inv) => {
    const groupeds = { ..._groupeds };
    // Get existing hash based on variationId
    let grouped = groupeds[inv.variationId];
    if (!grouped) {
      // If hash of this variationId has not been created at, create it
      groupeds[inv.variationId] = [];
      // Reassigning
      grouped = groupeds[inv.variationId];
    }
    // Add new inventoryId into hash
    grouped.push(inv.id);
    return groupeds;
    // [{[inv.variationId]: ["INVENTORYID1", "INVENTORYID2"]}, ...]
  }, {});
  // Create new array of ["id", "inventoryId"] called "Order Details with inventoryId attached"
  const orDeWithInventoryIds = orderDetails.map(orderDetail => ({
    id: orderDetail.id,
    // Get inventoryIds list based on hash of self variationId, then pop from the array of hash
    inventoryId: invItemsGroupedByVaria[orderDetail.item_variationId].pop()
  }));
  /* STEP 2: Assigning inventoryItems to OrderDetails */
  // Validations
  const checkingOrder = await Order.findOne({ where: { id: orderId } });
  if (!checkingOrder) {
    throw new HttpError(...ERRORS.INVALID.ORDER);
  }
  if (
    _.uniq(orDeWithInventoryIds.map(oD => oD.inventoryId)).length !== orDeWithInventoryIds.length
  ) {
    throw new HttpError(...ERRORS.DUPLICATE.INVENTORY);
  }
  /* orderDetail id check */
  const fetchedOrderDetails = await OrderDetail.findAll({
    where: {
      orderId,
      [Op.or]: orDeWithInventoryIds.map(oD => ({ id: oD.id }))
    }
  });
  if (fetchedOrderDetails.length !== orDeWithInventoryIds.length) {
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
      [Op.or]: fetchedOrderDetails.map(oD => ({
        id: oD.item_variationId
      }))
    }
  });
  for (let i = 0; i < orDeWithInventoryIds.length; i += 1) {
    const fetchedOrderDetail = fetchedOrderDetails.find(oD => oD.id === orDeWithInventoryIds[i].id);
    const checkingInventoryItems = seqVariations.find(
      varia => varia.id === fetchedOrderDetail.item_variationId
    ).Inventory;
    if (!checkingInventoryItems.map(inv => inv.id).includes(orDeWithInventoryIds[i].inventoryId)) {
      throw new HttpError(...ERRORS.MISC.INVENTORY_INCORRECTVARIATION);
    }
    const inventoryDetail = checkingInventoryItems.find(
      inv => inv.id === orDeWithInventoryIds[i].inventoryId
    );
    if (inventoryDetail.available === false || inventoryDetail.bought === true) {
      throw new HttpError(...ERRORS.MISC.INVENTORY_UNAVAILABLE);
    }
  }
  // Executions (ONLY WITH options.validateOnly == false)
  if (options && options.validateOnly === true) {
    return true;
  }
  db.sequelize.transaction(async t => {
    // await Order.update({ verifier, statusId: "verified" }, { where: { id: orderId } });
    for (let i = 0; i < orDeWithInventoryIds.length; i += 1) {
      // eslint-disable-next-line
      await OrderDetail.update(
        {
          item_inventoryId: orDeWithInventoryIds[i].inventoryId
        },
        {
          where: {
            id: orDeWithInventoryIds[i].id,
            orderId
          }
        },
        { transaction: t }
      );
      // eslint-disable-next-line
      await Inventory.update(
        { bought: true },
        { where: { id: orDeWithInventoryIds[i].inventoryId } }
      );
    }
  });
  return true;
};
exports.assignInventoryItemsToOrderDetails = assignInventoryItemsToOrderDetails;

// PATCH: Updating Order's status to "Verified"
exports.verifyOrder = async (orderId, accountStaffId) => {
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
        where: { id: accountStaffId },
        required: true
      }
    ]
  });
  if (!accountStaff) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTSTAFF);
  }
  // Executions
  await db.sequelize.transaction(async t => {
    await Order.update(
      { statusId: "verified", verifier: accountStaffId },
      { where: { id: orderId } },
      { transaction: t }
    );
  });
  return true;
};

// PATCH: Updating Order's status to "Delivering"
exports.startDeliverOrder = async orderId => {
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
  await db.sequelize.transaction(async t => {
    await Order.update({ statusId: "delivering" }, { where: { id: orderId } }, { transaction: t });
    for (let i = 0; i < orderDetails.length; i += 1) {
      // eslint-disable-next-line
      await Inventory.update(
        { available: false },
        { where: { id: orderDetails[i].item_inventoryId } },
        { transaction: t }
      );
    }
  });
  return true;
};

// PATCH: Updating Order's status to "Delivered"
exports.completeOrder = async orderId => {
  // Validations
  const checkingOrder = await Order.findOne({ where: { id: orderId } });
  if (!checkingOrder) {
    throw new HttpError(...ERRORS.INVALID.ORDER);
  }
  if (checkingOrder.statusId !== "delivering") {
    throw new HttpError(...ERRORS.MISC.ORDER_FORBIDDEN);
  }
  // Executions
  await db.sequelize.transaction(async t => {
    await Order.update({ statusId: "delivered" }, { where: { id: orderId } }, { transaction: t });
    // for COD Order, should disable/adjust if dev ever plan to apply LOAN PAYMENT
    await OrderPayment.update({ isPaid: true }, { where: { orderId } }, { transaction: t });
  });
  return true;
};

// PATCH: Cancel Order
exports.cancelOrder = async (orderId, accountStaffId) => {
  // Validations
  const checkingOrder = await Order.findOne({ where: { id: orderId } });
  if (!checkingOrder) {
    throw new HttpError(...ERRORS.INVALID.ORDER);
  }
  if (!["processing", "ordered", "verified", "delivering"].includes(checkingOrder.statusId)) {
    throw new HttpError(...ERRORS.MISC.ORDER_FORBIDDEN);
  }
  const existingAccountStaff = await Account.findOne({
    include: [
      {
        model: AccountStaff,
        as: "Staff",
        where: { id: accountStaffId },
        required: true
      }
    ]
  });
  if (!existingAccountStaff) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTSTAFF);
  }
  // Executions
  // await Order.update({ statusId: "canceled" }, { where: { id: orderId } });
  const orderDetails = await OrderDetail.findAll({ where: { orderId } });
  await db.sequelize.transaction(async t => {
    await Order.update(
      { statusId: "canceled", verifier: accountStaffId },
      { where: { id: orderId } },
      { transaction: t }
    );
    // Revert inventoryIds assign
    await OrderDetail.update({ item_inventoryId: null }, { where: { orderId } });
    for (let i = 0; i < orderDetails.length; i += 1) {
      // Revert inventori items to original state (before ordering)
      // eslint-disable-next-line
      await Inventory.update(
        { available: true, bought: false },
        { where: { id: orderDetails[i].item_inventoryId } },
        { transaction: t }
      );
    }
  });
  return true;
};

/* ---------- */
/* ULTILITIES */
const getOrderDetails = async cart => {
  const seqCartItemsDetail = await ItemVariation.findAll({
    include: [
      {
        model: Item,
        as: "Item",
        include: [
          {
            model: PromotionItem,
            as: "PromotionItems",
            include: { model: Promotion, as: "Promotion" }
          },
          {
            model: Inventory,
            as: "Inventory"
          },
          {
            model: ItemVariation, // NEEDED FOR ItemFinalization, inventorySize
            as: "Variations",
            include: { model: Inventory, as: "Inventory" },
            required: true,
            attributes: ["id", "name", "colors", "placing"]
          }
        ]
      },
      { model: Inventory, as: "Inventory" }
    ],
    where: {
      [Op.or]: cart.map(i => ({
        [Op.and]: {
          id: i.variationId,
          itemId: i.itemId
        }
      }))
    }
  });
  if (seqCartItemsDetail.length < 1 || seqCartItemsDetail.length !== cart.length) {
    throw new HttpError(...ERRORS.INVALID.ITEMVARIATION);
  }
  // "Finalizing" item of cart items detail (item variations)
  let cartItemsDetail = seqCartItemsDetail;
  cartItemsDetail = cartItemsDetail.map(varia => {
    const finalizedItem = getItemFinalization(varia.Item, null, null, true); // eslint-disable-line
    return {
      ...varia,
      Item: finalizedItem
    };
  });

  // Check quantity (based on specified variationId)
  for (let i = 0; i < cartItemsDetail.length; i += 1) {
    const checkingCartItem = cart.find(
      cartItem => cartItem.variationId === cartItemsDetail[i].dataValues.id
    );
    const checkingVariation = cartItemsDetail[i].Item.Variations.find(
      varia => varia.id === checkingCartItem.variationId
    ); // NEEDED for Variation.inventorySize
    if (!checkingCartItem) {
      // it is ItemVariation
      throw new HttpError(...ERRORS.MISC.ORDER_CARTVARIATION);
    }
    if (checkingVariation.dataValues.inventorySize < checkingCartItem.quantity) {
      throw new HttpError(...ERRORS.MISC.ORDER_QUANTITY);
    }
  }

  // Calculate total payment
  const totalPayment = cartItemsDetail.reduce((finalVal, o) => {
    return (
      finalVal +
      o.Item.dataValues.priceSale * cart.find(i => i.variationId === o.dataValues.id).quantity
    );
  }, 0);

  // get appliedPromotions
  const appliedPromotions = _.uniq(
    cartItemsDetail
      .filter(i => !!i.Item.dataValues.AppliedPromotion)
      .map(i => i.Item.dataValues.AppliedPromotion.id)
  ).join(",");

  return { orderDetails: cartItemsDetail, totalPayment, appliedPromotions };
};
exports.getOrderDetails = getOrderDetails;
