
import Sequelize from 'sequelize'
import RepositoryBase from '../RepositoryBase.js'
import { OrderSequelize, RestaurantSequelize, RestaurantCategorySequelize, ProductSequelize, ProductCategorySequelize } from './models/models.js'

class ProductRepository extends RepositoryBase {
  async findById (id, ...args) {
    return ProductSequelize.findByPk(id, {
      include: [
        {
          model: ProductCategorySequelize,
          as: 'productCategory'
        }]
    }
    )
  }

  async indexRestaurant (restaurantId) {
    return ProductSequelize.findAll({
      where: {
        restaurantId
      }
    })
  }

  async show (id) {
    return this.findById(id)
  }

  async create (productData, ...args) {
    return (new ProductSequelize(productData)).save()
  }

  async update (id, dataToUpdate, ...args) {
    const entity = await ProductSequelize.findByPk(id)
    entity.set(dataToUpdate)
    return entity.save()
  }

  async destroy (id, ...args) {
    const result = await ProductSequelize.destroy({ where: { id } })
    return result === 1
  }

  async save (businessEntity, ...args) {
    return this.create(businessEntity)
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
