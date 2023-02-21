const expect = require('chai').expect
const mongoUnit = require('mongo-unit')
const testData = require('./fixtures/testData.json')
const axios = require('axios')

const ai = axios.create({
	baseURL: 'http://localhost:4000/api/'
})

// skip authentication
process.env.UNSAFE_SKIP_AUTH = true

let server

mongoUnit.start({ dbName: 'test' }).then(() => {
  process.env.MONGO_URI = mongoUnit.getUrl()
  process.env.MONGO_DB_NAME='test'
  run() // this line start mocha tests
})

after(async () => {
  server.close()
  await mongoUnit.stop()
})

describe('api', () => {
  before(() => {
    // create it after DB is started
    server = require('../server')
  })
  beforeEach(() => mongoUnit.initDb(testData))
  afterEach(() => mongoUnit.dropDb())

  it('should return artworks', async () => {

    let artworks = await ai({
      method: 'get',
      url: 'artworks'
    })

    return expect(artworks.data[0].artist).to.equal('Barrazz Home')

  })

})