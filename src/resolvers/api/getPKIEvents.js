const format = require('pg-format')

const { query } = require('../utils')

const getPKIEvents = async (_, args) => {
  const { urbitId, since, nodeTypes, limit, offset } = args.input

  const acceptablePointNameLengths = []

  if (nodeTypes.includes('PLANET')) {
    acceptablePointNameLengths.push(14)
  }
  if (nodeTypes.includes('STAR')) {
    acceptablePointNameLengths.push(7)
  }
  if (nodeTypes.includes('GALAXY')) {
    acceptablePointNameLengths.push(4)
  }

  let queryString

  queryString = format('select %s as "%s", %s as "%s", %s as "%s", %s, %s as "%s", %s, %s as "%s", %s as "%s" from %I where', 'event_id', 'eventId', 'node_id', 'nodeId', 'event_type_id', 'eventTypeId', 'time', 'sponsor_id', 'sponsorId', 'address', 'continuity_number', 'continuityNumber', 'revision_number', 'revisionNumber', 'pki_events')
  if (since) {
    queryString += format(' %I < \'%s\'', 'time', since)
  }
  if (nodeTypes && nodeTypes.length > 0) {
    if (since) {
      queryString += ' and'
    }

    if (acceptablePointNameLengths.length === 1) {
      queryString += format(' length(%s)=%s', 'node_id', acceptablePointNameLengths[0])
    } else {
      queryString += ' ('
      acceptablePointNameLengths.forEach(length => {
        queryString += format('length(%s)=%s', 'node_id', length)
        if (parseInt(i) !== acceptablePointNameLengths.length - 1) {
          queryString += ' or '
        }
      })
      queryString += ')'
    }
  }
  if (urbitId) {
    if (since || (nodeTypes && nodeTypes.length > 0)) {
      queryString += format(' and %s=\'%s\'', 'node_id', urbitId)
    }
  }
  queryString += format(' order by %s desc', 'time')
  if (limit) {
    queryString += format(' limit %s', limit)
  }
  if (offset) {
    queryString += format(' offset %s', offset)
  }
  queryString += ';'

  await query(queryString)
}

module.exports = { getPKIEvents }
