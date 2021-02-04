const config = require('../config')
const redis = require('redis')
const bluebird = require('bluebird')

const client = redis.createClient({
  host: config.redis_host,
  port: config.redis_port,
  password: config.redis_password
})

bluebird.promisifyAll(redis.RedisClient.prototype)

client.on('error', error => {
  console.log(error)
})

client.on('reconnecting', ev => {
  console.log(ev)
})

module.exports = client
