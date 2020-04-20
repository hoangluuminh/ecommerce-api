module.exports = (Sequelize, sequelize) => {
  const ShopItem = sequelize.define(
    "Shop_Item",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      shopId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      itemId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      variationId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return ShopItem;
};
