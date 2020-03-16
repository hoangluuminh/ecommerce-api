module.exports = (Sequelize, sequelize) => {
  const Item = sequelize.define("Item", {
    id: {
      type: Sequelize.STRING(100),
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(100)
    },
    masp: {
      type: Sequelize.STRING(50)
    },
    price: {
      type: Sequelize.BIGINT
    },
    priceOg: {
      type: Sequelize.BIGINT
    },
    description: {
      type: Sequelize.TEXT
    },
    category: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    brand: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    remain: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    hidden: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  });

  return Item;
};
