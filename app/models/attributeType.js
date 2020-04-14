module.exports = (Sequelize, sequelize) => {
  const AttributeType = sequelize.define(
    "Attribute_Type",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      attributeId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      typeId: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return AttributeType;
};
