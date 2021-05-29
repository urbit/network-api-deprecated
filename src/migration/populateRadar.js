const { axiosGet } = require('../utils')
const { addToDB } = require('./utils/addToDB')

const populateRadar = async () => {
  const events = await axiosGet('http://35.247.74.19:8080/~radar.json')
  await addToDB('radar', events)
  return true
}

populateRadar()
