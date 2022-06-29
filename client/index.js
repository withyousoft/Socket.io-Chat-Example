require("dotenv").config();
const { io } = require("socket.io-client");
const prompt = require("prompt");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const lorem = new LoremIpsum({
  sentencesPerParagraph: { max: 8, min: 4 },
  wordsPerSentence: { max: 16, min: 4 },
});

const properties = [
  {
    name: "countOfConnection",
    validator: /^(0|[1-9][0-9]*)$/,
    warning: "Count of connection must be number.",
  },
];

prompt.start();

let countOfConnection = 0;

prompt.get(properties, function (err, result) {
  if (err) return onErr(err);
  countOfConnection = result.countOfConnection;
});

function onErr(err) {
  console.log(err);
  return 1;
}

const URL = process.env.ENDPOINT || "http://localhost:8000";
const POLLING_PERCENTAGE = process.env.POLLING_PERCENTAGE || 0.05;
const CLIENT_CREATION_INTERVAL_IN_MS =
  process.env.CLIENT_CREATION_INTERVAL_IN_MS || 100;
const EMIT_INTERVAL_IN_MS = process.env.EMIT_INTERVAL_IN_MS || 1000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const createClient = () => {
  // for demonstration purposes, some clients stay stuck in HTTP long-polling
  const transports =
    Math.random() < POLLING_PERCENTAGE ? ["polling"] : ["polling", "websocket"];
  const socket = io.connect(URL, { reconnect: true, port: 8000, transports });
  const room = "load_test";
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
  });

  socket.emit("join", { name, room }, (error) => {
    // console.log("joined");
    if (error) {
      console.log(error);
    }
  });

  socket.on("message", (message) => {
    // console.log("get message from server ===> ", JSON.stringify(message));
    packetsSinceLastReport++;
  });

  socket.on("lastMessage", (messages) => {
    // console.log(
    //   "get last messages from server ===> ",
    //   JSON.stringify(messages)
    // );
    packetsSinceLastReport++;
  });

  socket.on("roomData", ({ users }) => {
    // console.log("get room data from server ===> ", JSON.stringify(users));
    packetsSinceLastReport++;
  });

  setTimeout(() => {
    setInterval(() => {
      const newMessage = lorem.generateSentences(1);
      socket.emit("sendMessage", encodeURI(newMessage), () => {
        packetsSinceLastReport++;
      });
    }, EMIT_INTERVAL_IN_MS);
  }, 1000);

  socket.on("disconnect", (reason) => {
    console.log(`disconnect due to ${reason}`);
  });

  if (++clientCount < countOfConnection) {
    setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
  }
};

createClient();

const printReport = () => {
  const now = new Date().getTime();
  const durationSinceLastReport = (now - lastReport) / 1000;
  const packetsPerSeconds = (
    packetsSinceLastReport / durationSinceLastReport
  ).toFixed(2);

  console.log(
    `client count: ${clientCount} ; average packets received per second: ${packetsPerSeconds}`
  );

  packetsSinceLastReport = 0;
  lastReport = now;
};

setInterval(printReport, 5000);
