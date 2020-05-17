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
        allowNull: true
      },
      downPayment: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      loanTerm: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      apr: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      payee_lastName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      payee_firstName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      payee_email: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      payee_phone: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  );
  return Order;
};
