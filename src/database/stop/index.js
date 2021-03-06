const { DateTime } = require('luxon')
const { sql } = require('slonik')

exports.getStops = function (obj, args, { knex }) {
  return knex.withSchema('gtfs').select().from('stops').where({ feed_index: obj.feed_index })
}

exports.getStopsJson = async function (obj, args, { slonik }) {
  const stops = await slonik.anyFirst(sql`
    SELECT ST_AsGeoJSON(stops.*)
    FROM gtfs.stops
    WHERE feed_index=${obj.feed_index}
  `)
  return stops.map(x => JSON.parse(x))
}

// Args: stop_id
// Obj: feed_index,
exports.getStop = async function getStop (obj, args, { slonik }) {
  return slonik.one(sql`
    SELECT * FROM gtfs.stops
    WHERE stop_id = ${args.stop_id}
    AND feed_index = ${obj.feed_index}
  `)
}

// args: routes, date
// obj: stop
exports.getStopTimes = async function getStopTimes (obj, args, { slonik }) {
  const datetimeobj = DateTime.fromJSDate(args.date, { zone: 'UTC' })
  const serviceIDs = await require('../calendar/utils').getServiceIDsFromDate({ date: datetimeobj, feed_index: obj.feed_index, slonik })
  let routeIdQuery = sql``
  if (args.routes) {
    routeIdQuery = sql`AND gtfs.trips.route_id = ANY(${sql.array(args.routes, sql`text[]`)})`
  }

  const stopTimes = await slonik.any(sql`
  SELECT * FROM gtfs.stop_times
  WHERE 
  stop_id = ${obj.stop_id}
  AND
  feed_index = ${obj.feed_index}
  AND
  trip_id IN
  (
    SELECT trip_id FROM gtfs.trips
    WHERE gtfs.trips.service_id = ANY(${sql.array(serviceIDs, sql`text[]`)})
    ${routeIdQuery}
  )
  ORDER BY departure_time
    `)

  let prevDepartureTime = null
  const stopTimesWithPrevStopTime = stopTimes.map((time) => {
    if (prevDepartureTime) {
      time.time_since_last = time.departure_time.minus(prevDepartureTime).normalize()
    } else {
      time.time_since_last = null
    }

    prevDepartureTime = time.departure_time
    return time
  })
  return stopTimesWithPrevStopTime
}
