
import RepositoryBase from '../RepositoryBase.js'
import { RestaurantCategorySequelize } from './models/models.js'

class RestaurantCategoryRepository extends RepositoryBase {
  async findAll (...args) {
    const restaurantCategories = await RestaurantCategorySequelize.findAll()
    return arrayToBussinessEntity(restaurantCategories)
  }
}

export default RestaurantCategoryRepository
function arrayToBussinessEntity (entityArray) {
  return entityArray.map(entity => entity.toBussinessEntity())
}
