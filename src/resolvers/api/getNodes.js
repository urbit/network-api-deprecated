const { query } = require('../../utils')
const processNode = require('./utils/processNode')

const getNodes = async (q, nodeTypes, limit, offset) => {
  let excludedNodeIDLengths = []
  nodeTypes && !nodeTypes.includes('GALAXY') && excludedNodeIDLengths.push(4)
  nodeTypes && !nodeTypes.includes('STAR') && excludedNodeIDLengths.push(7)
  nodeTypes && !nodeTypes.includes('PLANET') && excludedNodeIDLengths.push(14)

  let queryString = `select * from node`

  if (excludedNodeIDLengths.length > 0 || q) {
    queryString += ` where`
  }

  q && (queryString += ` node_id like '${q}%'`)

  if (excludedNodeIDLengths.length > 0 && q) {
    queryString += ` and`
  }

  excludedNodeIDLengths.forEach(length => queryString += ` length(node_id) != ${length}`)
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