module.exports = (Sequelize, sequelize) => {
  const Voucher = sequelize.define(
    "Voucher",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      promoId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      used: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: false
    }
  );
  return Voucher;
};
