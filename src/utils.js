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
  // console.log(`running axiosGet with this endpoint: ${endpoint}`)
  const agent = new https.Agent({  
    rejectUnauthorized: false
   })

   try {
    const response = await axios.get(endpoint, { httpsAgent: agent, timeout: 10000 })
    return _get(response, 'data') || null
  } catch (error) {
    throw error
  }
}

const getNodeStatus = async urbitId => {

  try {
    let status = await query(`select count(result) from radar where ship_name = '${urbitId}';`)
    if (_get(status, 'rows[0].count') !== '0') {
      return 'ONLINE'
    }

    // If you want to know whether or not a specific star is *owned* by a lockup contract, you can check to see if its current owner is either of these two addresses:
    // 0x86cd9cd0992f04231751e3761de45cecea5d1801 (linear lockup)
    // 0x8c241098c3d3498fe1261421633fd57986d74aea (conditional lockup)
    status = await query(`select count(*) from pki_events where node_id = '${urbitId}' and address = '0x86cd9cd0992f04231751e3761de45cecea5d1801' or address = '0x8c241098c3d3498fe1261421633fd57986d74aea';`)

    // probably should be unlocked
    if (_get(status, 'rows[0].count') !== '0') {
      return 'UNLOCKED'
    }

    status = await query(`select count(*) from pki_events where node_id = '${urbitId}' and event_type_id = 7;`)
    
    if (_get(status, 'rows[0].count') !== '0') {
      return 'SPAWNED'
    }

    status = await query(`select count(*) from pki_events where node_id = '${urbitId}' and event_type_id = 6;`)

    if (_get(status, 'rows[0].count') !== '0') {
      return 'ACTIVATED'
    }

    status = await query(`select count(result) from radar where ship_name = '${urbitId}';`)

    if (_get(status, 'rows[0].count') !== '0') {
      return 'ONLINE'
    }

    return 'LOCKED'

  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }
}

module.exports = { query, axiosGet, getNodeStatus }