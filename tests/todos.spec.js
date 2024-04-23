import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import { db } from "../src/db.js"

test.beforeEach(async () => {
    await db.migrate.latest()
})

test.afterEach(async () => {
    await db.migrate.rollback()
})

test.serial("it renders a list of todos", async (t) => {
    const response = await supertest.agent(app).get("/")

    t.assert(response.text.includes('<div id="todoList">'))
})

test.serial("create new todo", async (t) => {
    await db("todos").insert({
        title: "Moje todo",
    })

    const response = await supertest.agent(app).get("/")

    t.assert(response.text.includes("Moje todo"))
})

test.serial("create new todo via form", async (t) => {
    const response = await supertest
        .agent(app)
        .post("/add-todo")
        .type("form")
        .send({ title: "Nějaký název" })
        .redirects(1)

    t.assert(response.text.includes("Nějaký název"))
})

test.serial("test toggle todo", async (t) => {
    await db("todos").insert({
        title: "Moje todo",
        done: true,
    })

    const todo = await db("todos").select("*").where("title", "Moje todo").first()

    await supertest.agent(app).get(`/toggle-todo/${todo.id}`)

    const updated_todo = await db("todos").select("*").where("id", todo.id).first()

    t.assert(todo.done === 1 && updated_todo.done === 0)
})

test.serial("update todo via form", async (t) => {
    await db("todos").insert({
        title: "Moje todo",
    })

    const todo = await db("todos").select("*").where("title", "Moje todo").first()

    await supertest
        .agent(app)
        .post(`/update-todo/${todo.id}`)
        .type("form")
        .send({
            title: "Moje todo aktualizované",
            priority: "high",
        })

    const updated_todo = await db("todos")
        .select("*")
        .where("id", todo.id)
        .first()

    t.assert(updated_todo.priority === "high" && updated_todo.title === "Moje todo aktualizované")
})

test.serial("test remove todo", async (t) => {
    await db("todos").insert({
        title: "Moje todo",
    })

    await db("todos").insert({
        title: "Moje další todo",
    })

    const todos = await db("todos").select("*")

    const response = await supertest
        .agent(app)
        .get(`/remove-todo/${todos[0].id}`)
        .redirects(1)

    t.assert(!response.text.includes("Moje todo"))
})

test.serial("test todo detail", async (t) => {
    await db("todos").insert({
        title: "Moje todo",
    })

    const response = await supertest.agent(app).get("/todo/1")

    t.assert(response.text.includes("Moje todo"))
})
