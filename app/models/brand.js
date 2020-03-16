module.exports = (Sequelize, sequelize) => {
  const Brand = sequelize.define('Brand', {
    id: {
      type: Sequelize.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    superTH: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    placing: {
      type: Sequelize.INTEGER
    }
  }, {
    createdAt: false,
    updatedAt: false
  })
  return Brand
}
