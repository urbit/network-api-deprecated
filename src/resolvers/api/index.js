const getNode = require('./getNode')
const getNodes = require('./getNodes')
const getActivity = require('./getActivity')
const getPKIEvents = require('./getPKIEvents')

const apiResolvers = {
  getNode: (_, args) => getNode(_, args),
  getNodes: (_, args) => getNodes(_, args),
  getActivity: (_, args) => getActivity(_, args),
  getPKIEvents: (_, args) => getPKIEvents(_, args)
}

module.exports = apiResolvers