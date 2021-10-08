const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const token = process.env.TELEGRAM_TOKEN_BOT;
const bot = new TelegramBot(token, { polling: true });

const MINUTES = process.env.MINUTES;

let subscribed = [];

bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

let the_interval = MINUTES * 60 * 1000;
let loop = 0;
setInterval(function () {
  axios
    .get("https://api.alternative.me/fng/")
    .then(function (response) {
        const fear = response.data.data[0].value;
        const message = getMessage(fear);

        if(isTheMomentForSendIt(fear, loop)) {
          sendMessageSubscription(message)
        }
    })
    .catch(function (error) {
      console.log(error);
    })
    loop++;
}, the_interval);

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (msg.text.toLowerCase() === "start" || msg.text.toLowerCase() === "/start") {
    if(!subscribed[chatId]?.status){
      bot.sendMessage(chatId, "Subscribed, thanks!");
      subscribed[chatId] = {
        id: chatId,
        status: true
      };      
    }else {
      bot.sendMessage(chatId, "You are already subscribed.");
    }   
    
  } else if (msg.text.toLowerCase() === "now" || msg.text.toLowerCase() === "/now") {
    axios
      .get("https://api.alternative.me/fng/")
      .then(function (response) {
        const fear = response.data.data[0].value;        
        const message = getMessage(fear);
          if(message){
            bot.sendMessage(chatId, message);
          } else {
            bot.sendMessage(chatId, "HOLD: The Fear & Greed Index of Bitcoin is " + fear);
          } 
      })
      .catch(function (error) {
        console.log(error);
      })
  } else {
    bot.sendMessage(
      chatId,
      "For get current Fear Index, you can send: /now, NOW, Now or now\n\nFor subscribe to the chanel, you can send: /start, Start, START or start"
    );
  }
});

function getMessage(fear) {
  if (fear >= 80) {
    return (
      "OMG SELL NOW, It's a bubble: The Fear & Greed Index of Bitcoin is " +
      fear
    );
  } else if (fear >= 75 && fear < 80) {
    return "SELL: The Fear & Greed Index of Bitcoin is " + fear;
  } else if (fear >= 70 && fear < 75) {
    return "Attention: The Fear & Greed Index of Bitcoin is " + fear;
  } else if (Attention <= 30 && fear > 25) {
    return "Attention: The Fear & Greed Index of Bitcoin is " + fear;
  } else if (fear <= 25 && fear > 20) {
    return "BUY: The Fear & Greed Index of Bitcoin is " + fear;
  } else if (fear <= 20) {
    return (
      "OMG BUY NOW, It's very cheap: The Fear & Greed Index of Bitcoin is " +
      fear
    );
  } else {
    return false;
  }
}

function sendMessageSubscription(message) {
  if(message){       
    subscribed.forEach((chatId) => {
      if(chatId.status) {
          bot.sendMessage(chatId.id, message);
        }
    })        
  }
}

function isTheMomentForSendIt(fear, loop) {

  if((fear >= 80 || fear <= 20) && loop%1 == 0) {
    return true;
  }

  if(((fear < 80 && fear >= 75) || (fear >20 && fear <= 25)) && loop%2 == 0) {
    return true;
  }
  
  if(((fear < 75 && fear >= 70) || (fear >25 && fear <= 30)) && loop%4 == 0) {
    return true;
  }

  return false;
}
