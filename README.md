# expo-error-log
An error logging utility for Expo

install with
`npm install expo-error-log`

in app.json add
```
{
  "expo": {
    "version": "1.0.1",
    ...,
    "hooks": {
      "postPublish" : [
        {
          "file":"expo-error-log"
        }
      ]
    }
  }
}
```
Now, everytime you `expo publish`, the sourceMap of your application will be saved in your project root in a `source-maps` folder.
note : it is necissary to incriment the version number in `app.json` before you run `expo publish`.
If you forget, expo-error-log will remind you, and the `publish` logs will display an error.

Next, add a script so we can easily excecute the `expo-error-log` cli from the command line. In package.json add:
```
{
  "main": "node_modules/expo/AppEntry.js",
  ...
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "eject": "expo eject",
    // add this line
    "expo-error-log": "expo-error-log"
  },

```

You must provide your own method to push errors to a database of some kind.
It is necissary to provide `setErrorHandeler` with the current version number of your app. The best way to do that is
```
expo install expo-constants
```
And in your main `app` component:
```
import Constants from 'expo-constants'
```

In app.js import the hook with

`import { setErrorHandler } from 'expo-error-log/setErrorHandler.js'`

And set up your logging service :
(hint: if you place it in the render method of your main app component, then statefull data will always be fresh!)
Here is an example of an error handler, it uses firebase realtime database

```
const myErrorHandler = e => {
  firebase.database().ref('/errors/').push(e)
  Alert.alert(
    "ALERT", 
    "Sorry there was an error, click to restart the app",
    [
      {
        text:'OK',
        onPress:()=>Updates.reload()
      }
    ],
    {cancelable: false}
  )
}

setErrorHandler({
  cb: myErrorHandler,
  // optional data propery for any extra data you wish to log
  data: {
    currentView: State.getView(),
    userName: State.getUserName(),
  },
  version: Constants.manifest.version
})
```

To fetch, symbolicate, parse, and print your error logs to the console, simply run

`npm run expo-error-log "curl myDatabaseRestApiEndpoint"`

for example with firebase, if the database rules are set to `read: true` for the `errors` node

`npm run expo-error-log "curl https://myProjectName.firebaseio.com/errors.json"`

alternatively you can write your own node script to download, process, and print the errors, using the `printErrors` function.
```
// myScript.js
const {printErrors} = require('expo-error-log/printErrors.js')

fetch("http://myDB.com")
.then(r => r.json)
.then(errors => printErrors(errors)
```
`node myScript.js`
