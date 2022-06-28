const { sequelize, Sequelize } = require("./index");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  identifier: { type: Sequelize.STRING, allowNull: false },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
});

module.exports = User;
