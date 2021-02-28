const Router = require('koa-router')
const static = require('../../libs/contentStatic')

const router = new Router()

// 查找缓存
router.get(
	'/',
	//  static('page:'),
	async ctx => {
		await ctx.render('web/index')
	}
)

router.get('/single/:id', async ctx => {
	let { id } = ctx.params

	await ctx.render('web/single', { id })
})

router.get('/contact', async ctx => {
	await ctx.render('web/contact')
})

module.exports = router.routes()
