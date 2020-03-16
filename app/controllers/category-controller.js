const { validationResult } = require('express-validator')

const { getUserReqMsg, getDatabaseInteractMsg } = require('../utils/logging-utils')
const HttpError = require('../models/http-error')

const categoryService = require('../services/category-service')
const controllerName = '[category-controller]'

exports.getCategory = async (req, res, next) => {
  const actionName = 'getCategory'
  // Declarations
  const { categoryId } = req.params
  // Executions
  try {
    const category = await categoryService.getCategory(categoryId)
    res.json({ category })
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    return next(new HttpError('Retrieving category unsuccessful. Please try again later', 500))
  }
}

exports.getCategories = async (req, res, next) => {
  const actionName = 'getCategories'
  // Validations
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors)
    return res.status(422).json(errors)
  }
  // Executions
  try {
    const categories = await categoryService.getCategories()
    res.json({ categories })
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    return next(new HttpError('Retrieving categories unsuccessful. Please try again later', 500))
  }
}

exports.addCategory = async (req, res, next) => {
  const actionName = 'addCategory'
  // Validations
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors)
    return res.status(422).json(errors)
  }
  // Declarations
  const { id, name } = req.body
  // Executions
  try {
    const category = await categoryService.addCategory(id, name)
    res.json({ category })
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new HttpError('Category with specified id already exists', 400))
    }
    return next(new HttpError('Adding category unsuccessful. Please try again later', 500))
  }
}

exports.updateCategory = async (req, res, next) => {
  const actionName = 'updateCategory'
  // Declarations
  const { categoryId: id } = req.params
  const { name } = req.body
  // Executions
  try {
    const result = await categoryService.updateCategory(id, name)
    if (!result) {
      return next(new HttpError('Specified category cannot be found', 400))
    }
    res.status(200).send()
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    return next(new HttpError('Updating category unsuccessful. Please try again later', 500))
  }
}

exports.deleteCategory = async (req, res, next) => {
  const actionName = 'deleteCategory'
  // Declarations
  const { categoryId } = req.params
  // Executions
  try {
    await categoryService.deleteCategory(categoryId)
    res.status(200).send()
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error)
    if (['CategoryNotFoundError'].indexOf(error.name) >= 0) {
      return next(new HttpError(error.message, 400))
    }
    return next(new HttpError('Deleting category unsuccessful. Please try again later', 500))
  }
}
