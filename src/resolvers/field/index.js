const { node } = require('./node')

const fieldResolvers = {
  node: (_, args) => node(_, args)
}

module.exports = fieldResolvers
