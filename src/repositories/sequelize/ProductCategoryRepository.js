
import RepositoryBase from '../RepositoryBase.js'
import { ProductCategorySequelize } from './models/models.js'

class ProductCategoryRepository extends RepositoryBase {
  async findAll (...args) {
    const restaurantCategories = await ProductCategorySequelize.findAll()
    return arrayToBussinessEntity(restaurantCategories)
  }
}

export default ProductCategoryRepository
function arrayToBussinessEntity (entityArray) {
  return entityArray.map(entity => entity.toBussinessEntity())
}
