const { getNodes } = require('./getNodes')
const { getActivity } = require('./getActivity')
const { getPKIEvents } = require('./getPKIEvents')
// const node = require('../field/node')
const { query } = require('../../utils')
// console.log("🚀 ~ file: index.js ~ line 6 ~ node", node)
// const { 
//   urbitId,
//   numOwners,
//   sponsor,
//   status,
//   kids,
//   nodeType,
//   continuityNumber,
//   revisionNumber,
//   ownershipProxy,
//   spawnProxy,
//   transferProxy,
//   managementProxy,
//   votingProxy
// } = node

const apiResolvers = {
  getNode: async (_, { input: { urbitId: nodeId } }) => {
    console.log("🚀 ~ file: index.js ~ line 25 ~ getNode: ~ nodeId", nodeId)
    // console.log("🚀 ~ file: index.js ~ line 25 ~ getNode: ~ urbitId", urbitId)
  // ({
  //   urbitId: urbitId(input),
  //   numOwners: numOwners(input),
  //   sponsor: sponsor(input),
  //   status: status(input),
  //   kids: kids(input),
  //   nodeType: nodeType(input),
  //   continuityNumber: continuityNumber(input),
  //   revisionNumber: revisionNumber(input),
  //   ownershipProxy: ownershipProxy(input),
  //   spawnProxy: spawnProxy(input),
  //   transferProxy: transferProxy(input),
  //   managementProxy: managementProxy(input),
  //   votingProxy: votingProxy(input)
  // })
    const response = await query(`select * from node where node_id = '${nodeId}' limit 1;`)
    const node = response.rows[0]
    console.log("🚀 ~ file: index.js ~ line 43 ~ getNode: ~ node", node)
    const {
      node_id: urbitId,
      num_owners: numOwners,
      sponsor_id: sponsor,
      continuity_number: continuityNumber,
      status 
    } = node

    return {
      urbitId,
      numOwners,
      sponsor,
      continuityNumber,
      status
    }
    
    // return {
    //   urbitId:,
    //   numOwners: numOwners(input),
      // sponsor: sponsor(input),
      // status: status(input),
      // kids: kids(input),
      // nodeType: nodeType(input),
      // continuityNumber: continuityNumber(input),
      // revisionNumber: revisionNumber(input),
      // ownershipProxy: ownershipProxy(input),
      // spawnProxy: spawnProxy(input),
      // transferProxy: transferProxy(input),
      // managementProxy: managementProxy(input),
      // votingProxy: votingProxy(input)
    // }
  },
  getNodes: (_, { input }) => {
    // input.forEach(inputArrEl => ({
    //   urbitId: urbitId(inputArrEl),
    //   numOwners: numOwners(inputArrEl),
    //   sponsor: sponsor(inputArrEl),
    //   status: status(inputArrEl),
    //   kids: kids(inputArrEl),
    //   nodeType: nodeType(inputArrEl),
    //   continuityNumber: continuityNumber(inputArrEl),
    //   revisionNumber: revisionNumber(inputArrEl),
    //   ownershipProxy: ownershipProxy(inputArrEl),
    //   spawnProxy: spawnProxy(inputArrEl),
    //   transferProxy: transferProxy(inputArrEl),
    //   managementProxy: managementProxy(inputArrEl),
    //   votingProxy: votingProxy(inputArrEl)
    // }))
    return 'thing'
  },
  getActivity: (_, args) => getActivity(_, args),
  getPKIEvents: (_, args) => getPKIEvents(_, args)
}

module.exports = apiResolvers
