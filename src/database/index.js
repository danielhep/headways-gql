const knex = require('knex')({
  client: 'pg',
  connection: process.env.DB_URI,
  pool: {
    afterCreate: function (conn, done) {
      // in this example we use pg driver's connection API
      conn.query('SET timezone="UTC";', function (err) {
        if (err) {
          // first query failed, return error and don't try to make next query
          console.log('Connection failed.')
          done(err, conn)
        } else {
          // do the second query...
          conn.query('SELECT pg_database_size(\'headways\');', function (err) {
            if (err) {
              console.log('Connection failed')
              console.log(err)
            } else {
              console.log('Connection succeeded.')
            }
            // if err is not falsy, connection is discarded from pool
            // if connection aquire was triggered by a query the error is passed to query promise
            done(err, conn)
          })
        }
      })
    }
  }
})

const { Duration } = require('luxon')
const { createPool, createTypeParserPreset, createIntervalTypeParser } = require('slonik')

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

  // {
  //   activeConnectionCount: 1,
  //   ended: false,
  //   idleConnectionCount: 0,
  //   waitingClientCount: 0,
  // }
})

module.exports.slonik = slonik
module.exports.knex = knex
