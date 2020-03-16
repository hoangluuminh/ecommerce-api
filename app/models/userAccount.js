module.exports = (Sequelize, sequelize) => {
  const UserAccount = sequelize.define('User_Account', {
    id: {
      type: Sequelize.STRING(100),
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
      type: Sequelize.STRING,
      allowNull: false
    },
    lastname: {
      type: Sequelize.STRING(50)
    },
    firstname: {
      type: Sequelize.STRING(50)
    },
    role: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    locked: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  }, {
    indexes: [
      { unique: true, fields: ['username'] },
      { unique: true, fields: ['email'] }
    ]
  })

  return UserAccount
}
