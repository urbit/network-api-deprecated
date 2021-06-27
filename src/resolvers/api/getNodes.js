const _get = require('lodash.get')

const { query } = require('../../utils')
const { getNode } = require('./getNode')

const getNodes = async (_, args) => {
  const q = _get(args, 'input.q') || '%'
  const nodeTypes = _get(args, 'input.nodeTypes') || []
  const limit = _get(args, 'input.limit') || 0
  const offset = _get(args, 'input.offset') || 0

  const pointNameQuery = `select * from raw_events where point like '${q}%' limit ${limit} offset ${offset};`
  const pointNameResponse = await query(pointNameQuery)
  const pointNameResponseRows = _get(pointNameResponse, 'rows') || []

  let nodes = []
  if (pointNameResponseRows.length === 0) {
    return nodes
  } else {
    console.log('in else')
    const potentialShips = []

    pointNameResponseRows.forEach(row => {
      const { point } = row
      if (!potentialShips.includes(point)) {
        potentialShips.push(point)
      }
    })

    potentialShips.forEach(async ship => {
      if (nodeTypes.length > 0) {
        if (!nodeTypes.includes('GALAXY')) {
          if (ship.length === 4) {
            return
          }
        } else if (!nodeTypes.includes('STAR')) {
          if (ship.length === 7) {
            return
          }
        } else if (!nodeTypes.includes('PLANET')) {
          if (ship.length === 14) {
            return
          }
        }
      }

      const node = await getNode(_, { input: { urbitId: ship } })

      nodes.push(node)
    })

    return nodes
  }
}

module.exports = { getNodes }
