const Sequelize = require("sequelize");
const dbConfig = require("../config/db.config");

const account = require("./account");
const accountStaff = require("./accountStaff");
const accountUser = require("./accountUser");
const appointment = require("./appointment");
const attribute = require("./attribute");
const attributeType = require("./attributeType");
const brand = require("./brand");
const item = require("./item");
const itemAttribute = require("./itemAttribute");
const itemComment = require("./itemComment");
const itemImg = require("./itemImg");
const itemVariation = require("./itemVariation");
const media = require("./media");
const order = require("./order");
const orderDetail = require("./orderDetail");
const promotion = require("./promotion");
const promotionItem = require("./promotionItem");
const shop = require("./shop");
const shopItem = require("./shopItem");
const staffRole = require("./staffRole");
const supportTicket = require("./supportTicket");
const supportType = require("./supportType");
const type = require("./type");
const userAddress = require("./userAddress");
const userFavItem = require("./userFavItem");
const userInfo = require("./userInfo");
const voucher = require("./voucher");

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
  account: account(Sequelize, sequelize),
  accountStaff: accountStaff(Sequelize, sequelize),
  accountUser: accountUser(Sequelize, sequelize),
  appointment: appointment(Sequelize, sequelize),
  attribute: attribute(Sequelize, sequelize),
  attributeType: attributeType(Sequelize, sequelize),
  brand: brand(Sequelize, sequelize),
  item: item(Sequelize, sequelize),
  itemAttribute: itemAttribute(Sequelize, sequelize),
  itemComment: itemComment(Sequelize, sequelize),
  itemImg: itemImg(Sequelize, sequelize),
  itemVariation: itemVariation(Sequelize, sequelize),
  media: media(Sequelize, sequelize),
  order: order(Sequelize, sequelize),
  orderDetail: orderDetail(Sequelize, sequelize),
  promotion: promotion(Sequelize, sequelize),
  promotionItem: promotionItem(Sequelize, sequelize),
  shop: shop(Sequelize, sequelize),
  shopItem: shopItem(Sequelize, sequelize),
  staffRole: staffRole(Sequelize, sequelize),
  supportTicket: supportTicket(Sequelize, sequelize),
  supportType: supportType(Sequelize, sequelize),
  type: type(Sequelize, sequelize),
  userAddress: userAddress(Sequelize, sequelize),
  userFavItem: userFavItem(Sequelize, sequelize),
  userInfo: userInfo(Sequelize, sequelize),
  voucher: voucher(Sequelize, sequelize)
};

// RELATIONS

db.account.hasOne(db.accountUser, { as: "User", foreignKey: "accountId" });
db.account.hasOne(db.accountStaff, { as: "Staff", foreignKey: "accountId" });

db.accountStaff.belongsTo(db.account, { as: "Account", foreignKey: "accountId" });
db.accountStaff.belongsTo(db.staffRole, { as: "Role", foreignKey: "roleId" });
db.accountStaff.hasMany(db.order, { as: "Orders", foreignKey: "verifier" });
db.accountStaff.hasMany(db.supportTicket, {
  as: "Tickets",
  foreignKey: "support"
});

db.accountUser.belongsTo(db.account, { as: "Account", foreignKey: "accountId" });
db.accountUser.hasOne(db.userInfo, { as: "Info", foreignKey: "userId" });
db.accountUser.hasMany(db.userAddress, {
  as: "Addresses",
  foreignKey: "userId",
  onDelete: "CASCADE"
});
db.accountUser.hasMany(db.order, { as: "Orders", foreignKey: "userId" });
db.accountUser.hasMany(db.userFavItem, {
  as: "FavItems",
  foreignKey: "userId",
  onDelete: "CASCADE"
});
db.accountUser.hasMany(db.itemComment, {
  as: "Comments",
  foreignKey: "userId",
  onDelete: "CASCADE"
});
db.accountUser.hasMany(db.supportTicket, {
  as: "SupportTickets",
  foreignKey: "customer"
});

db.appointment.belongsTo(db.shop, { as: "Shop", foreignKey: "shopId" });

db.attribute.hasMany(db.itemAttribute, {
  as: "ItemAttributes",
  foreignKey: "attributeId"
});
db.attribute.hasMany(db.attributeType, {
  as: "AttributeTypes",
  foreignKey: "attributeId"
});

db.brand.belongsTo(db.brand, { as: "Parent", foreignKey: "parent", onDelete: "CASCADE" });
db.brand.hasOne(db.brand, { foreignKey: "parent" });
db.brand.hasMany(db.brand, { as: "Children", foreignKey: "parent" });
db.brand.hasMany(db.item, { as: "Items", foreignKey: "brandId" });

