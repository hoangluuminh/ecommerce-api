const _ = require("lodash");

const db = require("../models");

const { Op, fn, col, literal, cast } = db.Sequelize;
const { attribute: Attribute, itemAttribute: ItemAttribute } = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");

// GET: List of attributes
exports.getAttributes = async () => {
  // Executions
  const { rows: attributes, count } = await Attribute.findAndCountAll({
    order: [["placing", "ASC"]]
  });
  for (let i = 0; i < attributes.length; i += 1) {
    const updtAttr = attributes[i];
    const newProp = updtAttr.valueType === "static" ? "usedValues" : "valueRanges";
    // eslint-disable-next-line
    updtAttr.dataValues[newProp] = await getAttributeValues(updtAttr.id, updtAttr.valueType);
  }
  return { attributes, count };
};

// GET: Attribute detail
exports.getAttribute = async attributeId => {
  // Executions
  const attribute = await Attribute.findOne({ where: { id: attributeId } });
  if (!attribute) {
    throw new HttpError(...ERRORS.INVALID.ATTRIBUTE);
  }
  return attribute;
};

// POST: Add Attribute
exports.addAttribute = async (id, name, description, valueType) => {
  // Validations
  const existingAttribute = await Attribute.findOne({ where: { id } });
  if (existingAttribute) {
    throw new HttpError(...ERRORS.UNIQUE.ATTRIBUTE);
  }
  // Executions
  const { "count(*)": count } = await Attribute.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  await Attribute.create({ id, name, description, valueType, placing: count });
};

// PUT: Update Attribute
exports.updateAttribute = async (id, name, description) => {
  // Validations
  const attribute = await Attribute.findOne({ where: { id } });
  if (!attribute) {
    throw new HttpError(...ERRORS.INVALID.ATTRIBUTE);
  }
  // Executions
  await Attribute.update({ name, description }, { where: { id } });
  return true;
};

// PATCH: Swap Attributes
exports.swapAttributes = async (attribute1Id, attribute2Id) => {
  // Validations
  const attribute1 = await Attribute.findOne({ where: { id: attribute1Id }, raw: true });
  const attribute2 = await Attribute.findOne({ where: { id: attribute2Id }, raw: true });
  if (!attribute1 || !attribute2) {
    throw new HttpError(...ERRORS.INVALID.ATTRIBUTE);
  }
  // Executions
  const result = db.sequelize.transaction(async t => {
    const attributeResults = [
      await Attribute.update(
        { placing: attribute2.placing },
        { where: { id: attribute1Id } },
        { transaction: t }
      ),
      await Attribute.update(
        { placing: attribute1.placing },
        { where: { id: attribute2Id } },
        { transaction: t }
      )
    ];
    return attributeResults.includes(0) ? 0 : 1;
  });
  return result;
};

// DELETE: Delete Attribute
exports.deleteAttribute = async attributeId => {
  // Validations
  const attribute = await Attribute.findOne({ where: { id: attributeId } });
  if (!attribute) {
    throw new HttpError(...ERRORS.INVALID.ATTRIBUTE);
  }
  // Executions
  const attributes = await Attribute.findAll({
    where: {
      placing: { [Op.gte]: attribute.placing }
    },
    raw: true
  });
  const { "count(*)": attributeCount } = await Attribute.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  const oldAttributes = JSON.parse(JSON.stringify(attributes));
  for (let i = attribute.placing; i < attributeCount - 1; i += 1) {
    attributes.find(c => c.placing === i + 1).placing = i;
  }
  _.remove(attributes, { id: attributeId });
  // Start transaction
  const result = db.sequelize.transaction(async t => {
    const deleteResult = await Attribute.destroy(
      { where: { id: attributeId } },
      { transaction: t }
    );
    const updateAttributeResults = [];
    for (let i = attribute.placing; i < attributeCount - 1; i += 1) {
      const updatingAttribute = oldAttributes.find(c => c.placing === i + 1);
      const updateAttributeResult = Attribute.update(
        { placing: i },
        { where: { id: updatingAttribute.id } },
        { transaction: t }
      );
      updateAttributeResults.push(updateAttributeResult);
    }
    return [deleteResult, ...(await Promise.all(updateAttributeResults))].includes(0) ? 0 : 1;
  });
  return result;
};

/* ---------- */
/* ULTILITIES */

// List of used attribute values / value ranges
const getAttributeValues = async (attributeId, valueType) => {
  switch (valueType) {
    default:
    case "static": {
      const seqAttributeValues = await ItemAttribute.findAll({
        where: { attributeId },
        attributes: [[literal("DISTINCT `value`"), "value"]]
      });
      const attributeValues = seqAttributeValues.map(aV => aV.value);
      return attributeValues;
    }
    case "dynamic": {
      const seqAttributeValueRanges = await ItemAttribute.findAll({
        where: { attributeId },
        attributes: [
          [fn("MIN", cast(col("Item_Attribute.value"), "FLOAT")), "min"],
          [fn("MAX", cast(col("Item_Attribute.value"), "FLOAT")), "max"]
        ],
        raw: true
      });
      return [seqAttributeValueRanges[0].min || 0, seqAttributeValueRanges[0].max || 0];
    }
  }
};
exports.getAttributeValues = getAttributeValues;
