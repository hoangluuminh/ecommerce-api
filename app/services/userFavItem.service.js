const db = require("../models");

const { userFavItem: UserFavItem, item: Item, itemImg: ItemImg, media: Media } = db;

const { getItemPreparation, getItemFinalization } = require("./item.service");
const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");

// GET: List of userFavItems
exports.getUserFavItems = async userId => {
  // Executions
  const { rows: userFavItems, count } = await UserFavItem.findAndCountAll({
    include: [
      {
        model: Item,
        as: "Item",
        include: [
          {
            model: ItemImg,
            as: "Imgs",
            include: { model: Media, as: "Media" },
            attributes: ["id", "mediaId", "placing"]
          }
        ]
      }
    ],
    where: { userId },
    order: [["createdAt", "DESC"]]
  });
  return { userFavItems, count };
};

// POST: Add UserFavItem
exports.addUserFavItem = async (userId, itemId) => {
  // Validations
  const [includes] = await getItemPreparation(null, {
    whitelist: ["PromotionItems", "Variations"]
  });
  const fetchedItem = await Item.findOne({ include: includes, where: { id: itemId } });
  if (!fetchedItem) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  const finalizedItem = getItemFinalization(fetchedItem);
  const existingUserFavItem = await UserFavItem.findOne({ where: { userId, itemId } });
  if (existingUserFavItem) {
    return false; // FavItem already has this item => no adding needed
  }
  // Executions
  await UserFavItem.create({ itemId, userId, price: finalizedItem.dataValues.priceSale });
  return true;
};

// DELETE: Delete UserFavItem
exports.deleteUserFavItem = async (userId, itemId) => {
  // Validation
  const item = await Item.findOne({ where: { id: itemId } });
  if (!item) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  await UserFavItem.destroy({ where: { userId, itemId } });
};

/* ULTILITIES */
exports.isUserFavItem = async (userId, itemId) => {
  const userFavItem = await UserFavItem.findOne({ where: { userId, itemId } });
  return !!userFavItem;
};
