import mongoose from 'mongoose'
import generateRestaurantCategories from '../common/restaurantCategoriesGenerator.cjs'

const seedRestaurantCategories = async () => {
  const collection = mongoose.connection.db.collection('restaurantcategories')
  await collection.drop()
  const restaurantCategories = await generateRestaurantCategories()
  await collection.insertMany(restaurantCategories)
  console.log('Restaurant categories collection seeded! :)')
}

export { seedRestaurantCategories }
