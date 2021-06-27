const { query } = require('../../utils')
const processNode = require('./utils/processNode')

const getNodes = async (q, nodeTypes, limit, offset) => {
  let excludedNodeIDLengths = []
  !nodeTypes.includes('GALAXY') && excludedNodeIDLengths.push(4)
  !nodeTypes.includes('STAR') && excludedNodeIDLengths.push(7)
  !nodeTypes.includes('PLANET') && excludedNodeIDLengths.push(14)

  let queryString = `select * from node where node_id like '${q}%'`
  excludedNodeIDLengths.forEach(length => queryString += ` and length(node_id) != ${length}`)
  limit && (queryString += ` limit ${limit}`)
  offset && (queryString += ` offset ${offset}`)
  queryString += `;`
  const response = await query(queryString)
  const responseRows = response.rows || []

  let nodes = []
  responseRows.forEach(row => {
    nodes.push(processNode(row))
  })
  return nodes
}

module.exports = getNodes