const _ = require("lodash");

const db = require("../models");

const { Op, fn, col } = db.Sequelize;
const { maker: Maker } = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");

// GET: List of makers
exports.getMakers = async () => {
  // Executions
  const { rows: makers, count } = await Maker.findAndCountAll({
    order: [["placing", "ASC"]]
  });
  return { makers, count };
};

// GET: Maker detail
exports.getMaker = async makerId => {
  // Executions
  const maker = await Maker.findOne({ where: { id: makerId } });
  if (!maker) {
    throw new HttpError(...ERRORS.INVALID.MAKER);
  }
  return maker;
};

// POST: Add Maker
exports.addMaker = async (id, name, description) => {
  // Validations
  const existingMaker = await Maker.findOne({ where: { id } });
  if (existingMaker) {
    throw new HttpError(...ERRORS.UNIQUE.MAKER);
  }
  // Executions
  const { "count(*)": count } = await Maker.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  await Maker.create({ id, name, description, placing: count });
};

// PUT: Update Maker
exports.updateMaker = async (id, name, description) => {
  // Validations
  const maker = await Maker.findOne({ where: { id } });
  if (!maker) {
    throw new HttpError(...ERRORS.INVALID.MAKER);
  }
  // Executions
  await Maker.update({ name, description }, { where: { id } });
  return true;
};

// PATCH: Swap Makers
exports.swapMakers = async (maker1Id, maker2Id) => {
  // Validations
  const maker1 = await Maker.findOne({ where: { id: maker1Id }, raw: true });
  const maker2 = await Maker.findOne({ where: { id: maker2Id }, raw: true });
  if (!maker1 || !maker2) {
    throw new HttpError(...ERRORS.INVALID.MAKER);
  }
  // Executions
  const result = db.sequelize.transaction(async t => {
    const makerResults = [
      await Maker.update(
        { placing: maker2.placing },
        { where: { id: maker1Id } },
        { transaction: t }
      ),
      await Maker.update(
        { placing: maker1.placing },
        { where: { id: maker2Id } },
        { transaction: t }
      )
    ];
    return makerResults.includes(0) ? 0 : 1;
  });
  return result;
};

// DELETE: Delete Maker
exports.deleteMaker = async makerId => {
  // Validations
  const maker = await Maker.findOne({ where: { id: makerId } });
  if (!maker) {
    throw new HttpError(...ERRORS.INVALID.MAKER);
  }
  // Executions
  const makers = await Maker.findAll({
    where: {
      placing: { [Op.gte]: maker.placing }
    },
    raw: true
  });
  const { "count(*)": makerCount } = await Maker.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  const oldMakers = JSON.parse(JSON.stringify(makers));
  for (let i = maker.placing; i < makerCount - 1; i += 1) {
    makers.find(c => c.placing === i + 1).placing = i;
  }
  _.remove(makers, { id: makerId });
  // Start transaction
  const result = db.sequelize.transaction(async t => {
    const deleteResult = await Maker.destroy({ where: { id: makerId } }, { transaction: t });
    const updateMakerResults = [];
    for (let i = maker.placing; i < makerCount - 1; i += 1) {
      const updatingMaker = oldMakers.find(c => c.placing === i + 1);
      const updateMakerResult = Maker.update(
        { placing: i },
        { where: { id: updatingMaker.id } },
        { transaction: t }
      );
      updateMakerResults.push(updateMakerResult);
    }
    return [deleteResult, ...(await Promise.all(updateMakerResults))].includes(0) ? 0 : 1;
  });
  return result;
};
