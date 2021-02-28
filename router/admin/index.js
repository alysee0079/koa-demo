const Router = require('koa-router')
const router = new Router()
const { upload } = require('../../libs/body')
const path = require('path')
const regs = require('../../libs/regs')
const fs = require('promise-fs')
const { upload_dir } = require('../../config')

const tabs = [
	{ title: 'banner管理', url: '/admin/banner', name: 'banner' },
	{ title: '车辆管理', url: '/admin/car', name: 'car' },
	{ title: '留言管理', url: '/admin/msg', name: 'msg' },
]

// 登录校验
router.use(async (ctx, next) => {
	if (ctx.session['adminID'] || ctx.url === '/admin/login') {
		await next()
	} else {
		ctx.redirect('/admin/login')
	}
})
// 主页页面
router.get('/', async ctx => {
	ctx.body = 'admin首页'
})
// 登录接口
require('./login')(router)

// 注册 banner 路由
addRouter('banner', {
	title: { title: '标题', type: 'text', reg: regs.admin.title, msg: '标题有误' },
	sub_title: { title: '副标题', type: 'text', reg: regs.admin.title, msg: '副标题有误' },
	image: { title: '图片', type: 'file' },
})
// 注册 car 路由
addRouter('car', {
	title: { title: '标题', type: 'text' },
	price: { title: '价格', type: 'number' },
	features: { title: '信息', type: 'fields', show_in_table: false },
	description: { title: '描述', type: 'textarea' },
	images: { title: '图片', type: 'files', show_in_table: false },
})

/**
 * 生成路由
 * @param {name} name 接口名
 */
function addRouter(name, fields) {
	const page_size = 10
	async function preprocess(ctx, next) {
		let datas = ctx.request.fields
		for (const name in fields) {
			let field = fields[name]
			switch (field.type) {
				case 'file':
					if (datas[name][0].size === 0) {
						datas[name] = ''
						try {
							await fs.unlink(datas[name][0].path)
						} catch (e) {
							console.log(e)
						}
					} else {
						datas[name] = path.basename(datas[name][0].path)
					}
					break
				case 'files':
					for (let i = 0; i < datas[name].length; i++) {
						if (datas[name][i].size === 0) {
							try {
								await fs.unlink(datas[name][i].path)
							} catch (e) {
								console.log(e)
							}
						}
					}
					datas[name] = datas[name]
						.filter(file => file.size)
						.map(file => path.basename(file.path))
						.join(',')
					break
				case 'fields':
					let keys = datas[`${name}_key`]
					let values = datas[`${name}_value`]
					delete datas[`${name}_key`]
					delete datas[`${name}_value`]
					let arr = []
					for (let i = 0; i < keys.length; i++) {
						arr.push(keys[i] + '|' + values[i])
					}
					datas[name] = arr.join(',')
					break
			}
		}
		ctx.datas = datas
		await next()
	}
	// 页面数据
	router.get(`/${name}`, async ctx => {
		ctx.redirect(`/admin/${name}/1`)
	})
	router.get(`/${name}/:page`, async ctx => {
		let { page } = ctx.params
		page = parseInt(page)
		if (isNaN(page) || page < 1) page = 1
		let data = await ctx.db.query(`SELECT * FROM ${name}_table ORDER BY ID DESC LIMIT ?,?`, [(page - 1) * page_size, page_size])
		const rows = await ctx.db.query(`SELECT count(*) AS c FROM ${name}_table`)
		const count = rows[0].c
		const page_count = Math.ceil(count / page_size)
		let cur_tab = -1
		tabs.forEach((tab, index) => {
			if (tab.name == name) cur_tab = index
		})
		await ctx.render('admin/table', { name, datas: data, tabs, cur_tab, fields, page, page_count })
	})
	// 添加接口
	router.post(`/${name}`, ...upload({ maxFileSize: 100 * 1024 * 1024 }), preprocess, async ctx => {
		let datas = ctx.datas
		// 数据预处理
		let errors = []
		for (const name in fields) {
			const { reg, msg } = fields[name]
			if (!reg) continue
			if (!reg.test(ctx.request.fields[name])) {
				errors.push(msg)
			}
		}
		if (!errors.length) {
			await ctx.db.query(
				`INSERT INTO ${name}_table (${Object.keys(datas).join(',')}) VALUES(${Object.keys(datas)
					.map(it => '?')
					.join(',')})`,
				Object.values(datas)
			)
			ctx.redirect(`/admin/${name}`)
		} else {
			ctx.body = errors.join('')
		}
	})
	// 修改接口
	router.post(`/${name}/:id`, ...upload({ maxFileSize: 100 * 1024 * 1024 }), preprocess, async ctx => {
		let datas = ctx.datas
		const { id } = ctx.params
		for (const name in fields) {
			if (fields[name].type === 'file' || fields[name].type === 'files') {
				if (!datas[name]) {
					delete datas[name]
				}
			}
		}
		await ctx.db.query(
			`UPDATE ${name}_table SET ${Object.keys(datas)
				.map(key => key + '=?')
				.join(',')} WHERE ID=?`,
			[...Object.values(datas), id]
		)
		ctx.redirect(`/admin/${name}`)
	})
	// 删除接口
	router.get(`/del${name}/:id`, async ctx => {
		let { id } = ctx.params
		let arrId = id.split('|')
		for (let i = 0; i < arrId.length; i++) {
			let id = arrId[i]
			let rows = await ctx.db.query(`SELECT * FROM ${name}_table WHERE ID=?`, [id])
			if (rows.length) {
				const data = rows[0]
				let aPath = []
				for (const name in fields) {
					if (fields[name].type === 'file' || fields[name].type === 'files') {
						aPath = aPath.concat(data[name].split(','))
					}
				}
				await ctx.db.query(`DELETE FROM ${name}_table WHERE ID=?`, [id])
				for (let i = 0; i < aPath.length; i++) {
					try {
						await fs.unlink(path.resolve(upload_dir, aPath[i]))
					} catch (error) {
						ctx.body = '找不到数据'
					}
				}
			} else {
				ctx.body = '找不到数据'
			}
		}
		ctx.redirect(`/admin/${name}`)
	})
}

router.get('/msg', async ctx => {
	let datas = await ctx.db.query('SELECT * FROM msg_table ORDER BY ID DESC')
	await ctx.render('admin/msg', { datas, tabs, cur_tab: 2 })
})

module.exports = router.routes()
