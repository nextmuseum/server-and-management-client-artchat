const ManagementClient = require('auth0').ManagementClient
const AuthenticationClient = require('auth0').AuthenticationClient

const a0auth = new AuthenticationClient({
  domain: process.env.A0_DOMAIN,
  clientId: process.env.A0_CLIENT_ID,
  clientSecret: process.env.A0_CLIENT_SECRET
})

const a0management = new ManagementClient({
  domain: process.env.A0_DOMAIN,
  clientId: process.env.A0_MGMT_CLIENT_ID,
  clientSecret: process.env.A0_MGMT_CLIENT_SECRET,
  scope: 'read:users update:users',
})

module.exports = { a0auth, a0management }