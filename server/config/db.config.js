require("dotenv").config();

module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "p2pinc",
  PASSWORD: process.env.DB_PASSWORD || "p2pinc",
  DB: process.env.DB_DATABASE || "websocket_chat",
  dialect: process.env.DB_DIALECT || "mysql",
  pool: {
    max: 150,
    min: 0,
    acquire: 600000,
    idle: 100000,
  },
};
