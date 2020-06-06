const bcrypt = require("bcrypt");
require("dotenv").config();
const db = require("./app/models");

const generateId = require("./app/utils/id.utils");
const { companyName } = require("./app/configs/business.config");

// BCrypt Password Salt
const saltRounds = 10;

const newItem = async (item, itemVariations, itemAttributes, userId, t) => {
  const itemId = item.id;
  // eslint-disable-next-line
  await db.item.create(
    {
      id: itemId,
      name: item.name,
      scaleId: item.scale,
      typeId: item.type,
      makerId: item.maker,
      brandId: item.brand,
      year: item.year,
      price: item.price,
      blog: "Xe mô hình tuyệt đẹp!!!",
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
        value: itemAttributes["chat-lieu"],
        rating: 5
      },
      { transaction: t }
    ),
    db.itemAttribute.create(
      {
        attributeId: "xuat-xu",
        itemId,
        value: itemAttributes["xuat-xu"],
        rating: 5
      },
      { transaction: t }
    ),
    db.itemAttribute.create(
      {
        attributeId: "trong-luong",
        itemId,
        value: itemAttributes["trong-luong"],
        rating: 5
      },
      { transaction: t }
    ),
    db.itemAttribute.create(
      {
        attributeId: "trong-luong-unit",
        itemId,
        value: itemAttributes["trong-luong-unit"],
        rating: 5
      },
      { transaction: t }
    )
  ]);
  // eslint-disable-next-line
  await Promise.all(
    itemVariations.map((varia, index) =>
      db.itemVariation.create(
        {
          id: generateId(),
          itemId,
          name: varia.name,
          colors: varia.colors,
          placing: index
        },
        { transaction: t }
      )
    )
  );
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
  await db.itemComment.create(
    {
      id: generateId(),
      itemId,
      userId,
      rating: 5,
      comment: "Xe đẹp, dá phải trăng, LIKE (y) (y)!!!"
    },
    { transaction: t }
  );
};

