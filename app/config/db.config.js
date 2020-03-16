module.exports = {
  HOST: process.env.MYSQL_HOST,
  PORT: process.env.MYSQL_PORT,
  USER: process.env.MYSQL_USERNAME,
  PASSWORD: process.env.MYSQL_PASSWORD,
  DB: process.env.MYSQL_DB,
  dialect: 'mysql',
  pool: { max: 50, min: 0, acquire: 30000, idle: 10000 }
}
