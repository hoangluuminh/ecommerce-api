module.exports = (Sequelize, sequelize) => {
  const AppointmentService = sequelize.define(
    "Appointment_Service",
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
  return AppointmentService;
};
