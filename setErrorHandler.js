import { Platform } from 'react-native';
import Constants from 'expo-constants'

let setErrorHandler = ({cb,data}) => {
    ErrorUtils.setGlobalHandler(
        (error,isFatal)=>{
            cb({
                mapId : Constants.manifest.revisionId + '.' + Platform.OS,
                stack : error.stack,
                timestamp : Date.now(),
                message : error.toString(),
                isFatal : isFatal,
                ...data
            })
        }
    )  
}

module.exports = {setErrorHandler}