const { Client }    = require('pg')
const https         = require('https')
const axios         = require('axios')
const _get          = require('lodash.get')

const client        = new Client()

const query = async qs => {
  try {
    await client.query(qs)
  } catch (error) {
    throw error
  }
}

const connect = async () => {
  try {
    await client.connect()
  } catch (error) {
    throw error
  }
}

const end = async () => {
  try {
    client.end()
  } catch (error) {
    throw error
  }
}

const axiosGet = async endpoint => {
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

module.exports { query, connect, end, axiosGet }