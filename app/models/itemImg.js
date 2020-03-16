module.exports = (Sequelize, sequelize) => {
  const ItemImg = sequelize.define('Item_Img', {
    id: {
      type: Sequelize.STRING(100),
      primaryKey: true,
      allowNull: false
    },
    img: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    itemID: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    placing: {
      type: Sequelize.INTEGER
    }
  }, {
    indexes: [
      { unique: false, fields: ['img', 'itemID'] },
      { unique: true, fields: ['img'] }
    ],
    createdAt: false,
    updatedAt: false
  })
  return ItemImg
}
