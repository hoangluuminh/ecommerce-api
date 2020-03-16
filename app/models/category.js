module.exports = (Sequelize, sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: Sequelize.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    placing: {
      type: Sequelize.INTEGER
    }
  }, {
    createdAt: false,
    updatedAt: false
  })
  return Category
}
