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
        // Cars
        db.type.create(
          {
            id: "sedan",
            name: "Sedan",
            cartRestrict: true,
            placing: 0
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "suv",
            name: "SUV",
            cartRestrict: true,
            placing: 1
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "hatchback",
            name: "Hatchback",
            cartRestrict: true,
            placing: 2
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "mpv",
            name: "MPV",
            cartRestrict: true,
            placing: 3
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "pickup",
            name: "Pick-up",
            cartRestrict: true,
            placing: 4
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "van",
            name: "Van",
            cartRestrict: true,
            placing: 5
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "coupe",
            name: "Coupe",
            cartRestrict: true,
            placing: 6
          },
          { transaction: t }
        )
      ]);

      // attributes
      await Promise.all([
        db.attribute.create(
          {
            id: "transmission",
            name: "Transmission", // Automatic, Manual, Automanual
            valueType: "static",
            placing: 0
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "fuel",
            name: "Fuel", // Gasoline, Petrol, Electric, Hybrid
            valueType: "static",
            placing: 1
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "top-speed",
            name: "Top speed", // 155...
            valueType: "dynamic",
            placing: 2
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "top-speed-unit",
            name: "Top speed Unit", // mph, km/h
            valueType: "static",
            placing: 3
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "fuel-consume",
            name: "Fuel consumption", // 26 27 28...
            valueType: "dynamic",
            placing: 4
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "fuel-consume-unit",
            name: "Fuel consumption Unit", // MPG, l/100km
            valueType: "static",
            placing: 5
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "seat",
            name: "Seating", // 4, 7
            valueType: "static",
            placing: 6
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "drivetrain",
            name: "Drivetrain", // FWD, RWD, 4WD, 4x2, 4x4, Other
            valueType: "static",
            placing: 7
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "engine",
            name: "Engine", // TwinPower Turbo, Biturbo
            valueType: "static",
            placing: 8
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "cylinder-count",
            name: "Cylinder count", // 1, 2, 3, 4, 5, 6, 8, 10, 12,...
            valueType: "dynamic",
            placing: 9
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "cylinder-capacity",
            name: "Cylinder capacity (cc)", // 149,3
            valueType: "dynamic",
            placing: 10
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "weight",
            name: "Weight", // 100 1000 ,...
            valueType: "dynamic",
            placing: 11
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "weight-unit",
            name: "Weight Unit", // lbs, kg
            valueType: "static",
            placing: 12
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "fuel-capacity",
            name: "Fuel capacity", // 100 1000 ,...
            valueType: "dynamic",
            placing: 13
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "fuel-capacity-unit",
            name: "Fuel capacity Unit", // gallon, litre
            valueType: "static",
            placing: 14
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "starter",
            name: "Starter", // Electric
            valueType: "static",
            placing: 15
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
          name: `${companyName} Showroom 1`,
          locationLng: "1",
          locationLat: "1",
          address: "100-102 Somewhere in this world",
          description: `${companyName} main showroom`
        },
        { transaction: t }
      );

      // paymentMethod
      await db.paymentMethod.create({ id: "cash", name: "Cash" }, { transaction: t });
      await db.paymentMethod.create({ id: "cc", name: "Credit Card" }, { transaction: t });

      // orderStatus
      await db.orderStatus.create({ id: "processing", name: "Processing" }, { transaction: t });
      await db.orderStatus.create({ id: "paid", name: "Paid" }, { transaction: t });
      await db.orderStatus.create({ id: "received", name: "Received" }, { transaction: t });
      await db.orderStatus.create({ id: "canceled", name: "Canceled" }, { transaction: t });

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
        await db.item.create(
          {
            id: `bmw-unknownicar-2018-${i}`,
            name: `BMW Unknownicar (${i})`,
            typeId: "coupe",
            brandId: "bmw",
            year: "2018",
            price: 10000,
            blog: "Car description",
            hidden: false
          },
          { transaction: t }
        );
        await Promise.all([
          db.itemAttribute.create(
            {
              attributeId: "seat",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "2", // 4, 7
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "top-speed",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "155", // 155...
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "top-speed-unit",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "mph", // mph, km/h
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "fuel-consume",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "28", // 26 27 28...
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "fuel-consume-unit",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "MPG", // MPG, l/100km
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "transmission",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "Manual", // Automatic, Manual, Automanual
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "fuel",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "Petrol", // Gasoline, Petrol, Electric, Hybrid
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "drivetrain",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "AWD", // FWD, RWD, 4WD, 4x2, 4x4, Other
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "engine",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "TwinPower Turbo", // TwinPower Turbo, Biturbo
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "weight",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "1000", // 100 1000 ,...
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "weight-unit",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "lbs", // lbs, kg
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "fuel-capacity",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "100", // 100 1000 ,...
              rating: 5
            },
            { transaction: t }
          ),
          db.itemAttribute.create(
            {
              attributeId: "fuel-capacity-unit",
              itemId: `bmw-unknownicar-2018-${i}`,
              value: "gallon", // gallon, litre
              rating: 5
            },
            { transaction: t }
          )
        ]);
        const variationRedId = generateId();
        const variationNightBlueId = generateId();
        await Promise.all([
          db.itemVariation.create(
            {
              id: variationRedId,
              itemId: `bmw-unknownicar-2018-${i}`,
              name: "Red",
              colors: "FF0000",
              placing: 0
            },
            { transaction: t }
          ),
          db.itemVariation.create(
            {
              id: variationNightBlueId,
              itemId: `bmw-unknownicar-2018-${i}`,
              name: "Night Blue",
              colors: "0057FF,303030",
              placing: 1
            },
            { transaction: t }
          )
        ]);
        await Promise.all([
          db.inventory.create(
            {
              id: `1HGBH41JXMN00001${i}`,
              itemId: `bmw-unknownicar-2018-${i}`,
              variationId: variationRedId,
              available: true,
              bought: false
            },
            { transaction: t }
          ),
          db.inventory.create(
            {
              id: `1HGBH41JXMN00002${i}`,
              itemId: `bmw-unknownicar-2018-${i}`,
              variationId: variationNightBlueId,
              available: true,
              bought: true
            },
            { transaction: t }
          )
        ]);
        await Promise.all([
          db.itemImg.create(
            {
              itemId: `bmw-unknownicar-2018-${i}`,
              mediaId: 1,
              placing: 0
            },
            { transaction: t }
          ),
          db.itemImg.create(
            {
              itemId: `bmw-unknownicar-2018-${i}`,
              mediaId: 2,
              placing: 1
            },
            { transaction: t }
          ),
          db.itemImg.create(
            {
              itemId: `bmw-unknownicar-2018-${i}`,
              mediaId: 3,
              placing: 2
            },
            { transaction: t }
          ),
          db.itemImg.create(
            {
              itemId: `bmw-unknownicar-2018-${i}`,
              mediaId: 4,
              placing: 3
            },
            { transaction: t }
          )
        ]);
        await db.userFavItem.create(
          { itemId: `bmw-unknownicar-2018-${i}`, userId: thatUserId, price: 10000 },
          { transaction: t }
        );
        await db.itemComment.create(
          {
            id: generateId(),
            itemId: `bmw-unknownicar-2018-${i}`,
            userId: thatUserId,
            rating: 5,
            comment: "This car is so cool, it puts Elon Musk to shame!!!"
          },
          { transaction: t }
        );
      }

      // promotion, promotionItem, voucher
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
        { promoId: promotion1.id, itemId: "bmw-unknownicar-2018-1" },
        { transaction: t }
      );
    });
  } catch (e) {
    console.log(e);
  }
}

dataSeed();
