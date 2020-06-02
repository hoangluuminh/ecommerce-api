const shortid = require("shortid");

const generateId = () => {
  return shortid.generate();
};
module.exports = generateId;
