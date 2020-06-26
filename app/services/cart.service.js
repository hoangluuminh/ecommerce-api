const _ = require("lodash");
const db = require("../models");

const { Op } = db.Sequelize;
const { item: Item, itemVariation: ItemVariation } = db;

const { ERRORS } = require("../utils/const.utils");
const { getItemPreparation, getItemFinalization } = require("./item.service");
const redisService = require("./redis.service");
const HttpError = require("../models/classes/http-error");

const getCartDetails = async cartList => {
  if (!cartList || cartList.length <= 0) {
    return [];
  }
  const { filteredCartList } = await filterCartList(cartList); // eslint-disable-line
  const [includes] = await getItemPreparation(null, {
    blacklist: ["Attributes", "ItemAttributes"]
  });
  const fetchedItems = await Item.findAll({
    include: includes,
    where: {
      id: {
        [Op.or]: filteredCartList.map(cartItem => cartItem.itemId)
      }
    }
  });
  // Create Cart Details from fetchedItems
  let cartDetails = [];
  fetchedItems.forEach(item => {
    // Get additional Item info such as Inventory size
    const newItem = getItemFinalization(item);
    // Get cartItems based on itemId
    const cartItemsOfItem = filteredCartList.filter(cI => cI.itemId === newItem.id);
    // Transform into object with CartInfo (itself) and the corresponsing Item
    const transformedCartItemsOfItem = cartItemsOfItem.map(_cartItemOfItem => {
      const cartItemOfItem = _cartItemOfItem;
      cartItemOfItem.Variation = newItem.Variations.find(
        varia => varia.id === cartItemOfItem.variationId
      );
      return {
        CartInfo: cartItemOfItem,
        Item: newItem
      };
    });
    cartDetails = [...cartDetails, ...transformedCartItemsOfItem];
  });
  return cartDetails;
};
exports.getCartDetails = getCartDetails;

exports.getRedisCartList = async accountId => {
  // Establish Redis connection
  const redisClient = redisService.redisClientInit();
  const storedUserRedis = await redisClient.get(accountId).then(val => JSON.parse(val) || null);
  const storedCartList = (storedUserRedis && storedUserRedis.cart) || [];

  return storedCartList;
};

exports.performSyncCart = async (accountId, cartList) => {
  // filteredCartList: from localStorage; storedCartList: from Redis
  // eslint-disable-next-line
  const { filteredCartList, filteredItems, filteredItemVariations } = await filterCartList(
    cartList
  );
  // Establish Redis connection
  const redisClient = redisService.redisClientInit();
  const storedUserRedis = await redisClient.get(accountId).then(val => JSON.parse(val) || null);
  const storedCartList = (storedUserRedis && storedUserRedis.cart) || [];

  // Executions
  for (let i = 0; i < filteredCartList.length; i += 1) {
    const cI = filteredCartList[i];
    // Validations
    const checkingItem = filteredItems.find(item => item.id === cI.itemId);
    const checkingItemVariation = filteredItemVariations.find(varia => varia.id === cI.variationId);
    if (checkingItemVariation) {
      // ACCEPTED
      const updatingCartItem = storedCartList.find(
        cartItem => cartItem.itemId === cI.itemId && cartItem.variationId === cI.variationId
      );
      if (!updatingCartItem) {
        // if storedCartList doesnt contain this particular cartItem
        storedCartList.push(cI);
      } else if (cI.quantity > updatingCartItem.quantity) {
        updatingCartItem.quantity = cI.quantity;
      }
      // REMOVE CART ITEM IF EXCEEDED INVENTORYSIZE
      // eslint-disable-next-line
      const availabilityResult = checkItemAvailability(
        getItemFinalization(checkingItem),
        cI.variationId,
        updatingCartItem ? updatingCartItem.quantity : cI.quantity,
        storedCartList,
        {
          isPerformingUpdate: true
        }
      );
      if (!availabilityResult) {
        _.remove(
          storedCartList,
          cartItem => cartItem.itemId === cI.itemId && cartItem.variationId === cI.variationId
        );
      }
    }
  }
  await redisClient.set(accountId, JSON.stringify({ ...storedUserRedis, cart: storedCartList }));

  const cartDetails = await getCartDetails(storedCartList);
  return cartDetails;
};

