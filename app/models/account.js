module.exports = (Sequelize, sequelize) => {
  const Account = sequelize.define(
    "Account",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    },
    {
      indexes: [
        { unique: true, fields: ["username"] },
        { unique: true, fields: ["email"] }
      ],
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  );

  return Account;
};
