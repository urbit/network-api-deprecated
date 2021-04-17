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
  cron.schedule(cronExpression, () => request('http://localhost:4000', cronQuery))
}

module.exports = { startCron }

