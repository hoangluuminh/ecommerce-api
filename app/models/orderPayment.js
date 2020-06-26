module.exports = (Sequelize, sequelize) => {
  const OrderPayment = sequelize.define(
    "Order_Payment",
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
      paymentMethodId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      paymentAmount: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      isPaid: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      due: {
        type: Sequelize.DATE,
        allowNull: false
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  );
  return OrderPayment;
};
