const { sql } = require('slonik')

exports.getRouteFromTrip = function (obj, args, { slonik }) {
  return slonik.one(sql`
    SELECT * FROM gtfs.routes 
    WHERE route_id = ${obj.route_id}
    AND feed_index = ${obj.feed_index}
  `)
}
