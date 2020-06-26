module.exports = (Sequelize, sequelize) => {
  const Attribute = sequelize.define(
    "Attribute",
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
      },
      valueType: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      placing: {
        type: Sequelize.INTEGER
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return Attribute;
};
