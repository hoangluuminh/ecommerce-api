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
      scaleId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      typeId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      makerId: {
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
      blog: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      viewCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  );

  return Item;
};
