# ARt chat - Objekttexte in Augmented Reality

Mit ARt chat können Museumsbesucher*innen virtuell Objekttexte in der Ausstellung ergänzen und mit anderen diskutieren. Die App verbindet Augmented Reality, Kunst und Kommunikation.

Objekttexte werden oft intensiver betrachtet als das tatsächliche Werk. Und wer sagt eigentlich, dass die dort geschriebene Interpretation, die einzig mögliche ist?

Wir wollen die Autor*innenschaft von Ausstellungstexten hinterfragen und erweitern. Die App ARt chat bietet die Möglichkeit eigene Beiträge virtuell beizutragen oder andere Texte zu kommentieren. So kann ein Austausch zwischen den Betrachtenden statt finden und es können sich lebendige Diskussionen entwickeln.

## Entstehungskontext
ARt chat wurde gemeinsam von nextmuseum.io, dem MIREVI Lab der Hochschule Düsseldorf entwickelt und mit [vobe.digital](https://vobe.digital) veröffentlicht. nextmuseum.io ist eine digitale Community Plattform für Schwarmkuration und Co-Kreation und wird vom NRW-Forum/ Kunstpalast Düsseldorf und dem Museum Ulm betrieben.

# 📱 Installation der iOS/Android App 
Zur Benutzung werden Smartphones benötigt, die entweder über ein iOS oder ein Android Betriebssystem verfügen. Die Anwendung läuft ab folgenden Betriebssystemen: Android ab *(Version 8.X)*, iOS *(ab Version 12.X)* zusätzlich muss das Gerät ARCore oder ARKit fähig sein. Die App ist ca. 125 MB groß und es wird empfohlen, diese vorab im WLAN herunterzuladen.<br>

➡️ [Apple App Store](https://apps.apple.com/de/app/artchat/id1594639117)<br>
➡️ [Google Play Store](https://play.google.com/store/apps/details?id=com.immersal.sdk.mapper).<br>

# Übersicht der Komponenten
Dieses Repository gibt Informationen zur Zusammensetzung der Teile der App inkl. Backend. Da die Applikation auf mehrere Teile basiert, wird hier ein Überblick hergestellt.

![Architektur](./docs/images/artchat-architecture.png "Architektur")

## Immersal - Mapping App
Eine App um Kunstwerke einzuscannen um diese mit der DB und dem QR Code zu verknüpfen.<br>
➡️ [Immersal Mapper - Apple App Store](https://apps.apple.com/app/immersal-mapper/id1466607906)<br>
➡️ [Immersal Mapper - Google Play Store](https://play.google.com/store/apps/details?id=de.nextmuseum.io.ARtchat).<br>
<br>

### QR Codes generieren
Einen QR Code generieren aus der ID des gescannten Kunstwerke(Maps).
Zum Beispiel über die Website: https://qr1.at/#text
<br>
Die "Map id" findest du auf https://developers.immersal.com

![Map Id](./docs/images/immersal-mapid.jpg "Immersal Map Id")

## Unity Immersal SDK
Wird benötigt um auf gescannte Kunstwerke(Maps) aus der Immersal Online Datenbank via ID gerunterzuladen.
SDK herunterladen und in das Projekt integrieren.<br>
🆔 Registrierung erforderlich.<br>
https://developers.immersal.com<br>

## MongoDB 
NoSQL Datenbank. Wird zur Speicherung von Daten über die Ausstellung, die Kunstwerke, die Benutzer und dem Chat verwendet.<br>
Für ARt chat wurde bspw. das Cloud-Angebot **MongoDB Atlas** des MongoDB-Entwicklers verwendet.<br>
⚙️ Datenspeicher<br>
🆔 Registrierung erforderlich.<br>
https://www.mongodb.com/de-de/atlas<br>

## Auth0

Auth0 ist eine einfach zu implementierende, anpassungsfähige Authentifizierungs- und Autorisierungsplattform. Auth0 übernimmt alle Logins über Email oder Social Media. Um sich über **Social Logins** wie Google, Apple oder Facebook einloggen zu können sind weiter Einstellungen notwendig, die alle innerhalb der Auth0 Dokumnetation beschrieben werden.
<br>
⚙️ Authentifizierung/Autorisierung, Social Logins<br>
🆔 Registrierung erforderlich.<br>
https://auth0.com/de<br>

## Heroku
Wird verwendet, um die REST-API sowie Management App laufen zu lassen.<br>
⚙️ Hosting/Betrieb der Webkomponenten<br>
🆔 Registrierung erforderlich.<br>
https://www.heroku.com<br>

## Unity
Entwicklungsumgebung für dieses Repository.<br>
Wird zum kompilieren der App verwendet.<br>
Version: 2020.3.20<br>
[Unity download archive](https://unity3d.com/get-unity/download/archive)<br>
Die Build Plattform iOS oder Android sollte ebenfalls installiert werden.

# 🛠️ Entwicklung und Veröffentlichung

1. [Android/iOS Apps: Unity](./docs/unity-development.md)
2. [REST-API + Management App: Web](./docs/web-development.md)

# Credits 
Auftraggeber*in/Rechteinhaber*in : Stiftung Museum Kunstpalast<br>
<br>
Ein Projekt von<br>
<br>
<img src="./docs/images/projekt-von.png" width="300" height=auto/><br>
<br>
Gefördert im Programm
<br>
<img src="./docs/images/gefoerdert-im-programm.png" width="300" height=auto/><br>
<br>
Gefördert von
<br>
<img src="./docs/images/gefoerdert-von.png" width="300" height=auto/><br>

Urheber*innen: Stiftung Museum Kunstpalast, nextmuseum.io
Code und Dokumentation in diesem Repositorium wurden begutachtet und erweitert durch [vobe.digital](vobe.digital)

# Markenname 
„ARt Chat“ ist eine Marke der Stiftung Museum Kunstpalast. Die Marke kann von anderen gemeinnützigen Körperschaften für Software genutzt werden, die auf dem veröffentlichten Code (Repositorium) basiert. In diesem Fall wird um Angabe des folgenden Nachweises gebeten:
<br>
<br>
to be defined...

# Lizenz
Herausgeber: Stiftung Museum Kunstpalast<br>
Ehrenhof 4-5 <br>
40479 Düsseldorf<br>
Tel. +49 (0) 211-566 42 100 <br>
Fax. +49 (0) 211-566 42 906<br>
https://www.kunstpalast.de/<br>
<br>
in Kooperation mit<br>
<br>
Stadt Ulm – Museum Ulm <br>
Marktplatz 9<br>
89073 Ulm<br>
Tel. +49 (0) 731-161 4301<br>
https://museumulm.de/<br>
<br>
<br>
to be defined...<br>