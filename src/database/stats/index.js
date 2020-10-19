const { sql } = require('slonik')

exports.getTrips = async function (obj, args, { slonik }) {
  const trips = await slonik.any(sql`
        SELECT * FROM gtfs.trips
        WHERE feed_index = ${obj.feed_index}
    `)

  return trips
}

exports.getTripsPerHour = async function (obj, args, { slonik }) {

}