exports.performInteractCart = async (accountId, itemId, variationId, quantity, cart, options) => {
  /* accountId available if /add (me); cart available if /add-local (anonymous) */
  const { action } = options;
  // Validations
  const [includes] = await getItemPreparation(null, {
    whitelist: ["Inventory", "Variations", "PromotionItems"]
  });
  const existingItem = await Item.findOne({ include: includes, where: { id: itemId } });
  if (!existingItem) {
    throw new HttpError(...ERRORS.INVALID.ITEM);
  }
  const existingItemVariation = await ItemVariation.findOne({ where: { id: variationId, itemId } });
  if (!existingItemVariation) {
    throw new HttpError(...ERRORS.INVALID.ITEMVARIATION);
  }
  // Establish Redis connection
  const redisClient = redisService.redisClientInit();
  const storedUserRedis =
    accountId && (await redisClient.get(accountId).then(val => JSON.parse(val) || null));
  const cartList = cart || (storedUserRedis && storedUserRedis.cart) || [];
  // Check Item Availability
  if (
    // eslint-disable-next-line
    !checkItemAvailability(getItemFinalization(existingItem), variationId, quantity, cartList, {
      isPerformingUpdate: action === "update"
    })
  ) {
    throw new HttpError(...ERRORS.MISC.ORDER_QUANTITY);
  }
  // Executions
  const updatingCartItem = cartList.find(
    cartItem => cartItem.itemId === itemId && cartItem.variationId === variationId
  );
  if (!updatingCartItem) {
    cartList.push({ itemId, variationId, quantity });
  } else {
    // eslint-disable-next-line
    if (action === "update") {
      updatingCartItem.quantity = quantity;
    } else {
      updatingCartItem.quantity += 1;
    }
  }

  if (accountId && storedUserRedis) {
    await redisClient.set(accountId, JSON.stringify({ ...storedUserRedis, cart: cartList }));
  }

  const cartDetails = await getCartDetails(JSON.parse(JSON.stringify(cartList)));
  const { filteredCartList } = await filterCartList(JSON.parse(JSON.stringify(cartList))); // eslint-disable-line
  return { cartList: filteredCartList, cartDetails };
};

exports.deleteItemFromCart = async (accountId, itemId, variationId) => {
  // Establish Redis connection
  const redisClient = redisService.redisClientInit();
  const storedUserRedis = await redisClient.get(accountId).then(val => JSON.parse(val) || null);
  let storedCartList = (storedUserRedis && storedUserRedis.cart) || [];
  // Executions
  storedCartList = storedCartList.filter(
    cartItem => !(cartItem.itemId === itemId && cartItem.variationId === variationId)
  );
  await redisClient.set(accountId, JSON.stringify({ ...storedUserRedis, cart: storedCartList }));

  return true;
};

exports.clearMeCart = async accountId => {
  // Establish Redis connection
  const redisClient = redisService.redisClientInit();
  const storedUserRedis = await redisClient.get(accountId).then(val => JSON.parse(val) || null);
  let storedCartList = (storedUserRedis && storedUserRedis.cart) || [];
  // Executions
  storedCartList = [];
  await redisClient.set(accountId, JSON.stringify({ ...storedUserRedis, cart: storedCartList }));

  return true;
};

/* UTILITIES */
const filterCartList = async cartList => {
  // Filter invalid itemId
  const [includes] = await getItemPreparation(null, {
    whitelist: ["PromotionItems", "Variations"]
  });
  const filteredItems = await Item.findAll({
    include: includes,
    where: {
      id: {
        [Op.or]: cartList.map(cartItem => cartItem.itemId)
      }
    }
  });
  const filteredItemVariations = await ItemVariation.findAll({
    where: {
      [Op.or]: cartList.map(cartItem => ({
        [Op.and]: {
          id: cartItem.variationId,
          itemId: cartItem.itemId
        }
      }))
    }
  });
  const filteredCartList = cartList
    .filter(cI => filteredItems.map(i => i.id).includes(cI.itemId))
    .filter(cI => filteredItemVariations.map(i => i.id).includes(cI.variationId));

  return { filteredItems, filteredItemVariations, filteredCartList };
};

const checkItemAvailability = (item, variationId, quantity, cartList, options) => {
  // "item" MUST BE PROCESSED THROUGH getItemFinalization FIRST
  const { isPerformingUpdate } = options;
  const variationInventorySize = item.Variations.find(varia => varia.id === variationId).dataValues
    .inventorySize;
  let condition = false;
  if (isPerformingUpdate) {
    condition = quantity <= variationInventorySize;
  } else {
    const cartItem = cartList.find(cI => cI.itemId === item.id && cI.variationId === variationId);
    const cartItemQuantity = cartItem ? cartItem.quantity : 0;
    condition = quantity + cartItemQuantity <= variationInventorySize;
  }
  return condition;
};
