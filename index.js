const irc = require('irc');
const request = require('request');
const secrets = require('./secrets.js');

// Basic Options + Trigger Words
// ---------------------------------------------------------------------
const options = {
  url: 'https://api.coinmarketcap.com/v1/ticker/', 
  channel: '##cryptotestchannel',
  botName: 'cryptkper',
  network: 'irc.freenode.org'
};

if (secrets) {
  Object.assign(options, secrets);
}

const TRIGGER_SINGLE  = '!';
const TRIGGER_VOLUME  = '!vol';
const TRIGGER_MVP     = '!mvp';
const TRIGGER_OPTIONS = '!options';

const MARKET_VOLUME_FULL_DAY = "24h_volume_usd";
const MVP_CURRENCIES = ['BTC', 'BCH', 'ETH', 'LTC'];

// Setup Client + Listeners
// ---------------------------------------------------------------------
const client = new irc.Client(options.network, options.botName, {
  channels: [options.channel]
});

client.addListener('message', function (from, to, message) {
  if (message.startsWith(TRIGGER_SINGLE)) { handleSingleRequest(message) }
  if (message === TRIGGER_MVP) { handleMVPRequest(message) }
  if (message === TRIGGER_OPTIONS) { handleOptionsRequest(message) }
  if (message === TRIGGER_VOLUME) { handleVolumeRequest(message) }
});

// Handlers
// ---------------------------------------------------------------------

const handleSingleRequest = (message) => {
  let name = message.substring(1);

  request(options.url, (error, response, body) => {

    if (!error && response.statusCode === 200) {
      let currency = JSON.parse(body).filter(function (item) {
        return item.id.toUpperCase()
        .includes(name.toUpperCase()) || item.name.toUpperCase()
        .includes(name.toUpperCase()) || item.symbol.toUpperCase()
        .includes(name.toUpperCase())
      });

      if (currency.length > 0) {
        console.log("Sending Message:", currency[0].symbol, currency[0].price_usd)
        client.say(options.channel, formatBold(currency[0].symbol) + formatGreen(' $' + currency[0].price_usd) )
      }
    }

  });

}

const handleMVPRequest = (message) => {

  request(options.url, (error, response, body) => {
    
    if (!error && response.statusCode === 200) {
      let filteredCurrencies = [];

      JSON.parse(body).forEach(function(currency) {
        if ( MVP_CURRENCIES.indexOf(currency["symbol"]) > -1) {
          filteredCurrencies.push(currency)
        }
      })

      let message = filteredCurrencies.map(function (item) {
        return formatBold(item.symbol) + formatGreen(" $" + parseFloat(item.price_usd))
      }).join(" ");

      client.say(options.channel, message);
    }

  });

}

const handleVolumeRequest =  (message) => {
  request(options.url, (error, response, body) => {
    if (!error && response.statusCode === 200) {

      let currencies = JSON.parse(body)
        .filter(function (item) {
          return item[MARKET_VOLUME_FULL_DAY] != null;
        })
        .sort(function (a, b) {
          let volumeA = parseFloat(a[MARKET_VOLUME_FULL_DAY]);
          let volumeB = parseFloat(b[MARKET_VOLUME_FULL_DAY]);

          if (volumeA < volumeB) return 1;
          if (volumeA > volumeB) return -1;
          return 0;
        })
        .slice(0, 15)

      let message = currencies.map(function (item) {
        return formatBold(item.symbol)+ " $"+ formatNumber(parseFloat(item[MARKET_VOLUME_FULL_DAY]))
      }).join(" ");

      client.say(options.channel, message);
    } 
  });
}

const handleOptionsRequest = (message) => {
  var desc = [
    "  !  - Get the current USD price of a currency e.g. !btc",
    "!mvp - Get top 4 currencies in USD",
    "!vol - Get the current 24 hour market cap of top 15 currencies"
  ]
  client.say(options.channel, desc.join("\n"))
}

// Helpers
// ---------------------------------------------------------------------
const formatBold = (text) => irc.colors.wrap("bold", text)
const formatRed = (text) => irc.colors.wrap("dark_red", text)
const formatGreen = (text) => irc.colors.wrap("dark_green", text)
const formatNumber = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
