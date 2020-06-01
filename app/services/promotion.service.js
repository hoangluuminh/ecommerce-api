const db = require("../models");

const { Op } = db.Sequelize;
const { promotion: Promotion, promotionItem: PromotionItem, item: Item } = db;

const generateId = require("../utils/id.utils");
const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");

// GET: List of promotions
exports.getPromotions = async (query, page, size, sort, sortDesc, timeStart, timeEnd) => {
  // Declarations
  let orders = [["id", sortDesc ? "DESC" : "ASC"]];
  switch (sort) {
    default: {
      orders = [["timeStart", sortDesc ? "DESC" : "ASC"]];
      break;
    }
    case "id":
    case "name":
    case "timeStart":
    case "timeEnd":
    case "offPercent": {
      orders = [[sort, sortDesc ? "DESC" : "ASC"]];
      break;
    }
  }
  const includes = [
    {
      model: PromotionItem,
      as: "PromotionItems"
    }
  ];
  const conditions = {
    [Op.and]: [
      {
        [Op.or]: {
          id: { [Op.substring]: query },
          name: { [Op.substring]: query }
        }
      },
      // timeStart
      { timeStart: timeStart ? { [Op.gte]: timeStart } : db.sequelize.literal("1=1") },
      // timeEnd
      { timeEnd: timeEnd ? { [Op.lte]: timeEnd } : db.sequelize.literal("1=1") }
    ]
  };
  // Executions
  const { rows: promotions, count } = await Promotion.findAndCountAll({
    include: includes,
    offset: (page - 1) * size,
    limit: size,
    where: conditions,
    distinct: true,
    order: orders
  });
  return { promotions, count };
};

// GET: Promotion details
exports.getPromotion = async promotionId => {
  // Executions
  const promotion = await Promotion.findOne({
    include: [
      {
        model: PromotionItem,
        as: "PromotionItems",
        include: [{ model: Item, as: "Item" }]
      }
    ],
    where: { id: promotionId }
  });
  if (!promotion) {
    throw new HttpError(...ERRORS.INVALID.PROMOTION);
  }
  return promotion;
};

// POST: Add Promotion
exports.addPromotion = async (name, timeStart, timeEnd, offPercent, description, items) => {
  // Validations
  // const existingPromotion = await Promotion.findOne({ where: { id } });
  // if (existingPromotion) {
  // throw new HttpError(...ERRORS.UNIQUE.PROMOTION);
  // }
  const checkingItems = await Item.findAll({
    where: { [Op.or]: items.map(item => ({ id: item })) }
  });
  if (checkingItems.length !== items.length) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  // Executions
  const promotionId = generateId();
  db.sequelize.transaction(async t => {
    await Promotion.create(
      { id: promotionId, name, timeStart, timeEnd, offPercent, description },
      { transaction: t }
    );
    await PromotionItem.bulkCreate(
      items.map(itemId => ({
        promoId: promotionId,
        itemId
      })),
      { transaction: t }
    );
  });
  return true;
};

// PUT: Update Promotion
exports.updatePromotion = async (id, name, timeStart, timeEnd, offPercent, description, items) => {
  // Validations
  const promotion = await Promotion.findOne({ where: { id } });
  if (!promotion) {
    throw new HttpError(...ERRORS.INVALID.PROMOTION);
  }
  const checkingItems = await Item.findAll({
    where: { [Op.or]: items.map(item => ({ id: item })) }
  });
  if (checkingItems.length !== items.length) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  // Executions
  db.sequelize.transaction(async t => {
    await Promotion.update(
      { name, timeStart, timeEnd, offPercent, description },
      { where: { id } },
      { transaction: t }
    );
    await PromotionItem.destroy({ where: { promoId: id } }, { transaction: t });
    await PromotionItem.bulkCreate(
      items.map(itemId => ({
        promoId: id,
        itemId
      })),
      { transaction: t }
    );
  });
  return true;
};

// DELETE: Delete Promotion
exports.deletePromotion = async id => {
  // Validation
  const promotion = await Promotion.findOne({ where: { id } });
  if (!promotion) {
    throw new HttpError(...ERRORS.INVALID.PROMOTION);
  }
  await Promotion.destroy({ where: { id } });
  return true;
};
