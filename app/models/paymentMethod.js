module.exports = (Sequelize, sequelize) => {
  const PaymentMethod = sequelize.define(
    "Payment_Method",
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return PaymentMethod;
};
