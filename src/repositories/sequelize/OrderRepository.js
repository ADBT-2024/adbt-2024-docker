import moment from 'moment'
import { Op } from 'sequelize'
import RepositoryBase from '../RepositoryBase.js'
import { OrderSequelize, RestaurantSequelize, ProductSequelize, sequelizeSession } from './models/models.js'

class OrderRepository extends RepositoryBase {
  async findById (id, ...args) {
    const entity = await OrderSequelize.findByPk(id)
    return entity?.toBussinessEntity()
  }

  async findByRestaurantId (restaurantId) {
    const orders = await OrderSequelize.findAll({
      where: { restaurantId },
      include: {
        model: ProductSequelize,
        as: 'products'
      }
    })
    return orders.map(order => order.toBussinessEntity())
  }

  async indexCustomer (customerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit
    const orders = await OrderSequelize.findAll({
      where: {
        userId: customerId
      },
      include: [{
        model: ProductSequelize,
        as: 'products'
      },
      {
        model: RestaurantSequelize,
        as: 'restaurant',
        attributes: ['name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })
    const total = await OrderSequelize.count({ where: { userId: customerId } })
    return {
      items: orders.map(order => order.toBussinessEntity()),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async #saveOrderProducts (order, productLines, transaction) {
    const addProductLinesPromises = productLines.map(productLine => {
      return order.addProduct(productLine.id, { through: { quantity: productLine.quantity, unityPrice: productLine.unityPrice }, transaction })
    })
    return Promise.all(addProductLinesPromises)
  }

  async #saveOrderWithProducts (order, productLines, transaction) {
    let savedOrder = await order.save({ transaction })
    await this.#saveOrderProducts(savedOrder, productLines, transaction)
    savedOrder = await savedOrder.reload({ include: { model: ProductSequelize, as: 'products' }, transaction })
    return savedOrder
  }

  async create (orderData, ...args) {
    let newOrder = OrderSequelize.build(orderData)
    const transaction = await sequelizeSession.transaction()
    try {
      newOrder = await this.#saveOrderWithProducts(newOrder, orderData.products, transaction)
      await transaction.commit()
      return newOrder.toBussinessEntity()
    } catch (err) {
      await transaction.rollback()
      throw new Error(err)
    }
  }

  async update (id, orderData, ...args) {
    const transaction = await sequelizeSession.transaction()
    try {
      await OrderSequelize.update(orderData, { where: { id } }, { transaction })
      let updatedOrder = await OrderSequelize.findByPk(id)
      await updatedOrder.setProducts([], { transaction })
      updatedOrder = await this.#saveOrderWithProducts(updatedOrder, orderData.products, transaction)
      await transaction.commit()
      return updatedOrder.toBussinessEntity()
    } catch (err) {
      await transaction.rollback()
      throw new Error(err)
    }
  }

  async destroy (id, ...args) {
    const result = await OrderSequelize.destroy({ where: { id } })
    return result === 1
  }

  async save (businessEntity, ...args) {
    const savedOrder = await OrderSequelize.findByPk(businessEntity.id)
    if (savedOrder) {
      savedOrder.set(businessEntity)
      return await savedOrder.save()
    }
    return await this.create(businessEntity)
  }

  async analytics (restaurantId) {
    const yesterdayZeroHours = moment().subtract(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const todayZeroHours = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const numYesterdayOrders = await OrderSequelize.count({
      where:
        {
          createdAt: {
            [Op.lt]: todayZeroHours,
            [Op.gte]: yesterdayZeroHours
          },
          restaurantId
        }
    })
    const numPendingOrders = await OrderSequelize.count({
      where:
        {
          startedAt: null,
          restaurantId
        }
    })
    const numDeliveredTodayOrders = await OrderSequelize.count({
      where:
        {
          deliveredAt: { [Op.gte]: todayZeroHours },
          restaurantId
        }
    })

    const invoicedToday = await OrderSequelize.sum(
      'price',
      {
        where:
          {
            startedAt: { [Op.gte]: todayZeroHours }, // FIXME: Created or confirmed?
            restaurantId
          }
      })
    return { restaurantId, numYesterdayOrders, numPendingOrders, numDeliveredTodayOrders, invoicedToday }
  }
}

export default OrderRepository
