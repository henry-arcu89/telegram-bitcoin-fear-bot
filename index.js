const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN_BOT;

const MINUTES = 1;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (msg.text.toLowerCase() === "start") {
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, "Subscribed, thanks!");

    var the_interval = MINUTES * 60 * 1000;
    setInterval(function () {
      axios
        .get("https://api.alternative.me/fng/")
        .then(function (response) {
          // handle success
          const fear = response.data.data[0].value;
          const message = getMessage(fear);
          if(message){
            bot.sendMessage(chatId, message);
          }          
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })

      // do your stuff here
    }, the_interval);
  } else if (msg.text.toLowerCase() === "now") {
    axios
      .get("https://api.alternative.me/fng/")
      .then(function (response) {
        // handle success
        const fear = response.data.data[0].value;        
        const message = getMessage(fear);
          if(message){
            bot.sendMessage(chatId, message);
          } else {
            bot.sendMessage(chatId, "HOLD: The Fear & Greed Index of Bitcoin is " + fear);
          } 
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
  } else {
    bot.sendMessage(
      chatId,
      "For get current Fear Index, you can send: NOW, Now or now\n\nFor subscribe to the chanel, you can send: Start, START or start"
    );
  }
});

function getMessage(fear) {
  if (fear >= 79) {
    return (
      "OMG SELL NOW, It's a bubble: The Fear & Greed Index of Bitcoin is " +
      fear
    );
  } else if (fear >= 75 && fear < 79) {
    return "SELL: The Fear & Greed Index of Bitcoin is " + fear;
  } else if (fear <= 25 && fear > 19) {
    return "BUY: The Fear & Greed Index of Bitcoin is " + fear;
  } else if (fear <= 19) {
    return (
      "OMG BUY NOW, It's very cheap: The Fear & Greed Index of Bitcoin is " +
      fear
    );
  } else {
    return false;
  }
}
