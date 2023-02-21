# ARt chat: API Spezifikation

## Endpoints

| Endpoint   				| Response       | Description     		|
| --------   				| -------------- | -------------------- |
| **app authentication endpoints** 					|  		|  	
| `GET /app/login-unity` 	| Header redirect | Redirect to Auth0 login page, setting `/app/forward-token` as auth callback |
| `GET /app/forward-token` | Header redirect | Extracts access token from OIDC middleware and forwards it as deeplink `unitydl://session?...`   |
| `GET /app/renew-token?refresh_token=<refreshToken>` | Access token | Refreshes (expired) access token using refresh token |
| `GET /app/logout-unity` 	| Header redirect | Terminate Auth0 session + Redirect to Auth0 login |
| **api endpoints (require authentication)** 					|  		|  									|
| refer to Insomnia template 


## Insomnia REST-API Client Vorlage

Es wird eine Vorlage für den REST-API Client [**Insomnia**](https://insomnia.rest/download) mitgeliefert. Nach dem Import können sämtliche API-Aufrufe komfortabel ausgeführt werden.

- `/docs/api/artchat-insomnia.json`
