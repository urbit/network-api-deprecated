const format = require('pg-format')

const { query } = require('../../utils')

const eventTypeKey = {
  1: 'CHANGE_OWNERSHIP',
  2: 'CHANGE_SPAWN_PROXY',
  3: 'CHANGE_TRANSFER_PROXY',
  4: 'CHANGE_MANAGEMENT_PROXY',
  5: 'CHANGE_VOTING_PROXY',
  6: 'ACTIVATE',
  7: 'SPAWN',
  8: 'ESCAPE_REQUESTED',
  9: 'ESCAPE_CANCELLED',
  10: 'ESCAPE_ACCEPTED',
  11: 'LOST_SPONSOR',
  12: 'BROKE_CONTINUITY',
  13: 'UNKNOWN'
}

const getPKIEvents = async (_, args) => {
  const { urbitId, since, nodeTypes, limit, offset } = args.input

  const acceptablePointNameLengths = []

  if (nodeTypes && nodeTypes.includes('PLANET')) {
    acceptablePointNameLengths.push(14)
  }
  if (nodeTypes && nodeTypes.includes('STAR')) {
    acceptablePointNameLengths.push(7)
  }
  if (nodeTypes && nodeTypes.includes('GALAXY')) {
    acceptablePointNameLengths.push(4)
  }

  let queryString

  queryString = format('select %s as "%s", %s as "%s", %s as "%s", %s, %s as "%s", %s, %s as "%s", %s as "%s" from %I', 'event_id', 'eventId', 'node_id', 'nodeId', 'event_type_id', 'eventTypeId', 'time', 'sponsor_id', 'sponsorId', 'address', 'continuity_number', 'continuityNumber', 'revision_number', 'revisionNumber', 'pki_events')
  if (urbitId || nodeTypes || since) {
    queryString += ' where'
  }
  if (since) {
    queryString += format(' %I < \'%s\'', 'time', since)
  }
  if (nodeTypes && nodeTypes.length > 0) {
    if (since) {
      queryString += ' and'
    }

    if (acceptablePointNameLengths.length === 1) {
      if (!since) {
        queryString += ' where'
      }
      queryString += format(' length(%s)=%s', 'node_id', acceptablePointNameLengths[0])
    } else {
      queryString += ' ('

      acceptablePointNameLengths.forEach((length, index) => {
        queryString += format('length(%s)=%s', 'node_id', length)
        if (index !== acceptablePointNameLengths.length - 1) {
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

  const response = await query(queryString)
  let rows = response.rows
  
  rows.forEach(row => {
    const { eventTypeId } = row
    if (eventTypeId) {
      row.type = eventTypeKey[eventTypeId]
    } else {
      row.type = 'UNKNOWN'
    } 
  })

  return rows
}

module.exports = getPKIEvents