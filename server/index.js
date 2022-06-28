require("dotenv").config();
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
const { addMessage, getLastMessages } = require("./messages");

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const db = require("./models");

app.use(cors());
app.use(router);

db.sequelize
  .sync()
  // .sync({ force: true })
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

io.on("connect", (socket) => {
  socket.on("join", async ({ name, room }, callback) => {
    const { error, user } = await addUser({
      socketId: socket.id,
      identifier: name,
      room,
    });

    const lastMessages = await getLastMessages({ room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      socketId: "admin",
      text: `${user.identifier}, welcome to room ${user.room}.`,
    });

    socket.emit("lastMessages", {
      lastMessages: lastMessages,
    });

    socket.broadcast.to(user.room).emit("message", {
      socketId: "admin",
      text: `${user.identifier} has joined!`,
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", async (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { socketId: socket.id, text: message });
    addMessage({ userId: user.userId, room: user.room, text: message });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        socketid: "admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(process.env.PORT || 8000, () =>
  console.log(`Server has started.`)
);
