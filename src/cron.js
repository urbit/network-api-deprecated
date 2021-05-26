const cron = require('node-cron')

const cronQuery = `
  mutation {
    populateDailyCron
  }
`

// Below is every minute for testing
const cronExpression = '* * * * *'

// Below is every five minutes for testing
// const cronExpression = '*/5 * * * *'

// Below is every 24 hours at midnight for production
// const cronExpression = '0 0 * * *'

const startCron = () => {
  let cronExpression
  if (process.env.NODE_ENV === 'prod') {
    // Every 24 hours at midnight for production
    cronExpression = '0 0 * * *'
  } else {
    // Every minute for testing
    // cronExpression = '* * * * *'

    // Every five minutes for testing
    cronExpression = '*/5 * * * *'
  }
  cron.schedule(cronExpression, () => request('http://localhost:4000', cronQuery))
}

module.exports = { startCron }

