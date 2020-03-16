const db = require('../models')
const { fn, col } = db.Sequelize
const Category = db.category
const LogError = require('../models/log-error')

exports.getCategory = async (categoryId) => {
  const category = await Category.findOne({
    where: { id: categoryId }
  })
  return category
}

exports.getCategories = async () => {
  const categorys = await Category.findAll({
    order: [['placing', 'ASC']]
  })
  return { categorys }
}

exports.addCategory = async (id, name) => {
  const { 'count(*)': placing } = await Category.findOne({
    attributes: [fn('count', col('*'))],
    raw: true
  })
  const category = await Category.create({ id, name, placing })
  return category
}

exports.updateCategory = async (id, name) => {
  const results = await Category.update(
    { name },
    { where: { id } })
  return results[0]
}

exports.deleteCategory = async (categoryId) => {
  const category = await Category.findOne({
    where: { id: categoryId },
    raw: true
  })
  if (!category) {
    throw new LogError('Category cannot be found', 'CategoryNotFoundError')
  }
  const { 'count(*)': categoryCount } = await Category.findOne({
    attributes: [fn('count', col('*'))],
    raw: true
  })
  const result = db.sequelize.transaction(async (t) => {
    const deleteResult = await Category.destroy(
      { where: { id: categoryId } },
      { transaction: t })
    const updateCategoryResults = []
    for (let i = category.placing; i < categoryCount - 1; i++) {
      const updateCategoryResult = await Category.update(
        { placing: i },
        { where: { placing: i + 1 } },
        { transaction: t })
      updateCategoryResults.push(updateCategoryResult)
    }
    return [deleteResult, ...updateCategoryResults].includes(0) ? 0 : 1
  })
  return result
}
