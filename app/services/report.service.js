const db = require("../models");

const { Op, fn, col, where } = db.Sequelize;
const {
  order: Order,
  orderDetail: OrderDetail,
  item: Item,
  inventory: Inventory,
  scale: Scale,
  type: Type,
  maker: Maker,
  brand: Brand
} = db;

// const HttpError = require("../models/classes/http-error");
const { INT_MAX } = require("../utils/const.utils");

// GET: Monthly Sales Report
exports.getMonthlySalesReport = async year => {
  // Executions
  const fetchedReport = await Order.findAll({
    attributes: [
      [fn("MONTH", col("createdAt")), "month"],
      [fn("SUM", col("totalPrice")), "sales"],
      [fn("COUNT", col("*")), "count"]
    ],
    where: {
      [Op.and]: [where(db.sequelize.fn("YEAR", col("createdAt")), year)]
    },
    group: [fn("MONTH", col("createdAt"))]
  });
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const report = {
    labels: months,
    datasets: [
      {
        label: "Sales",
        data: months.map((m, index) => {
          const monthData = fetchedReport.find(data => data.dataValues.month === index + 1);
          return monthData ? monthData.dataValues.sales : 0;
        })
      },
      {
        label: "Quantity",
        data: months.map((m, index) => {
          const monthData = fetchedReport.find(data => data.dataValues.month === index + 1);
          return monthData ? monthData.dataValues.count : 0;
        })
      }
    ]
  };
  return report;
};

// GET: Product Sales Report
exports.getProductSalesReport = async (timeStart, timeEnd) => {
  const fetchedReportOptions = {
    attributes: [
      "item_name",
      [fn("SUM", col("item_price")), "sales"],
      [fn("COUNT", col("*")), "count"]
    ],
    include: [{ model: Order.scope(null), as: "Order", attributes: [] }],
    where: {
      "$Order.createdAt$": {
        [Op.between]: [timeStart, timeEnd]
      }
    },
    group: ["item_name"],
    order: [
      [fn("SUM", col("item_price")), "DESC"],
      [fn("COUNT", col("*")), "DESC"]
    ]
  };
  const topQuantity = 10;
  // Executions
  const fetchedReport = await OrderDetail.findAll({
    ...fetchedReportOptions,
    limit: topQuantity
  });
  const fetchedRemainReport = await OrderDetail.findAll({
    ...fetchedReportOptions,
    limit: INT_MAX,
    offset: topQuantity
  });
  const remainingData = {
    name: "Others",
    sales: fetchedRemainReport.reduce((acc, el) => {
      let newValue = acc;
      newValue += el.dataValues.sales;
      return newValue;
    }, 0),
    count: fetchedRemainReport.reduce((acc, el) => {
      let newValue = acc;
      newValue += el.dataValues.count;
      return newValue;
    }, 0)
  };
  const finalValues = {
    labels: fetchedReport.map(data => data.dataValues.item_name),
    sales: fetchedReport.map(data => data.dataValues.sales),
    count: fetchedReport.map(data => data.dataValues.count)
  };
  if (fetchedRemainReport.length > 0) {
    finalValues.labels.push(remainingData.name);
    finalValues.sales.push(remainingData.sales);
    finalValues.count.push(remainingData.count);
  }
  const report = {
    labels: finalValues.labels,
    datasets: [
      {
        label: "Sales",
        data: finalValues.sales
      },
      {
        label: "Quantity",
        data: finalValues.count
      }
    ]
  };
  return report;
};

// GET: Category Sales Report
exports.getCategorySalesReport = async (category, timeStart, timeEnd) => {
  const categoryModel = () => {
    switch (category) {
      case "scale":
        return { model: Scale, as: "Scale", attr: "scaleId" };
      case "type":
        return { model: Type, as: "Type", attr: "typeId" };
      case "maker":
        return { model: Maker, as: "Maker", attr: "makerId" };
      case "brand":
        return { model: Brand, as: "Brand", attr: "brandId" };
      default:
        return null;
    }
  };
  const fetchedReportOptions = {
    includeIgnoreAttributes: false,
    attributes: [
      [fn("SUM", col("item_price")), "sales"],
      [fn("COUNT", col("*")), "count"],
      // [col(`InventoryItem.Item.${categoryModel().attr}`), "id"],
      [col(`InventoryItem.Item.${categoryModel().as}.name`), "name"]
    ],
    include: [
      { model: Order.scope(null), as: "Order", attributes: [] },
      {
        model: Inventory.scope(null),
        as: "InventoryItem",
        attributes: [],
        include: [
          {
            model: Item.scope(null),
            as: "Item",
            attributes: [categoryModel().attr],
            include: [{ model: categoryModel().model.scope(null), as: categoryModel().as }]
          }
        ]
      }
    ],
    where: {
      "$Order.createdAt$": {
        [Op.between]: [timeStart, timeEnd]
      }
    },
    group: [`InventoryItem.Item.${categoryModel().attr}`],
    order: [
      [fn("SUM", col("item_price")), "DESC"],
      [fn("COUNT", col("*")), "DESC"]
    ]
  };
  const topQuantity = 5;
  // Executions
  const fetchedReport = await OrderDetail.findAll({
    ...fetchedReportOptions,
    limit: topQuantity
  });
  const fetchedRemainReport = await OrderDetail.findAll({
    ...fetchedReportOptions,
    limit: INT_MAX,
    offset: topQuantity
  });
  const remainingData = {
    name: "Others",
    sales: fetchedRemainReport.reduce((acc, el) => {
      let newValue = acc;
      newValue += el.dataValues.sales;
      return newValue;
    }, 0),
    count: fetchedRemainReport.reduce((acc, el) => {
      let newValue = acc;
      newValue += el.dataValues.count;
      return newValue;
    }, 0)
  };

  const finalValues = {
    labels: fetchedReport.map(data => data.dataValues.name),
    sales: fetchedReport.map(data => data.dataValues.sales),
    count: fetchedReport.map(data => data.dataValues.count)
  };
  if (fetchedRemainReport.length > 0) {
    finalValues.labels.push(remainingData.name);
    finalValues.sales.push(remainingData.sales);
    finalValues.count.push(remainingData.count);
  }
  const report = [
    {
      labels: finalValues.labels,
      datasets: [
        {
          label: "Sales",
          data: finalValues.sales
        }
      ]
    },
    {
      labels: finalValues.labels,
      datasets: [
        {
          label: "Quantity",
          data: finalValues.count
        }
      ]
    }
  ];
  return report;
};
