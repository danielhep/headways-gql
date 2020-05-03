const { sql } = require('slonik')
const { DateTime } = require('luxon')

exports.getRoutes = function (obj, args, { slonik }) {
  return slonik.any(sql`
    SELECT * FROM gtfs.routes
    WHERE feed_index = ${obj.feed_index}
    ORDER BY (substring(route_short_name, '^[0-9]+'))::int  
          ,substring(route_short_name, '[^0-9_].*$')
  `) // this sql sorts by numbers first, then letters
}

// args: contains date
// obj is a stop
exports.getRoutesFromStop = async function (obj, args, { slonik }) {
  let serviceIDQuery = sql``
  if (args.date) {
    const datetimeobj = DateTime.fromJSDate(args.date, { zone: 'UTC' })
    const serviceIDs = await require('../calendar/utils').getServiceIDsFromDate({ date: datetimeobj, feed_index: obj.feed_index, slonik })
    serviceIDQuery = sql`AND gtfs.trips.service_id = ANY(${sql.array(serviceIDs, sql`text[]`)})`
  }

  const res = await slonik.any(sql`
    SELECT * FROM gtfs.routes
      WHERE feed_index = ${obj.feed_index}
      AND route_id IN
        (SELECT route_id FROM gtfs.trips
        WHERE gtfs.trips.feed_index = ${obj.feed_index} 
        ${serviceIDQuery}
        AND gtfs.trips.trip_id IN
          (SELECT trip_id FROM gtfs.stop_times
          WHERE gtfs.stop_times.feed_index = ${obj.feed_index}
          AND gtfs.stop_times.stop_id = ${obj.stop_id}
          )
        )
  `)
  return res
}

exports.getRoute = async function (obj, args, { slonik }) {
  const route = await slonik.one(sql`
    SELECT * FROM gtfs.routes 
    WHERE feed_index = ${obj.feed_index}
    AND route_id = ${args.route_id}
  `)
  return route
}

exports.getRoutesFromShortName = async function (obj, args, { slonik }) {
  const routes = await slonik.any(sql`
    SELECT * FROM gtfs.routes
    WHERE feed_index = ${obj.feed_index}
    AND route_short_name = ANY(${sql.array(args.route_short_names, sql`text[]`)})
  `)
  return routes
}

exports.getRoutesFromID = async function (obj, args, { slonik }) {
  console.log(args)
  const routes = await slonik.any(sql`
    SELECT * FROM gtfs.routes
    WHERE _id = ANY(${sql.array(args.route_ids, sql`uuid[]`)})
  `)
  return routes
}

exports.getShapesFromRoute = async function (obj, args, { slonik }) {
  const shapes = await slonik.any(sql`
    SELECT ST_AsGeoJSON(the_geom) FROM gtfs.shape_geoms
    WHERE feed_index = ${obj.feed_index}
    AND shape_id IN
      (
        SELECT DISTINCT shape_id FROM gtfs.trips
        WHERE route_id = ${obj.route_id}
      )
  `)

  return shapes.map(d => JSON.parse(d.st_asgeojson))
}
