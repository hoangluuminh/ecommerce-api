const Moment = require("moment");
const MomentRange = require("moment-range");
const validator = require("validator");
const _ = require("lodash");

const db = require("../models");

const moment = MomentRange.extendMoment(Moment);

const { Op, fn, col, literal } = db.Sequelize;
const {
  item: Item,
  brand: Brand,
  type: Type,
  itemVariation: ItemVariation,
  itemImg: ItemImg,
  itemAttribute: ItemAttribute,
  inventory: Inventory,
  attribute: Attribute,
  promotionItem: PromotionItem,
  promotion: Promotion,
  media: Media,
  itemComment: ItemComment,
  accountUser: AccountUser,
  account: Account
} = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS, INT_MAX } = require("../utils/const.utils");
const generateId = require("../utils/id.utils");

// GET: List of products
exports.getItems = async (
  query,
  page,
  size,
  sort,
  sortDesc,
  special,
  type,
  brand,
  year,
  price,
  variationName,
  attributes,
  withHidden
) => {
  // Declarations
  const [includes] = await getItemPreparation(attributes); // eslint-disable-line

  // Orders
  const includeOrders = [
    [{ model: Attribute, as: "Attributes" }, "placing", "ASC"],
    [{ model: ItemVariation, as: "Variations" }, "placing", "ASC"],
    [{ model: ItemImg, as: "Imgs" }, "placing", "ASC"]
  ];
  let orders = [["id", sortDesc ? "DESC" : "ASC"]];
  switch (sort) {
    default: {
      orders = [["createdAt", sortDesc ? "DESC" : "ASC"]];
      break;
    }
    case "id":
    case "type":
    case "brand":
    case "year":
    case "price":
    case "createdAt":
    case "updatedAt": {
      orders = [[sort, sortDesc ? "DESC" : "ASC"]];
      break;
    }
  }
  let specialOrders = [];
  switch (special) {
    default: {
      break;
    }
    case "hot": {
      specialOrders = [["viewCount", "DESC"]];
      break;
    }
    case "new": {
      specialOrders = [["updatedAt", "DESC"]];
      break;
    }
  }

  // Conditions
  let [priceFrom, priceTo] = [0, INT_MAX];
  if (price) {
    const priceSplitted = price.split(",");
    if (priceSplitted[0]) {
      priceFrom = priceSplitted[0]; // eslint-disable-line
    }
    if (priceSplitted[1]) {
      priceTo = priceSplitted[1]; // eslint-disable-line
    }
  }
  let [yearFrom, yearTo] = [0, INT_MAX];
  if (year) {
    const yearSplitted = year.split(",");
    if (yearSplitted[0]) {
      yearFrom = yearSplitted[0]; // eslint-disable-line
    }
    if (yearSplitted[1]) {
      yearTo = yearSplitted[1]; // eslint-disable-line
    }
  }
  const conditions = {
    [Op.and]: [
      // query
      {
        [Op.or]: {
          name: { [Op.substring]: query }
        }
      },
      // hidden
      { hidden: !withHidden ? false : db.sequelize.literal("1=1") },
      // type, brand
      { typeId: type || db.sequelize.literal("1=1") },
      { brandId: brand || db.sequelize.literal("1=1") },
      // priceFrom, priceTo
      { price: { [Op.between]: [priceFrom, priceTo] } },
      // yearFrom, yearTo
      { year: { [Op.between]: [yearFrom, yearTo] } }
    ]
  };

  // Executions
  const findOptions = {
    where: conditions,
    include: includes,
    distinct: true,
    order: [...specialOrders, ...orders, ...includeOrders]
  };
  if (!attributes && !variationName) {
    findOptions.offset = (page - 1) * size;
    findOptions.limit = size;
  }
  const { rows: seqItems, count: seqCount } = await Item.findAndCountAll(findOptions);
  let count = attributes || variationName ? [...seqItems].length : seqCount;

  /* POST PROCESSING (cuz either Sequelize or the dev is incompetent) */
  let items = seqItems;
  items = items.map(item => {
    return getItemFinalization(item, attributes, variationName); // eslint-disable-line
  });
  // Filtering empty item (due to attribute filters)
  items = items.filter(item => item !== null);
  // Pagination
  if (attributes || variationName) {
    count = items.length;
    items = items.slice((page - 1) * size, page * size);
  }
  return { items, count };
};

