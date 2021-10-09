# Telegram Bitcoin Fear Bot

Custom Telegram that notify when Bitcoin Fear & Greed Index is in zones of buy or sell.

## Build Setup

```bash
# install dependencies
$ npm install
# or
$ yarn 

# create environtment file
$ cp .env.example .env

```

## Generate Telegram Bot with [BotFather](https://t.me/BotFather) & put the token in environtment

```code
TELEGRAM_TOKEN_BOT='TELEGRAM_TOKEN_BOT'
```

## Start bot

```bash
# build for production and launch telgram bot
$ npm run start
# or
$ yarn start
```


#Use

- If send any message, it's reply with help info.
- If you send '/start', 'start', 'START' or 'Start', it sends you the index value every hour (this period can be configured)
- If your send '/now', 'now', 'NOW' or 'Now', it sends you the current index value.
- You can send '/stop', 'stop', 'STOP' or 'Stop' for unsubscribe.

