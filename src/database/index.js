const { Duration } = require('luxon')
const { sql, createPool, createTypeParserPreset, createIntervalTypeParser } = require('slonik')
const DataLoader = require('dataloader')
const _ = require('lodash')

const slonik = createPool(
  process.env.DB_URI,
  {
    typeParsers: [
      ...createTypeParserPreset(),
      {
        // Intervals should map to Luxon durations
        name: 'interval',
        parse: (value) => {
          const seconds = createIntervalTypeParser().parse(value)
          return Duration.fromMillis(seconds * 1000).shiftTo('hours', 'minutes', 'seconds', 'milliseconds')
        }
      }
    ]
  })

slonik.connect(() => {
  console.log(slonik.getPoolState())
})

const batch = {
  async trips (keys) {
    const tuples = _.map(keys, (key) => sql`(${sql.join([key.feed_index, key.trip_id], sql`, `)})`)
    const res = await slonik.any(sql`
      SELECT * FROM gtfs.trips
      WHERE (feed_index, trip_id) IN (${sql.join(tuples, sql`, `)})
    `)

    // ensure that the order of the return is the same as the keys
    return _.map(keys, (key) => res.find(v => (v.feed_index === key.feed_index) && (v.trip_id === key.trip_id)))
  },
  async routes (keys) {
    const tuples = _.map(keys, (key) => sql`(${sql.join([key.feed_index, key.route_id], sql`, `)})`)
    const res = await slonik.any(sql`
      SELECT * FROM gtfs.routes
      WHERE (feed_index, route_id) IN (${sql.join(tuples, sql`, `)})
    `)

    // ensure that the order of the return is the same as the keys
    return _.map(keys, (key) => res.find(v => (v.feed_index === key.feed_index) && (v.route_id === key.route_id)))
  }
}

const dataLoaders = {
  trip: new DataLoader(batch.trips),
  routes: new DataLoader(batch.routes)
}

module.exports.dataLoaders = dataLoaders
module.exports.slonik = slonik
