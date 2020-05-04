module.exports = (Sequelize, sequelize) => {
  const Type = sequelize.define(
    "Type",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      placing: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return Type;
};
