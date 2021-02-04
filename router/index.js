const Router = require('koa-router')
const staticRoute = require('./static')

const router = new Router()

router.use('/admin', require('./admin'))
router.use('', require('./web'))
// 静态资源路由
staticRoute(router)

module.exports = router.routes()
