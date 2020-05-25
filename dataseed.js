const bcrypt = require("bcrypt");
require("dotenv").config();
const db = require("./app/models");

const generateId = require("./app/utils/id.utils");
const { companyName } = require("./app/configs/business.config");

// BCrypt Password Salt
const saltRounds = 10;

async function dataSeed() {
  try {
    await db.sequelize.sync();
    db.sequelize.transaction(async t => {
      // staffRole
      await db.staffRole.create({ id: "admin", name: "Admin" }, { transaction: t });
      await db.staffRole.create({ id: "manager", name: "Manager" }, { transaction: t });
      await db.staffRole.create({ id: "merchandiser", name: "Merchandiser" }, { transaction: t });
      await db.staffRole.create({ id: "support", name: "Customer Support" }, { transaction: t });

      // accounts
      const hashedPassword = await bcrypt.hash("123456", saltRounds);
      const accounts = await Promise.all([
        db.account.create(
          {
            id: generateId(),
            username: "admin",
            password: hashedPassword,
            email: "admin@autogoshop.com"
          },
          { transaction: t }
        ),
        db.account.create(
          {
            id: generateId(),
            username: "manager",
            password: hashedPassword,
            email: "manager@autogoshop.com"
          },
          { transaction: t }
        ),
        db.account.create(
          {
            id: generateId(),
            username: "merchandiser",
            password: hashedPassword,
            email: "merchandiser@autogoshop.com"
          },
          { transaction: t }
        ),
        db.account.create(
          {
            id: generateId(),
            username: "support",
            password: hashedPassword,
            email: "support@autogoshop.com"
          },
          { transaction: t }
        ),
        db.account.create(
          {
            id: generateId(),
            username: "hoangluuminh",
            password: hashedPassword,
            email: "hoangluuminh@autogoshop.com"
          },
          { transaction: t }
        )
      ]);
      const usersAndStaffs = await Promise.all([
        db.accountStaff.create(
          { id: generateId(), accountId: accounts[0].id, roleId: "admin" },
          { transaction: t }
        ),
        db.accountStaff.create(
          { id: generateId(), accountId: accounts[1].id, roleId: "manager" },
          { transaction: t }
        ),
        db.accountStaff.create(
          { id: generateId(), accountId: accounts[2].id, roleId: "merchandiser" },
          { transaction: t }
        ),
        db.accountStaff.create(
          { id: generateId(), accountId: accounts[3].id, roleId: "support" },
          { transaction: t }
        ),
        db.accountUser.create({ id: generateId(), accountId: accounts[4].id }, { transaction: t })
      ]);
      // info and address for user
      const thatUserId = usersAndStaffs[4].id;
      await Promise.all([
        db.userInfo.create(
          {
            userId: thatUserId,
            lastName: "Lưu Minh",
            firstName: "Hoàng",
            phone: "09080909008",
            gender: "m",
            birthday: new Date(),
            address: "100-102 Forever Land"
          },
          { transaction: t }
        )
      ]);

      // scale
      await Promise.all([
        db.scale.create({ id: "1_12", name: "1:12", placing: 0 }, { transaction: t }),
        db.scale.create({ id: "1_16", name: "1:16", placing: 1 }, { transaction: t }),
        db.scale.create({ id: "1_18", name: "1:18", placing: 2 }, { transaction: t }),
        db.scale.create({ id: "1_24", name: "1:24", placing: 3 }, { transaction: t }),
        db.scale.create({ id: "1_36", name: "1:36", placing: 4 }, { transaction: t })
      ]);

      // maker
      await Promise.all([
        db.maker.create({ id: "maisto", name: "Maisto", placing: 0 }, { transaction: t }),
        db.maker.create({ id: "bburago", name: "Bburago", placing: 1 }, { transaction: t }),
        db.maker.create({ id: "welly", name: "Welly", placing: 2 }, { transaction: t }),
        db.maker.create({ id: "rarstar", name: "Rarstar", placing: 3 }, { transaction: t }),
        db.maker.create({ id: "xlg", name: "XLG", placing: 4 }, { transaction: t })
      ]);

      // brands
      await Promise.all([
        db.brand.create({ id: "tesla", name: "Tesla", placing: 0 }, { transaction: t }),
        db.brand.create({ id: "ford", name: "Ford", placing: 1 }, { transaction: t }),
        db.brand.create({ id: "ferrari", name: "Ferrari", placing: 2 }, { transaction: t }),
        db.brand.create(
          { id: "mercedes-benz", name: "Mercedes Benz", placing: 3 },
          { transaction: t }
        ),
        db.brand.create({ id: "bmw", name: "BMW", placing: 4 }, { transaction: t })
      ]);

      // types
      await Promise.all([
        db.type.create(
          {
            id: "car",
            name: "Mô hình Ôtô",
            placing: 0
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "motorbike",
            name: "Mô hình Môtô",
            placing: 1
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "construction",
            name: "Mô hình xe công trình",
            placing: 2
          },
          { transaction: t }
        )
      ]);

      // attributes
      await Promise.all([
        db.attribute.create(
          {
            id: "chat-lieu",
            name: "Chất liệu", // Sắt, Nhựa
            valueType: "static",
            placing: 0
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "xuat-xu",
            name: "Xuất xứ", // Mỹ, Trung Quốc
            valueType: "static",
            placing: 1
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "trong-luong",
            name: "Trọng lượng",
            valueType: "dynamic",
            placing: 2
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "trong-luong-unit",
            name: "Đơn vị Trọng lượng", // g
            valueType: "static",
            placing: 3
          },
          { transaction: t }
        )
      ]);

      // supportType
      await Promise.all([
        db.supportType.create(
          {
            id: "question",
            name: "Questions",
            description: `Leave unanswered questions you have for ${companyName}`
          },
          { transaction: t }
        ),
        db.supportType.create(
          {
            id: "feedback",
            name: "Service comment, feedback",
            description: `Leave feedback about your experience with ${companyName}`
          },
          { transaction: t }
        ),
        db.supportType.create(
          {
            id: "website",
            name: "Website technical issues",
            description: `Receive assistance for trouble you are experiencing with the ${companyName} site`
          },
          { transaction: t }
        ),
        db.supportType.create(
          {
            id: "aftersales",
            name: "Aftersales inquiry",
            description:
              "Receive assistance for purchased products/orders (unexpected quality, manufacturing issues, refund, etc.)"
          },
          { transaction: t }
        )
      ]);

      // shop
      await db.shop.create(
        {
          id: "mainshop",
          name: `${companyName} TPHCM`,
          locationLng: "1",
          locationLat: "1",
          address: "100-102 Somewhere in this world",
          phone: "0909000999",
          description: `${companyName} main shop`
        },
        { transaction: t }
      );

      // paymentMethod
      await db.paymentMethod.create({ id: "cash", name: "Cash" }, { transaction: t });
      await db.paymentMethod.create({ id: "cc", name: "Credit Card" }, { transaction: t });

      // orderStatus
      await db.orderStatus.create({ id: "processing", name: "Chờ thanh toán" }, { transaction: t });
      await db.orderStatus.create({ id: "ordered", name: "Chờ xác nhận" }, { transaction: t });
      await db.orderStatus.create({ id: "verified", name: "Chuẩn bị hàng" }, { transaction: t });
      await db.orderStatus.create({ id: "delivering", name: "Đang giao hàng" }, { transaction: t });
      await db.orderStatus.create({ id: "delivered", name: "Đã nhận hàng" }, { transaction: t });
      await db.orderStatus.create(
        { id: "rejected", name: "Thanh toán thất bại" },
        { transaction: t }
      );
      await db.orderStatus.create({ id: "canceled", name: "Đã huỷ đơn" }, { transaction: t });

      /* USER-GENERATED */

      // media
      await db.media.create(
        { url: "0cQhD0me2_unknownicar.png", description: "" },
        { transaction: t }
      );
      await db.media.create(
        { url: "0cQhD0me3_unknownicar2.png", description: "" },
        { transaction: t }
      );
      await db.media.create(
        { url: "0cQhD0me4_unknownicar3.png", description: "" },
        { transaction: t }
      );
      await db.media.create(
        { url: "0cQhD0me5_unknownicar4.png", description: "" },
        { transaction: t }
      );

      // item
      for (let i = 1; i <= 30; i += 1) {
        const itemId = `bmw-unknownicar-${i}-24`;
        // eslint-disable-next-line
        await db.item.create(
          {
            id: itemId,
            name: `BMW Unknownicar (${i})`,
            scaleId: "1_24",
            typeId: "car",
            makerId: "maisto",
            brandId: "bmw",
            year: "2018",
            price: 1390000,
            blog: "Xe mô hình tuyệt đẹp đến từ Mai tồ",
            hidden: false
          },
          { transaction: t }
        );
        // eslint-disable-next-line
        await Promise.all([
          db.itemAttribute.create(
            {
              attributeId: "chat-lieu",
              itemId,
              value: "Sắt",
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "xuat-xu",
              itemId,
              value: "Mỹ",
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "trong-luong",
              itemId,
              value: "500",
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "trong-luong-unit",
              itemId,
              value: "g",
              rating: 5
            },
            { transaction: t }
          )
        ]);
        const variationRedId = generateId();
        const variationNightBlueId = generateId();
        // eslint-disable-next-line
        await Promise.all([
          db.itemVariation.create(
            {
              id: variationRedId,
              itemId,
              name: "Red",
              colors: "FF0000",
              placing: 0
            },
            { transaction: t }
          ),
          db.itemVariation.create(
            {
              id: variationNightBlueId,
              itemId,
              name: "Striped Blue",
              colors: "0057FF,303030",
              placing: 1
            },
            { transaction: t }
          )
        ]);
        // eslint-disable-next-line
        await Promise.all([
          db.inventory.create(
            {
              id: `1HGBH41JXMN00001${i}`,
              itemId,
              variationId: variationRedId,
              available: true,
              bought: false
            },
            { transaction: t }
          ),
          db.inventory.create(
            {
              id: `1HGBH41JXMN00002${i}`,
              itemId,
              variationId: variationNightBlueId,
              available: true,
              bought: true
            },
            { transaction: t }
          )
        ]);
        // eslint-disable-next-line
        await Promise.all([
          db.itemImg.create(
            {
              itemId,
              mediaId: 1,
              placing: 0
            },
            { transaction: t }
          ),
          db.itemImg.create(
            {
              itemId,
              mediaId: 2,
              placing: 1
            },
            { transaction: t }
          ),
          db.itemImg.create(
            {
              itemId,
              mediaId: 3,
              placing: 2
            },
            { transaction: t }
          ),
          db.itemImg.create(
            {
              itemId,
              mediaId: 4,
              placing: 3
            },
            { transaction: t }
          )
        ]);
        // eslint-disable-next-line
        await db.userFavItem.create(
          { itemId, userId: thatUserId, price: 100000000 },
          { transaction: t }
        );
        // eslint-disable-next-line
        await db.itemComment.create(
          {
            id: generateId(),
            itemId,
            userId: thatUserId,
            rating: 5,
            comment: "Xe đẹp, dá phải trăng, LIKE (y) (y)!!!"
          },
          { transaction: t }
        );
      }

      // promotion, promotionItem
      const promotion1 = await db.promotion.create(
        {
          id: generateId(),
          name: "Forever Sale",
          timeStart: new Date(),
          timeEnd: new Date("2030"),
          description: "Selected products are sale-off forever!",
          offPercent: 5
        },
        { transaction: t }
      );
      await db.promotionItem.create(
        { promoId: promotion1.id, itemId: "bmw-unknownicar-1-24" },
        { transaction: t }
      );
    });
  } catch (e) {
    console.log(e);
  }
}

dataSeed();
