const mongoose = require('mongoose')
const { QueryTypes } = require('sequelize')
const { faker } = require('@faker-js/faker')
const generateOrders = async (nOrders, technology = 'mongoose', queryInterface = null) => {
  const orders = []
  const address = `${faker.address.streetAddress()}, ${faker.address.cityName()}, ${faker.address.country()}.`
  let availableOrderId
  const productsByRestaurant = {}
  if (technology === 'sequelize') {
    availableOrderId = await queryInterface.sequelize.query('SELECT COALESCE(MAX(id), 0) + 1 AS availableId FROM Orders', { type: QueryTypes.SELECT })
    availableOrderId = availableOrderId[0].availableId
  }
  let restaurants, users
  if (technology === 'mongoose') {
    [restaurants, users] = await Promise.all([
      mongoose.connection.db.collection('restaurants').find({}).project({ _id: 1, products: 1, shippingCosts: 1 }).toArray(),
      mongoose.connection.db.collection('users').find({ userType: 'customer' }).project({ _id: 1 }).toArray()
    ])
  } else if (technology === 'sequelize') {
    restaurants = await queryInterface.sequelize.query('SELECT id,shippingCosts FROM Restaurants ORDER BY RAND()', { type: QueryTypes.SELECT })
    users = await queryInterface.sequelize.query('SELECT id FROM Users ORDER BY RAND()', { type: QueryTypes.SELECT })
    const productDTOs = await queryInterface.sequelize.query('SELECT id, price, restaurantId FROM Products', { type: QueryTypes.SELECT })
    productDTOs.forEach((productDTO) => {
      if (!(productDTO.restaurantId in productsByRestaurant)) { productsByRestaurant[productDTO.restaurantId] = [] }
      productsByRestaurant[productDTO.restaurantId].push(productDTO)
    })
  }

  for (let i = 0; i < nOrders; i++) {
    if (technology === 'mongoose') {
      const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)]
      const randomUserId = users[Math.floor(Math.random() * users.length)]._id
      orders.push((await generateFakeOrderMongoose(address, randomRestaurant, randomUserId)))
    } else if (technology === 'sequelize') {
      const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)]
      // Selecciono restaurante aleatorio, obtengo los productos, y se lo paso a generateFakeORderSequelize
      orders.push((await generateFakeOrderSequelize(address, availableOrderId, randomRestaurant, users[Math.floor(Math.random() * users.length)].id, productsByRestaurant[randomRestaurant.id])))
      availableOrderId++
    }
  }
  return orders
}

const generateFakeOrderMongoose = async (address, restaurant, userId) => {
  const { createdAt, updatedAt, startedAt, sentAt, deliveredAt, price, shippingCosts, products } = await generateCommonFakeOrderProperties(restaurant.products, restaurant.shippingCosts)

  return { createdAt, updatedAt, startedAt, sentAt, deliveredAt, price, address, shippingCosts, restaurantId: restaurant._id, userId, products }
}

const generateFakeOrderSequelize = async (address, availableOrderId, restaurant, userId, restaurantProducts) => {
  const restaurantId = restaurant.id
  const { createdAt, updatedAt, startedAt, sentAt, deliveredAt, price, shippingCosts, products } = await generateCommonFakeOrderProperties(restaurantProducts, restaurant.shippingCosts, availableOrderId)
  return { id: availableOrderId, createdAt, updatedAt, startedAt, sentAt, deliveredAt, price, address, shippingCosts, restaurantId, userId, products }
}

const pickOrderProductsFromProducts = async (restaurantProducts, orderId) => {
  const orderProducts = []
  const nProducts = getRandomNumberOfProducts(restaurantProducts.length)
  const shuffledProducts = shuffleArray(restaurantProducts)
  for (let i = 0; i < nProducts && i < shuffledProducts.length; i++) {
    const { id, _id, name, image, price } = shuffledProducts[i]
    const quantity = faker.datatype.number({ min: 1, max: 3 })
    const orderProduct = _id ? { _id, name, image, unityPrice: price, quantity } : { productId: id, orderId, unityPrice: price, quantity }
    orderProducts.push(orderProduct)
  }
  return orderProducts
}

const shuffleArray = (arr) => {
  const shuffledArr = [...arr]
  for (let i = shuffledArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffledArr[i]
    shuffledArr[i] = shuffledArr[j]
    shuffledArr[j] = temp
  }
  return shuffledArr
}
async function generateCommonFakeOrderProperties (restaurantProducts, restaurantShippingCosts, availableOrderId) {
  const orderProducts = await pickOrderProductsFromProducts(restaurantProducts, availableOrderId)
  let price = computePrice(orderProducts)
  const shippingCosts = price > 10 ? 0 : restaurantShippingCosts
  price += shippingCosts
  const status = faker.helpers.arrayElement(['pending', 'in process', 'sent', 'delivered'])
  const createdAt = faker.date.recent(5)
  let updatedAt = createdAt

  let startedAt, sentAt, deliveredAt
  if (status === 'in process') {
    startedAt = faker.date.soon(0, createdAt)
    updatedAt = startedAt
  } else if (status === 'sent') {
    startedAt = faker.date.soon(0, createdAt)
    sentAt = faker.date.soon(0, startedAt)
    updatedAt = sentAt
  } else if (status === 'delivered') {
    startedAt = faker.date.soon(0, createdAt)
    sentAt = faker.date.soon(0, startedAt)
    deliveredAt = faker.date.soon(0, sentAt)
    updatedAt = deliveredAt
  }
  return { createdAt, updatedAt, startedAt, sentAt, deliveredAt, price, shippingCosts, products: orderProducts }
}

function getRandomNumberOfProducts (max) {
  const mean = 5
  const stdDev = 2
  let numProducts = Math.round((Math.random() * (max - mean)) + mean - stdDev * (Math.log(Math.random())))
  if (numProducts < 1) {
    numProducts = 1
  } else if (numProducts > max) {
    numProducts = max
  }
  return numProducts
}

const computePrice = (orderProducts) => {
  return orderProducts.reduce((total, productLineWithPrice) => total + productLineWithPrice.quantity * productLineWithPrice.unityPrice, 0)
}

module.exports = generateOrders
