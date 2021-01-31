const logger = require('./logger')

// middleware for logging between req and res
const requestLogger = (request, response, next) => {
  logger.info('\n--------------')
  logger.info('Method', request.method)
  logger.info('Path', request.path)
  logger.info('Body', request.body)
  logger.info('--------------')
  next()
}

// if unknown end point is hit other than the ones defined end points
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unkown endpoint' })
}

// express error handler
const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  // if the request is malformatted the findById will throw an error causing promise to be rejected
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformattted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
}
