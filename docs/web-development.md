# Webentwicklung: API + Management Anwendung

## Spezifikation

Eine Übersicht der [API Endpunkte](./api/api-specification.md) kann hier eingesehen werden

## Vorbereitung

Zunächst werden die Abhängigkeiten eingerichtet bzw. vorbereitet.
<br>
> ⚠️ Alle Zugangsdaten werden in der Umgebungsdatei `.env` bereitgestellt. Als Vorlage kann `.env.sample` kopiert und verwendet werden.

### 1. Datenbankverbindung: MongoDB

> Die Verwendung des Cloud-Services *MongoDB Atlas* ist **optional**. Es kann jede andere Instanz einer MongoDB Datenbank verwendet werden.

| Umgebungsvariable | Beschreibung 
|-------------------|-------------
| **`MONGO_URI`** | Kombinierte Verbindungsparameter, für Format siehe `.env.sample`  
| **`MONGO_DB_NAME`** | Datenbankname separat


### 2. Authentifizierung/Autorisierung: Auth0

> Die Verwendung von *Auth0* ist **erforderlich**. Die gesamte Anwendungslogik des ARt chat Backends baut spezifisch auf der *Auth0* Logik auf.

⚠️ Aus Datenschutzgründen wird die Anlage des Auth0-Mandantes in (🇪🇺) Europa empfohlen.

| Umgebungsvariable | Beschreibung 
|-------------------|-------------
| **`A0_DOMAIN`** | `(Tenant name).eu.auth0.com` -> **`nextmuseum-io`**`.eu.auth0.com` 
| **`A0_ISSUER_BASE_URL`** | `A0_DOMAIN` mit Protokoll, i.d.R. `https` -> `https://nextmuseum-io.eu.auth0.com`
| **`A0_API_IDENTIFIER`** | Identifikator der angelegten API, bspw. `https://nextmuseum-artchat.herokuapp.com/api`
| **`A0_SECRET_HASH`** | Zufällige Zeichenkette (Entropie/Salt) zum Verschlüsseln der Session
| **`A0_CLIENT_ID`** | Client ID der generischen Anwendung (Loginmaske)
| **`A0_CLIENT_SECRET`** | Secret der generischen Anwendung (Loginmaske)
| **`A0_MGMT_CLIENT_ID`** | Client ID der System API (Management App)
| **`A0_MGMT_CLIENT_SECRET`** | Secret der System API (Management App)


### 3. Sonstiges

| Umgebungsvariable | Beschreibung 
|-------------------|-------------
| **`APP_HOST`** | Lokaler Anwendungspfad, standardmäßig `http://localhost:4000` 

## Entwicklung

Sobald alle Umgebungsvariablen hinterlegt sind, kann mit der Entwicklung begonnen werden.

### 1. API

```
cd api
npm install
npm run devStart
```

**API** startet unter *http://localhost:4000*

### 2. Management Anwendung

```
cd app
npm install
npm run serve
```

Die **Management Anwendung** startet unter *http://localhost:8080*. Benutzt standardmäßig die lokal ausgeführte API unter `http://localhost:4000/api`.
> Alle Aufrufe unter dem Pfad `/api` werden zum Host `http://localhost:4000` durchgeleitet (Proxy), sodass eine Abfrage unter dem relativen Pfad unter demselben Host möglich ist, um v.a. CORS-Probleme zu umgehen. Kann beim Punkt `proxy` in der `/app/vue.config.js` eingestellt werden. Hiermit ist es möglich, die lokale laufende Management App gegen eine remote laufende API-Instanz (**dev** oder **prod**) anfragen zu lassen.

## 📦 Build & Deployment

Sowohl die **[API](./api.md)** als auch die **[Management Anwendung](./client.md)** werden zusammen "gepackt" und veröffentlicht. Die statischen Dateien der Management Anwendung werden in ein Unterverzeichnis der API ausgegeben (`/api/app`) und stehen dann unter dem Pfad `/app` der Webadresse zur Verfügung.

### Umgebungen

Es wurden bisher drei Umgebungen für REST-API/Management App verwendet:<br> **local** (lokal), **dev** (remote) und **prod** (remote).

### Deployment

> ⚠️Die Umgebung für das Deployment der Anwendung muss obenstehende Umgebungsvariablen exakt definieren (**ENV**IRONMENT VARS).

Da GitHub und die Hosting-Umgebung (hier Heroku) miteinander verknüpft sind, startet das Deployment automatisch, sobald ein Push auf den GIT Branch erfolgt.

> Deployment bedeutet hier: Fetch des Quellcodes aus dem GIT Repository, Installation der npm packages, Kompilierung der Anwendung, Neustart des Webservers/der Anwendungslaufzeit 

|GIT Branch | Umgebung
|-------|---------
|main|prod
|development|dev

### Startskript 

Hiermit werden sowohl API als auch Management Anwendung kompiliert und gestartet. 

Im Verzeichnis `/`:
```
npm run install
npm run start
```

## 🧪 Tests & Samples

Eine Basis für das Testen der Datenabfragen (Integrationstests) mithilfe von MongoDB-Emulation ist unter `/test` zu finden und kann künftig ausgebaut werden.

Im Verzeichnis `/api`:
```
npm run test
```

Beispiele für sämtliche **Datenmodelle** liegen unter `/test/samples/*.json`.


