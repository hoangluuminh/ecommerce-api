module.exports = (Sequelize, sequelize) => {
  const Item = sequelize.define(
    "Item",
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
      typeId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      brandId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        allowNull: false
      },
      ratingCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      blog: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      hidden: {
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

  return Item;
};
