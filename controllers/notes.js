const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes.map((n) => n.toJSON()))
  })
})

notesRouter.get('/:id', (request, response, next) => {
  //using mongoose's findById method for fetching individual notes

  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note).end()
      } else {
        response.status(404).end()
      }
    })
    // he error that is passed forwards is given to the next function as a parameter. If next was called without a parameter, then the execution would simply move onto the next route or middleware. If the next function is called with a parameter, then the execution will continue to the error handler middleware.
    .catch((error) => next(error))
  // errorHandler defined at the bottom
})

notesRouter.delete('/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

notesRouter.post('/', (request, response, next) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({
      error: 'content is missing',
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note
    .save()
    .then((savedNote) => savedNote.toJSON())
    .then((savedAndJsonForamttedNote) => {
      response.json(savedAndJsonForamttedNote)
    })
    .catch((error) => next(error))
})

notesRouter.put('/:id', (request, response, next) => {
  const body = request.body
  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then((updatedNote) => {
      response.json(updatedNote)
    })
    .catch((error) => next(error))
})

module.exports = notesRouter