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
  // console.log("🚀 ~ file: populateRadar.js ~ line 20 ~ populateRadar ~ getDataResponse", getDataResponse)

 
  let insertQuery = format('INSERT INTO %I (%s, %s, %s, %s) VALUES', 'radar', 'SHIP_NAME', 'PING', 'RESULT', 'RESPONSE')
  const ships = Object.keys(getDataResponse)
  // console.log("🚀 ~ file: populateRadar.js ~ line 25 ~ populateRadar ~ ships", ships)

  ships.forEach((ship, i) => {
  // console.log("🚀 ~ file: populateRadar.js ~ line 25 ~ ships.forEach ~ ship", ship)

    if (i > 0) {
      insertQuery += ','
    }

    // const { shipKey: ship } = getDataResponse
    const shipBody = getDataResponse[ship]
    // const bandyn = getDataResponse

    if (i === 0) {
      // console.log("🚀 ~ file: populateRadar.js ~ line 34 ~ ships.forEach ~ shipBody", shipBody)
      // console.log("🚀 ~ file: populateRadar.js ~ line 33 ~ ships.forEach ~ ship", ship)
      // console.log("🚀 ~ file: populateRadar.js ~ line 33 ~ ships.forEach ~ shipKey", ship)
    }

    if (shipBody.length === 0) {
      insertQuery += format(' (\'%s\', %L, %L, %L)', ship || null, null, null, null)
    } else {
      // console.log("🚀 ~ file: populateRadar.js ~ line 45 ~ ships.forEach ~ ship", ship)
      getDataResponse[ship].forEach((thisShip, j) => {
        // console.log("🚀 ~ file: populateRadar.js ~ line 49 ~ getDataResponse[ship].forEach ~ j", j)
        if (j > 0) {
          insertQuery += ','
        }

        const { ping = -1, result = -1, response = -1 } = thisShip

        // const ping = _get(thisShip, `[${j}].ping`) || -1
        // const result = _get(thisShip, `[${j}].result`) || -1
        // const response = _get(thisShip, `[${j}].response`) || -1
        insertQuery += format(' (\'%s\', \'%s\', \'%s\', \'%s\')', ship, ping, result, response)
      })
    }
  })

  // console.log('about to add ;')
  insertQuery += ';'
  // console.log("🚀 ~ file: populateRadar.js ~ line 60 ~ populateRadar ~ insertQuery", insertQuery)
  try {
    return await query(insertQuery)
  } catch (error) {
    console.log("🚀 ~ file: populateRadar.js ~ line 73 ~ populateRadar ~ error", error)
    throw error
  }
}

module.exports = { populateRadar }