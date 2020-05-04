module.exports = (Sequelize, sequelize) => {
  const ItemComment = sequelize.define(
    "Item_Comment",
    {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      itemId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      userId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return ItemComment;
};