// GET: Product detail
exports.getItem = async (itemId, silent, keepAttr) => {
  // Declarations
  const [includes] = await getItemPreparation(); // eslint-disable-line
  const includeOrders = [
    [{ model: Attribute, as: "Attributes" }, "placing", "ASC"],
    [{ model: ItemVariation, as: "Variations" }, "placing", "ASC"],
    [{ model: ItemImg, as: "Imgs" }, "placing", "ASC"],
    [{ model: ItemComment, as: "Comments" }, "createdAt", "DESC"]
  ];
  // Executions
  const seqItem = await Item.findOne({
    include: [
      ...includes,
      {
        model: ItemComment,
        as: "Comments",
        include: [
          {
            model: AccountUser,
            as: "User",
            include: [
              {
                model: Account,
                as: "Account",
                attributes: ["username", "email"]
              }
            ]
          }
        ]
      }
    ],
    order: includeOrders,
    where: { id: itemId }
  });
  if (!seqItem) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }

  /* POST PROCESSING */
  const item = getItemFinalization(seqItem, null, null, keepAttr); // eslint-disable-line
  item.dataValues.rating = _.sum(item.Comments.map(c => c.rating)) / item.Comments.length;

  // Additional: one up view count
  if (!silent) {
    await oneUpViewCount(item); // eslint-disable-line
  }

  return item;
};

// GET: Search suggestion
exports.getSuggestions = async query => {
  const conditions = {
    viewCount: { [Op.gt]: 0 }
  };
  if (query) {
    conditions.name = { [Op.substring]: query };
  }
  const seqValues = await Item.findAll({
    where: conditions,
    attributes: ["name"],
    order: [["viewCount", "DESC"]],
    limit: 5
  });
  const values = seqValues.map(v => v.name);
  return values;
};

// GET: Item filter values
exports.getItemFilterValues = async () => {
  // Executions
  const seqYearRanges = await Item.findOne({
    attributes: [
      [fn("MIN", col("year")), "min"],
      [fn("MAX", col("year")), "max"]
    ]
  });
  const seqPriceRanges = await Item.findOne({
    attributes: [
      [fn("MIN", col("price")), "min"],
      [fn("MAX", col("price")), "max"]
    ]
  });
  const seqVariations = await ItemVariation.findAll({
    attributes: [[literal("DISTINCT `name`"), "nameValue"]]
  });
  // Results
  const yearRanges = [seqYearRanges.dataValues.min || 0, seqYearRanges.dataValues.max || 0];
  const priceRanges = [seqPriceRanges.dataValues.min || 0, seqPriceRanges.dataValues.max || 0];
  const variationValues = seqVariations.map(v => v.dataValues.nameValue);
  return { year: yearRanges, price: priceRanges, variations: variationValues };
};

// POST: Add Item
exports.addItem = async (
  id,
  name,
  type,
  brand,
  year,
  price,
  blog,
  hidden,
  images,
  variations,
  attributes
) => {
  // Validations
  const existingItem = await Item.findOne({ where: { id } });
  if (existingItem) {
    throw new HttpError(...ERRORS.UNIQUE.ITEM);
  }
  // eslint-disable-next-line
  try {
    await itemInfoValidation(type, brand, attributes); // eslint-disable-line
  } catch (e) {
    throw e;
  }
  // Executions
  db.sequelize.transaction(async t => {
    await Item.create(
      { id, name, typeId: type, brandId: brand, year, price, blog, hidden },
      { transaction: t }
    );
    await ItemImg.bulkCreate(
      images.map((image, index) => ({
        itemId: id,
        mediaId: image,
        placing: index
      })),
      { transaction: t }
    );
    await ItemVariation.bulkCreate(
      variations.map((variation, index) => ({
        id: generateId(),
        itemId: id,
        name: variation.name,
        colors: variation.colors,
        placing: index
      })),
      { transaction: t }
    );
    await ItemAttribute.bulkCreate(
      Object.keys(attributes).map(attrK => ({
        attributeId: attrK,
        itemId: id,
        value: attributes[attrK].value,
        rating: attributes[attrK].rating
      })),
      { transaction: t }
    );
  });
  return true;
};

