const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const dotenv = require("dotenv");
const storage = require("node-persist");
dotenv.config();

const token = process.env.TELEGRAM_TOKEN_BOT;
const bot = new TelegramBot(token, { polling: true });

const MINUTES = Number(process.env.MINUTES);

type Chatconfig = {
  id: number,
  status: boolean,
}

let subscribed = [] as Chatconfig[];

void (async function main() {
  subscribed = await loadData();
  await initOldFearValue();
})();

let the_interval = MINUTES * 60 * 1000;
let loop = 0;
setInterval(function () {
  axios
    .get("https://api.alternative.me/fng/")
    .then(async function (response) {
      const fear: number = response.data.data[0].value;
      const message = getMessage(fear);

      if (await isTheMomentForSendIt(fear, loop)) {
        sendMessageSubscription(message);
      }
      storage.setItem('oldFearValue', fear);
    })
    .catch(function (error) {
      console.log(error);
    });
  loop++;
}, the_interval);

bot.on("message", (msg) => {
  const chatId: number = msg.chat.id;

  if (
    msg.text.toLowerCase() === "start" ||
    msg.text.toLowerCase() === "/start"
  ) {
    if (!isSubscribed(chatId)) {
      bot.sendMessage(chatId, "Subscribed, thanks!  \u{2705}");
      subscribed.push({
        id: chatId,
        status: true,
      });
      saveData();
    } else {
      bot.sendMessage(chatId, "You are already subscribed.  \u{2705}");
    }
  } else if (
    msg.text.toLowerCase() === "now" ||
    msg.text.toLowerCase() === "/now"
  ) {
    axios
      .get("https://api.alternative.me/fng/")
      .then(function (response) {
        const fear: number = response.data.data[0].value;
        const message = getMessage(fear);
        if (message) {
          bot.sendMessage(chatId, message);
        } else {
          bot.sendMessage(
            chatId,
            "HOLD: The Fear & Greed Index of Bitcoin is " + fear
          );
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  } else if (
    msg.text.toLowerCase() === "stop" ||
    msg.text.toLowerCase() === "/stop"
  ) {
    const index = subscribed.findIndex((chat) => chat.id == chatId);
    if (index > -1) {
      subscribed.splice(index, 1);
    }
    bot.sendMessage(chatId, "Ok, now you are unsubscribed.  \u{274C}");
    saveData();
  } else {
    bot.sendMessage(
      chatId,
      "For get current Fear Index, you can send: /now, NOW, Now or now\n\nFor subscribe to the chanel, you can send: /start, Start, START or start\n\nFor unsubscribe to the chanel, you can send: /stop, Stop, STOP or stop"
    );
  }
});

function getMessage(fear: number): string {
  if (fear >= 85) {
    return (
      "OMG SELL NOW, It's a bubble: \u{1F6A8}\u{1F6A8}\u{1F6A8} The Fear & Greed Index of Bitcoin is " +
      fear
    );
  } else if (fear >= 78 && fear < 85) {
    return "SELL: \u{1F6A8}\u{1F6A8} The Fear & Greed Index of Bitcoin is " + fear;
  } else if (fear >= 70 && fear < 78) {
    return "Attention: \u{1F6A8} The Fear & Greed Index of Bitcoin is " + fear;
  } else if (fear <= 30 && fear > 25) {
    return "Attention: \u{1F6A8} The Fear & Greed Index of Bitcoin is " + fear;
  } else if (fear <= 25 && fear > 20) {
    return "BUY: \u{1F6A8}\u{1F6A8} The Fear & Greed Index of Bitcoin is " + fear;
  } else if (fear <= 20) {
    return (
      "OMG BUY NOW, It's very cheap: \u{1F6A8}\u{1F6A8}\u{1F6A8} The Fear & Greed Index of Bitcoin is " +
      fear
    );
  } else {
    return null;
  }
}

function sendMessageSubscription(message: string) {
  if (message) {
    subscribed.forEach((chatId) => {
      if (chatId.status) {
        bot.sendMessage(chatId.id, message);
      }
    });
  }
}

async function isTheMomentForSendIt(fear: number, loop: number): Promise<boolean> {

  if (((fear >= 85 || fear <= 20) && loop % 1 == 0) &&
    loop % 4 == 0
  ) {
    return true;
  }

  const oldFearValue = await getOldFearValue() as unknown as Number

  if (oldFearValue == fear) {
    return false;
  }

  if ((fear < 85 && fear >= 78) || (fear > 20 && fear <= 25)) {
    return true;
  }

  if ((fear < 78 && fear >= 70) || (fear > 25 && fear <= 30)) {
    return true;
  }

  return false;
}

async function loadData(): Promise<Chatconfig[]> {
  await storage.init({
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: "utf8",
  });

  if ((await storage.getItem("subscribed")) === undefined) {
    await storage.setItem("subscribed", []);
  }

  return Object.values(await storage.getItem("subscribed")) as Chatconfig[];
}

async function initOldFearValue(): Promise<void> {
  await storage.init({
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: "utf8",
  });

  if ((await storage.getItem("oldFearValue")) === undefined) {
    await storage.setItem("oldFearValue", null);
  }
}

async function getOldFearValue(): Promise<Number | null> {
  if ((await storage.getItem("oldFearValue")) === undefined) {
    await storage.setItem("oldFearValue", null);
  }

  return await storage.getItem("oldFearValue");
}

async function saveData(): Promise<void> {
  await storage.updateItem("subscribed", subscribed);
}

function isSubscribed(chatId: number): boolean {
  return (subscribed.filter((chat) => chat.id == chatId).length) ? true : false;
}
