const { sql } = require('slonik')
const { DateTime } = require('luxon')

exports.getRoutes = function (obj, args, { knex }) {
  return knex.withSchema('gtfs').select().from('routes').where({ feed_index: obj.feed_index })
}

exports.getRoutesFromStop = async function (obj, args, { slonik }) {
  let serviceIDQuery = sql``
  if (args.date) {
    const datetimeobj = DateTime.fromJSDate(args.date, { zone: 'UTC' })
    const serviceIDs = await require('../calendar/utils').getServiceIDsFromDate({ date: datetimeobj, feed_index: obj.feed_index, slonik })
    serviceIDQuery = sql`AND gtfs.trips.service_id = ANY(${sql.array(serviceIDs, sql`text[]`)})`
  }

  const res = await slonik.any(sql`
    SELECT DISTINCT * FROM gtfs.routes
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
  console.log('Hello')
  const route = await slonik.one(sql`
    SELECT * FROM gtfs.routes 
    WHERE feed_index = ${obj.feed_index}
    AND route_id = ${args.route_id}
  `)
  console.log(route)
  return route
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

  return shapes
}
