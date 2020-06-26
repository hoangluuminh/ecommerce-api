const _ = require("lodash");

const db = require("../models");

const { Op, fn, col } = db.Sequelize;
const { type: Type } = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");

// GET: List of types
exports.getTypes = async () => {
  // Executions
  const { rows: types, count } = await Type.findAndCountAll({
    order: [["placing", "ASC"]]
  });
  return { types, count };
};

// GET: Type detail
exports.getType = async typeId => {
  // Executions
  const type = await Type.findOne({ where: { id: typeId } });
  if (!type) {
    throw new HttpError(...ERRORS.INVALID.TYPE);
  }
  return type;
};

// POST: Add Type
exports.addType = async (id, name, description) => {
  // Validations
  const existingType = await Type.findOne({ where: { id } });
  if (existingType) {
    throw new HttpError(...ERRORS.UNIQUE.TYPE);
  }
  // Executions
  const { "count(*)": count } = await Type.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  await Type.create({ id, name, description, placing: count });
};

// PUT: Update Type
exports.updateType = async (id, name, description) => {
  // Validations
  const type = await Type.findOne({ where: { id } });
  if (!type) {
    throw new HttpError(...ERRORS.INVALID.TYPE);
  }
  // Executions
  await Type.update({ name, description }, { where: { id } });
  return true;
};

// PATCH: Swap Types
exports.swapTypes = async (type1Id, type2Id) => {
  // Validations
  const type1 = await Type.findOne({ where: { id: type1Id }, raw: true });
  const type2 = await Type.findOne({ where: { id: type2Id }, raw: true });
  if (!type1 || !type2) {
    throw new HttpError(...ERRORS.INVALID.TYPE);
  }
  // Executions
  const result = db.sequelize.transaction(async t => {
    const typeResults = [
      await Type.update({ placing: type2.placing }, { where: { id: type1Id } }, { transaction: t }),
      await Type.update({ placing: type1.placing }, { where: { id: type2Id } }, { transaction: t })
    ];
    return typeResults.includes(0) ? 0 : 1;
  });
  return result;
};

// DELETE: Delete Type
exports.deleteType = async typeId => {
  // Validations
  const type = await Type.findOne({ where: { id: typeId } });
  if (!type) {
    throw new HttpError(...ERRORS.INVALID.TYPE);
  }
  // Executions
  const types = await Type.findAll({
    where: {
      placing: { [Op.gte]: type.placing }
    },
    raw: true
  });
  const { "count(*)": typeCount } = await Type.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  const oldTypes = JSON.parse(JSON.stringify(types));
  for (let i = type.placing; i < typeCount - 1; i += 1) {
    types.find(c => c.placing === i + 1).placing = i;
  }
  _.remove(types, { id: typeId });
  // Start transaction
  const result = db.sequelize.transaction(async t => {
    const deleteResult = await Type.destroy({ where: { id: typeId } }, { transaction: t });
    const updateTypeResults = [];
    for (let i = type.placing; i < typeCount - 1; i += 1) {
      const updatingType = oldTypes.find(c => c.placing === i + 1);
      const updateTypeResult = Type.update(
        { placing: i },
        { where: { id: updatingType.id } },
        { transaction: t }
      );
      updateTypeResults.push(updateTypeResult);
    }
    return [deleteResult, ...(await Promise.all(updateTypeResults))].includes(0) ? 0 : 1;
  });
  return result;
};
