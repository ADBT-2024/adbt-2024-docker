import mongoose, { Schema } from 'mongoose'
import OrderEntity, { OrderedProduct } from '../../../entities/OrderEntity.js'
import orderedProductSchema from './OrderedProduct.js'

const toBussinessEntity = (order) => {
  const orderedProducts = order.products.map(product => new OrderedProduct(product._id, product.createdAt, product.updatedAt, product.name, product.image, product.quantity, product.unityPrice))
  return new OrderEntity(order._id.toString(), order.createdAt, order.updatedAt, order.startedAt, order.sentAt, order.deliveredAt, order?.status, order.price, order.address, order.shippingCosts, order.restaurantId.toString(), order.userId.toString(), orderedProducts)
}

const orderSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  price: {
    type: Number,
    required: 'Kindly enter de delivery address'
  },
  address: {
    type: String,
    required: 'Kindly enter de delivery address'
  },
  shippingCosts: {
    type: Number,
    required: 'Kindly enter de delivery address'
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    required: 'Kindly select the restaurant owner',
    ref: 'Restaurant'
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: 'Kindly select the restaurant owner',
    ref: 'User'
  },
  products: [orderedProductSchema]
}, {
  methods: {
    toBussinessEntity () {
      return toBussinessEntity(this)
    }
  },
  statics: {
    toBussinessEntity (orderDocumentObject) {
      return toBussinessEntity(orderDocumentObject)
    }
  },
  strict: false,
  timestamps: true,
  toJSON: { virtuals: true }
})

orderSchema.virtual('status').get(function () {
  if (this.deliveredAt) { return 'delivered' }
  if (this.sentAt) { return 'sent' }
  if (this.startedAt) { return 'in process' }
  return 'pending'
})

const orderModel = mongoose.model('Orders', orderSchema)
export default orderModel
