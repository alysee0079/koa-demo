const { post } = require('../../libs/body')
const passwordLib = require('../../libs/password')
const { admin } = require('../../libs/regs')

module.exports = router => {
	// 登录页面
	router.get('/login', async ctx => {
		await ctx.render('admin/login', { error: null, username: '', password: '' })
	})
	// 登录接口
	router.post('/login', post(), async ctx => {
		let { username, password } = ctx.request.fields
		username = username.toLowerCase()
		async function render(msg) {
			await ctx.render('admin/login', { error: msg, username, password })
		}
		// 校验数据格式
		if (!admin.username.test(username)) {
			await render('用户名格式错误')
		} else if (!admin.password.test(password)) {
			await render('密码格式错误')
		} else {
			// 校验用户是否存在
			const rows = await ctx.db.query('SELECT ID,password FROM admin_table WHERE username=?', [username])
			if (!rows.length) {
				await render('此用户不存在')
			} else {
				// 密码
				if (rows[0].password === passwordLib(password)) {
					ctx.session['adminID'] = rows[0].ID
					ctx.redirect('/admin/')
				} else {
					await render('密码错误')
				}
			}
		}
	})
}
