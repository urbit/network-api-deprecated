const convertDateToISO = dateToConvert => {
  let string = dateToConvert.slice(1)
  string = string.split('..')
  string[0] = string[0].replace(/\./g, '-')
  string[1] = string[1].replace(/\./g, ':') + '.000Z'
  string = string.join('T')
  return string
}

module.exports = { convertDateToISO }
