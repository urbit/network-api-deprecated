const { query } = require('../../utils')
const processNode = require('./utils/processNode')

const getNode = async nodeId => {
  console.log("🚀 ~ file: getNode.js ~ line 5 ~ nodeId", nodeId)
  const response = await query(`select * from node where node_id = '${nodeId}' limit 1;`)
  const node = response.rows[0]
  return await processNode(node)
}

module.exports = getNode