module.exports = (Sequelize, sequelize) => {
  const SupportTicketStatus = sequelize.define(
    "Support_Ticket_Status",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return SupportTicketStatus;
};
