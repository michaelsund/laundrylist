## lists 1.3.0

Read this to generate a keystore if you intend to push the android app to a device with 'react-native run-android --variant=release'
https://facebook.github.io/react-native/docs/signed-apk-android.html
Hint: keystore password is big bang rock paper scissor

create the file serversettings.json in the project root directory with the following contents.
```json
{
  "devMode": true,
  "dev": "localhost",
  "prod": "mydomain.com",
  "port": 3000,
  "mongoserver": "mongo.internal.com"
}
```
where is used for local development, and mydomain the fqdn that the server will be running on live.


and create or modify the file strings.xml in android/app/src/main/res/values

where 123456789 is your facebook app id.
```xml
<resources>
    <string name="app_name">Laundrylists</string>
    <string name="facebook_app_id">123456789</string>
</resources>
```

### Adb device without docker nodejs/mongo

run with npm install in root dir, and server dir.

setup a mongodb server.

Modify serversettings.json to your liking.

ex: attach to a running virtual or physical android device with 'react-native run-android'

forward devserver ports and localhost ports for local server.js 'npm run remoteandroid'

!dont forget to put the application into dev mode in serversettings.json

start the node server locally with 'node server.js'

## Android studio needs SDK 23.0.1 to be installed installed
follow this guide to get started https://facebook.github.io/react-native/docs/getting-started.html

react-native-fbsdk craps out in version ^0.4.0, change to

compile('com.facebook.android:facebook-android-sdk:4.22.1')

in node_modules/react-native-fbsdk/android/build.grade


### Todo
* facebook auth get friends and only sort the sharelist view though friends and not all users.
* indication in the lists view that someone has shared a list with you to accept/decline
* middleware for both api routes and socket calls to verify that the sender is authenticated against the facebook app and has permissions on the list.
* https for express (also required by ios for fetches in release builds).
