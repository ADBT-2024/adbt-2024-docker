import mongoose from 'mongoose'
import moment from 'moment'
import OrderMongoose from './models/Order.js'
import RepositoryBase from '../RepositoryBase.js'

class OrderRepository extends RepositoryBase {
  async findById (id) {
    try {
      const order = await OrderMongoose.findById(id)
      return order?.toBussinessEntity()
    } catch (err) {
      return null
    }
  }

  async findByRestaurantId (restaurantId) {
    const orders = await OrderMongoose.find({ restaurantId })
    return orders.map(order => order.toBussinessEntity())
  }

  async indexCustomer (customerId) {
    const orders = await OrderMongoose.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(customerId) }
      },
      {
        $lookup: {
          from: 'restaurants',
          localField: 'restaurantId',
          foreignField: '_id',
          as: 'restaurant'
        }
      },
      { $sort: { createdAt: 1 } },
      {
        $addFields: { id: '$_id' }
      }
    ])
    return orders.map(orderDocumentObject => OrderMongoose.toBussinessEntity(orderDocumentObject))
  }

  async create (orderData) {
    orderData.products.forEach(product => { product._id = product.id ? product.id : product._id })
    const order = new OrderMongoose(orderData)
    await order.save()
    return order.toBussinessEntity()
  }

  async update (id, orderData) {
    orderData.products.forEach(product => { product._id = product.id ? product.id : product._id })
    const order = await OrderMongoose.findByIdAndUpdate(id, orderData, { new: true })
    return order.toBussinessEntity()
  }

  async destroy (id) {
    const deletedResult = await OrderMongoose.findByIdAndDelete(id)
    return deletedResult !== null
  }

  async save (entity) {
    entity.products.forEach(product => { product._id = product.id ? product.id : product._id })
    const savedEntity = await OrderMongoose.findByIdAndUpdate(entity.id, entity, { upsert: true, new: true })
    return savedEntity.toBussinessEntity()
  }

  async analytics (restaurantId) {
    const yesterdayZeroHours = moment().subtract(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const todayZeroHours = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const numYesterdayOrders = (await OrderMongoose.find({
      createdAt: {
        $lt: todayZeroHours,
        $gte: yesterdayZeroHours
      },
      restaurantId: new mongoose.Types.ObjectId(restaurantId)
    })).length
    const numPendingOrders = (await OrderMongoose.find({
      startedAt: { $exists: false },
      restaurantId: new mongoose.Types.ObjectId(restaurantId)
    })).length
    const numDeliveredTodayOrders = (await OrderMongoose.find({
      deliveredAt: { $gte: todayZeroHours },
      restaurantId: new mongoose.Types.ObjectId(restaurantId)
    })).length

    const invoicedToday = (await OrderMongoose.aggregate([
      {
        $match: {
          startedAt: { $gte: new Date(todayZeroHours) },
          restaurantId: new mongoose.Types.ObjectId(restaurantId)
        }
      },
      {
        $group: {
          _id: 'null',
          invoicedToday: {
            $sum: '$price'
          }
        }
      },
      { $project: { _id: 0 } }
    ]))?.[0]?.invoicedToday
    return { restaurantId, numYesterdayOrders, numPendingOrders, numDeliveredTodayOrders, invoicedToday }
  }
}
export default OrderRepository
