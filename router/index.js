const Router = require('koa-router')
const staticRoute = require('./static')
const { upload_dir } = require('../config')
const path = require('path')
const send = require('koa-send')

const router = new Router()

router.use('/admin', require('./admin'))
router.use('', require('./web'))
router.use('/api', require('./api'))
router.get('/upload/:img', async ctx => {
	let img = ctx.params.img
	await send(ctx, img, {
		maxage: 60 * 86400 * 1000,
		immutable: true,
		root: upload_dir,
	})
})
// 静态资源路由
staticRoute(router)

module.exports = router.routes()
