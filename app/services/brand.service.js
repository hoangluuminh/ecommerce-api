const _ = require("lodash");

const db = require("../models");

const { Op, fn, col } = db.Sequelize;
const { brand: Brand } = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");

// GET: List of brands
exports.getBrands = async () => {
  // Executions
  const { rows: brands, count } = await Brand.findAndCountAll({
    order: [["placing", "ASC"]]
  });
  return { brands, count };
};

// GET: Brand detail
exports.getBrand = async brandId => {
  // Executions
  const brand = await Brand.findOne({ where: { id: brandId } });
  if (!brand) {
    throw new HttpError(...ERRORS.INVALID.BRAND);
  }
  return brand;
};

// POST: Add Brand
exports.addBrand = async (id, name, description) => {
  // Validations
  const existingBrand = await Brand.findOne({ where: { id } });
  if (existingBrand) {
    throw new HttpError(...ERRORS.UNIQUE.BRAND);
  }
  // Executions
  const { "count(*)": count } = await Brand.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  await Brand.create({ id, name, description, placing: count });
};

// PUT: Update Brand
exports.updateBrand = async (id, name, description) => {
  // Validations
  const brand = await Brand.findOne({ where: { id } });
  if (!brand) {
    throw new HttpError(...ERRORS.INVALID.BRAND);
  }
  // Executions
  await Brand.update({ name, description }, { where: { id } });
  return true;
};

// PATCH: Swap Brands
exports.swapBrands = async (brand1Id, brand2Id) => {
  // Validations
  const brand1 = await Brand.findOne({ where: { id: brand1Id }, raw: true });
  const brand2 = await Brand.findOne({ where: { id: brand2Id }, raw: true });
  if (!brand1 || !brand2) {
    throw new HttpError(...ERRORS.INVALID.BRAND);
  }
  // Executions
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

// DELETE: Delete Brand
exports.deleteBrand = async brandId => {
  // Validations
  const brand = await Brand.findOne({ where: { id: brandId } });
  if (!brand) {
    throw new HttpError(...ERRORS.INVALID.BRAND);
  }
  // Executions
  const brands = await Brand.findAll({
    where: {
      placing: { [Op.gte]: brand.placing }
    },
    raw: true
  });
  const { "count(*)": brandCount } = await Brand.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  const oldBrands = JSON.parse(JSON.stringify(brands));
  for (let i = brand.placing; i < brandCount - 1; i += 1) {
    brands.find(c => c.placing === i + 1).placing = i;
  }
  _.remove(brands, { id: brandId });
  // Start transaction
  const result = db.sequelize.transaction(async t => {
    const deleteResult = await Brand.destroy({ where: { id: brandId } }, { transaction: t });
    const updateBrandResults = [];
    for (let i = brand.placing; i < brandCount - 1; i += 1) {
      const updatingBrand = oldBrands.find(c => c.placing === i + 1);
      const updateBrandResult = Brand.update(
        { placing: i },
        { where: { id: updatingBrand.id } },
        { transaction: t }
      );
      updateBrandResults.push(updateBrandResult);
    }
    return [deleteResult, ...(await Promise.all(updateBrandResults))].includes(0) ? 0 : 1;
  });
  return result;
};
