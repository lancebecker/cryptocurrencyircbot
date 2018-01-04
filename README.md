# Cryptobot

Adapted and extended from:
<https://github.com/gderaco/cryptocurrencyircbot>

# Installation

```
git clone https://github.com/lancebecker/cryptobot.git
yarn
node index.js
```

## For privately configurations and secrets you don't want shared in this repo
`cp secrets.template.js secrets.js`

#### Options
  | Option | Type | Description | Default |
  | ------ | ---- | ----------- | ------- |
  | `botName` | String | The name your bot displays in an IRC channel | cryptkeeper |
  | `url` | String | API request url. | https://api.coinmarketcap.com/v1/ticker/' |
  | `channel` | String | Change this to your preferred channel |##cryptotestchannel |
  | `network` | String | IRC Network | irc.freenode.org |
  | `mvps` | Array | Optional list of currencies you want displayed when using the !mvp command | ['BTC', 'BCH', 'ETH', 'LTC'] |
