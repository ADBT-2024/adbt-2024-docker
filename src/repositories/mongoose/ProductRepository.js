import RestaurantMongoose from './models/Restaurant.js'
import OrderMongoose from './models/Order.js'
import ProductCategoryMongoose from './models/ProductCategory.js'
import RepositoryBase from '../RepositoryBase.js'

class ProductRepository extends RepositoryBase {
  async findById (id) {
    try {
      const restaurant = await RestaurantMongoose.findOne({ 'products._id': id })
      const product = restaurant.products.id(id)
      product.productCategory = await ProductCategoryMongoose.findById(product.productCategoryId)
      product.restaurantId = restaurant._id
      return product.toBussinessEntity()
    } catch (err) {
      return null
    }
  }

  async create (productData) {
    const restaurant = await RestaurantMongoose.findById(productData.restaurantId)
    restaurant.products.push(productData)
    await restaurant.save()
    const savedProduct = restaurant.products.at(-1) // last element of the array
    return savedProduct.toBussinessEntity()
  }

  async update (id, productData) {
    const restaurantUpdated = await RestaurantMongoose.findOneAndUpdate(
      { 'products._id': id },
      {
        $set: {
          'products.$.name': productData.name,
          'products.$.description': productData.description,
          'products.$.image': productData.image,
          'products.$.availability': productData.availability,
          'products.$.order': productData.order,
          'products.$.price': productData.price,
          'products.$.productCategoryId': productData.productCategoryId
        }
      },
      { new: true })
    return restaurantUpdated.products.id(id).toBussinessEntity()
  }

  async destroy (id) {
    const restaurant = await RestaurantMongoose.findOne({ 'products._id': id })
    restaurant.products.pull(id)
    const updatedRestaurant = await restaurant.save()
    return !updatedRestaurant.products.id(id)
  }

  async save (entity) {
    return await this.create(entity)
  }

  async show (id) {
    return this.findById(id)
  }

  async popular () {
    const top3Products = await OrderMongoose.aggregate([
      {
        $project: { products: 1, status: 1, _id: 0 }
      },
      {
        $unwind: { path: '$products' }
      },
      {
        $group:
        {
          _id: '$products._id',
          unitsSold: {
            $sum: '$products.quantity'
          }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 3 }
    ])
    const top3ProductsFull = await Promise.all(top3Products.map(async (product) => {
      const fullProduct = await this.findById(product._id)
      fullProduct.unitsSold = product.unitsSold
      return fullProduct
    }))

    return top3ProductsFull
  }

  async checkProductOwnership (productId, ownerId) {
    const restaurant = await RestaurantMongoose.findOne({ 'products._id': productId })
    return ownerId === restaurant.userId.toString()
  }

  async checkProductRestaurantOwnership (restaurantId, ownerId) {
    const restaurant = await RestaurantMongoose.findById(restaurantId)
    return ownerId === restaurant.userId.toString()
  }
}

export default ProductRepository
