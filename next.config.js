require('dotenv').config()

module.exports = {
  env: {
    FAUNA_SERVER_KEY: process.env.FAUNA_SERVER_KEY,
    FAUNA_TEST_KEY: process.env.FAUNA_TEST_KEY,
    BASEURL: process.env.BASEURL,
  },
}
