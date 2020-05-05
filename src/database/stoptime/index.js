const { Duration } = require('luxon')
const { sql } = require('slonik')

// luxon duration is used to contain the timestamp since it can contain times past 24 hours
// timepoints in the next service day will be in the next day's time
// this is a generator that accepts 'arrival' or 'depature'
exports.getLuxonDurationFromInterval = (arrivalOrDeparture) => function (obj, args, { knex }) {
  const timeObj = { hours: null, minutes: null, seconds: null }
  if (arrivalOrDeparture === 'arrival') {
    timeObj.hours = obj.arrival_time.hours
    timeObj.minutes = obj.arrival_time.minutes
    timeObj.seconds = obj.arrival_time_seconds
  } else if (arrivalOrDeparture === 'departure') {
    timeObj.hours = obj.departure_time.hours
    timeObj.minutes = obj.departure_time.minutes
    timeObj.seconds = obj.departure_time_seconds
  }

  return Duration.fromObject(timeObj)
}

exports.getTripFromStopTime = async function (obj, args, { slonik }) {
  return slonik.one(sql`
    SELECT * FROM gtfs.trips
    WHERE trip_id = ${obj.trip_id}
    AND feed_index = ${obj.feed_index}
  `)
}
