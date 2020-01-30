let setErrorHandler = ({cb,data,version}) => {
    ErrorUtils.setGlobalHandler(
        (error,isFatal)=>{
            cb({
                mapId : version,
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