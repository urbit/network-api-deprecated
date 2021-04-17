const { addToDB } = require('./utils/addToDB')

const populateNodeStatus = async () => {
  await addToDB('node_status', null)
  return true
}

module.exports = { populateNodeStatus }
