const User = require("./models/user.model");
const users = [];

/**
 *
 * @param {socketId, identifier, room} id: Socked ID, name: user identifier, room: room identifier
 * @returns
 */
const addUser = async ({ socketId, identifier, room }) => {
  identifier = identifier.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.room === room && user.identifier === identifier
  );

  if (existingUser) {
    return { error: "User Identifier is taken already" };
  }

  let dbUser = await User.findOne({ where: { identifier } });
  if (!dbUser) {
    dbUser = await User.create({ identifier });
  }

  const user = { socketId, userId: dbUser.id, identifier, room };

  users.push(user);

  return { user };
};

const removeUser = (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (socketId) => users.find((user) => user.socketId === socketId);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
