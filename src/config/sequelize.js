import Sequelize from 'sequelize'

const databaseHost = process.env.DATABASE_HOST
const databasePort = process.env.DATABASE_PORT
const databaseUsername = process.env.DATABASE_USERNAME
const databasePassword = process.env.DATABASE_PASSWORD
const databaseName = process.env.DATABASE_NAME

const initSequelize = function () {
  const sequelizeConnection = new Sequelize(databaseName, databaseUsername, databasePassword, {
    host: databaseHost,
    port: databasePort,
    dialect: 'mariadb',
    dialectOptions: {
      allowPublicKeyRetrieval: true
    }
    // logging: false
  })
  return sequelizeConnection.authenticate()
}

export { initSequelize }
