
import container from '../config/container.js'
const checkProductOwnership = async (req, res, next) => {
  const productService = container.resolve('productService')
  try {
    const belongsToOwner = await productService.checkProductOwnership(req.params.productId, req.user.id)
    if (belongsToOwner) {
      return next()
    } else {
      return res.status(403).send('Not enough privileges. This entity does not belong to you')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
const checkProductRestaurantOwnership = async (req, res, next) => {
  const productService = container.resolve('productService')
  try {
    const belongsToOwner = await productService.checkProductRestaurantOwnership(req.body.restaurantId, req.user.id)
    if (belongsToOwner) {
      return next()
    } else {
      return res.status(403).send('Not enough privileges. This entity does not belong to you')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export { checkProductOwnership, checkProductRestaurantOwnership }
