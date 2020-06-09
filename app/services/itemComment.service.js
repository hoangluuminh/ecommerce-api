const db = require("../models");

const { Op } = db.Sequelize;

const {
  itemComment: ItemComment,
  item: Item,
  order: Order,
  orderDetail: OrderDetail,
  itemImg: ItemImg,
  media: Media
} = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");
const generateId = require("../utils/id.utils");

// GET: List of itemComments
exports.getUserItemComments = async userId => {
  // Executions
  const { rows: itemComments, count } = await ItemComment.findAndCountAll({
    include: [
      {
        model: Item,
        as: "Item"
      }
    ],
    where: { userId },
    order: [["createdAt", "DESC"]]
  });
  return { itemComments, count };
};

// GET: List of user's purchased items (by userId)
const getUserPurchasedItems = async userId => {
  // Executions
  const uniqueOrderDetails = await OrderDetail.findAll({
    attributes: ["item_id"],
    include: [{ model: Order, as: "Order" }],
    where: { "$Order.userId$": userId, "$Order.statusId$": "delivered" },
    distinct: true
  });
  const { rows: items, count } = await Item.findAndCountAll({
    include: [
      {
        model: ItemImg,
        as: "Imgs",
        include: { model: Media, as: "Media" },
        attributes: ["id", "mediaId", "placing"]
      }
    ],
    where: {
      [Op.or]: uniqueOrderDetails.map(oD => ({
        id: oD.item_id
      }))
    }
  });
  return { items, count };
};
exports.getUserPurchasedItems = getUserPurchasedItems;

// POST: Add ItemComment
exports.addItemComment = async (userId, itemId, rating, comment) => {
  // Validations
  const fetchedItem = await Item.findOne({ where: { id: itemId } });
  if (!fetchedItem) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  const { items: purchasedItems } = await getUserPurchasedItems(userId);
  if (purchasedItems.filter(item => item.dataValues.id === fetchedItem.id).length <= 0) {
    throw new HttpError(...ERRORS.MISC.ITEMCOMMENT_UNOWNED);
  }
  // Executions
  await ItemComment.create({ id: generateId(), itemId, userId, rating, comment });
  return true;
};

// DELETE: Delete ItemComment
exports.deleteItemComment = async (userId, itemCommentId) => {
  // Validation
  const itemComment = await ItemComment.findOne({ where: { id: itemCommentId, userId } });
  if (!itemComment) {
    throw new HttpError(...ERRORS.INVALID.ITEMCOMMENT);
  }
  await ItemComment.destroy({ where: { id: itemCommentId } });
  return true;
};
