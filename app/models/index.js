const Sequelize = require('sequelize')
const dbConfig = require('../config/db.config')

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  pool: { ...dbConfig.pool }
})

const db = {
  Sequelize,
  sequelize,
  // Models
  item: require('../models/item')(Sequelize, sequelize),
  brand: require('../models/brand')(Sequelize, sequelize),
  category: require('../models/category')(Sequelize, sequelize),
  itemImg: require('../models/itemImg')(Sequelize, sequelize),
  userAccount: require('../models/userAccount')(Sequelize, sequelize),
  userRole: require('../models/userRole')(Sequelize, sequelize)
}

db.item.belongsTo(db.brand, { foreignKey: 'brand' })
db.item.belongsTo(db.category, { foreignKey: 'category' })
db.item.hasMany(db.itemImg, { foreignKey: 'itemID', onDelete: 'CASCADE' })

db.brand.hasMany(db.item, { foreignKey: 'brand' })
db.brand.belongsTo(db.brand, { as: 'SuperTH', foreignKey: 'superTH' })
db.brand.hasOne(db.brand, { foreignKey: 'superTH' })
db.brand.hasMany(db.brand, { as: 'ChildTH', foreignKey: 'superTH' })

db.category.hasMany(db.item, { foreignKey: 'category' })

db.itemImg.belongsTo(db.item, { foreignKey: 'itemID' })

db.userAccount.belongsTo(db.userRole, { foreignKey: 'role' })

db.userRole.hasMany(db.userAccount, { foreignKey: 'role' })

module.exports = db
