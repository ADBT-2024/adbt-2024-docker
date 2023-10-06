
import RepositoryBase from '../RepositoryBase.js'
import ProductCategoryMongoose from './models/ProductCategory.js'

class ProductCategoryRepository extends RepositoryBase {
  async findAll (...args) {
    const restaurantCategories = await ProductCategoryMongoose.find()
    return restaurantCategories.map(restaurantCategory => restaurantCategory.toBussinessEntity())
  }
}

export default ProductCategoryRepository
