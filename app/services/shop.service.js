const db = require("../models");

const { shop: Shop } = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");

// GET: Shop detail
exports.getShop = async () => {
  // Executions
  const shop = await Shop.findOne();
  if (!shop) {
    throw new HttpError(...ERRORS.INVALID.SHOP);
  }
  return shop;
};
// PUT: Update Shop
exports.updateShop = async (name, locationLng, locationLat, address, description) => {
  // Validations
  const shop = await Shop.findOne();
  if (!shop) {
    throw new HttpError(...ERRORS.INVALID.SHOP);
  }
  // Executions
  await Shop.update(
    { name, locationLng, locationLat, address, description },
    {
      where: {
        id: db.sequelize.literal("1=1")
      }
    }
  );
  return true;
};
