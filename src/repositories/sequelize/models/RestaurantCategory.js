
import { Model } from 'sequelize'
import RestaurantCategoryEntity from '../../../entities/RestaurantCategoryEntity.js'

const loadModel = function (sequelize, DataTypes) {
  class RestaurantCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      RestaurantCategory.hasMany(models.Restaurant, { foreignKey: 'restaurantCategoryId' })
    }

    toBussinessEntity () {
      return new RestaurantCategoryEntity(this.id, this.createdAt, this.updatedAt, this.name)
    }
  }
  RestaurantCategory.init({
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
    modelName: 'RestaurantCategory'
  })
  return RestaurantCategory
}
export default loadModel
