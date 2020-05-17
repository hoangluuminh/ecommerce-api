const _ = require("lodash");

const db = require("../models");

const { Op, fn, col } = db.Sequelize;
const { inventory: Inventory, item: Item, itemVariation: ItemVariation } = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");

// GET: List of inventories
exports.getInventories = async (query, page, size, sort, sortDesc, itemId) => {
  // Declarations
  let orders = [["id", sortDesc ? "DESC" : "ASC"]];
  switch (sort) {
    default: {
      orders = [["createdAt", sortDesc ? "DESC" : "ASC"]];
      break;
    }
    case "id":
    case "itemId":
    case "variationId":
    case "available":
    case "bought":
    case "createdAt":
    case "updatedAt": {
      orders = [[sort, sortDesc ? "DESC" : "ASC"]];
      break;
    }
  }
  const includes = [
    {
      model: Item,
      as: "Item",
      required: true
    },
    {
      model: ItemVariation,
      as: "Variation",
      required: true
    }
  ];
  const conditions = {
    [Op.and]: [
      {
        [Op.or]: {
          id: { [Op.substring]: query },
          "$Item.name$": { [Op.substring]: query },
          "$Item.id$": { [Op.substring]: query },
          "$Variation.name$": { [Op.substring]: query },
          "$Variation.id$": { [Op.substring]: query }
        }
      },
      // itemId
      { itemId: itemId || db.sequelize.literal("1=1") }
    ]
  };
  // Executions
  const { rows: inventories, count } = await Inventory.findAndCountAll({
    include: includes,
    offset: (page - 1) * size,
    limit: size,
    where: conditions,
    distinct: true,
    order: orders
  });
  return { inventories, count };
};

// GET: Inventory detail
exports.getInventory = async inventoryId => {
  // Executions
  const includes = [
    {
      model: Item,
      as: "Item",
      required: true
    },
    {
      model: ItemVariation,
      as: "Variation",
      required: true
    }
  ];
  const inventory = await Inventory.findOne({
    include: includes,
    where: { id: inventoryId }
  });
  if (!inventory) {
    throw new HttpError(...ERRORS.INVALID.INVENTORY);
  }
  return inventory;
};

// POST: Add Inventories
exports.addInventories = async (itemId, variationId, identifiers) => {
  // Validations
  const existingItem = await Item.findOne({ where: { id: itemId } });
  if (!existingItem) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  const existingVariation = await ItemVariation.findOne({ where: { id: variationId } });
  if (!existingVariation) {
    throw new HttpError(...ERRORS.INVALID.ITEMVARIATION);
  }
  if (existingVariation.itemId !== existingItem.id) {
    throw new HttpError(...ERRORS.MISC.INVENTORY_INCORRECTITEM);
  }
  if (identifiers.filter((v, i, self) => self.indexOf(v) === i).length !== identifiers.length) {
    // Check duplication
    throw new HttpError(...ERRORS.DUPLICATE.INVENTORY);
  }
  const { "count(*)": existingInventoriesCount } = await Inventory.findOne({
    attributes: [fn("count", col("*"))],
    raw: true,
    where: {
      id: {
        [Op.or]: identifiers
      }
    }
  });
  if (existingInventoriesCount > 0) {
    throw new HttpError(...ERRORS.UNIQUE.INVENTORY);
  }
  // Executions
  await Inventory.bulkCreate(
    identifiers.map(identifier => ({
      id: identifier,
      itemId,
      variationId,
      available: true,
      bought: false
    }))
  );
};

// PUT: Update Inventory
exports.updateInventory = async (id, variationId, available) => {
  // Validations
  const inventory = await Inventory.findOne({
    include: [
      {
        model: Item,
        as: "Item"
      }
    ],
    where: { id }
  });
  if (!inventory) {
    throw new HttpError(...ERRORS.INVALID.INVENTORY);
  }
  const existingVariation = await ItemVariation.findOne({ where: { id: variationId } });
  if (!existingVariation) {
    throw new HttpError(...ERRORS.INVALID.ITEMVARIATION);
  }
  if (existingVariation.itemId !== inventory.Item.id) {
    throw new HttpError(...ERRORS.MISC.INVENTORY_INCORRECTITEM);
  }
  if (inventory.bought === true) {
    throw new HttpError(...ERRORS.MISC.INVENTORY_BOUGHT);
  }
  // Executions
  await Inventory.update({ variationId, available }, { where: { id } });
  return true;
};
