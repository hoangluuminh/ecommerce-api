module.exports = (Sequelize, sequelize) => {
  const UserFavItem = sequelize.define(
    "User_Fav_Item",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      itemId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      userId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      }
    },
    {
      createdAt: "createdAt",
      updatedAt: false
    }
  );
  return UserFavItem;
};
