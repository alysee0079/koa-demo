const Router = require('koa-router')

const router = new Router()

router.get('/login', async ctx => {
  ctx.body = '登录'
})

module.exports = router.routes()
