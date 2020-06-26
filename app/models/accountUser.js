module.exports = (Sequelize, sequelize) => {
  const AccountUser = sequelize.define(
    "Account_User",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      accountId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      locked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );

  return AccountUser;
};
