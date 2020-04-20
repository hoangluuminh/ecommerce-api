module.exports = (Sequelize, sequelize) => {
  const SupportTicket = sequelize.define(
    "Support_Ticket",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      supportTypeId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      support: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      customer: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      orderId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  );
  return SupportTicket;
};
