const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const HttpError = require("../models/classes/http-error");
const mediaService = require("../services/media.service");
const { ERRORS } = require("../utils/const.utils");
const { getUploadedFiles } = require("../utils/upload.utils");

const controllerName = "media.controller";

// POST: Display image
exports.displayImage = async (req, res, next) => {
  const actionName = "getImage";
  // Declarations
  const { url: imageUrl } = req.params;
  // Executions
  try {
    const imagePath = await mediaService.getMediaPath(imageUrl);
    return res.sendFile(imagePath);
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.MEDIA_URL[0]].indexOf(error.name) >= 0) {
      return next(new HttpError(error.name, error.message, error.code));
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Upload image
exports.uploadImages = async (req, res, next) => {
  const actionName = "uploadImages";
  // Executions
  try {
    const files = await getUploadedFiles(req, "uploadingFiles", {
      maxSize: 25 * 1024 * 1024, // 25mb
      allowedTypes: ["image/jpeg", "image/png"]
    });
    if (files.length === 0) {
      return res.status(200).send();
    }
    const filesInstance = await mediaService.uploadImages(files);
    return res.json({ images: filesInstance });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.MISC.MEDIA_FILESIZE[0]].indexOf(error.name) >= 0) {
      return next(new HttpError(error.name, `${error.message} (25MB)`, error.code));
    }
    if ([ERRORS.INVALID.MEDIA_TYPE[0]].indexOf(error.name) >= 0) {
      return next(new HttpError(error.name, `${error.message} (png, jpeg)`, error.code));
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPLOAD));
  }
};