// PUT: Update Item
exports.updateItem = async (
  id,
  name,
  type,
  brand,
  year,
  price,
  blog,
  hidden,
  images,
  variations,
  attributes
) => {
  // Validations
  const includeOrders = [
    [{ model: Attribute, as: "Attributes" }, "placing", "ASC"],
    [{ model: ItemVariation, as: "Variations" }, "placing", "ASC"],
    [{ model: ItemImg, as: "Imgs" }, "placing", "ASC"]
  ];
  const updatingItem = await Item.findOne({
    where: { id },
    include: [
      {
        model: ItemImg,
        as: "Imgs"
      },
      {
        model: ItemVariation,
        as: "Variations"
      },
      {
        model: ItemAttribute,
        as: "ItemAttributes"
      },
      {
        model: Attribute,
        as: "Attributes"
      }
    ],
    order: includeOrders
  });
  if (!updatingItem) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  // eslint-disable-next-line
  try {
    await itemInfoValidation(type, brand, attributes); // eslint-disable-line
  } catch (e) {
    throw e;
  }
  const oldVariations = updatingItem.Variations;
  if (variations.length < oldVariations.length) {
    throw new HttpError(...ERRORS.MISC.ITEM_VARIATIONMISSING);
  }
  // Executions
  db.sequelize.transaction(async t => {
    await Item.update(
      { name, typeId: type, brandId: brand, year, price, blog, hidden },
      { where: { id } },
      { transaction: t }
    );
    // Imgs
    await ItemImg.destroy({ where: { itemId: id } });
    await ItemImg.bulkCreate(
      images.map((image, index) => ({
        itemId: id,
        mediaId: image,
        placing: index
      })),
      { transaction: t }
    );
    // Attributes
    await ItemAttribute.destroy({ where: { itemId: id } });
    await ItemAttribute.bulkCreate(
      Object.keys(attributes).map(attrK => ({
        attributeId: attrK,
        itemId: id,
        value: attributes[attrK].value,
        rating: attributes[attrK].rating
      })),
      { transaction: t }
    );
    // Variations
    for (let i = 0; i < oldVariations.length; i += 1) {
      // eslint-disable-next-line
      await ItemVariation.update(
        { name: variations[i].name, colors: variations[i].colors },
        { where: { itemId: id, placing: i } },
        { transaction: t }
      );
    }
    await ItemVariation.bulkCreate(
      variations.slice(oldVariations.length).map((newVariation, index) => ({
        id: generateId(),
        itemId: id,
        name: newVariation.name,
        colors: newVariation.colors,
        placing: index + oldVariations.length
      })),
      { transaction: t }
    );
  });
  return true;
};

// PATCH: Hide Item
exports.hideItem = async (id, hidden) => {
  // Validation
  const item = await Item.findOne({ where: { id } });
  if (!item) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  // Executions
  await Item.update({ hidden }, { where: { id } });
  return true;
};

// DELETE: Delete Item
exports.deleteItem = async id => {
  // Validation
  const item = await Item.findOne({ where: { id } });
  if (!item) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  await Item.destroy({ where: { id } });
};

/* ---------- */
/* UTILITIES (that should have gone into item.util idk why i do this haha) */

const getItemPreparation = async attributes => {
  // ItemAttributes Processing
  let fetchedAttributes = [];
  let attributeConditions = db.sequelize.literal("1=1");
  if (attributes && Object.keys(attributes).length > 0) {
    fetchedAttributes = await Attribute.findAll({ raw: true });
    attributeConditions = Object.keys(attributes).map(attrK => {
      const usingAttribute = fetchedAttributes.find(fAttr => fAttr.id === attrK);
      const attributeValue = attributes[attrK];
      switch (usingAttribute.valueType) {
        default:
        case "static": {
          return {
            [Op.and]: {
              attributeId: usingAttribute.id,
              value: attributeValue
            }
          };
        }
        case "dynamic": {
          const [attributeValueFrom, attributeValueTo] = attributeValue.split(",");
          return {
            attributeId: usingAttribute.id,
            [Op.and]: [
              db.sequelize.literal(
                `CAST(\`ItemAttributes\`.\`value\` AS FLOAT) >= ${attributeValueFrom}`
              ),
              db.sequelize.literal(
                `CAST(\`ItemAttributes\`.\`value\` AS FLOAT) <= ${attributeValueTo}`
              )
            ]
          };
        }
      }
    });
  }

  // Includes
  const includes = [
    {
      model: Type,
      as: "Type",
      required: true
    },
    {
      model: Brand,
      as: "Brand",
      required: true
    },
    {
      model: ItemVariation,
      as: "Variations",
      include: { model: Inventory, as: "Inventory" },
      required: true,
      attributes: ["id", "name", "colors", "placing"]
    },
    {
      model: ItemImg,
      as: "Imgs",
      include: { model: Media, as: "Media" },
      attributes: ["id", "mediaId", "placing"]
    },
    {
      model: Attribute,
      as: "Attributes",
      required: true
    },
    {
      model: Inventory,
      as: "Inventory"
    },
    {
      model: PromotionItem,
      as: "PromotionItems",
      include: { model: Promotion, as: "Promotion" }
    }
  ];
  if (attributes && Object.keys(attributes).length > 0) {
    includes.push({
      model: ItemAttribute,
      as: "ItemAttributes",
      include: { model: Attribute, as: "Attribute" },
      where: {
        [Op.or]: attributeConditions
      }
    });
  }

  // Results
  return [includes];
};

