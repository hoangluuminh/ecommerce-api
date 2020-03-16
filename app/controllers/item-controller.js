const { validationResult } = require('express-validator')

const { getUserReqMsg, getDatabaseInteractMsg } = require('../utils/logging-utils')
const { paginationInfo } = require('../utils/pagination-utils')
const HttpError = require('../models/http-error')

const itemService = require('../services/item-service')
const controllerName = '[item-controller]'

exports.getItem = async (req, res, next) => {
  const actionName = 'getItem'
  // Declarations
  const { itemId } = req.params
  // Executions
  try {
    const item = await itemService.getItem(itemId)
    res.json({ item })
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    return next(new HttpError('Retrieving item unsuccessful. Please try again later', 500))
  }
}

exports.getItems = async (req, res, next) => {
  const actionName = 'getItems'
  // Validations
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors)
    return res.status(422).json(errors)
  }
  // Declarations
  const { query, page, size, sort, sortDesc, priceFrom, priceTo, brand, category, noImg } = req.query
  // Executions
  try {
    const { items, count } = await itemService.getItems(query, page, size, sort, sortDesc, priceFrom, priceTo, brand, category, noImg)
    res.json({
      items,
      pagination: paginationInfo(page, size, count, 5)
    })
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    return next(new HttpError('Retrieving items unsuccessful. Please try again later', 500))
  }
}

exports.addItem = async (req, res, next) => {
  const actionName = 'addItem'
  // Validations
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors)
    return res.status(422).json(errors)
  }
  // Declarations
  const { id, name, masp, priceOg, price, description, brand, category, itemImgs } = req.body
  // Executions
  try {
    const item = await itemService.addItem(id, name, masp, priceOg, price, description, brand, category, itemImgs)
    res.json({ item })
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new HttpError('Item already exists', 400))
    }
    return next(new HttpError('Adding item unsuccessful. Please try again later', 500))
  }
}

exports.addImgToItem = async (req, res, next) => {
  const actionName = 'addImgToItem'
  // Validations
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors)
    return res.status(422).json(errors)
  }
  // Declarations
  const { itemId } = req.params
  const { img } = req.body
  // Executions
  try {
    const itemImg = await itemService.addImgToItem(itemId, img)
    res.json({ itemImg })
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return next(new HttpError('Specified item cannot be found', 400))
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new HttpError('Image with specified URL already exists', 400))
    }
    return next(new HttpError('Adding image to item unsuccessful. Please try again later', 500))
  }
}

exports.updateItem = async (req, res, next) => {
  const actionName = 'updateItem'
  // Validations
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors)
    return res.status(422).json(errors)
  }
  // Declarations
  const { itemId: id } = req.params
  const { name, masp, priceOg, price, description, brand, category } = req.body
  // Executions
  try {
    const result = await itemService.updateItem(id, name, masp, priceOg, price, description, brand, category)
    if (!result) {
      return next(new HttpError('Specified item cannot be found', 400))
    }
    res.status(200).send()
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    return next(new HttpError('Updating item unsuccessful. Please try again later', 500))
  }
}

exports.swapItemImgs = async (req, res, next) => {
  const actionName = 'swapItemImgs'
  // Validations
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors)
    return res.status(422).json(errors)
  }
  // Declarations
  const { itemId: id } = req.params
  const { itemImg1Id, itemImg2Id } = req.body
  // Executions
  try {
    await itemService.swapItemImgs(id, itemImg1Id, itemImg2Id)
    res.status(200).send()
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    if (['ItemImgsNotFoundError'].indexOf(error.name) >= 0) {
      return next(new HttpError(error.message, 400))
    }
    return next(new HttpError('Swapping item images unsuccessful. Please try again later', 500))
  }
}

exports.setItemRemain = async (req, res, next) => {
  const actionName = 'setItemRemain'
  // Validations
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors)
    return res.status(422).json(errors)
  }
  // Declarations
  const { itemId: id } = req.params
  const { remain } = req.body
  // Executions
  try {
    const result = await itemService.setItemRemain(id, remain)
    if (!result) {
      return next(new HttpError('Specified item cannot be found', 400))
    }
    res.status(200).send()
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    return next(new HttpError('Set item remain unsuccessful. Please try again later', 500))
  }
}

exports.setItemHidden = async (req, res, next) => {
  const actionName = 'setItemHidden'
  // Validations
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors)
    return res.status(422).json(errors)
  }
  // Declarations
  const { itemId: id } = req.params
  const { hidden } = req.body
  // Executions
  try {
    const result = await itemService.setItemHidden(id, hidden)
    if (!result) {
      return next(new HttpError('Specified item cannot be found', 400))
    }
    res.status(200).send()
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    return next(new HttpError('Set item remain unsuccessful. Please try again later', 500))
  }
}

exports.deleteItem = async (req, res, next) => {
  const actionName = 'deleteItem'
  // Declarations
  const { itemId } = req.params
  // Executions
  try {
    const result = await itemService.deleteItem(itemId)
    if (!result) {
      return next(new HttpError('Specified item cannot be found', 400))
    }
    res.status(200).send()
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    return next(new HttpError('Deleting item unsuccessful. Please try again later', 500))
  }
}

exports.deleteItemImg = async (req, res, next) => {
  const actionName = 'deleteItemImg'
  // Validations
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors)
    return res.status(422).json(errors)
  }
  // Declarations
  const { itemId, itemImgId } = req.params
  // Executions
  try {
    await itemService.deleteItemImg(itemId, itemImgId)
    res.status(200).send()
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    if (['ItemImgNotFoundError'].indexOf(error.name) >= 0) {
      return next(new HttpError(error.message, 400))
    }
    return next(new HttpError('Deleting item image unsuccessful. Please try again later', 500))
  }
}
