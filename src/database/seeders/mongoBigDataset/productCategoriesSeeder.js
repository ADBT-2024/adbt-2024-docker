import mongoose from 'mongoose'
import generateProductCategories from '../common/productCategoriesGenerator.cjs'

const seedProductCategories = async () => {
  const collection = mongoose.connection.db.collection('productcategories')
  await collection.drop()
  const productCategories = await generateProductCategories()
  await collection.insertMany(productCategories)
  console.log('Product categories collection seeded! :)')
}

export { seedProductCategories }
