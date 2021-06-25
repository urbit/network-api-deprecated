const format = require('pg-format')
const { query } = require('../utils')

const populateNodeStatus = async () => {
  try {
    return await query(format('INSERT INTO %I (%s) VALUES (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\');', 'node_status', 'STATUS_NAME', 'locked', 'unlocked', 'spawned', 'activated', 'online'))
  } catch (error) {
    console.log("🚀 ~ file: populateNodeStatus.js ~ line 9 ~ populateNodeStatus ~ error", error) 
    throw error
  }
}

module.exports = { populateNodeStatus }