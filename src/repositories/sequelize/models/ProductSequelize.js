
import { Model } from 'sequelize'
import Product from '../../../entities/Product.js'
const loadModel = function (sequelize, DataTypes) {
  class ProductSequelize extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      const OrderProducts = sequelize.define('OrderProducts', {
        quantity: DataTypes.INTEGER,
        unityPrice: DataTypes.DOUBLE
      })

      ProductSequelize.belongsTo(models.RestaurantSequelize, { foreignKey: 'restaurantId', as: 'restaurant', onDelete: 'cascade' })
      ProductSequelize.belongsTo(models.ProductCategorySequelize, { foreignKey: 'productCategoryId', as: 'productCategory' })
      ProductSequelize.belongsToMany(models.OrderSequelize, { as: 'orders', through: OrderProducts })
    }

    toBussinessEntity () {
      return new Product(this.id.toString(), this.createdAt, this.updatedAt,
        this.name, this.description, this.price, this.image, this.order, this.availability,
        this.restaurantId.toString(), this.productCategoryId.toString(), this.productCategory?.name)
    }
  }
  ProductSequelize.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    image: DataTypes.STRING,
    order: DataTypes.INTEGER,
    availability: DataTypes.BOOLEAN,
    restaurantId: DataTypes.INTEGER,
    productCategoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product'
  })
  return ProductSequelize
}
export default loadModel
