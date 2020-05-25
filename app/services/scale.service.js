const _ = require("lodash");

const db = require("../models");

const { Op, fn, col } = db.Sequelize;
const { scale: Scale } = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");

// GET: List of scales
exports.getScales = async () => {
  // Executions
  const { rows: scales, count } = await Scale.findAndCountAll({
    order: [["placing", "ASC"]]
  });
  return { scales, count };
};

// GET: Scale detail
exports.getScale = async scaleId => {
  // Executions
  const scale = await Scale.findOne({ where: { id: scaleId } });
  if (!scale) {
    throw new HttpError(...ERRORS.INVALID.SCALE);
  }
  return scale;
};

// POST: Add Scale
exports.addScale = async (id, name, description) => {
  // Validations
  const existingScale = await Scale.findOne({ where: { id } });
  if (existingScale) {
    throw new HttpError(...ERRORS.UNIQUE.SCALE);
  }
  // Executions
  const { "count(*)": count } = await Scale.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  await Scale.create({ id, name, description, placing: count });
};

// PUT: Update Scale
exports.updateScale = async (id, name, description) => {
  // Validations
  const scale = await Scale.findOne({ where: { id } });
  if (!scale) {
    throw new HttpError(...ERRORS.INVALID.SCALE);
  }
  // Executions
  await Scale.update({ name, description }, { where: { id } });
  return true;
};

// PATCH: Swap Scales
exports.swapScales = async (scale1Id, scale2Id) => {
  // Validations
  const scale1 = await Scale.findOne({ where: { id: scale1Id }, raw: true });
  const scale2 = await Scale.findOne({ where: { id: scale2Id }, raw: true });
  if (!scale1 || !scale2) {
    throw new HttpError(...ERRORS.INVALID.SCALE);
  }
  // Executions
  const result = db.sequelize.transaction(async t => {
    const scaleResults = [
      await Scale.update(
        { placing: scale2.placing },
        { where: { id: scale1Id } },
        { transaction: t }
      ),
      await Scale.update(
        { placing: scale1.placing },
        { where: { id: scale2Id } },
        { transaction: t }
      )
    ];
    return scaleResults.includes(0) ? 0 : 1;
  });
  return result;
};

// DELETE: Delete Scale
exports.deleteScale = async scaleId => {
  // Validations
  const scale = await Scale.findOne({ where: { id: scaleId } });
  if (!scale) {
    throw new HttpError(...ERRORS.INVALID.SCALE);
  }
  // Executions
  const scales = await Scale.findAll({
    where: {
      placing: { [Op.gte]: scale.placing }
    },
    raw: true
  });
  const { "count(*)": scaleCount } = await Scale.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  const oldScales = JSON.parse(JSON.stringify(scales));
  for (let i = scale.placing; i < scaleCount - 1; i += 1) {
    scales.find(c => c.placing === i + 1).placing = i;
  }
  _.remove(scales, { id: scaleId });
  // Start transaction
  const result = db.sequelize.transaction(async t => {
    const deleteResult = await Scale.destroy({ where: { id: scaleId } }, { transaction: t });
    const updateScaleResults = [];
    for (let i = scale.placing; i < scaleCount - 1; i += 1) {
      const updatingScale = oldScales.find(c => c.placing === i + 1);
      const updateScaleResult = Scale.update(
        { placing: i },
        { where: { id: updatingScale.id } },
        { transaction: t }
      );
      updateScaleResults.push(updateScaleResult);
    }
    return [deleteResult, ...(await Promise.all(updateScaleResults))].includes(0) ? 0 : 1;
  });
  return result;
};
