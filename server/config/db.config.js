module.exports = {
  HOST: "localhost",
  USER: "p2pinc",
  PASSWORD: "p2pinc",
  DB: "websocket_chat",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
