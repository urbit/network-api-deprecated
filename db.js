const { Client }    = require('pg')

const connectToDB = async (req, res) => {
  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }
  
  let dbResponse
  try {
    dbResponse = await client.query('SELECT $1::text as message', ['Hello world!'])
    console.log(`dbResponse: ${dbResponse}`)
  } catch (error) {
    console.log('dbResponse error')
    throw error
  }

  try {
    await client.end()
    console.log('client.end() try')
    dbResponse = JSON.stringify(dbResponse)
    return dbResponse
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  } 
}

const dbResolvers = {
  getDB: () => connectToDB(),
}

module.exports = dbResolvers