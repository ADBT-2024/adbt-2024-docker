const generateRestaurantCategories = async () => {
  const restaurantCategories = [{ name: 'Fast Food' }, { name: 'Casual' }, { name: 'Fast Casual' }, { name: 'Contemporary' }, { name: 'Fine Dining' }, { name: 'Cafes and Coffee Shops' }, { name: 'Specialty Drinks' }, { name: 'Buffet' }, { name: 'Food Trucks' }]
  return restaurantCategories
}

module.exports = generateRestaurantCategories
