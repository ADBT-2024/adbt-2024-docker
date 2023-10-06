import RepositoryBase from '../RepositoryBase.js'
import { User as UserSequelize } from './models/models.js'

class UserRepository extends RepositoryBase {
  async findById (id, ...args) {
    const entity = await UserSequelize.findByPk(id)
    return entity?.toBussinessEntity()
  }

  async create (businessEntity, ...args) {
    const entity = new UserSequelize(businessEntity)
    return (await entity.save()).toBussinessEntity()
  }

  async update (id, businessEntity, ...args) {
    const entity = await UserSequelize.findByPk(id)
    delete businessEntity.password // don't hash the already hashed password. This version does not include functionality to update password
    entity.set(businessEntity)
    await entity.save()
    return entity.toBussinessEntity()
  }

  async destroy (id, ...args) {
    const result = await UserSequelize.destroy({ where: { id } })
    return result === 1
  }

  async findByToken (token) {
    const entity = await UserSequelize.findOne({ where: { token } }, { attributes: { exclude: ['password'] } })
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
    return await UserSequelize.findOne({ where: { email, userType } })
  }

  async save (businessEntity, ...args) {
    return await this.create(businessEntity)
  }
}

export default UserRepository
