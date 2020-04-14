module.exports = (Sequelize, sequelize) => {
  const PromotionItem = sequelize.define(
    "Promotion_Item",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      promoId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      itemId: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return PromotionItem;
};
