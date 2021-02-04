const Koa = require('koa')
const config = require('./config')

const { errorHandler, launchInfo } = require('./utils/tools')

;(async () => {
  const server = new Koa()
  // 链接数据库
  server.context.db = await require('./libs/mysql')
  // 链接 redis
  server.context.redis = require('./libs/redis')
  // 绑定全局错误处理
  errorHandler(server)
  // session
  await require('./libs/session')(server)
  // 路由注入
  server.use(require('./router'))
  server.listen(config.port)
  // 启动信息
  launchInfo()
})()
