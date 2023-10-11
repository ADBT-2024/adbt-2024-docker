import bcrypt from 'bcryptjs'
import crypto from 'crypto'

import container from '../config/container.js'
import { processFileUris } from './FileService.js'

class UserService {
  constructor () {
    this.userRepository = container.resolve('userRepository')
  }

  _updateUserToken (user) {
    user.token = crypto.randomBytes(20).toString('hex')
    const expirationDate = new Date()
    expirationDate.setHours(expirationDate.getHours() + 1)
    user.tokenExpiration = expirationDate
  }

  async _register (newUser, userType) {
    newUser.userType = userType
    this._updateUserToken(newUser)
    const registeredUser = await this.userRepository.create(newUser)
    processFileUris(registeredUser, ['avatar'])
    return registeredUser
  }

  async registerCustomer (data) {
    return this._register(data, 'customer')
  }

  async registerOwner (data) {
    return this._register(data, 'owner')
  }

  async loginByToken (token) {
    const user = await this.userRepository.findByToken(token)
    if (user && user.tokenExpiration > new Date()) {
      processFileUris(user, ['avatar'])
      return user
    }
    const errorMessage = user?.tokenExpiration <= new Date() ? 'Token expired' : 'Token not valid'
    throw new Error(errorMessage)
  }

  async _login (email, password, userType) {
    let user
    if (userType === 'owner') {
      user = await this.userRepository.findOwnerByEmail(email)
    } else if (userType === 'customer') {
      user = await this.userRepository.findCustomerByEmail(email)
    }
    if (!user) {
      throw new Error('Invalid email or password')
    }
    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      throw new Error('Invalid email or password')
    }

    this._updateUserToken(user)
    const updatedUser = await this.userRepository.update(user.id, user)
    processFileUris(updatedUser, ['avatar'])
    return updatedUser
  }

  async loginOwner (email, password) {
    return this._login(email, password, 'owner')
  }

  async loginCustomer (email, password) {
    return this._login(email, password, 'customer')
  }

  async show (id) {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    processFileUris(user, ['avatar'])
    const propertiesToBeRemoved = ['password', 'createdAt', 'updatedAt', 'token', 'tokenExpiration', 'phone']
    propertiesToBeRemoved.forEach(property => delete user[property])
    return user
  }

  async update (id, data) {
    const user = await this.userRepository.update(id, data)
    if (!user) {
      throw new Error('User not found')
    }
    processFileUris(user, ['avatar'])
    return user
  }

  async destroy (id) {
    const result = await this.userRepository.destroy(id)
    if (!result) {
      throw new Error('User not found')
    }
    return true
  }

  async exists (id) {
    return await this.userRepository.findById(id)
  }
}

export default UserService