const mongoose = require('mongoose')
const { QueryTypes } = require('sequelize')
const { faker } = require('@faker-js/faker')
const { generateProducts, generateRandomNumberOfProducts } = require('./productsGenerator.cjs')

const generateRestaurants = async (nRestaurants, technology = 'mongoose', queryInterface = null) => {
  const restaurants = []
  let restaurantCategories, users
  if (technology === 'mongoose') {
    [restaurantCategories, users] = await Promise.all([
      mongoose.connection.db.collection('restaurantcategories').find({}).toArray(),
      mongoose.connection.db.collection('users').find({ userType: 'owner' }).project({ _id: 1 }).toArray()
    ])
  }

  for (let i = 0; i < nRestaurants; i++) {
    if (technology === 'mongoose') {
      const randomRestaurantCategory = restaurantCategories[Math.floor(Math.random() * restaurantCategories.length)]
      const randomUserId = users[Math.floor(Math.random() * users.length)]._id
      restaurants.push((await generateFakeRestaurantMongoose(randomRestaurantCategory, randomUserId)))
    } else if (technology === 'sequelize') {
      restaurants.push((await generateFakeRestaurantSequelize(queryInterface)))
    }
  }
  return restaurants
}

async function generateFakeRestaurantMongoose (restaurantCategory, userId) {
  const _id = new mongoose.Types.ObjectId()
  const { name, description, address, postalCode, url, shippingCosts, email, phone, logo, heroImage, status, createdAt, updatedAt } = generateCommonFakeRestaurantProperties()

  const products = await generateProducts(_id, generateRandomNumberOfProducts(), restaurantCategory.name)

  return { _id, name, description, address, postalCode, url, shippingCosts, email, phone, logo, heroImage, status, restaurantCategoryId: restaurantCategory._id, userId, products, createdAt, updatedAt }
}

const generateFakeRestaurantSequelize = async (queryInterface) => {
  const { name, description, address, postalCode, url, shippingCosts, email, phone, logo, heroImage, status, createdAt, updatedAt } = generateCommonFakeRestaurantProperties()
  const users = await queryInterface.sequelize.query('SELECT id FROM Users WHERE userType LIKE \'owner\' ORDER BY RAND() LIMIT 1', { type: QueryTypes.SELECT })
  const userId = users[0].id
  const restaurantCategories = await queryInterface.sequelize.query('SELECT id FROM RestaurantCategories ORDER BY RAND() LIMIT 1', { type: QueryTypes.SELECT })
  const restaurantCategoryId = restaurantCategories[0].id

  return { name, description, address, postalCode, url, shippingCosts, email, averageServiceMinutes: null, phone, logo, heroImage, status, createdAt, updatedAt, userId, restaurantCategoryId }
}

const generateCommonFakeRestaurantProperties = () => {
  const name = faker.company.name()
  const description = faker.lorem.paragraph()
  const address = `${faker.address.streetAddress()}, ${faker.address.cityName()}, ${faker.address.country()}.`
  const postalCode = faker.address.zipCode()
  const url = faker.internet.url(name)
  const shippingCosts = faker.datatype.float({ min: 1, max: 10, precision: 0.1 })
  const email = faker.internet.email(name)
  const phone = faker.phone.number()
  const logo = faker.image.abstract() + `?timestamp=${Math.floor(Math.random() * 100)}`
  const heroImage = faker.image.business() + `?timestamp=${Math.floor(Math.random() * 100)}`
  const status = faker.helpers.arrayElement(['online', 'offline', 'closed', 'temporarily closed'])
  const createdAt = new Date()
  const updatedAt = createdAt
  return { name, description, address, postalCode, url, shippingCosts, email, phone, logo, heroImage, status, createdAt, updatedAt }
}

module.exports = generateRestaurants
