module.exports = (Sequelize, sequelize) => {
  const Order = sequelize.define(
    "Order",
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
      verifier: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      totalPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      paymentMethod: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      isPaid: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      shopId: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      delivery_fullname: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      delivery_phone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      delivery_address: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  );
  return Order;
};
