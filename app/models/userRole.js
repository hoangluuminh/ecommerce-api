module.exports = (Sequelize, sequelize) => {
  const UserRole = sequelize.define('User_Role', {
    id: {
      type: Sequelize.STRING(100),
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    }
  }, {
    createdAt: false,
    updatedAt: false
  })

  return UserRole
}
