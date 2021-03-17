// const axios = require('axios')
// const ob  = require('urbit-ob')
// const ajs = require('azimuth-js')
// const Web3 = require('web3')

// const infura   = `https://mainnet.infura.io/v3/7014111724dc4d198c82cab378fa5453`

// const provider = new Web3.providers.HttpProvider(infura)
// const web3     = new Web3(provider)

// const dbResolvers = require('./db')
// const addToDB = dbResolvers.addToDB

// const azimuth = ajs.azimuth
// const check = ajs.check

// const getNode = async urbit_id => {
//   try {

//       const contracts = await ajs.initContractsPartial(web3, ajs.azimuth.mainnet)
//       const pointNumber = parseInt(ob.patp2dec(urbit_id))
//       const sponsor = azimuth.getSponsor(contracts, pointNumber)
//       const sponsorOfSponsor = azimuth.getSponsor(contracts, sponsor)

//       getDataResponse = {
//         urbit_id,
//         node_type: 
//           check.isGalaxy(pointNumber) ? 'galaxy' : 
//           check.isStar(pointNumber) ? 'star' : 
//           check.isPlanet(pointNumber) ? 'planet' :
//           // From spec: we don't have data for comets or moons, because they're not registered on Azimuth and radar only checks for activity from ships with keys that have been set on Azimuth. There will likely be a future in which we'll have a way to provide data about these ship types though
//           // Is it the case that comets are not children while moons are? What do we want to do here right now?
//           // A: As of now, we don't have any data on comets and moons. Radar MIGHT have some data on comets 
//           check.isChild(pointNumber) ? 'moon' :
//           'comet',
//         // Where in azimuth is status stored? Don't see any appropriate method
//         // First will come from radar--online or not
//         // Locked, unlocked, activated should all come from azimuth
//         // Maybe break into multiple sections: online/offline, activated/unactivated, spawned/unspawned
//         // If something is in getUnspawnedChildren, it is unlocked
//         // If it is in getSpawned, then it is spawned but not activated. Once it is activated, it is no longer in getSpawned
//         // If it is in radar, it is online
//         status: ,
//         continuity: azimuth.getContinuityNumber(contracts, pointNumber),
//         key_revision: azimuth.getKeyRevisionNumber(contracts, pointNumber),
//         // How can there be more than one owner?
//         num_owners:,
//         sponsors: [ sponsor, sponsorOfSponsor ],
//         // Maybe we want to change the key "kids" to "children"?
//         // A: No
//         kids: azimuth.getSponsoring(contracts, pointNumber),
//         // The data model refers to all of these being strings, not booleans
//         proxy_addresses: {
//           // Proxy addresses are addresses for a combination of ship and a thing like "ownership"
//           // Read https://urbit.org/docs/glossary/proxies/
//           // What is the method for ownership proxy? No clear method in azimuth-js
//           ownership:,
//           spawn: azimuth.getSpawnProxy(contracts, pointNumber),
//           transfer: azimuth.getTransferProxy(contracts, pointNumber),
//           // What is the method for voting proxy? No clear method in azimuth-js. Is isVotingProxy correct?
//           voting: azimuth.isVotingProxy(contracts, pointNumber),
//           // What is the method for voting proxy? No clear method in azimuth-js. Is isManagementProxy correct?
//           management: azimuth.isManagementProxy(contracts, pointNumber)
//         }
//       }
//     console.log(`getDataResponse: ${JSON.stringify(getDataResponse)}`)
//   } catch (error) {
//     console.log(`getDataResponse error: ${error}`)
//     throw error
//   }

//   return addToDB(table, getDataResponse)
// }

// const getNodes = nodes => {
//   let nodeArr = []

//   for (let i in nodes) {
//     nodeArr.push(getNode(nodes[i]))
//   }

//   return nodeArr
// }

// // Note to self: probably don't need to use any azimuth-js methods at all, unless there are things we can't derive from the PKI events

// // Note to self: radar will be used to populate get-activity. So it would be like returning an array of all the pings between the timestamp arguments. Each of those arrays would have a boolean. A single array is sufficient.

// // get-activity would return something like the following
// // [ 
//   // {
//   //   urbit_id: '~panmut-solneb',
//   //   date: Date.now(),
//   //   active: true
//   // }, 
//   // {
//   //   urbit_id: '~wolref-podlex',
//   //   date: Date.now(),
//   //   active: true
//   // } 
// // ]

// const apiResolvers = {
//   getNode: () => getNode('~panmut-solneb'),
//   getNodes: () => getNodes('~panmut-solneb', '~wolref-podlex'),
//   getPKIEvents: () => ['PKIevent'],
//   // according to the spec, this returns activity as a boolean...how does this work? Do we just want to return whether it has had an activity at all? Because in the description of this method it also sounds like we maybe want to return data about actual activities
//   getActivity: () => ['activity'],
// }

// module.exports = apiResolvers