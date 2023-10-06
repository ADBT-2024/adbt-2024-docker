import { Schema } from 'mongoose'
import ProductEntity from '../../../entities/ProductEntity.js'

const toBussinessEntity = (product) => {
  return new ProductEntity(product._id.toString(), product.createdAt, product.updatedAt, product.name, product.description, product.price, product.image, product.order, product.availability, product.restaurantId?.toString(), product.productCategoryId?.toString(), product.productCategory?.[0]?.name)
}

const productSchema = new Schema({
  name: {
    type: String,
    required: 'Kindly enter the title of the comment'
  },
  description: {
    type: String,
    required: 'Kindly enter the title of the comment'
  },
  price: {
    type: Number,
    required: 'Kindly enter the title of the comment'
  },
  image: {
    type: String,
    required: 'Kindly enter the title of the comment'
  },
  order: {
    type: Number,
    required: 'Kindly enter the title of the comment'
  },
  availability: {
    type: Boolean,
    required: 'Kindly enter the title of the comment'
  },
  productCategoryId: {
    type: Schema.Types.ObjectId,
    required: 'Kindly enter the title of the comment'
  }
}, {
  methods: {
    toBussinessEntity () {
      return toBussinessEntity(this)
    }
  },
  statics: {
    toBussinessEntity (productDocumentObject) {
      return toBussinessEntity(productDocumentObject)
    }
  },
  strict: false,
  timestamps: true,
  toJSON: { virtuals: true }
})

export default productSchema
export { toBussinessEntity }
