var Tessel = require('tessel-io')
var five = require('johnny-five')
var fs = require('fs')
var path = require('path')

// Constants
const mountPoint = '/mnt/sda1' // The first flash drive you plug in will be mounted here, the second will be at '/mnt/sdb1'
const filepath = path.join(mountPoint, 'environment.csv')
const FIVE_MIN = 5 * 60 * 1000
const logging = false

var lastSent = new Date()

prepareFile()

var board = new five.Board({
  io: new Tessel(),
  repl: false,
  debug: true,
})

board.on('ready', () => {
  var monitor = new five.IMU({
    controller: 'BME280',
    freq: 5000,
  })

  monitor.on('change', function () {
    if (shouldSendData()) {
      const data = formattedData(
        this.thermometer.celsius,
        this.barometer.pressure,
        this.hygrometer.relativeHumidity
      )

      writeData(data)
      lastSent = new Date()
    }
  })
})

function shouldSendData() {
  var elapsed = new Date() - lastSent
  return elapsed > FIVE_MIN
}

function readData() {
  fs.readFile(filepath, function (err, data) {
    if (err) throw err
    console.log('Read', data.toString(), 'from USB mass storage device.')
  })
}

function writeData(data) {
  fs.appendFile(filepath, data, (err) => {
    if (err) {
      console.log(err)
      throw err
    } else {
      if (logging) console.log(data)
    }
  })
}

function prepareFile() {
  const headerString = 'taken_at,temp_in_celsius,pressure,relative_humidity' + '\n'
  fs.exists(filepath, (exists) => {
    if (!exists) {
      fs.writeFile(filepath, headerString, function (err) {
        if (err) throw err
        console.log('Wrote: ' + headerString)
      })
    }
  })
}

function formattedData(temp_in_celsius, pressure, relative_humidity) {
  const taken_at = new Date().toISOString()
  return [taken_at, temp_in_celsius, pressure, relative_humidity].join(',') + '\n'
}
