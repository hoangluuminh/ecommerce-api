module.exports = (Sequelize, sequelize) => {
  const Shop = sequelize.define(
    "Shop",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      locationLng: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      locationLat: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      phone: {
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
      updatedAt: "updatedAt"
    }
  );
  return Shop;
};
