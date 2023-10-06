import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const getMongoDBConnectionURI = () => {
  const databaseProtocol = process.env.DATABASE_PROTOCOL
  const databaseHost = process.env.DATABASE_HOST
  const databasePort = process.env.DATABASE_PORT ? `:${process.env.DATABASE_PORT}` : ''
  const databaseUsername = process.env.DATABASE_USERNAME
  const databasePassword = process.env.DATABASE_PASSWORD
  const databaseName = process.env.DATABASE_NAME
  const dbCredentials = (databaseUsername && databasePassword) ? databaseUsername + ':' + databasePassword + '@' : ''

  const mongoDbConnectionURI = `${databaseProtocol}://${dbCredentials}${databaseHost}${databasePort}/${databaseName}?authSource=admin`
  return mongoDbConnectionURI
}

const initMongoose = () => {
  const mongoDbConnectionURI = getMongoDBConnectionURI()
  console.log(`Trying to connect to ${mongoDbConnectionURI}`)
  mongoose.set('strictQuery', false) // removes a deprecation warning
  // mongoose.set('debug', true)
  return mongoose.connect(mongoDbConnectionURI)
}

export { initMongoose, getMongoDBConnectionURI }
