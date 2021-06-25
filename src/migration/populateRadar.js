const _get = require('lodash.get')
const format = require('pg-format')
const { axiosGet } = require('../utils')
const { query } = require('../utils')
const radarFixture = require('../../_radar.json')

const populateRadar = async () => {
  let getDataResponse
  
  try {
    // getDataResponse = await axiosGet('http://35.247.74.19:8080/~radar.json')
  } catch (error) {
    if (error.isAxiosError || error.response.status === 504) {
      return {}
    }
    throw error
  }

  getDataResponse = radarFixture

 
  let insertQuery = format('INSERT INTO %I (%s, %s, %s, %s) VALUES', 'radar', 'SHIP_NAME', 'PING', 'RESULT', 'RESPONSE')
  const ships = Object.keys(getDataResponse)

  ships.forEach((ship, i) => {

    if (i > 0) {
      insertQuery += ','
    }

    const shipBody = getDataResponse[ship]

    if (shipBody.length === 0) {
      insertQuery += format(' (\'%s\', %L, %L, %L)', ship || null, null, null, null)
    } else {
      getDataResponse[ship].forEach((thisShip, j) => {
        if (j > 0) {
          insertQuery += ','
        }

        const { ping = -1, result = -1, response = -1 } = thisShip

        insertQuery += format(' (\'%s\', \'%s\', \'%s\', \'%s\')', ship, ping, result, response)
      })
    }
  })

  insertQuery += ';'
  
  try {
    return await query(insertQuery)
  } catch (error) {
    console.log("🚀 ~ file: populateRadar.js ~ line 73 ~ populateRadar ~ error", error)
    throw error
  }
}

module.exports = { populateRadar }