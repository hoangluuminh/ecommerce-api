module.exports = (Sequelize, sequelize) => {
  const ItemAttribute = sequelize.define(
    "Item_Attribute",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      attributeId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      itemId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      value: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return ItemAttribute;
};
