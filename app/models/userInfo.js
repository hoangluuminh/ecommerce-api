module.exports = (Sequelize, sequelize) => {
  const UserInfo = sequelize.define(
    "User_Info",
    {
      userId: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      gender: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      birthday: {
        type: Sequelize.DATE,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return UserInfo;
};
