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
  countOfConnection = parseInt(result.countOfConnection);

  createClient();
  setInterval(printReport, 5000);
});

function onErr(err) {
  console.log(err);
  return 1;
}

const URL = process.env.ENDPOINT || "http://localhost:8000";
const POLLING_PERCENTAGE = process.env.POLLING_PERCENTAGE || 0.05;
const CLIENT_CREATION_INTERVAL_IN_MS =
  process.env.CLIENT_CREATION_INTERVAL_IN_MS || 100;
const MAX_MESSAGE_COUNT = process.env.MAX_MESSAGE_COUNT || 100;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const createClient = async () => {
  // for demonstration purposes, some clients stay stuck in HTTP long-polling
  const transports =
    Math.random() < POLLING_PERCENTAGE ? ["polling"] : ["polling", "websocket"];
  const socket = io.connect(URL, {
    reconnect: true,
    transports,
  });
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

  socket.on("reconnect", (attempt) => {
    console.log("Reconnect is succeed. attempt ===> ", attempt);
  });

  socket.io.on("reconnect_attempt", (attempt) => {
    console.log("Try to reconnect attempt ===> ", attempt);
  });

  socket.io.on("reconnect_error", (error) => {
    console.log("reconnect is failed with reason ===> ", error);
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

  socket.on("connect", (data) => {
    console.log("connected  ===> ");
  });

  socket.on("disconnect", async (reason) => {
    console.log(`disconnect due to ${reason}`);
    if (reason === "io client disconnect") {
      await sleep(Math.floor(Math.random() * 1000));
      socket.connect();
    }
  });

  setTimeout(async () => {
    for (var i = 0; i < MAX_MESSAGE_COUNT; i++) {
      const newMessage = lorem.generateSentences(1);
      // eslint-disable-next-line no-loop-func
      socket.emit("sendMessage", encodeURI(newMessage), () => {
        packetsSinceLastReport++;
      });
      await sleep(Math.floor(Math.random() * 1000));
    }

    await sleep(Math.floor(Math.random() * 1000));
    socket.disconnect();
  }, 1000);

  if (++clientCount < countOfConnection) {
    setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
  }
};

// createClient();

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
