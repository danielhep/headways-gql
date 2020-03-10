const { sql } = require('slonik')

exports.getAgencies = async function getAgencies (obj, args, { slonik }) {
  if (obj) {
    return slonik.any(sql`
      SELECT * FROM gtfs.agency WHERE feed_index=${obj.feed_index}
    `)
  } else {
    return slonik.any(sql`
      SELECT * FROM gtfs.agency
    `)
  }
}

// Args: agency_id, feed_index
exports.getAgency = async function getAgency (obj, args, context) {
  return context.knex.withSchema('gtfs').select().where(args).from('agency').first()
}
