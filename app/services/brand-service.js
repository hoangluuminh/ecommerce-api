const _ = require("lodash");
const db = require("../models");

const { Op, fn, col } = db.Sequelize;
const Brand = db.brand;
const LogError = require("../models/log-error");

// GET: Get brand by id
exports.getBrand = async (brandId, withChild) => {
  const includes = [];
  const orders = [];
  if (withChild) {
    includes.push({ model: Brand, as: "SuperTH" });
    includes.push({ model: Brand, as: "ChildTH" });
    orders.push(["ChildTH", "placing", "ASC"]);
  }
  const brand = await Brand.findOne({
    include: includes,
    order: orders,
    where: { id: brandId }
  });
  return brand;
};

// GET: Get list of brands
exports.getBrands = async () => {
  const brands = await Brand.findAll({
    include: [
      { model: Brand, as: "SuperTH" },
      { model: Brand, as: "ChildTH" }
    ],
    order: [
      ["placing", "ASC"],
      ["ChildTH", "placing", "ASC"]
    ],
    where: { superTH: { [Op.is]: null } },
    distinct: true
  });
  return brands;
};

// POST: Add brand
exports.addBrand = async (id, name, superTH) => {
  const { "count(*)": placing } = await Brand.findOne({
    attributes: [fn("count", col("*"))],
    where: { superTH: { [superTH ? Op.eq : Op.is]: superTH } },
    raw: true
  });
  const brand = await Brand.create({ id, name, superTH, placing });
  return brand;
};

// PUT: Update brand by id
exports.updateBrand = async (id, name) => {
  const results = await Brand.update({ name }, { where: { id } });
  return results[0];
};

// PATCH: Swap placing of 2 brands
exports.swapBrands = async (brand1Id, brand2Id) => {
  const brand1 = await Brand.findOne({
    where: { id: brand1Id },
    raw: true
  });
  const brand2 = await Brand.findOne({
    where: { id: brand2Id },
    raw: true
  });
  if (!brand1 || !brand2) {
    throw new LogError("One of the brands cannot be found", "BrandsNotFoundError");
  }
  if (brand1.superTH && brand2.superTH && brand1.superTH !== brand2.superTH) {
    throw new LogError("The brands belong to different parents", "BrandsParentError");
  }
  const result = db.sequelize.transaction(async t => {
    const brandResults = [
      await Brand.update(
        { placing: brand2.placing },
        { where: { id: brand1Id } },
        { transaction: t }
      ),
      await Brand.update(
        { placing: brand1.placing },
        { where: { id: brand2Id } },
        { transaction: t }
      )
    ];
    return brandResults.includes(0) ? 0 : 1;
  });
  return result;
};

// DELETE: Delete brand by id
exports.deleteBrand = async brandId => {
  const brand = await Brand.findOne({
    where: { id: brandId },
    raw: true
  });
  if (!brand) {
    throw new LogError("Brand cannot be found", "BrandNotFoundError");
  }
  const brands = await Brand.findAll({
    where: {
      superTH: brand.superTH,
      placing: { [Op.gte]: brand.placing }
    },
    raw: true
  });
  const { "count(*)": brandCount } = await Brand.findOne({
    attributes: [fn("count", col("*"))],
    where: { superTH: { [brand.superTH ? Op.eq : Op.is]: brand.superTH } },
    raw: true
  });
  // Update placings
  const oldBrands = JSON.parse(JSON.stringify(brands));
  for (let i = brand.placing; i < brandCount - 1; i += 1) {
    brands.find(b => b.placing === i + 1).placing = i;
  }
  _.remove(brands, { id: brandId });
  // Start transaction
  const result = db.sequelize.transaction(async t => {
    const deleteResult = await Brand.destroy({ where: { id: brandId } }, { transaction: t });
    const updatePlacingResults = [];
    for (let i = brand.placing; i < brandCount - 1; i += 1) {
      const updatingBrand = oldBrands.find(b => b.placing === i + 1);
      const updatePlacingResult = Brand.update(
        { placing: i },
        { where: { id: updatingBrand.id, superTH: brand.superTH } },
        { transaction: t }
      );
      updatePlacingResults.push(updatePlacingResult);
    }
    return [deleteResult, ...(await Promise.all(updatePlacingResults))].includes(0) ? 0 : 1;
  });
  return result;
};
