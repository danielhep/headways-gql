const { GraphQLDate } = require('graphql-iso-date')

module.exports = {
  Date: GraphQLDate,
  Query: {
    agencies: require('./database/agency').getAgencies,
    agency: require('./database/agency').getAgency,
    feeds: require('./database/feed').getFeeds,
    feed: require('./database/feed').getFeed,
    routes_by_id: require('./database/route').getRoutesFromID
  },
  Feed: {
    agencies: require('./database/agency').getAgencies,
    routes: require('./database/route').getRoutes,
    stops: require('./database/stop').getStops,
    stops_json: require('./database/stop').getStopsJson,
    stop: require('./database/stop').getStop,
    route: require('./database/route').getRoute,
    routes_by_short_name: require('./database/route').getRoutesFromShortName,
    trip_stats: require('./database/stats').getTrips
  },
  Agency: {
    routes: require('./database/route').getRoutes,
    stop: require('./database/stop').getStop,
    agency_center: ({ agency_center }) => {
      return {
        lat: agency_center[0],
        long: agency_center[1]
      }
    },
    stops: require('./database/stop').getStops
  },
  Route: {
    shapes: require('./database/route').getShapesFromRoute
  },
  Stop: {
    stop_times: require('./database/stop').getStopTimes,
    routes: require('./database/route').getRoutesFromStop
  },
  StopTime: {
    trip: require('./database/stoptime').getTripFromStopTime,
    departure_time_readable: require('./database/stop/utils.js').getTimeFromDuration('departure_time'),
    is_even_hour: ({ departure_time }) => !(departure_time.hours % 2),
    time_since_last_readable: require('./database/stop/utils.js').getTimeFromDuration('time_since_last')
  },
  Trip: {
    route: ({ route_id, feed_index }, args, { dataLoaders }) => dataLoaders.routes.load({ route_id, feed_index })
  },
  TripStatistics: {
    trips_per_hour: require('./database/stats').getTripsPerHour
  }
}
