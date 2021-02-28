const mysql = require('../libs/mysql')
const password = require('../libs/password')
const rl = require('../libs/rl')

;(async () => {
	const db = await mysql
	while (1) {
		let name = await rl.questionAsync('admin name：')
		if (!name) {
			break
		}
		name = name.toLowerCase()
		// 检查
		const rows = await db.query('SELECT * FROM admin_table WHERE username=?', [name])
		if (rows.length) {
			console.log('管理员账户已经存在')
		} else {
			const pass = await rl.questionAsync('admin password：')
			await db.query('INSERT INTO admin_table (username,password) VALUES (?,?)', [name, password(pass)])
			console.log('管理员添加成功!')
		}
	}
	rl.close()
})()
