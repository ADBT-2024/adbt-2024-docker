import mongoose from 'mongoose'
import generateUsers from '../common/usersGenerator.cjs'

const seedUsers = async (nUsers) => {
  const collection = mongoose.connection.db.collection('users')
  await collection.drop()
  const users = await generateUsers(nUsers)
  await collection.insertMany(users)
  console.log('Users collection seeded! :)')
}

export { seedUsers }
