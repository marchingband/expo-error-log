let setErrorHandler = ({cb,data,version}) => {
    ErrorUtils.setGlobalHandler(
        (error,isFatal)=>{
            cb({
                mapId : version,
                stack : error.stack,
                timestamp : Date.now(),
                message : error.toString(),
                ...data
            })
    })  
}
module.exports = {setErrorHandler}