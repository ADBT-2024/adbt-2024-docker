const mongoose = require('mongoose')
const { QueryTypes } = require('sequelize')
const { faker } = require('@faker-js/faker')
const generateOrders = async (nOrders, technology = 'mongoose', queryInterface = null) => {
  const orders = []
  const address = `${faker.address.streetAddress()}, ${faker.address.cityName()}, ${faker.address.country()}.`
  let availableOrderId
  if (technology === 'sequelize') {
    availableOrderId = await queryInterface.sequelize.query('SELECT COALESCE(MAX(id), 0) + 1 AS availableId FROM orders', { type: QueryTypes.SELECT })
    availableOrderId = availableOrderId[0].availableId
  }
  let restaurants, users
  if (technology === 'mongoose') {
    [restaurants, users] = await Promise.all([
      mongoose.connection.db.collection('restaurants').find({}).project({ _id: 1, products: 1, shippingCosts: 1 }).toArray(),
      mongoose.connection.db.collection('users').find({ userType: 'customer' }).project({ _id: 1 }).toArray()
    ])
  }

  for (let i = 0; i < nOrders; i++) {
    if (technology === 'mongoose') {
      const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)]
      const randomUserId = users[Math.floor(Math.random() * users.length)]._id
      orders.push((await generateFakeOrderMongoose(address, randomRestaurant, randomUserId)))
    } else if (technology === 'sequelize') {
      orders.push((await generateFakeOrderSequelize(address, queryInterface, availableOrderId)))
      availableOrderId++
    }
  }
  return orders
}

const generateFakeOrderMongoose = async (address, restaurant, userId) => {
  const { createdAt, updatedAt, startedAt, sentAt, deliveredAt, price, shippingCosts, products } = await generateCommonFakeOrderProperties(restaurant.products, restaurant.shippingCosts)

  return { createdAt, updatedAt, startedAt, sentAt, deliveredAt, price, address, shippingCosts, restaurantId: restaurant._id, userId, products }
}

const generateFakeOrderSequelize = async (address, queryInterface, availableOrderId) => {
  const restaurants = await queryInterface.sequelize.query('SELECT id,shippingCosts FROM restaurants ORDER BY RAND() LIMIT 1', { type: QueryTypes.SELECT })
  const users = await queryInterface.sequelize.query('SELECT id FROM users ORDER BY RAND() LIMIT 1', { type: QueryTypes.SELECT })
  const restaurantId = restaurants[0].id
  const restaurantProducts = await queryInterface.sequelize.query('SELECT * FROM products WHERE restaurantId = :restaurantId', { replacements: { restaurantId }, type: QueryTypes.SELECT })

  const userId = users[0].id

  const { createdAt, updatedAt, startedAt, sentAt, deliveredAt, price, shippingCosts, products } = await generateCommonFakeOrderProperties(restaurantProducts, restaurants[0].shippingCosts, availableOrderId)

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
  const products = await pickOrderProductsFromProducts(restaurantProducts, availableOrderId)
  let price = computePrice(products)
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
  return { createdAt, updatedAt, startedAt, sentAt, deliveredAt, price, shippingCosts, products }
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
