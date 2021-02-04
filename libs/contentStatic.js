const assert = require('assert')

module.exports = (key, maxAge = 1 * 86400 * 1000) => {
  assert(key, 'key is required')
  return async (ctx, next) => {
    const data = await ctx.redis.getAsync(key)
    if (data) {
      ctx.body = data
      console.log('from cache')
    } else {
      await next()
      await ctx.redis.psetexAsync(key, maxAge, ctx.body)
      console.log('from render')
    }
  }
}
