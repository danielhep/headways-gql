const { sql } = require('slonik')

exports.getFeeds = async function (obj, args, { slonik }) {
  return slonik.any(sql`
    SELECT * FROM gtfs.feed_info
  `)
}
exports.getFeed = async function (obj, args, { slonik }) {
  return slonik.one(sql`
    SELECT * FROM gtfs.feed_info
    WHERE feed_index = ${args.feed_index}
  `)
}
