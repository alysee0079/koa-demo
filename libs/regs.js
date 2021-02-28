module.exports = {
	admin: {
		username: /^[a-z0-9]{4,32}$/,
		password: /^.{6,32}$/,
		title: /^.{6,32}$/,
		sub_title: /^.{6,200}$/,
	},
	web: {},
}
