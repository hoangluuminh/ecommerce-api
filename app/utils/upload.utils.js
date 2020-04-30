const formidable = require("formidable");

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("./const.utils");

exports.getUploadedFiles = async (req, key, options) => {
  const { maxSize, allowedTypes } = options;

  let fileArr = [];
  const form = formidable({
    keepExtensions: true,
    multiples: true
  });

  // Validations
  if (options.maxSize) {
    form.on("progress", bytesReceived => { // eslint-disable-line
      if (bytesReceived > maxSize) {
        return form._error(new HttpError(...ERRORS.MISC.MEDIA_FILESIZE)); // eslint-disable-line
      }
    });
  }
  if (options.allowedTypes) {
    form.onPart = part => { // eslint-disable-line
      if (!allowedTypes.includes(part.mime)) {
        return form._error(new HttpError(...ERRORS.INVALID.MEDIA_TYPE)); // eslint-disable-line
      }
      if (!part.filename || allowedTypes.includes(part.mime)) {
        form.handlePart(part);
      }
    };
  }

  // Executions
  await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      const reqFiles = files[key];
      if (reqFiles) {
        fileArr = Array.isArray(reqFiles) && reqFiles.length > 1
          ? [...reqFiles] : [reqFiles];
      }
      return resolve();
    });
  });
  return fileArr;
};
