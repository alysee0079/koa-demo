const Router = require('koa-router')
const static = require('../../libs/contentStatic')
const { upload } = require('../../libs/body')

const router = new Router()

// 统一处理数据格式
router.use(async (ctx, next) => {
	try {
		await next()
		if (ctx.body !== undefined) {
			ctx.status = 200
			ctx.body = {
				ok: true,
				data: ctx.body,
			}
		} else {
			ctx.status = 404
			ctx.body = {
				ok: false,
				msg: 'data not found',
			}
		}
	} catch (e) {
		ctx.status = 500
		ctx.body = {
			ok: false,
			msg: e.message,
		}
	}
})

// 获取 banner 数据
router.get('/banner', async ctx => {
	ctx.body = await ctx.db.query('SELECT title,sub_title,image FROM banner_table')
})

const page_size = 10
function preprocess(datas) {
	datas.forEach(data => {
		// features
		let arr = data.features.split(',')
		let json = {}
		arr.forEach(str => {
			let [key, value] = str.split('|')
			json[key] = value
		})
		data['time'] = parseInt(json['上牌时间'])
		data['mileage'] = json['表显里程']
		data['dispalce'] = json['本车排量']
		data['transmission'] = json['变速箱']
		data['type'] = json['车辆性质']
		delete data.features
		// images
		data.image = data.images.split(',')[0]
		delete data.images
	})
	return datas
}
// 获取 车辆列表数据
router.get('/carlist/:page', async ctx => {
	const { page } = ctx.params
	let datas = await ctx.db.query(`SELECT ID,title,price,features,description,images  FROM car_table LIMIT ?,?`, [(page - 1) * page_size, page_size])
	ctx.body = preprocess(datas)
})

// 获取车辆总页数
router.get('/carpage', async ctx => {
	let rows = await ctx.db.query('SELECT count(*) AS c FROM car_table')
	ctx.body = {
		count: Math.ceil(rows[0].c / page_size),
	}
})

// 获取车辆详情
router.get('/car/:id', async ctx => {
	const { id } = ctx.params
	let rows = await ctx.db.query('SELECT * FROM car_table WHERE ID=?', [id])
	ctx.body = rows[0]
})

// 获取精选好车
router.get('/chosencar', async ctx => {
	let datas = await ctx.db.query('SELECT * FROM car_table ORDER BY price DESC LIMIT 6')
	ctx.body = preprocess(datas)
})

// 获取好车
router.get('/latestcar', async ctx => {
	let datas = await ctx.db.query('SELECT * FROM car_table ORDER BY ID DESC LIMIT 3')
	ctx.body = preprocess(datas)
})

// 发送留言
router.post('/msg', ...upload(), async ctx => {
	let { name, title, email, content } = ctx.request.fields
	await ctx.db.query('INSERT INTO msg_table (name, email, title, content) VALUES(?,?,?,?)', [name, title, email, content])
	ctx.body = 'ok'
})
module.exports = router.routes()
