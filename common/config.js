module.exports = {
  listeningPort: 3050,
  // db config
  localDbConnection: {
    host: '127.0.0.1',
    // port: '3306',
    user: 'root',
    password: '123456',
    database: 'clinicapp'
  },
  UATDbConnection: {
    host: 'clinicapp.cluster-cadm0ypdzkfe.ap-southeast-1.rds.amazonaws.com',
    user: 'admin',
    password: '50BoiledPotatoes!',
    database: 'clinicapp'
  },
  // environment: 'LOCAL',
  environment: 'UAT',
  password_SHA_key: 'clinicAppSecret',
  tokenExpireTime: 30 * 60 * 1000 //30mins
}