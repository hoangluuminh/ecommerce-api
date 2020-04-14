module.exports = (Sequelize, sequelize) => {
  const Appointment = sequelize.define(
    "Appointment",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      serviceId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      shopId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      time: {
        type: Sequelize.DATE
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
  return Appointment;
};
