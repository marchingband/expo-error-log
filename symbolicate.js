#!/usr/bin/env node

var sourceMap = require('source-map');
var fs = require('fs');

let basePath = process.env.PWD;
let sourceMapPath = basePath + '/source-maps/';

const symbolicate = async (errors) => {
    var log = {
        timestamp: Date.now(),
        datetime: new Date().toUTCString(),
        errors:[
            // {
            //     isFatal: true,
            //     timestamp: -1,
            //     datetime: '',
            //     message: '',
            //     userData: {},
            //     mapId: '',
            //     mapPath: '',
            //     err: undefined,
            //     stack: [
            //         {
            //             name: '',
            //             source: '',
            //             line: -1,
            //             column: -1,
            //             shortSource: ''
            //         }
            //     ]
            // }
        ]
    };
    const errorObjects = Object.values(errors);
    await Promise.all(errorObjects.map(async e=>{
        let error = {};
        try{
            error.isFatal = e.isFatal;
            error.mapId = e.mapId;
            error.mapPath = sourceMapPath + e.mapId + '.map';
            error.timestamp = e.timestamp;
            error.datetime = new Date(e.timestamp).toUTCString();
            error.message = e.message;
            error.userData = Object.keys(e)
                .filter(k=>!['stack','message','timestamp','mapId','isFatal'].includes(k))
                .reduce((obj,key)=>({...obj,[key]:e[key]}),{});
            let traces = e.stack.split('\n');
            let traceObjects = traces.map(t=>({
                    column : t.split(':')[t.split(':').length-1],
                    row : t.split(':')[t.split(':').length-2],
                    name : t.split('@')[0]
                }))
                .filter(t=>t.column && t.row && t.name)
                .map(t=>t.name.startsWith('http')?({row:t.row,column:t.column}):t);
            error.stack = [];
            let stack = [];
            let map = fs.readFileSync(sourceMapPath + e.mapId +'.map', 'utf8');
            var smc = await new sourceMap.SourceMapConsumer(map);
            traceObjects.forEach(trace=>{
                let line = parseInt(trace.row);
                let column = parseInt(trace.column);
                let symbolicatedError = smc.originalPositionFor({
                    line: line,
                    column: column
                });
                stack.push({
                    ...symbolicatedError,
                    shortSource : symbolicatedError.source.replace(basePath, '.')
                });
            });
            error.stack = stack;
        }catch(err){
            error.err = err;
        }
        log.errors.push(error);
    }))
    let sortedErrors = log.errors.sort((a,b)=>a.timestamp - b.timestamp);
    log.errors = sortedErrors;
    return log
};

module.exports = { symbolicate }
