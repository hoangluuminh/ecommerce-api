const shortid = require("shortid");

const generateId = options => {
  let isOrderId = null;
  if (options) {
    isOrderId = options.isOrderId;
  }
  if (isOrderId) {
    shortid.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-~");
  }
  return shortid.generate();
};
module.exports = generateId;
