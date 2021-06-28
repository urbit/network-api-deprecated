const format = require('pg-format')
const { query } = require('../utils')

const refreshNodeMaterializedView = async () => {
  try {
    return await query(format('REFRESH MATERIALIZED VIEW %I;', 'node'))
  } catch (error) {
    console.log("🚀 ~ file: refreshNodeMaterializedView.js ~ line 8 ~ refreshNodeMaterializedView ~ error", error) 
    throw error
  }
}

module.exports = { refreshNodeMaterializedView }