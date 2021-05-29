const { addToDB } = require('./utils/addToDB')

const populateNodeType = async () => {
  await addToDB('node_type', null)
  return true
}

populateNodeType()
