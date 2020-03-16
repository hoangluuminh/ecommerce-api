const Sequelize = require("sequelize");
const dbConfig = require("../config/db.config");

const itemModel = require("./item");
const brandModel = require("./brand");
const categoryModel = require("./category");
const itemImgModel = require("./itemImg");
const userAccountModel = require("./userAccount");
const userRoleModel = require("./userRole");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  pool: { ...dbConfig.pool },
  logging: dbConfig.logging
});

const db = {
  Sequelize,
  sequelize,
  // Models
  item: itemModel(Sequelize, sequelize),
  brand: brandModel(Sequelize, sequelize),
  category: categoryModel(Sequelize, sequelize),
  itemImg: itemImgModel(Sequelize, sequelize),
  userAccount: userAccountModel(Sequelize, sequelize),
  userRole: userRoleModel(Sequelize, sequelize)
};

db.item.belongsTo(db.brand, { foreignKey: "brand" });
db.item.belongsTo(db.category, { foreignKey: "category" });
db.item.hasMany(db.itemImg, { foreignKey: "itemID", onDelete: "CASCADE" });

db.brand.hasMany(db.item, { foreignKey: "brand" });
db.brand.belongsTo(db.brand, { as: "SuperTH", foreignKey: "superTH", onDelete: "CASCADE" });
db.brand.hasOne(db.brand, { foreignKey: "superTH" });
db.brand.hasMany(db.brand, { as: "ChildTH", foreignKey: "superTH" });

db.category.hasMany(db.item, { foreignKey: "category" });

db.itemImg.belongsTo(db.item, { foreignKey: "itemID" });

db.userAccount.belongsTo(db.userRole, { foreignKey: "role" });

db.userRole.hasMany(db.userAccount, { foreignKey: "role" });

module.exports = db;
