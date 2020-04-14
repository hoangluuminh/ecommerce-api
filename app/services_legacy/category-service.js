const _ = require("lodash");
const db = require("../models");

const { Op, fn, col } = db.Sequelize;
const Category = db.category;
const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const-utils");

exports.getCategory = async categoryId => {
  const category = await Category.findOne({
    where: { id: categoryId }
  });
  return category;
};

exports.getCategories = async () => {
  const categories = await Category.findAll({
    order: [["placing", "ASC"]]
  });
  return categories;
};

exports.addCategory = async (id, name) => {
  const { "count(*)": placing } = await Category.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  const category = await Category.create({ id, name, placing });
  return category;
};

exports.updateCategory = async (id, name) => {
  const results = await Category.update({ name }, { where: { id } });
  return results[0];
};

exports.deleteCategory = async categoryId => {
  const category = await Category.findOne({
    where: { id: categoryId },
    raw: true
  });
  if (!category) {
    throw new HttpError(...ERRORS.INVALID.CATEGORY);
  }
  const categories = await Category.findAll({
    where: {
      placing: { [Op.gte]: category.placing }
    },
    raw: true
  });
  const { "count(*)": categoryCount } = await Category.findOne({
    attributes: [fn("count", col("*"))],
    raw: true
  });
  // Update placings
  const oldCategories = JSON.parse(JSON.stringify(categories));
  for (let i = category.placing; i < categoryCount - 1; i += 1) {
    categories.find(c => c.placing === i + 1).placing = i;
  }
  _.remove(categories, { id: categoryId });
  // Start transaction
  const result = db.sequelize.transaction(async t => {
    const deleteResult = await Category.destroy({ where: { id: categoryId } }, { transaction: t });
    const updateCategoryResults = [];
    for (let i = category.placing; i < categoryCount - 1; i += 1) {
      const updatingCategory = oldCategories.find(c => c.placing === i + 1);
      const updateCategoryResult = Category.update(
        { placing: i },
        { where: { id: updatingCategory.id } },
        { transaction: t }
      );
      updateCategoryResults.push(updateCategoryResult);
    }
    return [deleteResult, ...(await Promise.all(updateCategoryResults))].includes(0) ? 0 : 1;
  });
  return result;
};
