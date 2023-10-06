
import RepositoryBase from '../RepositoryBase.js'
import RestaurantCategoryMongoose from './models/RestaurantCategory.js'

class RestaurantCategoryRepository extends RepositoryBase {
  async findAll (...args) {
    const restaurantCategories = await RestaurantCategoryMongoose.find()
    return restaurantCategories.map(restaurantCategory => restaurantCategory.toBussinessEntity())
  }
}

export default RestaurantCategoryRepository
