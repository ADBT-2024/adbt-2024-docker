import container from '../config/container.js'
import { processFileUris } from './FileService.js'

class OrderService {
  constructor () {
    this.orderRepository = container.resolve('orderRepository')
    this.restaurantRepository = container.resolve('restaurantRepository')
    this.restaurantService = container.resolve('restaurantService')
  }

  async findById (id) {
    return await this.orderRepository.findById(id)
  }

  async indexRestaurant (restaurantId) {
    const restaurantOrders = await this.orderRepository.findByRestaurantId(restaurantId)
    return restaurantOrders.map(order => {
      order.products = order.products.map(product => {
        processFileUris(product, ['image'])
        return product
      })
      return order
    })
  }

  async indexCustomer (customerId) {
    return this.orderRepository.indexCustomer(customerId)
  }

  async getProductsFromProductLines (productLines, restaurantId) {
    const productLinesIds = productLines.map(productLine => productLine.productId)
    const restaurantWithProducts = await this.restaurantRepository.findById(restaurantId)
    const products = restaurantWithProducts.products
    const productsFromProductLines = products.filter(product => productLinesIds.includes(product.id))
    return this.#equalProductsArraysSorting(productsFromProductLines, productLines)
  }

  #equalProductsArraysSorting (productsToBeSorted, sortedProductsArray) {
    return sortedProductsArray.map(obj2 => {
      const index = productsToBeSorted.findIndex(obj1 => obj1.id === obj2.productId)
      return productsToBeSorted[index]
    })
  }

  async #getProductLinesWithPrices (productLines, restaurantId) {
    const products = await this.getProductsFromProductLines(productLines, restaurantId)
    const productLinesCopy = [...productLines]
    /* eslint-disable eqeqeq */
    productLinesCopy.forEach(pl => { pl.unityPrice = products.find(p => p.id === pl.productId).price })
    return productLinesCopy
  }

  #computeOrderProductsPrice (productLinesWithPrices) {
    return productLinesWithPrices.reduce((total, productLineWithPrice) => total + productLineWithPrice.quantity * productLineWithPrice.unityPrice, 0)
  }

  async #computeShippingCosts (priceOfProducts, restaurantId) {
    let shippingCosts = 0
    if (priceOfProducts < 10) {
      const restaurant = await this.restaurantRepository.findById(restaurantId)
      shippingCosts = restaurant.shippingCosts
    }
    return shippingCosts
  }

  #getProductsWithOrderedProducts (products, productLines) {
    for (const product of products) {
      const productLine = productLines.find(productLine => productLine.productId === product.id)
      product.quantity = productLine.quantity
      product.unityPrice = productLine.unityPrice
    }
    return products
  }

  async #saveOrderWithProducts (order, productLines) {
    const products = await this.getProductsFromProductLines(productLines, order.restaurantId)
    order.products = this.#getProductsWithOrderedProducts(products, productLines)
    return this.orderRepository.create(order)
  }

  async #updateOrderWithProducts (order, productLines) {
    const products = await this.getProductsFromProductLines(productLines, order.restaurantId)
    order.products = this.#getProductsWithOrderedProducts(products, productLines)
    return this.orderRepository.update(order.id, order)
  }

  async #getOrderWithShippingCostsAndPrice (order, productLinesWithPrices) {
    const orderProductsPrice = this.#computeOrderProductsPrice(productLinesWithPrices)
    order.shippingCosts = await this.#computeShippingCosts(orderProductsPrice, order.restaurantId)
    order.price = orderProductsPrice + order.shippingCosts
    return order
  }

  async create (data) {
    const productLinesWithPrices = await this.#getProductLinesWithPrices(data.products, data.restaurantId)
    let newOrder = await this.#getOrderWithShippingCostsAndPrice(data, productLinesWithPrices)
    newOrder = await this.#saveOrderWithProducts(newOrder, productLinesWithPrices)
    return newOrder
  }

  async update (id, orderToBeUpdated) {
    const currentlySavedOrder = await this.findById(id)
    orderToBeUpdated.restaurantId = currentlySavedOrder.restaurantId
    orderToBeUpdated.id = currentlySavedOrder.id
    const productLinesWithPrices = await this.#getProductLinesWithPrices(orderToBeUpdated.products, orderToBeUpdated.restaurantId)
    orderToBeUpdated = await this.#getOrderWithShippingCostsAndPrice(orderToBeUpdated, productLinesWithPrices)
    return this.#updateOrderWithProducts(orderToBeUpdated, productLinesWithPrices)
  }

  async destroy (id) {
    const result = await this.orderRepository.destroy(id)
    if (!result) {
      throw new Error('Order not found')
    }
    return true
  }

  async isOrderPending (id) {
    const order = await this.findById(id)
    return !order.startedAt
  }

  async isOrderShippable (id) {
    const order = await this.findById(id)
    return order.startedAt && !order.sentAt
  }

  async isOrderDeliverable (id) {
    const order = await this.findById(id)
    return order.startedAt && order.sentAt && !order.deliveredAt
  }

  async confirm (id) {
    const order = await this.orderRepository.findById(id)
    order.startedAt = new Date()
    return this.orderRepository.save(order)
  }

  async send (id) {
    const order = await this.orderRepository.findById(id)
    order.sentAt = new Date()
    return this.orderRepository.save(order)
  }

  async deliver (id) {
    const order = await this.orderRepository.findById(id)
    order.deliveredAt = new Date()
    const deliveredOrder = await this.orderRepository.save(order)
    await this.restaurantService.updateAverageServiceTime(order.restaurantId)
    return deliveredOrder
  }

  async show (id) {
    const order = await this.findById(id)
    if (!order) {
      throw new Error('Order not found')
    }
    return order
  }

  async analytics (restaurantId) {
    return this.orderRepository.analytics(restaurantId)
  }

  async checkOrderOwnership (orderId, ownerId) {
    const order = await this.orderRepository.findById(orderId)
    const restaurantOrder = await this.restaurantRepository.findById(order.restaurantId)
    return ownerId === restaurantOrder.userId.toString()
  }

  async checkOrderCustomer (orderId, customerId) {
    const order = await this.orderRepository.findById(orderId)
    return customerId.toString() === order.userId.toString()
  }

  async exists (id) {
    return await this.orderRepository.findById(id)
  }

  async getRestaurantIdOfOrder (order, orderId = null) {
    return order.restaurantId !== undefined ? order.restaurantId : (await this.findById(orderId))?.restaurantId
  }

  async productsBelongToSameRestaurantAsSavedOrder (productLines, orderId) {
    const order = await this.findById(orderId)
    const products = await this.getProductsFromProductLines(productLines, order.restaurantId)
    return products.find(product => product.restaurantId === order.restaurantId)
  }

  async productsBelongToSameRestaurant (order, productLines, orderId) {
    const restaurantId = await this.getRestaurantIdOfOrder(order, orderId)
    const products = await this.getProductsFromProductLines(productLines, restaurantId)
    return !(products.length === 0 || products.length !== productLines.length || products.find(product => product.restaurantId !== restaurantId))
  }

  async areProductsAvailable (order, productLines, orderId) {
    const restaurantId = await this.getRestaurantIdOfOrder(order, orderId)
    const products = await this.getProductsFromProductLines(productLines, restaurantId)
    return products.find(product => product.availability === false) === undefined
  }
}

export default OrderService
