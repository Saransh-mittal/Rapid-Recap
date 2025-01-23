// src/scheduler/cacheScheduleConfig.js
const {
  refreshRecentBotArticlesCache,
} = require('./tasks/refreshBotArticleCache')
const {
  refreshRecentUserArticlesCache,
} = require('./tasks/refreshUserArticleCache')
const refreshArticlesListCache = require('./tasks/refreshArticlesListCache')

const cacheSchedules = [
  {
    name: 'refreshUserArticles',
    cronPattern: '20 */2 * * *', // Every 2 hours, 20 minutes offset
    task: refreshRecentUserArticlesCache,
  },
  {
    name: 'refreshArticlesList',
    cronPattern: '40 */2 * * *', // Every 2 hours, 40 minutes offset
    task: refreshArticlesListCache,
  },
]

module.exports = cacheSchedules
