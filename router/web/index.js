const Router = require('koa-router')
const static = require('../../libs/contentStatic')

const router = new Router()

// 查找缓存
router.get('/', static('page:'), async ctx => {
  ctx.body = 'index'
})

module.exports = router.routes()
