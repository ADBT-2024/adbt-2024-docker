
import { Model } from 'sequelize'
import OrderEntity from '../../../entities/OrderEntity.js'

const loadModel = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      const OrderProducts = sequelize.define('OrderProducts', {
        quantity: DataTypes.INTEGER,
        unityPrice: DataTypes.DOUBLE
      })

      Order.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' })
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
      Order.belongsToMany(models.Product, { as: 'products', through: OrderProducts }, { onDelete: 'cascade' })
    }

    static createOrderProduct (id, createdAt, updatedAt, name, image, quantity, unityPrice) {
      const orderedProduct = { id, createdAt, updatedAt, name, image, quantity, unityPrice }
      return orderedProduct
    }

    toBussinessEntity () {
      const orderedProducts = this.products?.map(product => Order.createOrderProduct(product.id, product.createdAt, product.updatedAt, product.name, product.image, product.OrderProducts.quantity, product.OrderProducts.unityPrice))

      return new OrderEntity(this.id.toString(), this.createdAt ? this.createdAt : undefined, this.updatedAt ? this.updatedAt : undefined, this.startedAt ? this.startedAt : undefined, this.sentAt ? this.sentAt : undefined, this.deliveredAt ? this.deliveredAt : undefined, this.status, this.price, this.address, this.shippingCosts, this.restaurantId.toString(), this.userId.toString(), orderedProducts)
    }

    getStatus () {
      if (this.deliveredAt) { return 'delivered' }
      if (this.sentAt) { return 'sent' }
      if (this.startedAt) { return 'in process' }
      return 'pending'
    }
  }
  Order.init({
    createdAt: DataTypes.DATE,
    startedAt: DataTypes.DATE,
    sentAt: DataTypes.DATE,
    deliveredAt: DataTypes.DATE,
    price: DataTypes.DOUBLE,
    address: DataTypes.STRING,
    shippingCosts: DataTypes.DOUBLE,
    restaurantId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    status: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.getStatus()
      }
    }
  }, {
    sequelize,
    modelName: 'Order'
  })
  return Order
}

export default loadModel
