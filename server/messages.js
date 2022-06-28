const Message = require("./models/message.model");
const User = require("./models/user.model");

/**
 *
 * @param {socketId, identifier, room} id: Socked ID, name: user identifier, room: room identifier
 * @returns
 */
const addMessage = async ({ userId, room, text }) => {
  const newMessage = await Message.create({ userId, room, text });
  return {
    id: newMessage.id,
    userId: newMessage.userId,
    room: newMessage.room,
    text: newMessage.text,
  };
};

const getLastMessages = async ({ room }) => {
  const messages = await Message.findAll({
    where: {
      room,
    },
    order: [["createdAt", "ASC"]],
    include: [
      {
        model: User,
        as: "user",
      },
    ],
    limit: 20,
  });

  if (!messages) {
    return null;
  }
  return messages.map((el) => ({
    id: el.id,
    userId: el.user.id,
    identifier: el.user.identifier,
    text: el.text,
  }));
};

module.exports = { addMessage, getLastMessages };
