
import { Model } from 'sequelize'
import ProductCategoryEntity from '../../../entities/ProductCategoryEntity.js'

const loadModel = function (sequelize, DataTypes) {
  class ProductCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      ProductCategory.hasMany(models.Product)
    }

    toBussinessEntity () {
      return new ProductCategoryEntity(this.id, this.createdAt, this.updatedAt, this.name)
    }
  }
  ProductCategory.init({
    name: DataTypes.STRING,
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: new Date()
    }
  }, {
    sequelize,
    modelName: 'ProductCategory'
  })
  return ProductCategory
}
export default loadModel
