import container from '../config/container.js'
import { processFileUris } from './FileService.js'

class RestaurantService {
  constructor () {
    this.restaurantRepository = container.resolve('restaurantRepository')
  }

  async index () {
    const restaurants = await this.restaurantRepository.findAll()
    return restaurants.map(restaurant => {
      delete restaurant.userId
      processFileUris(restaurant, ['heroImage', 'logo'])
      return restaurant
    })
  }

  async indexOwner (ownerId) {
    const restaurants = await this.restaurantRepository.findByOwnerId(ownerId)
    return restaurants.map(restaurant => {
      processFileUris(restaurant, ['heroImage', 'logo'])
      return restaurant
    })
  }

  async create (data) {
    const newRestaurant = await this.restaurantRepository.create(data)
    return newRestaurant
  }

  async show (id) {
    const restaurant = await this.restaurantRepository.show(id)
    if (!restaurant) {
      throw new Error('Restaurant not found')
    }

    processFileUris(restaurant, ['heroImage', 'logo'])
    restaurant.products = restaurant.products?.map(product => {
      processFileUris(product, ['image'])
      return product
    })
    return restaurant
  }

  async update (id, data) {
    const restaurant = await this.restaurantRepository.update(id, data)
    if (!restaurant) {
      throw new Error('Restaurant not found')
    }
    return restaurant
  }

  async destroy (id) {
    const result = await this.restaurantRepository.destroy(id)
    if (!result) {
      throw new Error('Restaurant not found')
    }
    return true
  }

  async updateAverageServiceTime (restaurantId) {
    const updatedRestaurant = await this.restaurantRepository.updateAverageServiceTime(restaurantId)
    return updatedRestaurant
  }

  async exists (id) {
    return await this.restaurantRepository.findById(id)
  }
}

export default RestaurantService
