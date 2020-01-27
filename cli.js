#!/usr/bin/env node

var sourceMap = require('source-map');
var fs = require('fs');
var child = require('child_process')
const chalk = require('chalk');

let command = process.argv[2];
let data = child.execSync(command,{encoding:'utf8'}).toString();
let json = JSON.parse(data);
let basePath = process.env.PWD;
let sourceMapPath = basePath + '/source-maps/';

const y = x => chalk.yellow(x)
const g = x => chalk.green(x)
const b = x => chalk.blue(x)
const r = x => chalk.red(x)
const m = x => chalk.magenta(x)

let logs = [];

(async() => {
    console.log(g('\n\n------------------------START-----------------------------------------'))
    console.log('----------------------------------------------------------------------')
    let errorObjects = Object.values(json);
    await Promise.all(errorObjects.map(async e=>{
        let output = '\n'
        try{
            output += "timestamp : " + y( e.timestamp ) + '\n';
            output += "date/time : " + y( new Date(e.timestamp).toUTCString() ) + '\n';
            if(e.message){
                output += "error message : " + m(e.message) + '\n';
            } 
            let userData = Object.keys(e).filter(k=>!['stack','message','timestamp','mapId'].includes(k))
            if(userData){
                output += y('user data: {') + '\n'
            }
            userData.forEach(k=> output += '  ' + k + ': ' + e[k] + '\n')
            output += '}\n'
            // will catch here if cant find source map
            let map = fs.readFileSync(sourceMapPath + e.mapId +'.map', 'utf8');
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
                output += b( error.name + ": " ) + error.source 
                output += y(' {line ' + error.line + ' : ' + error.column + '}') + '\n'
            })
            output += '\n---------------------------------------------------------------------\n'
            logs.push({output,timestamp:e.timestamp})
        }catch(err){
            output += r( 'LOGGER_ERROR: could not find source map at: ' + '\n' );
            output += r( sourceMapPath + e.mapId + '.map'  + '\n' );
            output += '\n-------------------------------------------------------------------'
            logs.push({output,timestamp:e.timestamp})
        }
    }))
    let sortedLogs = logs.sort((a,b)=>a.timestamp - b.timestamp).map(l=>l.output)
    sortedLogs.forEach(l=>console.log(l))
    console.log(g('----------------------------END-------------------------------------\n\n'))
})();