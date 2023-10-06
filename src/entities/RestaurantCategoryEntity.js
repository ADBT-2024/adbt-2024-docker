import BaseEntity from './BaseEntity.js'

class RestaurantCategoryEntity extends BaseEntity {
  name

  constructor (id, createdAt, updatedAt, name) {
    super(id, createdAt, updatedAt)
    this.name = name
  }
}

export default RestaurantCategoryEntity
