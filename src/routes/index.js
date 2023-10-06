import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const basename = path.basename(__filename)

const loadRoutes = function (app) {
  fs.readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
    })
    .forEach(async file => {
      const { default: loadFileRoutes } = await import(path.join(__dirname, file))
      loadFileRoutes(app)
    })
}

export default loadRoutes
