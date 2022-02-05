# ARTchat API + Management Client

This is a monorepo for 

1. The ARTchat API
2. Management Client (UI)


## API

### Development

```
cd api
npm install
npm run devStart
```
### Production

```
cd api
npm install
npm start
```

### Endpoints

| Endpoint   				| Response       | Description     		|
| --------   				| -------------- | -------------------- |
| **app authentication endpoints** 					|  		|  	
| `GET /app/login-unity` 	| Header redirect | Redirect to Auth0 login page, setting `/app/forward-token` as auth callback |
| `GET /app/forward-token` | Header redirect | Extracts access token from OIDC middleware and forwards it as deeplink `unitydl://session?...`   |
| `GET /app/renew-token?refresh_token=<refreshToken>` | Access token | Refreshes (expired) access token using refresh token |
| `GET /app/logout-unity` 	| Header redirect | Terminate Auth0 session + Redirect to Auth0 login |
| **api endpoints (require authentication)** 					|  		|  									|
| `GET /api/user/me` 	|  { user object }		| Returns authenticated user by extracting from session context |
| `PUT /api/user/me` 	|  (empty) HTTP 204		| Returns authenticated user by extracting from session context |


## Management Client

### Development

```
cd app
npm install
npm run dev
```

### Build

TBD