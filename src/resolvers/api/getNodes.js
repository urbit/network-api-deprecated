const { Client }    = require('pg')
const _get           = require('lodash.get')

const getNodes = async (_, args) => {
  console.log('running getNodes')

  const q = _get(args, 'input.q') || '%'
  const nodeTypes = _get(args, 'input.nodeTypes') || []
  const limit = _get(args, 'input.limit') || 0
  const offset = _get(args, 'input.offset') || 0

  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  let pointNameQuery = `select * from raw_events where point like '${q}%';`
  console.log("🚀 ~ file: api.js ~ line 308 ~ getNodes ~ pointNameQuery", pointNameQuery)

  let pointNameResponse
  try {
    console.log('inside try')
    pointNameResponse = await client
      .query(pointNameQuery)
    console.log("🚀 ~ file: api.js ~ line 37 ~ getNode ~ pointNameResponse", pointNameResponse)
  } catch (error) {
    console.log(`pointNameResponse error: ${error}`)
    throw error
  }

  console.log("🚀 ~ file: api.js ~ line 324 ~ getNodes ~ pointNameResponse.rows", pointNameResponse.rows)

  try {
    client.end()
    console.log('client.end() try')
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  }

  let returnArr = []
  if (pointNameResponse.rows.length === 0) {
    return returnArr
  } else {
    console.log('in else')
    let potentialShips = []
    for (let i in pointNameResponse.rows) {
      console.log("🚀 ~ file: api.js ~ line 346 ~ getNodes ~ pointNameResponse.rows[i]", pointNameResponse.rows[i])
      let point = pointNameResponse.rows[i].point
      if (!potentialShips.includes(point)) {
        potentialShips.push(point)
      }
    }
      
    console.log("🚀 ~ file: api.js ~ line 355 ~ getNodes ~ potentialShips", potentialShips)

    for (let i in potentialShips) {
      if (nodeTypes.length > 0) {
        if (!nodeTypes.includes('GALAXY')) {
          if (potentialShips[i].length ===  4) {
            continue
          }
        } else if (!nodeTypes.includes('STAR')) {
          if (potentialShips[i].length ===  7) {
            continue
          }
        } else if (!nodeTypes.includes('PLANET')) {
          if (potentialShips[i].length ===  14) {
            continue
          }
        }
      }

      let node
      try {
        node = await getNode(_, { input: { urbitId: potentialShips[i] } })
      } catch (error) {
        console.log(`pointNameResponse error: ${error}`)
        throw error
      }

      returnArr.push(node)
    }

    for (let i = offset; i > 0; i--) {
      returnArr = returnArr.slice(1)
    }

    for (let i = limit; i > 0; i--) {
      returnArr = returnArr.slice(0, limit)
    }

    console.log("🚀 ~ file: api.js ~ line 363 ~ getNodes ~ returnArr", returnArr)
    return returnArr
  }
}

module.exports = { getNodes }