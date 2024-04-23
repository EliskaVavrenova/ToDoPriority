import knex from 'knex'
import knexfile from '../knexfile.js'

const NODE_ENV = process.env.NODE_ENV ?? "development"

export const db = knex(knexfile[NODE_ENV])

export const getAllTodos = async () => {
  const todos = await db('todos').select('*')

  return todos
}

export const getTodoById = async (id) => {
  const todo = await db('todos').select('*').where('id', id).first()

  return todo
}
