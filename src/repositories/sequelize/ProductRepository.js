
import Sequelize from 'sequelize'
import RepositoryBase from '../RepositoryBase.js'
import { OrderSequelize, RestaurantSequelize, RestaurantCategorySequelize, ProductSequelize, ProductCategorySequelize } from './models/models.js'

class ProductRepository extends RepositoryBase {
  async findById (id, ...args) {
    const product = await ProductSequelize.findByPk(id, {
      include: [
        {
          model: ProductCategorySequelize,
          as: 'productCategory'
        }]
    }
    )
    return product?.toBussinessEntity()
  }

  async indexRestaurant (restaurantId) {
    const products = await ProductSequelize.findAll({
      where: {
        restaurantId
      }
    })
    return products.map(product => product.toBussinessEntity())
  }

  async show (id) {
    return await this.findById(id)
  }

  async create (businessEntity, ...args) {
    const entity = new ProductSequelize(businessEntity)
    return (await entity.save()).toBussinessEntity()
  }

  async update (id, businessEntity, ...args) {
    const entity = await ProductSequelize.findByPk(id)
    entity.set(businessEntity)
    await entity.save()
    return entity.toBussinessEntity()
  }

  async destroy (id, ...args) {
    const result = await ProductSequelize.destroy({ where: { id } })
    return result === 1
  }

  async save (businessEntity, ...args) {
    return await this.create(businessEntity)
  }

  async popular () {
    const topProducts = await ProductSequelize.findAll(
      {
        include: [{
          model: OrderSequelize,
          as: 'orders',
          attributes: []
        },
        {
          model: RestaurantSequelize,
          as: 'restaurant',
          attributes: ['id', 'name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId'],
          include:
        {
          model: RestaurantCategorySequelize,
          as: 'restaurantCategory'
        }
        }
        ],
        attributes: {
          include: [
            [Sequelize.fn('SUM', Sequelize.col('orders.OrderProducts.quantity')), 'soldProductCount']
          ],
          separate: true
        },
        group: ['orders.OrderProducts.productId'],
        order: [[Sequelize.col('soldProductCount'), 'DESC']]
      // limit: 3 //this is not supported when M:N associations are involved
      })
    return topProducts.slice(0, 3)
  }

  async checkProductOwnership (productId, ownerId) {
    const product = await ProductSequelize.findByPk(productId, { include: { model: RestaurantSequelize, as: 'restaurant' } })
    return ownerId === product.restaurant.userId
  }

  async checkProductRestaurantOwnership (restaurantId, ownerId) {
    const restaurant = await RestaurantSequelize.findByPk(restaurantId)
    return ownerId === restaurant.userId
  }
}

export default ProductRepository
