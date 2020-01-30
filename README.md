# expo-error-log
An error logging utility for Expo

install with

```npm install expo-error-log```

or

```yarn add expo-error-log```

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
Now, everytime you `expo publish`, the source map of your application will be saved in your project root in a `source-maps` folder.
note : It is necissary to incriment the version number in `app.json` before you run `expo publish`.
If you forget, expo-error-log will remind you, and the `publish` logs will display an error.

Next, add a script so we can easily excecute the `expo-error-log` cli from the command line.
In package.json add:
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
In this function it is necissary to provide `setErrorHandeler` with the current version number of your app, which it uses to correlate errors with their respective source maps. The best way to do that is
```
expo install expo-constants
```
And in your main `App` component:
```
import Constants from 'expo-constants'
```

In `App.js` import the hook with

`import { setErrorHandler } from 'expo-error-log/setErrorHandler.js'`

and set up your logging service.
(hint: If you place it in the render method of your main app component, then statefull data that you want to log will always be fresh!)
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
    currentView: this.state.currentView,
    userName: this.state.userName,
  },
  version: Constants.manifest.version
})
```

To fetch, symbolicate, parse, and print your error logs to the console, simply run

`npm run expo-error-log "curl myDatabaseRestApiEndpoint"`

For example with firebase, if the database rules are set to `read: true` for the `errors` node

`npm run expo-error-log "curl https://myProjectName.firebaseio.com/errors.json"`

Alternatively, you can provide a custom function to fetch your errors from the database.
Pass the argument `with` followed by a path to your file, relative to the project root.

For example, if I placed my function in `/myExpoProject/errorFetch/myErrorFetchFunc.js`
then `npm run expo-error-log with ./errorFetch/myErrorFetchFunc.js` would work.
Note that myErrorFetchFunc.js must export a function directly, for example:
```
const firebase = require('firebase');

const myLogScript = async()=>{
    firebase.initializeApp(env.firebaseConfig);
    await firebase.auth().signInWithEmailAndPassword(env.myLoginEmail,env.myLoginPassword)
    .catch(e=> console.log(e));
    let errors;
    await firebase.database().ref('/errors/').once('value',function(snap){
        errors = snap.val();
    })
    return(errors)
};

module.exports = myLogScript
```
This function can be either synchronous or async (returning a Promise), and return an array or an object, like firebase does.

![alt text](https://github.com/marchingband/expo-error-log/blob/master/screengrab.png?raw=true)

If you want to save the output of expo-error-log, you can use this bash command
```
npm run expo-error-log with ./myScript > myLogFile.txt
```
or to append to the file
```
npm run expo-error-log with ./myScript >> myLogFile.txt
```
Or, you can use only the part of the package which symbolicates and parses your stack traces, and do with them as you please.
```
// myErrorPrintingScript.js
const { symbolicate } = require('expo-error-log/symbolicate.js');
const myLogFetchingScript = require('./helpers/myLogFetchingScript.js');

(async ()=>{
    const errors =  await myLogScript();
    const log = await symbolicate(errors);
    log.errors.forEach(e=>console.log(e))
    process.exit()
})()
``` 
then `node myErrorPrintingScript.js`

`symbolicate.js` returns a log in this shape
```
{
    timestamp: Date.now(),
    datetime: new Date().toUTCString(),
    errors:[
        {
            isFatal: true,
            timestamp: -1,
            datetime: '',
            message: '',
            userData: {},
            mapId: '',
            mapPath: '',
            err: undefined,
            stack: [
                {
                    name: '',
                    source: '',
                    line: -1,
                    column: -1,
                    shortSource: ''
                },
            ]
        },
    ]
};

```
![alt text](https://github.com/marchingband/expo-error-log/blob/master/screengrab2.png?raw=true)