const getItemFinalization = (item, attributes, variationName, keepAttr) => {
  // attributes filter
  if (attributes && Object.keys(attributes).length > 0) {
    if (Object.keys(attributes).length !== item.ItemAttributes.length) {
      return null;
    }
  }
  // variationName filter
  if (variationName) {
    let hasCorrectVariationNameCount = false;
    for (let variaIndex = 0; variaIndex < item.Variations.length; variaIndex += 1) {
      const checkingVariation = item.Variations[variaIndex];
      if (checkingVariation.name.indexOf(variationName) >= 0) {
        hasCorrectVariationNameCount = true;
        break;
      }
    }
    if (!hasCorrectVariationNameCount) {
      return null;
    }
  }

  const newItem = item; // NEW ITEM
  // promotion => priceSale
  newItem.dataValues.priceSale = newItem.price;
  if (newItem.PromotionItems.length > 0) {
    for (let pIIndex = 0; pIIndex < newItem.PromotionItems.length; pIIndex += 1) {
      const promoItemPromo = newItem.PromotionItems[pIIndex].Promotion;
      const [timeStart, timeEnd] = [
        new Date(promoItemPromo.timeStart),
        new Date(promoItemPromo.timeEnd)
      ];
      if (
        moment()
          .range(timeStart, timeEnd)
          .contains(new Date(Date.now()))
      ) {
        newItem.dataValues.priceSale = (newItem.price * (100 - promoItemPromo.offPercent)) / 100;
        newItem.dataValues.AppliedPromotion = promoItemPromo;
        newItem.dataValues.PromotionItems = null;
        break;
      }
    }
  }
  // Remove itemAttributes (only used for comparing, filtering)
  newItem.dataValues.ItemAttributes = null;
  // Merge attribute and its unit
  if (!keepAttr) {
    const oldAttributes = item.Attributes;
    oldAttributes.forEach(oAttr => {
      const updatingAttrUnit = oldAttributes.find(a => a.id === `${oAttr.id}-unit`);
      if (updatingAttrUnit) {
        const updatingItemAttr = newItem.Attributes.find(a => a.id === oAttr.id).Item_Attribute;
        const updatingItemAttrUnit = updatingAttrUnit.Item_Attribute;
        updatingItemAttr.dataValues.value = `${updatingItemAttr.value} ${updatingItemAttrUnit.value}`;
        _.remove(newItem.Attributes, { id: updatingAttrUnit.id });
      }
    });
  }
  // inventorySizes
  newItem.dataValues.inventorySize = item.Inventory.length;
  newItem.dataValues.Inventory = null;
  newItem.Variations.forEach(varia => {
    varia.dataValues.inventorySize = varia.Inventory.length; // eslint-disable-line
    varia.dataValues.Inventory = null; // eslint-disable-line
  });

  // Result
  return newItem;
};

const oneUpViewCount = async item => {
  await Item.update({ viewCount: item.viewCount + 1 }, { where: { id: item.id }, silent: true });
};

const itemInfoValidation = async (type, brand, attributes) => {
  const existingType = await Type.findOne({ where: { id: type } });
  if (!existingType) {
    throw new HttpError(...ERRORS.INVALID.TYPE);
  }
  const existingBrand = await Brand.findOne({ where: { id: brand } });
  if (!existingBrand) {
    throw new HttpError(...ERRORS.INVALID.BRAND);
  }
  const fetchedAttributes = await Attribute.findAll();
  const fAttrIds = fetchedAttributes.map(fAttr => fAttr.id);
  for (let i = 0; i < Object.keys(attributes).length; i += 1) {
    const checkingAttrK = Object.keys(attributes)[i];
    if (!fAttrIds.includes(checkingAttrK)) {
      throw new HttpError(...ERRORS.INVALID.ATTRIBUTE);
    }
    const checkingAttr = fetchedAttributes.find(fA => fA.id === checkingAttrK);
    if (
      checkingAttr.valueType === "dynamic" &&
      !validator.isFloat(attributes[checkingAttrK].value.toString())
    ) {
      throw new HttpError(...ERRORS.MISC.ATTRIBUTE_DYNAMIC);
    }
  }
};
