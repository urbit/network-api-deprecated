const format = require('pg-format')
const { query } = require('../utils')

const populateEventType = async () => {
  try {
    return await query(format('INSERT INTO %I (%s) VALUES (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\');', 'event_type', 'EVENT_NAME', 'change_ownership', 'change_spawn_proxy', 'change_transfer_proxy', 'change_management_proxy', 'change_voting_proxy', 'activate', 'spawn', 'escape_requested', 'escape_cancelled', 'escape_accepted', 'lost_sponsor', 'broke_continuity'))
  } catch (error) {
    console.log("🚀 ~ file: populateEventType.js ~ line 8 ~ populateEventType ~ error", error) 
    throw error
  }
}

module.exports = { populateEventType }