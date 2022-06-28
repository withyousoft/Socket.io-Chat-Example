const Message = require("./models/message.model");
const User = require("./models/user.model");

/**
 *
 * @param {socketId, identifier, room} id: Socked ID, name: user identifier, room: room identifier
 * @returns
 */
const addMessage = async ({ userId, text }) => {
  const newMessage = await Message.create({ userId, text });
  return {
    id: newMessage.id,
    userId: newMessage.userId,
    text: newMessage.text,
  };
};

const getLastMessages = async () => {
  const messages = await Message.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
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