async function dataSeed() {
  try {
    await db.sequelize.sync();
    db.sequelize.transaction(async t => {
      // staffRole
      await db.staffRole.create({ id: "admin", name: "Quản trị" }, { transaction: t });
      await db.staffRole.create({ id: "manager", name: "Quản lý Website" }, { transaction: t });
      await db.staffRole.create(
        { id: "merchandiser", name: "Nhân viên duyệt đơn" },
        { transaction: t }
      );
      await db.staffRole.create(
        { id: "support", name: "Nhân viên chăm sóc khách hàng" },
        { transaction: t }
      );

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
            email: "ceriagame@gmail.com"
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
            address: "32/7 Đường nào đó"
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
        db.maker.create({ id: "xlg", name: "XLG", placing: 4 }, { transaction: t }),
        db.maker.create({ id: "kyosho", name: "Kyosho", placing: 5 }, { transaction: t }),
        db.maker.create({ id: "gtspirit", name: "GTSpirit", placing: 6 }, { transaction: t })
      ]);

      // brands
      await Promise.all([
        db.brand.create({ id: "audi", name: "Audi", placing: 0 }, { transaction: t }),
        db.brand.create({ id: "ford", name: "Ford", placing: 1 }, { transaction: t }),
        db.brand.create({ id: "ferrari", name: "Ferrari", placing: 2 }, { transaction: t }),
        db.brand.create(
          { id: "mercedes-benz", name: "Mercedes Benz", placing: 3 },
          { transaction: t }
        ),
        db.brand.create({ id: "bmw", name: "BMW", placing: 4 }, { transaction: t }),
        db.brand.create({ id: "lamborghini", name: "Lamborghini", placing: 5 }, { transaction: t }),
        db.brand.create({ id: "porche", name: "Porche", placing: 5 }, { transaction: t })
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
            name: "Chất liệu", // Sắt, Kim loại
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
            id: "1_technical",
            name: "Vấn đề kĩ thuật",
            description: "Nhận trợ giúp, hoặc báo cáo lỗi bạn mắc phải khi xem sản phẩm, thanh toán"
          },
          { transaction: t }
        ),
        db.supportType.create(
          {
            id: "2_aftersales",
            name: "Truy vấn sau mua hàng",
            description:
              "Nhận trợ giúp hoặc khiếu nại về sản phẩm, đơn hàng đã mua (Sản phẩm lỗi, Trả hàng, v.v.)"
          },
          { transaction: t }
        )
      ]);
      // supportTicketStatus
      await Promise.all([
        db.supportTicketStatus.create(
          {
            id: "pending",
            name: "Chờ phản hồi"
          },
          { transaction: t }
        ),
        db.supportTicketStatus.create(
          {
            id: "inprogress",
            name: "Đang giải quyết"
          },
          { transaction: t }
        ),
        db.supportTicketStatus.create(
          {
            id: "solved",
            name: "Đã giải quyết"
          },
          { transaction: t }
        ),
        db.supportTicketStatus.create(
          {
            id: "closed",
            name: "Đã đóng"
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
          address: "100-102 Vĩnh Viễn, P9, Q10",
          phone: "0909000999",
          description: `Trụ sở chính của ${companyName}`
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
      await Promise.all([
        newItem(
          {
            id: "mercedes-benz-amg-gt-118-maisto",
            name: "Mercedes-Benz Amg Gt 1:18 Maisto",
            scale: "1_18",
            type: "car",
            maker: "maisto",
            brand: "mercedes-benz",
            year: 2019,
            price: 14590000
          },
          [{ name: "Xanh dương", colors: "0054CB" }],
          {
            "chat-lieu": "Kim loại",
            "xuat-xu": "Trung Quốc",
            "trong-luong": "900",
            "trong-luong-unit": "g"
          },
          thatUserId,
          t
        ),
        newItem(
          {
            id: "ford-mustang-gt-118-maisto",
            name: "Ford Mustang Gt 1:18 Maisto",
            scale: "1_18",
            type: "car",
            maker: "maisto",
            brand: "ford",
            year: 2019,
            price: 1459000
          },
          [{ name: "Xanh dương", colors: "38375A" }],
          {
            "chat-lieu": "Kim loại",
            "xuat-xu": "Trung Quốc",
            "trong-luong": "900",
            "trong-luong-unit": "g"
          },
          thatUserId,
          t
        ),
        newItem(
          {
            id: "lamborghini-centenario-118-maisto",
            name: "Lamborghini Centenario 1:18 Maisto",
            scale: "1_18",
            type: "car",
            maker: "maisto",
            brand: "lamborghini",
            year: 2019,
            price: 909000
          },
          [
            { name: "Xanh dương", colors: "226ABF" },
            { name: "Đỏ", colors: "FF4446" }
          ],
          {
            "chat-lieu": "Kim loại",
            "xuat-xu": "Trung Quốc",
            "trong-luong": "900",
            "trong-luong-unit": "g"
          },
          thatUserId,
          t
        ),
        newItem(
          {
            id: "audi-r8-gt-118-maisto",
            name: "Audi R8 Gt 1:18 Maisto",
            scale: "1_18",
            type: "car",
            maker: "maisto",
            brand: "audi",
            year: 2019,
            price: 869000
          },
          [{ name: "Đen", colors: "191E2E" }],
          {
            "chat-lieu": "Kim loại",
            "xuat-xu": "Trung Quốc",
            "trong-luong": "900",
            "trong-luong-unit": "g"
          },
          thatUserId,
          t
        ),
        newItem(
          {
            id: "audi-r8-v8-118-maisto",
            name: "Audi R8 V8 1:18 Maisto",
            scale: "1_18",
            type: "car",
            maker: "maisto",
            brand: "audi",
            year: 2019,
            price: 869000
          },
          [
            { name: "Trắng", colors: "EFF0F9" },
            { name: "Đỏ", colors: "FF001D" }
          ],
          {
            "chat-lieu": "Kim loại",
            "xuat-xu": "Trung Quốc",
            "trong-luong": "900",
            "trong-luong-unit": "g"
          },
          thatUserId,
          t
        ),
        newItem(
          {
            id: "ferrari-458-special-118-bburago-signature-series",
            name: "Ferrari 458 Special 1:18 Bburago (Signature Series)",
            scale: "1_18",
            type: "car",
            maker: "bburago",
            brand: "ferrari",
            year: 2019,
            price: 1449000
          },
          [
            { name: "Đỏ", colors: "FE0030,1C1923" },
            { name: "Đen", colors: "83888E" }
          ],
          {
            "chat-lieu": "Kim loại",
            "xuat-xu": "Thái Lan",
            "trong-luong": "900",
            "trong-luong-unit": "g"
          },
          thatUserId,
          t
        ),
        newItem(
          {
            id: "ferrari-testarossa-112-gtspirit",
            name: "Ferrari Testarossa 1:12 GTSpirit",
            scale: "1_12",
            type: "car",
            maker: "gtspirit",
            brand: "ferrari",
            year: 2019,
            price: 6500000
          },
          [{ name: "Đỏ", colors: "FF0634" }],
          {
            "chat-lieu": "Nhựa",
            "xuat-xu": "Pháp",
            "trong-luong": "1500",
            "trong-luong-unit": "g"
          },
          thatUserId,
          t
        ),
        newItem(
          {
            id: "mercedes-amg-g65-gtspirit-112",
            name: "Mercedes-AMG G65 GTSpirit 1:12",
            scale: "1_12",
            type: "car",
            maker: "gtspirit",
            brand: "mercedes-benz",
            year: 2019,
            price: 5500000
          },
          [
            { name: "Trắng", colors: "FFFFFF" },
            { name: "Đen", colors: "181E20" }
          ],
          {
            "chat-lieu": "Nhựa",
            "xuat-xu": "Pháp",
            "trong-luong": "1500",
            "trong-luong-unit": "g"
          },
          thatUserId,
          t
        ),
        newItem(
          {
            id: "ferrari-365-gtb4-daytona-112-gtspirit",
            name: "Ferrari 365 Gtb/4 Daytona 1:12 Gtspirit",
            scale: "1_12",
            type: "car",
            maker: "gtspirit",
            brand: "ferrari",
            year: 2019,
            price: 5100000
          },
          [{ name: "Đỏ", colors: "D82127" }],
          {
            "chat-lieu": "Nhựa",
            "xuat-xu": "Pháp",
            "trong-luong": "1500",
            "trong-luong-unit": "g"
          },
          thatUserId,
          t
        ),
        newItem(
          {
            id: " porsche-918-spyder-112-gtspirit ",
            name: "Porsche 918 Spyder 1:12 Gtspirit",
            scale: "1_12",
            type: "car",
            maker: "gtspirit",
            brand: "porche",
            year: 2019,
            price: 5100000
          },
          [{ name: "Trắng Đỏ", colors: "FAFAFA,D82127" }],
          {
            "chat-lieu": "Nhựa",
            "xuat-xu": "Pháp",
            "trong-luong": "1500",
            "trong-luong-unit": "g"
          },
          thatUserId,
          t
        )
      ]);

      // promotion, promotionItem
      const promotion1 = await db.promotion.create(
        {
          id: generateId(),
          name: "Khuyến mãi vĩnh cữu",
          timeStart: new Date(),
          timeEnd: new Date("2030"),
          description: "Giảm 10% với các sản phẩm nhất định",
          offPercent: 5
        },
        { transaction: t }
      );
      await db.promotionItem.create(
        { promoId: promotion1.id, itemId: "mercedes-benz-amg-gt-118-maisto" },
        { transaction: t }
      );
    });
  } catch (e) {
    console.log(e);
  }
}

dataSeed();
