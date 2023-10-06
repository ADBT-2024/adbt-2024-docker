import express from 'express'
import dotenv from 'dotenv'
import routes from './routes/index.js'
import { initPassport } from './config/passport.js'
import { initMongoose } from './config/mongoose.js'
import loadGlobalMiddlewares from './middlewares/GlobalMiddlewaresLoader.js'
import { initSequelize } from './config/sequelize.js'

dotenv.config()

const app = express()

loadGlobalMiddlewares(app)
routes(app)
initPassport()
let server

try {
  await initializeDatabase()
  const port = process.env.APP_PORT || 3000
  server = await app.listen(port)
  console.log('KrakowEats listening at http://localhost:' + server.address().port)
} catch (error) {
  console.error(error)
}

export { server }
async function initializeDatabase () {
  if (process.env.DATABASE_TECHNOLOGY === 'mongoose') {
    await initMongoose()
    console.log('INFO - DocumentOriented/MongoDB/Mongoose technology selected.')
  } else if (process.env.DATABASE_TECHNOLOGY === 'sequelize') {
    await initSequelize()
    console.log('INFO - Relational/MariaDB/Sequelize technology selected.')
  }
  console.log('INFO - Database connected.')
}
