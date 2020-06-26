const _ = require("lodash");

const db = require("../models");

const { Op, fn, col } = db.Sequelize;
const { inventory: Inventory, item: Item, itemVariation: ItemVariation } = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");
// const generateId = require("../utils/id.utils");

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
exports.addInventories = async inventories => {
  // inventories include array of { inventoryItemId, itemId, variationName }
  /* VALIDATIONS */
  // Validate inventoryItemIds, by getting list of inventoryItemIds as "identifiers"
  const identifiers = inventories.map(inv => inv.inventoryItemId);
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
  // Get list of distinct itemId, check if they're all valid
  const uniqItemIds = _.uniq(inventories.map(inv => inv.itemId));
  const checkingItems = await Item.findAll({
    where: {
      [Op.or]: uniqItemIds.map(uniqItemId => ({
        id: uniqItemId
      }))
    }
  });
  if (uniqItemIds.length !== checkingItems.length) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  // Check if all variationName belongs to their corresponding Items
  // IMPORTANT: (make sure all pairs of itemId and variationName are unique)
  const correspondingItemVariations = await ItemVariation.findAll({
    // corresponds to "inventories"
    where: {
      [Op.or]: inventories.map(inv => ({
        [Op.and]: {
          itemId: inv.itemId,
          name: inv.variationName
        }
      }))
    }
  });
  if (
    _.uniqWith(
      inventories.map(inv => ({ itemId: inv.itemId, variationName: inv.variationName })),
      _.isEqual
    ).length !== correspondingItemVariations.length
  ) {
    throw new HttpError(...ERRORS.MISC.INVENTORY_INCORRECTITEM);
  }
  /* EXECUTIONS */
  const inventoriesFinalized = inventories.reduce((arr, inv) => {
    const newArr = [...arr];
    newArr.push({
      inventoryItemId: inv.inventoryItemId,
      itemId: inv.itemId,
      variationId: correspondingItemVariations.find(
        varia => varia.itemId === inv.itemId && varia.name === inv.variationName
      ).id
    });
    return newArr;
  }, []);
  await Inventory.bulkCreate(
    inventoriesFinalized.map(inv => ({
      id: inv.inventoryItemId,
      itemId: inv.itemId,
      variationId: inv.variationId,
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