db.item.belongsTo(db.type, { as: "Type", foreignKey: "typeId" });
db.item.belongsTo(db.brand, { as: "Brand", foreignKey: "brandId" });
db.item.hasMany(db.itemImg, { as: "Imgs", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.itemAttribute, { as: "Attributes", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.shopItem, { as: "Inventory", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.itemVariation, { as: "Variations", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.userFavItem, { as: "UserFavs", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.itemComment, { as: "Comments", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.promotionItem, {
  as: "PromotionItems",
  foreignKey: "itemId",
  onDelete: "CASCADE"
});

db.itemAttribute.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });
db.itemAttribute.belongsTo(db.attribute, { as: "Attribute", foreignKey: "attributeId" });

db.itemComment.belongsTo(db.accountUser, { as: "User", foreignKey: "userId" });
db.itemComment.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });

db.itemImg.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });
db.itemImg.belongsTo(db.media, { as: "Media", foreignKey: "mediaId" });

db.itemVariation.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });
db.itemVariation.hasMany(db.shopItem, {
  as: "Inventory",
  foreignKey: "variationId",
  onDelete: "CASCADE"
});

db.media.hasMany(db.itemImg, { as: "ItemImgs", foreignKey: "mediaId" });

db.order.belongsTo(db.accountUser, { as: "Customer", foreignKey: "userId" });
db.order.belongsTo(db.accountStaff, { as: "Verifier", foreignKey: "verifier" });
db.order.hasMany(db.orderDetail, { as: "Items", foreignKey: "orderId", onDelete: "CASCADE" });
db.order.hasMany(db.supportTicket, {
  as: "SupportTickets",
  foreignKey: "orderId"
});

db.orderDetail.belongsTo(db.order, { as: "Order", foreignKey: "orderId" });
db.orderDetail.belongsTo(db.shopItem, { as: "ShopItem", foreignKey: "item_shopItem" });

db.promotion.hasMany(db.promotionItem, {
  as: "PromotionItems",
  foreignKey: "promoId",
  onDelete: "CASCADE"
});
db.promotion.hasMany(db.voucher, { as: "Vouchers", foreignKey: "promoId", onDelete: "CASCADE" });

db.promotionItem.belongsTo(db.promotion, { as: "Promotion", foreignKey: "promoId" });
db.promotionItem.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });

db.shop.hasMany(db.order, { as: "Orders", foreignKey: "shopId", onDelete: "CASCADE" });
db.shop.hasMany(db.shopItem, { as: "Inventory", foreignKey: "shopId", onDelete: "CASCADE" });
db.shop.hasMany(db.appointment, { as: "Appointments", foreignKey: "shopId", onDelete: "CASCADE" });

db.shopItem.belongsTo(db.shop, { as: "Shop", foreignKey: "shopId" });
db.shopItem.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });
db.shopItem.belongsTo(db.itemVariation, { as: "Variation", foreignKey: "variationId" });
db.shopItem.hasMany(db.orderDetail, { as: "OrderDetails", foreignKey: "item_shopItem" });

db.staffRole.hasMany(db.accountStaff, { as: "Staffs", foreignKey: "roleId" });

db.supportTicket.belongsTo(db.accountStaff, { as: "Support", foreignKey: "support" });
db.supportTicket.belongsTo(db.accountUser, { as: "Customer", foreignKey: "customer" });
db.supportTicket.belongsTo(db.order, { as: "Order", foreignKey: "orderId" });

db.supportType.hasMany(db.supportTicket, {
  as: "SupportTickets",
  foreignKey: "supportTypeId"
});

db.type.belongsTo(db.type, { as: "Parent", foreignKey: "parent", onDelete: "CASCADE" });
db.type.hasOne(db.type, { foreignKey: "parent" });
db.type.hasMany(db.type, { as: "Children", foreignKey: "parent" });
db.type.hasMany(db.item, { as: "Items", foreignKey: "typeId" });
db.type.hasMany(db.attributeType, {
  as: "AttributeTypes",
  foreignKey: "typeId",
  onDelete: "CASCADE"
});

db.userAddress.belongsTo(db.accountUser, { as: "User", foreignKey: "userId" });

db.userFavItem.belongsTo(db.accountUser, { as: "User", foreignKey: "userId" });
db.userFavItem.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });

db.userInfo.belongsTo(db.userInfo, { as: "User", foreignKey: "userId" });

db.voucher.belongsTo(db.promotion, { as: "Promotion", foreignKey: "promoId" });

module.exports = db;
