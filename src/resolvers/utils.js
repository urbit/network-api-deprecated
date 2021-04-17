const { Client }    = require('pg')
const https         = require('https')
const axios         = require('axios')
const _get          = require('lodash.get')

const query = async qs => {

  // console.log(`query string being sent to postgres: ${qs}`)

  const client = new Client()

  try {
    await client.connect()
  } catch (error) {
    throw error
  }

  let queryResponse

  try {
    queryResponse = await client.query(qs)
  } catch (error) {
    throw error
  }

  try {
    await client.end()
  } catch (error) {
    throw error
  }

  return queryResponse
}

const axiosGet = async endpoint => {
  console.log(`running axiosGet with this endpoint: ${endpoint}`)
  const agent = new https.Agent({  
    rejectUnauthorized: false
   })

   try {
    const response = await axios.get(endpoint, { httpsAgent: agent })
    return _get(response, 'data') || null
  } catch (error) {
    throw error
  }
}

module.exports = { query, axiosGet }