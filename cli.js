#!/usr/bin/env

var sourceMap = require('source-map');
var fs = require('fs');
var child = require('child_process')

let command = process.argv[2];
let data = child.execSync(command,{encoding:'utf8'}).toString();
let json = JSON.parse(data);
let basePath = process.env.PWD;
let sourceMapPath = basePath + '/source-maps/';

let logs = [];

(async() => {
    console.log('\n\n------------------------START-----------------------------------------')
    console.log('----------------------------------------------------------------------')
    let errorObjects = Object.values(json);
    await Promise.all(errorObjects.map(async e=>{
        let output = '\n'
        try{
            let map = fs.readFileSync(sourceMapPath + e.mapId +'.map', 'utf8');
            output += "timestamp : " + e.timestamp + '\n';
            output += "date/time : " + new Date(e.timestamp).toUTCString() + '\n';
            output += "error message : " + e.message + '\n';
            let userData = Object.keys(e).filter(k=>!['stack','message','timestamp','mapId'].includes(k))
            if(userData){
                output += 'user data:\n'
            }
            userData.forEach(k=> output += k + ': ' + e[k] + '\n')
            output += 'stack trace:\n'
            let traces = e.stack.split('\n');
            let traceObjects = traces.map(t=>({
                column : t.split(':')[t.split(':').length-1],
                row : t.split(':')[t.split(':').length-2],
                name : t.split('@')[0]
                }))
                .filter(t=>t.column && t.row && t.name)
                .map(t=>t.name.startsWith('http')?({row:t.row,column:t.column}):t)
            var smc = await new sourceMap.SourceMapConsumer(map);
            traceObjects.forEach(trace=>{
                let line = parseInt(trace.row);
                let column = parseInt(trace.column);
                let error = smc.originalPositionFor({
                    line: line,
                    column: column
                });
                output += error.name + ": " + error.source 
                output += ' {line ' + error.line + ' : ' + error.column + '}\n'
            })
            output += '\n---------------------------------------------------------------------\n'
            logs.push({output,timestamp:e.timestamp})
        }catch(err){
            output += "timestamp : " + e.timestamp + '\n';
            output += "date/time : " + new Date(e.timestamp).toUTCString() + '\n';
            output += 'LOGGER_ERROR: could not find map ' + e.mapId + '.map'
            if(e.message){
                output += '\nerror message: ' + e.message
            }
            output += '\n\n-------------------------------------------------------------------'
            logs.push({output,timestamp:e.timestamp})
        }
    }))
    let sortedLogs = logs.sort((a,b)=>a.timestamp - b.timestamp).map(l=>l.output)
    sortedLogs.forEach(l=>console.log(l))
    console.log('----------------------------END-------------------------------------\n\n')
})();