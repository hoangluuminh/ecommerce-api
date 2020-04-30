const fs = require("fs");
const util = require("util");
const db = require("../models");

const { media: Media } = db;

const mediaConfig = require("../configs/media.config");
const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");
const generateId = require("../utils/id.utils");

// POST: Get image
exports.getMediaPath = async imageUrl => {
  // Validations
  const file = await Media.findOne({ where: { url: imageUrl } });
  if (!file) {
    throw new HttpError(...ERRORS.INVALID.MEDIA_URL);
  }
  // Executions
  return `${process.cwd()}${mediaConfig.DIR}/${file.url}`;
};

// POST: Upload image
exports.uploadImages = async files => {
  // Declarations
  const fileNames = [];
  // Executions
  const renamingPromises = [];
  for (let i = 0; i < files.length; i += 1) {
    const oldpath = files[i].path;
    const fileName = `${generateId()}_${files[i].name.slice(-25)}`; // slice from end, get 25 chars
    const newpath = `.${mediaConfig.DIR}/${fileName}`;

    const promise = util.promisify(fs.rename)(oldpath, newpath);

    renamingPromises.push(promise);
    fileNames.push(fileName);
  }
  await Promise.all(renamingPromises);

  const filesInstance = await Media.bulkCreate(
    fileNames.map(fileName => ({
      url: fileName
    }))
  );

  return filesInstance;
};
