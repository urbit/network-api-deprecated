const cron = require('node-cron')
const populateAll = require('./migration/populateAll')

const startCron = () => {
  let cronExpression
  if (process.env.NODE_ENV === 'prod') {

    // Every 24 hours at midnight
    cronExpression = '0 0 * * *'
  } else {
    
    // Every minute
    // cronExpression = '* * * * *'

    // Every 5 minutes
    cronExpression = '*/5 * * * *'
  }
  cron.schedule(cronExpression, () => populateAll())
}

module.exports = { startCron }

