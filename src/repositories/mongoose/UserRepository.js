import RepositoryBase from '../RepositoryBase.js'
import UserMongoose from './models/User.js'

class UserRepository extends RepositoryBase {
  async findById (id, ...args) {
    try {
      const entity = await UserMongoose.findById(id)
      return entity?.toBussinessEntity()
    } catch (err) {
      return null
    }
  }

  async create (businessEntity, ...args) {
    const entity = new UserMongoose(businessEntity)
    return (await entity.save())?.toBussinessEntity()
  }

  async update (id, businessEntity, ...args) {
    const entity = await UserMongoose.findOneAndUpdate({ _id: id }, businessEntity, { new: true, exclude: ['password'] })
    return entity?.toBussinessEntity()
  }

  async destroy (id, ...args) {
    const result = await UserMongoose.deleteOne({ _id: id })
    return result?.deletedCount === 1
  }

  async save (entity) {
    const savedEntity = await UserMongoose.findByIdAndUpdate(entity.id, entity, { upsert: true, new: true })
    return savedEntity?.toBussinessEntity()
  }

  async findByToken (token) {
    const entity = await UserMongoose.findOne({ token }, { password: 0 })
    return entity?.toBussinessEntity()
  }

  async findOwnerByEmail (email) {
    const entity = await this._findByEmailAndUserType(email, 'owner')
    return entity?.toBussinessEntity()
  }

  async findCustomerByEmail (email) {
    const entity = await this._findByEmailAndUserType(email, 'customer')
    return entity?.toBussinessEntity()
  }

  async _findByEmailAndUserType (email, userType) {
    return await UserMongoose.findOne({ email, userType })
  }
}

export default UserRepository
