const path = require('path')

module.exports = {
  port: 8081,
  // db
  db_host: '192.168.5.10',
  db_port: 3306,
  db_user: 'root',
  db_password: '123pwe',
  db_database: 'yxd_test',
  // redis
  redis_host: '127.0.0.1',
  redis_port: 6379,
  redis_password: undefined,
  // upload
  upload_dir: path.resolve(__dirname, 'upload'),
  // session
  maxAge: 86400 * 1000,
  // keys
  key_count: 1024,
  key_len: 1024,
  key_path: path.resolve(__dirname, '.keys'),
  // static
  static_path: path.resolve(__dirname, 'static'),
  // 404
  error_404: path.resolve(__dirname, 'errors/404.html'),
  md5_key: 'SDfdfg5aO*&$O%ohlkuIYIUOR$LUI$HR(&*FHULI$HRGSDLKJFHSDILUY$*OOY$IUHILUFH*O$&TIGRgrdrgd大概多少风格士大夫敢死队风格让他如果士大夫敢死队发)'
}
