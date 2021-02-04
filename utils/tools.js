const fs = require('promise-fs')
const config = require('../config')
const network = require('../libs/network')

module.exports = {
  async errorHandler(server) {
    let error_404 = ''
    try {
      error_404 = await fs.readFile(config.error_404)
      error_404 = error_404.toString()
    } catch (error) {
      console.log('read 404 error')
    }
    // 全局错误处理
    server.use(async (ctx, next) => {
      try {
        await next()
        if (!ctx.body) {
          ctx.status = 404
          ctx.body = error_404
        }
      } catch (e) {
        ctx.status = 500
        ctx.body = 'server error'
        console.error(e)
      }
    })
  },
  launchInfo() {
    // 启动信息
    network.forEach(ip => {
      if (config.port === 80) {
        console.log(`server running at http://${ip}`)
      } else {
        console.log(`server running at http://${ip}:${config.port}`)
      }
    })
  }
}
