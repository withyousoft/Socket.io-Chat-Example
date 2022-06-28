const { sequelize, Sequelize } = require("./index");
const User = require("./user.model");

const Message = sequelize.define("message", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    reference: { model: "user", key: "id" },
  },
  room: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  text: Sequelize.STRING,
});

Message.belongsTo(User);
module.exports = Message;
