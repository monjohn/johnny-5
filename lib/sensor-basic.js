var Barcli = require('barcli')
var five = require('johnny-five')
var Tessel = require('tessel-io')

var board = new five.Board({
  io: new Tessel(),
  repl: false,
  debug: false,
})

board.on('ready', function () {
  var hygrometer = new five.Hygrometer({
    controller: 'DHT22',
  })

  hygrometer.on('change', function () {
    console.log(this.relativeHumidity + ' %')
  })
})
