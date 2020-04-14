module.exports = (Sequelize, sequelize) => {
  const UserAddress = sequelize.define(
    "User_Address",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      userId: {
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
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isMain: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  );
  return UserAddress;
};
