const db = require("../models");

const { Op } = db.Sequelize;
const {
  supportTicket: SupportTicket,
  supportType: SupportType,
  supportTicketStatus: SupportTicketStatus,
  account: Account,
  accountStaff: AccountStaff,
  accountUser: AccountUser,
  userInfo: UserInfo,
  order: Order
} = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");
const generateId = require("../utils/id.utils");

// GET: List of support tickets
exports.getSupportTickets = async (
  query,
  page,
  size,
  sort,
  sortDesc,
  supportTypeId,
  support,
  customer,
  statusId
) => {
  // Declarations
  let orders = [["createdAt", sortDesc ? "DESC" : "ASC"]];
  switch (sort) {
    default: {
      orders = [["createdAt", sortDesc ? "DESC" : "ASC"]];
      break;
    }
    case "id":
    case "supportTypeId":
    case "support":
    case "customer":
    case "statusId":
    case "orderId":
    case "createdAt":
    case "updatedAt": {
      orders = [[sort, sortDesc ? "DESC" : "ASC"]];
      break;
    }
  }
  const includes = [
    {
      model: SupportType,
      as: "SupportType",
      required: true
    },
    {
      model: SupportTicketStatus,
      as: "Status",
      required: true
    },
    {
      model: AccountStaff,
      as: "Support",
      required: false,
      include: [{ model: Account, as: "Account" }]
    },
    {
      model: AccountUser,
      as: "Customer",
      include: [
        { model: Account, as: "Account", attributes: ["username", "email"] },
        { model: UserInfo, as: "Info" }
      ]
    }
  ];
  const conditions = {
    [Op.and]: [
      {
        [Op.or]: {
          id: { [Op.substring]: query },
          support: { [Op.substring]: query },
          customer: { [Op.substring]: query },
          "$Customer.Account.username$": { [Op.substring]: query },
          "$Customer.Account.email$": { [Op.substring]: query }
        }
      },
      // supportTypeId
      { supportTypeId: supportTypeId || db.sequelize.literal("1=1") },
      // support
      { support: support || db.sequelize.literal("1=1") },
      // customer
      { customer: customer || db.sequelize.literal("1=1") },
      // statusId
      { statusId: statusId || db.sequelize.literal("1=1") }
    ]
  };
  // Executions
  const { rows: supportTickets, count } = await SupportTicket.findAndCountAll({
    include: includes,
    offset: (page - 1) * size,
    limit: size,
    where: conditions,
    distinct: true,
    order: orders
  });
  return { supportTickets, count };
};

// GET: Support Ticket detail
exports.getSupportTicket = async supportTicketId => {
  const includes = [
    {
      model: SupportType,
      as: "SupportType",
      required: true
    },
    {
      model: SupportTicketStatus,
      as: "Status",
      required: true
    },
    {
      model: AccountStaff,
      as: "Support",
      required: false,
      include: [{ model: Account, as: "Account" }]
    },
    {
      model: AccountUser,
      as: "Customer",
      include: [
        { model: Account, as: "Account", attributes: ["username", "email"] },
        { model: UserInfo, as: "Info" }
      ]
    }
  ];
  const supportTicket = await SupportTicket.findOne({
    include: includes,
    where: { id: supportTicketId }
  });
  if (!supportTicket) {
    throw new HttpError(...ERRORS.INVALID.SUPPORTTICKET);
  }
  return supportTicket;
};

// GET: Support Types List
exports.getSupportTypes = async () => {
  // Executions
  const { rows: supportTypes, count } = await SupportType.findAndCountAll();
  return { supportTypes, count };
};

// GET: Support Ticket Statuses List
exports.getSupportTicketStatuses = async () => {
  // Executions
  const { rows: supportTicketStatuses, count } = await SupportTicketStatus.findAndCountAll();
  return { supportTicketStatuses, count };
};

// POST: Submit Support Ticket
exports.addSupportTicket = async (accountUserId, supportTypeId, orderId, note) => {
  // Validations
  const checkingSupportType = await SupportType.findOne({
    where: { id: supportTypeId }
  });
  if (!checkingSupportType) {
    throw new HttpError(...ERRORS.INVALID.SUPPORTTYPE);
  }
  const checkingAccountUser = await Account.findOne({
    include: [
      {
        model: AccountUser,
        as: "User",
        where: { id: accountUserId },
        required: true
      }
    ]
  });
  if (!checkingAccountUser) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTUSER);
  }
  if (orderId) {
    const checkingOrder = await Order.findOne({
      where: { id: orderId }
    });
    if (!checkingOrder) {
      throw new HttpError(...ERRORS.INVALID.ORDER);
    }
  }
  // Executions
  await SupportTicket.create({
    id: generateId(),
    supportTypeId,
    customer: accountUserId,
    orderId,
    note,
    statusId: "pending"
  });
  return true;
};

// PATCH: Update Support Ticket's status
exports.updateSupportTicketStatus = async (supportTicketId, statusId, accountStaffId) => {
  // Validations
  const checkingSupportTicket = await SupportTicket.findOne({
    where: { id: supportTicketId }
  });
  if (!checkingSupportTicket) {
    throw new HttpError(...ERRORS.INVALID.SUPPORTTICKET);
  }
  const checkingSupportTicketStatus = await SupportTicketStatus.findOne({
    where: { id: statusId }
  });
  if (!checkingSupportTicketStatus) {
    throw new HttpError(...ERRORS.INVALID.SUPPORTTICKETSTATUS);
  }
  const checkingAccountStaff = await Account.findOne({
    include: [
      {
        model: AccountStaff,
        as: "Staff",
        where: { id: accountStaffId },
        required: true
      }
    ]
  });
  if (!checkingAccountStaff) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTSTAFF);
  }
  // Executions
  await SupportTicket.update(
    { statusId, support: accountStaffId },
    { where: { id: supportTicketId } }
  );
  return true;
};

// DELETE: Delete Support
exports.deleteSupportTicket = async supportTicketId => {
  // Validations
  const checkingSupportTicket = await SupportTicket.findOne({
    where: { id: supportTicketId }
  });
  if (!checkingSupportTicket) {
    throw new HttpError(...ERRORS.INVALID.SUPPORTTICKET);
  }
  await SupportTicket.destroy({ where: { id: supportTicketId } });
  return true;
};
