module.exports = (Sequelize, sequelize) => {
  const OrderDetail = sequelize.define(
    "Order_Detail",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      orderId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      item_id: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      item_variationId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      item_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      item_price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      item_inventoryId: {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return OrderDetail;
};
