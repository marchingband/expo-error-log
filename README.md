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

Next, add a script so we can easily excecute the expo-error-log cli from the command line. In package.json add:
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

In app.js import with

`import { setErrorHandler } from 'expo-error-log/setErrorHandler.js'`

And set up your logging service :
(hint: if you place this in the render method of your app component, then statefull data will always be fresh!)

```
const myErrorHandler = async e =>{
    await firebase.database().ref('/errors/').push(e)
    await alert("There was an error"),
    Util.reload()  
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
