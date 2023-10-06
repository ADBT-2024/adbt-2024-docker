import mongoose from 'mongoose'
import RepositoryBase from '../RepositoryBase.js'
import { Restaurant as RestaurantMongoose, Order as OrderMongoose } from './models/modelsMongoose.js'

class RestaurantRepository extends RepositoryBase {
  async findById (id, ...args) {
    try {
      const leanNeeded = args[0]?.lean
      let entity = null
      if (leanNeeded) {
        entity = await RestaurantMongoose.findById(id).lean()
        return entity ? RestaurantMongoose.toBussinessEntity(entity) : null
      }
      entity = await RestaurantMongoose.findById(id)
      return entity?.toBussinessEntity()
    } catch (err) {
      return null
    }
  }

  async findAll () {
    const restaurants = await RestaurantMongoose.aggregate([
      {
        $lookup: {
          from: 'restaurantcategories',
          localField: 'restaurantCategoryId',
          foreignField: '_id',
          as: 'restaurantCategory'
        }
      }
    ])
    return restaurants.map(restaurant => RestaurantMongoose.toBussinessEntity(restaurant))
  }

  /* async findById (id, lean = false) {
    let restaurantPromise = RestaurantMongoose.findById(id)
    if (lean) { restaurantPromise = restaurantPromise.lean() }

    return await restaurantPromise
  } */

  async create (restaurantData) {
    const restaurant = new RestaurantMongoose(restaurantData)
    const createdRestaurant = await restaurant.save()
    return createdRestaurant.toBussinessEntity()
  }

  async update (id, restaurantData) {
    const restaurant = await RestaurantMongoose.findByIdAndUpdate(id, restaurantData, { new: true })
    return restaurant.toBussinessEntity()
  }

  async destroy (id) {
    const restaurantOrders = await OrderMongoose.find({ restaurantId: id })
    if (restaurantOrders.length > 0) { // this should be also done at RestaurantMiddleware
      return false
    } else {
      const deletedResult = await RestaurantMongoose.findByIdAndDelete(id)
      return deletedResult !== null
    }
  }

  async save (entity) {
    const savedEntity = await RestaurantMongoose.findByIdAndUpdate(entity.id, entity, { upsert: true, new: true })
    return savedEntity.toBussinessEntity()
  }

  async findByOwnerId (ownerId) {
    const restaurants = await RestaurantMongoose.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(ownerId) }
      },
      {
        $lookup: {
          from: 'restaurantcategories',
          localField: 'restaurantCategoryId',
          foreignField: '_id',
          as: 'restaurantCategory'
        }
      }
    ])
    return restaurants.map(restaurant => RestaurantMongoose.toBussinessEntity(restaurant))
  }

  async show (id) {
    const restaurant = await RestaurantMongoose.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: 'restaurantcategories',
          localField: 'restaurantCategoryId',
          foreignField: '_id',
          as: 'restaurantCategory'
        }
      },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { 'products.order': 1 }
      },
      {
        $addFields: { 'products.id': '$products._id' }
      },
      {
        $addFields: { id: '$_id' }
      },
      {
        $lookup: {
          from: 'productcategories',
          localField: 'products.productCategoryId',
          foreignField: '_id',
          as: 'products.productCategory'
        }
      },
      {
        $group: {
          _id: '$_id',
          id: { $first: '$_id' },
          name: { $first: '$name' },
          description: { $first: '$description' },
          address: { $first: '$address' },
          postalCode: { $first: '$postalCode' },
          url: { $first: '$url' },
          shippingCosts: { $first: '$shippingCosts' },
          averageServiceMinutes: { $first: '$averageServiceMinutes' },
          email: { $first: '$email' },
          phone: { $first: '$phone' },
          logo: { $first: '$logo' },
          heroImage: { $first: '$heroImage' },
          status: { $first: '$status' },
          restaurantCategoryId: { $first: '$restaurantCategoryId' },
          restaurantCategory: { $first: '$restaurantCategory' },
          userId: { $first: '$userId' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          products: { $push: '$products' }
        }
      }
    ]
    )
    if (!restaurant[0].products[0].id) { delete restaurant[0].products }

    return restaurant[0] ? RestaurantMongoose.toBussinessEntity(restaurant[0]) : null
  }

  async updateAverageServiceTime (restaurantId) {
    const restaurant = await RestaurantMongoose.findById(restaurantId)
    restaurant.averageServiceMinutes = await restaurant.getAverageServiceTime()
    const updatedRestaurant = await restaurant.save()
    return updatedRestaurant.toBussinessEntity()
  }
}

export default RestaurantRepository
