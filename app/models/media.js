module.exports = (Sequelize, sequelize) => {
  const Media = sequelize.define(
    "Media",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      url: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    },
    {
      indexes: [{ unique: true, fields: ["url"] }],
      createdAt: "createdAt",
      updatedAt: false
    }
  );
  return Media;
};
