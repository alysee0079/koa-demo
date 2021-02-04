const session = require('koa-session')
const config = require('../config')
const fs = require('promise-fs')
const client = require('./redis')

module.exports = async server => {
  // session
  try {
    const buffer = await fs.readFile(config.key_path)
    server.keys = JSON.parse(buffer.toString())
  } catch (error) {
    console.log('读取key失败')
    console.error(error)
    return
  }
  const store = {
    async get(key) {
      const data = await client.getAsync(key)
      if (!data) return {}
      try {
        return JSON.parse(data)
      } catch (error) {
        return {}
      }
    },
    async set(key, session, maxAge) {
      await client.psetexAsync(key, maxAge, JSON.stringify(session))
    },
    async destroy(key) {
      await client.delAsync(key)
    }
  }
  return server.use(
    session(
      {
        maxAge: config.maxAge,
        renew: true,
        store
      },
      server
    )
  )
}
