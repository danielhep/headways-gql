const { sql } = require('slonik')

exports.getAgencies = async function getAgencies (obj, args, { slonik }) {
  const excludeFilter = args.exclude ? sql`AND agency_id != ALL(${sql.array(args.exclude, 'text')})` : sql``
  console.log(excludeFilter)
  if (obj) {
    return slonik.any(sql`
      SELECT * FROM gtfs.agency WHERE feed_index=${obj.feed_index}
      ${excludeFilter}
    `)
  } else {
    return slonik.any(sql`
      SELECT * FROM gtfs.agency
    `)
  }
}

// Args: agency_id, feed_index
exports.getAgency = async function getAgency (obj, args, { slonik }) {
  return slonik.one(sql`
    SELECT * FROM gtfs.agency WHERE feed_index=${args.feed_index} AND agency_id=${args.agency_id}
  `)
}
