module.exports = (Sequelize, sequelize) => {
  const ItemVariation = sequelize.define(
    "Item_Variation",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      itemId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      colors: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      placing: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return ItemVariation;
};
