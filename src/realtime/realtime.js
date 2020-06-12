const fetch = require('node-fetch')
const xml2js = require('xml2js')
const OBA_KEY = process.env.OBA_KEY

module.exports = {
  async getReq (req, res) {
    // const stopID = '1_17230' // 62
    const stopID = '1_7210' // e line
    const data = await fetch(`http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/${stopID}.xml?key=${OBA_KEY}&minutesAfter=120`)
    const dataObj = (await xml2js.parseStringPromise(await data.text())).response
    const currentTime = dataObj.currentTime[0]
    const stopTimes = dataObj.data[0].entry[0].arrivalsAndDepartures[0].arrivalAndDeparture
    const transformedStopTimes = stopTimes.map((x) => ({
      predicted: x.predicted[0] === 'true',
      // predicted time == 0 when it's a long way out?
      // the times are returned as strings, so this code is messy because we are doing implicit casts. TODO
      predictedDepartureTime: x.predicted[0] === 'true' ? Math.round((x.predictedDepartureTime[0] - currentTime) / 1000 / 60) : Math.round((x.scheduledDepartureTime[0] - currentTime) / 1000 / 60),
      deviation: x.predicted[0] === 'true' ? x.tripStatus[0].scheduleDeviation[0] / 60 : null
    }))
    console.log(stopTimes[0].tripStatus)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(transformedStopTimes.filter(x => x.predictedDepartureTime > 0)))
  }
}
