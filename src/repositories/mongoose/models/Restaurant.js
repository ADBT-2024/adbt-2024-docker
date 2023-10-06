import mongoose, { Schema } from 'mongoose'
import { Order, ProductSchema } from './modelsMongoose.js'
import moment from 'moment'
import RestaurantEntity from '../../../entities/RestaurantEntity.js'

const toBussinessEntity = (restaurant) => {
  const products = restaurant.products ? restaurant.products.map(product => ProductSchema.statics.toBussinessEntity(product)) : null

  return new RestaurantEntity(restaurant._id.toString(), restaurant.createdAt, restaurant.updatedAt,
    restaurant.name, restaurant.description, restaurant.address, restaurant.postalCode, restaurant.url, restaurant.shippingCosts,
    restaurant.averageServiceMinutes, restaurant.email, restaurant.phone, restaurant.logo, restaurant.heroImage,
    restaurant.status, restaurant.restaurantCategoryId.toString(), restaurant.restaurantCategory?.[0]?.name, restaurant.userId.toString(), products)
}

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: 'Kindly enter the restaurant name'
  },
  description: {
    type: String
  },
  address: {
    type: String,
    required: 'Kindly enter the restaurant name'
  },
  postalCode: {
    type: String,
    required: 'Kindly enter the restaurant postal code'
  },
  url: {
    type: String
  },
  shippingCosts: {
    type: Number,
    required: 'Kindly enter the shipping costs',
    min: 0
  },
  averageServiceMinutes: {
    type: Number
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  logo: {
    type: String
  },
  heroImage: {
    type: String
  },
  status: {
    type: String,
    enum: [
      'online',
      'offline',
      'closed',
      'temporarily closed'
    ]
  },
  restaurantCategoryId: {
    type: Schema.Types.ObjectId,
    required: 'Kindly select the restaurant category',
    ref: 'RestaurantCategory'
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: 'Kindly select the restaurant owner',
    ref: 'User'
  },
  products: [ProductSchema]
}, {
  methods: {
    async getAverageServiceTime () {
      try {
        const restaurantOrders = await Order.find({ restaurantId: this.id })
        const serviceTimes = restaurantOrders.filter(o => o.deliveredAt).map(o => moment(o.deliveredAt).diff(moment(o.createdAt), 'minutes'))
        return serviceTimes.reduce((acc, serviceTime) => acc + serviceTime, 0) / serviceTimes.length
      } catch (err) {
        return err
      }
    },
    toBussinessEntity () {
      return toBussinessEntity(this)
    }
  },
  statics: {
    toBussinessEntity (restaurantDocumentObject) {
      return toBussinessEntity(restaurantDocumentObject)
    }
  },
  strict: false,
  timestamps: true,
  toJSON: { virtuals: true }
})

const restaurantModel = mongoose.model('Restaurants', restaurantSchema)
export default restaurantModel
