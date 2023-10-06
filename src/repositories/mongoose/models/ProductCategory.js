import mongoose, { Schema } from 'mongoose'
import ProductCategoryEntity from '../../../entities/ProductCategoryEntity.js'

const productCategorySchema = new Schema({
  name: {
    type: String,
    required: 'Kindly enter the name of the category'
  }
}, {
  methods: {
    toBussinessEntity () {
      return new ProductCategoryEntity(this._id.toString(), this.createdAt, this.updatedAt, this.name)
    }
  },
  strict: false,
  timestamps: true,
  toJSON: { virtuals: true }
})

const productCategoryModel = mongoose.model('ProductCategories', productCategorySchema)
export default productCategoryModel
