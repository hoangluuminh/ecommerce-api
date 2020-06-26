module.exports = (Sequelize, sequelize) => {
  const Inventory = sequelize.define(
    "Inventory",
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
      variationId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      bought: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  );
  return Inventory;
};
