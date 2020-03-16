const db = require('../models')
const { Op, fn, col } = db.Sequelize
const { item: Item, itemImg: ItemImg } = db
const { INT_MAX } = require('../utils/const-utils')
const LogError = require('../models/log-error')

// GET: Get item by id
exports.getItem = async (itemId) => {
  const item = await Item.findOne({
    include: [db.brand, db.category, db.itemImg],
    order: [
      [db.itemImg, 'placing', 'ASC']
    ],
    where: {
      id: itemId
    }
  })
  return item
}

// GET: Get list of items by query, with filters and sorting
exports.getItems = async (query, page, size, sort, sortDesc, priceFrom, priceTo, brand, category, noImg) => {
  const includes = [
    {
      model: db.brand,
      as: 'Brand',
      include: [{ model: db.brand, as: 'SuperTH' }],
      attributes: [
        ['id', 'brandId'],
        'name',
        'superTH',
        'placing'
      ],
      required: false
    },
    {
      model: db.category,
      as: 'Category',
      attributes: [['id', 'categoryId'], 'name', 'placing'],
      required: false
    }
  ]
  const orders = [
    [sort, (sortDesc) ? 'DESC' : 'ASC']
  ]
  if (!noImg) { // include Item_Imgs
    includes.push(db.itemImg)
    orders.push([db.itemImg, 'placing', 'ASC'])
  }
  const conditions = {
    [Op.and]: [
      // query
      {
        [Op.or]: {
          name: { [Op.substring]: query },
          masp: { [Op.substring]: query }
        }
      },
      // priceFrom, priceTo
      {
        price: {
          [Op.between]: [(priceFrom || 0), (priceTo || INT_MAX)]
        }
      },
      {
        [Op.and]: db.sequelize.literal(brand ? `( \`Item\`.\`brand\` = "${brand}" OR \`Item\`.\`brand\` IN (SELECT id FROM \`Brands\` WHERE superTH = "${brand}") )` : '1=1')
      },
      {
        [Op.and]: db.sequelize.literal(category ? `\`Item\`.\`category\` = "${category}"` : '1=1')
      }
    ]
  }
  const { 'count(*)': count } = await Item.findOne({
    attributes: [fn('count', col('*'))],
    raw: true,
    where: conditions
  })
  const items = await Item.findAll({
    include: includes,
    offset: (page - 1) * size,
    limit: size,
    distinct: true,
    subQuery: true,
    where: conditions,
    order: orders
  })
  return { items, count }
}

// POST: Add an item by id
exports.addItem = async (id, name, masp, priceOg, price, description, brand, category, itemImgs) => {
  const result = db.sequelize.transaction(async (t) => {
    const item = await Item.create({
      id, name, masp, priceOg, price, description, brand, category
    }, { transaction: t })
    for (const [i, itemImg] of itemImgs.entries()) {
      await ItemImg.create({
        id: `${id}__${i}`,
        img: itemImg.img,
        itemID: id,
        placing: itemImg.placing
      }, { transaction: t })
    }
    return item
  })
  return result
}

// POST: Add itemImg to item by specified itemId
exports.addImgToItem = async (itemId, img) => {
  const { 'count(*)': placing } = await ItemImg.findOne({
    attributes: [fn('count', col('*'))],
    raw: true,
    where: { itemID: itemId }
  })
  const itemImg = await ItemImg.create({
    id: `${itemId}__${placing}`,
    img,
    itemID: itemId,
    placing
  })
  return itemImg
}

// PUT: Update item by id
exports.updateItem = async (id, name, masp, priceOg, price, description, brand, category) => {
  const results = await Item.update(
    { name, masp, priceOg, price, description, brand, category },
    { where: { id } })
  return results[0]
}

// PATCH: Swap placing of 2 itemImg of a given item
exports.swapItemImgs = async (itemId, itemImg1Id, itemImg2Id) => {
  const itemImg1 = await ItemImg.findOne({
    where: { id: itemImg1Id, itemID: itemId },
    raw: true
  })
  const itemImg2 = await ItemImg.findOne({
    where: { id: itemImg2Id, itemID: itemId },
    raw: true
  })
  if (!itemImg1 || !itemImg2) {
    throw new LogError('Cannot find images', 'ItemImgsNotFoundError')
  }
  const result = db.sequelize.transaction(async (t) => {
    const results = [
      await ItemImg.update(
        { placing: itemImg2.placing },
        { where: { id: itemImg1.id } },
        { transaction: t }),
      await ItemImg.update(
        { placing: itemImg1.placing },
        { where: { id: itemImg2.id } },
        { transaction: t })
    ]
    return results.includes(0) ? 0 : 1
  })
  return result
}

// PATCH: Set 'remain' for Item
exports.setItemRemain = async (itemId, remain) => {
  const result = await Item.update(
    { remain: remain ? 1 : 0 },
    { where: { id: itemId } })
  return result[0]
}

// PATCH: Set 'hidden' for Item
exports.setItemHidden = async (itemId, hidden) => {
  const result = await Item.update(
    { hidden: hidden ? 1 : 0 },
    { where: { id: itemId } })
  return result[0]
}

// DELETE: Delete item by id
exports.deleteItem = async (itemId) => {
  const result = await Item.destroy({ where: { id: itemId } })
  return result
}

// DELETE: Delete itemImg by itemId and ItemImgId, also update images' placing
exports.deleteItemImg = async (itemId, itemImgId) => {
  const itemImg = await ItemImg.findOne({
    where: { id: itemImgId, itemID: itemId },
    raw: true
  })
  if (!itemImg) {
    throw new LogError('Cannot find image', 'ItemImgNotFoundError')
  }
  const { 'count(*)': itemImgCount } = await ItemImg.findOne({
    attributes: [fn('count', col('*'))],
    raw: true,
    where: { itemID: itemId }
  })
  const result = db.sequelize.transaction(async (t) => {
    const deleteImgResult = await ItemImg.destroy(
      { where: { id: itemImgId } },
      { transaction: t })
    const updateImgResults = []
    for (let i = itemImg.placing; i < itemImgCount - 1; i++) {
      const updateImgResult = await ItemImg.update(
        { placing: i },
        { where: { itemID: itemId, placing: i + 1 } },
        { transaction: t })
      updateImgResults.push(updateImgResult)
    }
    return [deleteImgResult, ...updateImgResults].includes(0) ? 0 : 1
  })
  return result
}
