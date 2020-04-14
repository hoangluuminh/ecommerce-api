const bcrypt = require("bcrypt");
require("dotenv").config();
const db = require("./app/models");
// BCrypt Password Salt
const saltRounds = 10;

const companyName = "Autogo";

const getMili = () =>
  `${new Date().getTime()}${Math.random()
    .toString(36)
    .substring(7)}`;

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
            id: getMili(),
            username: "admin",
            password: hashedPassword,
            email: "admin@autogoshop.com"
          },
          { transaction: t }
        ),
        db.account.create(
          {
            id: getMili(),
            username: "manager",
            password: hashedPassword,
            email: "manager@autogoshop.com"
          },
          { transaction: t }
        ),
        db.account.create(
          {
            id: getMili(),
            username: "merchandiser",
            password: hashedPassword,
            email: "merchandiser@autogoshop.com"
          },
          { transaction: t }
        ),
        db.account.create(
          {
            id: getMili(),
            username: "support",
            password: hashedPassword,
            email: "support@autogoshop.com"
          },
          { transaction: t }
        ),
        db.account.create(
          {
            id: getMili(),
            username: "hoangluuminh",
            password: hashedPassword,
            email: "hoangluuminh@autogoshop.com"
          },
          { transaction: t }
        )
      ]);
      const usersAndStaffs = await Promise.all([
        db.accountStaff.create(
          { id: getMili(), accountId: accounts[0].id, roleId: "admin" },
          { transaction: t }
        ),
        db.accountStaff.create(
          { id: getMili(), accountId: accounts[1].id, roleId: "manager" },
          { transaction: t }
        ),
        db.accountStaff.create(
          { id: getMili(), accountId: accounts[2].id, roleId: "merchandiser" },
          { transaction: t }
        ),
        db.accountStaff.create(
          { id: getMili(), accountId: accounts[3].id, roleId: "support" },
          { transaction: t }
        ),
        db.accountUser.create({ id: getMili(), accountId: accounts[4].id }, { transaction: t })
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
            birthday: new Date()
          },
          { transaction: t }
        ),
        db.userAddress.create(
          {
            userId: thatUserId,
            fullName: "Lưu Minh Hoàng",
            phone: "09080909008",
            address: "100 Everyhere",
            isMain: true
          },
          { transaction: t }
        ),
        db.userAddress.create(
          {
            userId: thatUserId,
            fullName: "Hoang Lưu Mình",
            phone: "09080909009",
            address: "102 Everynowandthen",
            isMain: false
          },
          { transaction: t }
        )
      ]);

      // brands
      const brands = await Promise.all([
        db.brand.create({ id: "tesla", name: "Tesla", placing: 0 }, { transaction: t }),
        db.brand.create({ id: "ford", name: "Ford", placing: 1 }, { transaction: t }),
        db.brand.create({ id: "ferrari", name: "Ferrari", placing: 2 }, { transaction: t }),
        db.brand.create(
          { id: "mercedes-benz", name: "Mercedes Benz", placing: 3 },
          { transaction: t }
        )
      ]);
      await Promise.all([
        db.brand.create(
          {
            id: "ford-mustang",
            name: "Ford Mustang",
            parent: brands[1].id,
            placing: 0
          },
          { transaction: t }
        ),
        db.brand.create(
          {
            id: "fork-mustard",
            name: "Fork & Mustard",
            parent: brands[1].id,
            placing: 1
          },
          { transaction: t }
        )
      ]);

      // types
      const types = await Promise.all([
        db.type.create({ id: "car", name: "Cars", placing: 0 }, { transaction: t }),
        db.type.create({ id: "motorcycle", name: "Motorcycles", placing: 1 }, { transaction: t }),
        db.type.create({ id: "accessories", name: "Accessories", placing: 2 }, { transaction: t })
      ]);
      await Promise.all([
        // Cars
        db.type.create(
          {
            id: "sedan",
            name: "Sedan",
            parent: types[0].id,
            placing: 0
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "suv",
            name: "SUV",
            parent: types[0].id,
            placing: 1
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "hatchback",
            name: "Hatchback",
            parent: types[0].id,
            placing: 2
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "mpv",
            name: "MPV",
            parent: types[0].id,
            placing: 3
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "pickup",
            name: "Pick-up",
            parent: types[0].id,
            placing: 4
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "van",
            name: "Van",
            parent: types[0].id,
            placing: 5
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "coupe",
            name: "Coupe",
            parent: types[0].id,
            placing: 5
          },
          { transaction: t }
        ),
        // Motorcycles
        db.type.create(
          {
            id: "scooter",
            name: "Scooter",
            parent: types[1].id,
            placing: 0
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "sport-bike",
            name: "Sport Bike",
            parent: types[1].id,
            placing: 1
          },
          { transaction: t }
        ),
        // Accessories
        db.type.create(
          {
            id: "floor-mats",
            name: "Floor Mats",
            parent: types[2].id,
            placing: 0
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "seat-covers",
            name: "Seat Covers",
            parent: types[2].id,
            placing: 1
          },
          { transaction: t }
        ),
        db.type.create(
          {
            id: "infotainment",
            name: "Infotainment",
            parent: types[2].id,
            placing: 2
          },
          { transaction: t }
        )
      ]);

      // attributes
      await Promise.all([
        db.attribute.create(
          {
            id: "seat",
            name: "Seating", // 4, 7
            valueType: "string",
            placing: 0
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "fuel-consume-mpg",
            name: "MPG", // 26 27 28...
            valueType: "number",
            placing: 1
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "fuel-consume-lpkm",
            name: "Liter/100km", // 2,17
            valueType: "number",
            placing: 2
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "transmission",
            name: "Transmission", // Automatic, Manual, Automanual
            valueType: "string",
            placing: 3
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "fuel",
            name: "Fuel", // Gasoline, Petrol, Electric, Hybrid
            valueType: "string",
            placing: 4
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "drivetrain",
            name: "Drivetrain", // FWD, RWD, 4WD, 4x2, 4x4, Other
            valueType: "string",
            placing: 5
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "engine",
            name: "Engine", // TwinPower Turbo, Biturbo
            valueType: "string",
            placing: 6
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "cylinder-count",
            name: "Cylinder Count", // 1, 2, 3, 4, 5, 6, 8, 10, 12, Other
            valueType: "string",
            placing: 7
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "cylinder-capacity",
            name: "Cylinder Capacity (cc)", // 149,3
            valueType: "number",
            placing: 8
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "weight-lbs",
            name: "Weight (lbs)", // 100 1000 ,...
            valueType: "number",
            placing: 9
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "weight-kg",
            name: "Weight (kg)", // 100 1000 ,...
            valueType: "number",
            placing: 10
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "fuel-capacity-g",
            name: "Fuel Capacity (gallon)", // 100 1000 ,...
            valueType: "number",
            placing: 11
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "fuel-capacity-l",
            name: "Fuel Capacity (litre)", // 100 1000 ,...
            valueType: "number",
            placing: 12
          },
          { transaction: t }
        ),
        db.attribute.create(
          {
            id: "starter",
            name: "Starter", // Electric
            valueType: "string",
            placing: 13
          },
          { transaction: t }
        )
      ]);
      // attributeType
      await Promise.all([
        db.attributeType.create({ attributeId: "seat", typeId: "car" }, { transaction: t }),
        db.attributeType.create(
          { attributeId: "fuel-consume-mpg", typeId: "car" },
          { transaction: t }
        ),
        db.attributeType.create(
          { attributeId: "fuel-consume-lpkm", typeId: "motorcycle" },
          { transaction: t }
        ),
        db.attributeType.create({ attributeId: "transmission", typeId: "car" }, { transaction: t }),
        db.attributeType.create({ attributeId: "fuel", typeId: "car" }, { transaction: t }),
        db.attributeType.create({ attributeId: "fuel", typeId: "motorcycle" }, { transaction: t }),
        db.attributeType.create({ attributeId: "drivetrain", typeId: "car" }, { transaction: t }),
        db.attributeType.create({ attributeId: "engine", typeId: "car" }, { transaction: t }),
        db.attributeType.create(
          { attributeId: "engine", typeId: "motorcycle" },
          { transaction: t }
        ),
        db.attributeType.create(
          { attributeId: "cylinder-count", typeId: "car" },
          { transaction: t }
        ),
        db.attributeType.create(
          { attributeId: "cylinder-count", typeId: "motorcycle" },
          { transaction: t }
        ),
        db.attributeType.create(
          { attributeId: "cylinder-capacity", typeId: "motorcycle" },
          { transaction: t }
        ),
        db.attributeType.create({ attributeId: "weight-lbs", typeId: "car" }, { transaction: t }),
        db.attributeType.create(
          { attributeId: "weight-kg", typeId: "motorcycle" },
          { transaction: t }
        ),
        db.attributeType.create(
          { attributeId: "fuel-capacity-g", typeId: "car" },
          { transaction: t }
        ),
        db.attributeType.create(
          { attributeId: "fuel-capacity-l", typeId: "motorcycle" },
          { transaction: t }
        ),
        db.attributeType.create(
          { attributeId: "starter", typeId: "motorcycle" },
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
    });
  } catch (e) {
    console.log(e);
  }
}

dataSeed();
