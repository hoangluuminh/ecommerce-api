module.exports = (Sequelize, sequelize) => {
  const WarrantyService = sequelize.define(
    "Warranty_Service",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      userWarrantyId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: false
    }
  );
  return WarrantyService;
};
