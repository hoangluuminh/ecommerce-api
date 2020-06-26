module.exports = (Sequelize, sequelize) => {
  const Promotion = sequelize.define(
    "Promotion",
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
      timeStart: {
        type: Sequelize.DATE,
        allowNull: false
      },
      timeEnd: {
        type: Sequelize.DATE,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      offPercent: {
        type: Sequelize.INTEGER
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return Promotion;
};
