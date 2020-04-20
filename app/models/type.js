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
      parent: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cartRestrict: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
