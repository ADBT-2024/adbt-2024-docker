import mongoose, { Schema } from 'mongoose'
import RestaurantCategoryEntity from '../../../entities/RestaurantCategoryEntity.js'

const restaurantCategorySchema = new Schema({
  name: {
    type: String,
    required: 'Kindly enter the name of the category'
  }
}, {
  methods: {
    toBussinessEntity () {
      return new RestaurantCategoryEntity(this._id.toString(), this.createdAt, this.updatedAt, this.name)
    }
  },
  strict: false,
  timestamps: true,
  toJSON: { virtuals: true }
})

const restaurantCategoryModel = mongoose.model('RestaurantCategories', restaurantCategorySchema)
export default restaurantCategoryModel
