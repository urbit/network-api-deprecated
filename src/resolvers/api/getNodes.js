const _get = require('lodash.get')

const { query, connect, end } = require('../utils')
const { getNode } = require('./getNode')

const getNodes = async (_, args) => {
  const q = _get(args, 'input.q') || '%'
  const nodeTypes = _get(args, 'input.nodeTypes') || []
  const limit = _get(args, 'input.limit') || 0
  const offset = _get(args, 'input.offset') || 0

  await connect()

  const pointNameQuery = `select * from raw_events where point like '${q}%';`
  const pointNameResponse = await query(pointNameQuery)

  await end()

  let returnArr = []
  if (pointNameResponse.rows.length === 0) {
    return returnArr
  } else {
    console.log('in else')
    const potentialShips = []
    for (const i in pointNameResponse.rows) {
      console.log('🚀 ~ file: api.js ~ line 346 ~ getNodes ~ pointNameResponse.rows[i]', pointNameResponse.rows[i])
      const point = pointNameResponse.rows[i].point
      if (!potentialShips.includes(point)) {
        potentialShips.push(point)
      }
    }

    console.log('🚀 ~ file: api.js ~ line 355 ~ getNodes ~ potentialShips', potentialShips)

    for (const i in potentialShips) {
      if (nodeTypes.length > 0) {
        if (!nodeTypes.includes('GALAXY')) {
          if (potentialShips[i].length === 4) {
            continue
          }
        } else if (!nodeTypes.includes('STAR')) {
          if (potentialShips[i].length === 7) {
            continue
          }
        } else if (!nodeTypes.includes('PLANET')) {
          if (potentialShips[i].length === 14) {
            continue
          }
        }
      }

      const node = await getNode(_, { input: { urbitId: potentialShips[i] } })

      returnArr.push(node)
    }

    for (let i = offset; i > 0; i--) {
      returnArr = returnArr.slice(1)
    }

    for (let i = limit; i > 0; i--) {
      returnArr = returnArr.slice(0, limit)
    }

    return returnArr
  }
}

module.exports = { getNodes }
