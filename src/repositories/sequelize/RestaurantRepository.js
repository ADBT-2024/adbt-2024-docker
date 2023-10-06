
import RepositoryBase from '../RepositoryBase.js'
import { Restaurant as RestaurantSequelize, RestaurantCategory as RestaurantCategorySequelize, Product as ProductSequelize, ProductCategory as ProductCategorySequelize } from './models/models.js'

class RestaurantRepository extends RepositoryBase {
  async findById (id, ...args) {
    const restaurant = await RestaurantSequelize.findByPk(id, {
      // attributes: { exclude: ['userId'] },
      include: [{
        model: ProductSequelize,
        as: 'products',
        include: { model: ProductCategorySequelize, as: 'productCategory' }
      },
      {
        model: RestaurantCategorySequelize,
        as: 'restaurantCategory'
      }],
      order: [[{ model: ProductSequelize, as: 'products' }, 'order', 'ASC']]
    })
    return restaurant?.toBussinessEntity()
  }

  async findAll (...args) {
    const restaurants = await RestaurantSequelize.findAll(
      {
        attributes: ['id', 'name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId'],
        include:
      {
        model: RestaurantCategorySequelize,
        as: 'restaurantCategory'
      },
        order: [[{ model: RestaurantCategorySequelize, as: 'restaurantCategory' }, 'name', 'ASC']]
      }
    )
    return arrayToBussinessEntity(restaurants)
  }

  async create (businessEntity, ...args) {
    const entity = new RestaurantSequelize(businessEntity)
    return (await entity.save()).toBussinessEntity()
  }

  async update (id, businessEntity, ...args) {
    const entity = await RestaurantSequelize.findByPk(id)
    entity.set(businessEntity)
    await entity.save()
    return entity.toBussinessEntity()
  }

  async destroy (id, ...args) {
    const result = await RestaurantSequelize.destroy({ where: { id } })
    return result === 1
  }

  async save (businessEntity, ...args) {
    return await this.create(businessEntity)
  }

  async findByOwnerId (ownerId) {
    const restaurants = await RestaurantSequelize.findAll(
      {
        attributes: { exclude: ['userId'] },
        where: { userId: ownerId },
        include: [{
          model: RestaurantCategorySequelize,
          as: 'restaurantCategory'
        }]
      })
    return arrayToBussinessEntity(restaurants)
  }

  async updateAverageServiceTime (restaurantId) {
    const restaurant = await RestaurantSequelize.findByPk(restaurantId)
    const averageServiceTime = await restaurant.getAverageServiceTime()
    await RestaurantSequelize.update({ averageServiceMinutes: averageServiceTime }, { where: { id: restaurantId } })
  }

  async show (id) {
    return await this.findById(id)
  }
}

export default RestaurantRepository
function arrayToBussinessEntity (restaurants) {
  return restaurants.map(restaurant => restaurant.toBussinessEntity())
}
