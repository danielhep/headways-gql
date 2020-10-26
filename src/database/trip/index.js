const { sql } = require('slonik')

exports.getRouteFromTrip = function (obj, args, { slonik }) {
  return slonik.one(sql`
    SELECT * FROM gtfs.routes 
    WHERE route_id = ${obj.route_id}
    AND feed_index = ${obj.feed_index}
  `)
}

exports.getTripsFromRoute = function (obj, args, { slonik }) {
  return slonik.any(sql`
    SELECT * FROM gtfs.trips
    WHERE route_id = ${obj.route_id}
    AND feed_index = ${obj.feed_index}
  `)
}

exports.getTripCountFromRoute = async function (obj, args, { slonik }) {
  const val = await (slonik.one(sql`
    SELECT COUNT(*) FROM gtfs.trips
    WHERE route_id = ${obj.route_id}
    AND feed_index = ${obj.feed_index}
  `))
  return val.count
}
