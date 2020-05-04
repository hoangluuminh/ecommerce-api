module.exports = (Sequelize, sequelize) => {
  const UserWarranty = sequelize.define(
    "User_Warranty",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      inventoryId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      expire_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expire_mileage: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: false
    }
  );
  return UserWarranty;
};
