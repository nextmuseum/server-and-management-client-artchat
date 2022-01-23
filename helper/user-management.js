const ManagementClient = require('auth0').ManagementClient;

const auth0 = new ManagementClient({
  domain: process.env.A0_DOMAIN,
  clientId: process.env.A0_MGMT_CLIENT_ID,
  clientSecret: process.env.A0_MGMT_CLIENT_SECRET,
  scope: 'read:users update:users',
});

module.exports = auth0;