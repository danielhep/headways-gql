const fetch = require('node-fetch')
const xml2js = require('xml2js')
const OBA_KEY = process.env.OBA_KEY

module.exports = {
  async getReq (req, res) {
    const data = await fetch(`http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/1_17230.xml?key=${OBA_KEY}&minutesAfter=120`)
    const dataObj = (await xml2js.parseStringPromise(await data.text())).response
    const currentTime = dataObj.currentTime[0]
    const stopTimes = dataObj.data[0].entry[0].arrivalsAndDepartures[0].arrivalAndDeparture
    const transformedStopTimes = stopTimes.map((x) => ({
      predicted: x.predicted[0],
      // predicted time == 0 when it's a long way out?
      // the times are returned as strings, so this code is messy because we are doing implicit casts. TODO
      predictedDepartureTime: x.predictedDepartureTime[0] !== '0' ? (x.predictedDepartureTime[0] - currentTime) / 1000 / 60 : (x.scheduledDepartureTime[0] - currentTime) / 1000 / 60
    }))
    console.log(stopTimes)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(transformedStopTimes))
  }
}
