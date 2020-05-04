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
      statusId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      totalPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      appliedPromotion: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      downPayment: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      loadTerm: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      apr: {
        type: Sequelize.FLOAT,
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
