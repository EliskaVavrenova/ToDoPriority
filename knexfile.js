export default {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./mydb.sqlite",
    },
    useNullAsDefault: false,
    debug: false,
  },
  test: {
    client: "sqlite3",
    connection: {
      filename: "./testdb.sqlite",
    },
    useNullAsDefault: true,
  },
}
