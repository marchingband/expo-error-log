#!/usr/bin/env node
var sourceMap = require('source-map');
var fs = require('fs');
var child = require('child_process');
const chalk = require('chalk');
const path = require('path')

let basePath = process.env.PWD;
let sourceMapPath = basePath + '/source-maps/';

let command = process.argv[2];

const y = x => chalk.yellow(x);
const g = x => chalk.green(x);
const b = x => chalk.blue(x);
const r = x => chalk.red(x);
const m = x => chalk.magenta(x);
const bld = x => chalk.bold(x)

var logs = [];
var data;

(async() => {
    if(command == "with"){
        let customPathArg = process.argv[3];
        let customPath = path.resolve(basePath, customPathArg)
        var f = require(customPath)
        rawData = await f();
        data = Object.values(rawData)
    } else {
        let jsonString = child.execSync(command,{encoding:'utf8'}).toString();
        data = Object.values(JSON.parse(jsonString));
    } ;
    console.log(g('\n\n------------------------START-----------------------------------------'));
    await Promise.all(data.map(async e=>{
        let output = '\n';
        try{
            output += bld("timestamp:\n  ") + y( e.timestamp ) + '\n';
            output += y( '  ' + new Date(e.timestamp).toUTCString() ) + '\n';
            if(e.message){
                output += bld("error message:\n  ") + m(e.message) + '\n';
            } ;
            let userData = Object.keys(e).filter(k=>!['stack','message','timestamp','mapId'].includes(k));
            if(userData){
                output += bld('user data: {') + '\n';
            };
            userData.forEach(k=> output += '  ' + g(k) + ': ' + b(e[k]) + '\n');
            output += '}\n';
            let map = fs.readFileSync(sourceMapPath + e.mapId +'.map', 'utf8');
            output += bld('stack trace:\n');
            let traces = e.stack.split('\n');
            let traceObjects = traces.map(t=>({
                    column : t.split(':')[t.split(':').length-1],
                    row : t.split(':')[t.split(':').length-2],
                    name : t.split('@')[0]
                }))
                .filter(t=>t.column && t.row && t.name)
                .map(t=>t.name.startsWith('http')?({row:t.row,column:t.column}):t);
            var smc = await new sourceMap.SourceMapConsumer(map);
            traceObjects.forEach(trace=>{
                let line = parseInt(trace.row);
                let column = parseInt(trace.column);
                let error = smc.originalPositionFor({
                    line: line,
                    column: column
                });
                output += b( ' ' + error.name + ": " ) + error.source.replace(basePath,'.') ;
                output += y(' {line ' + error.line + ':' + error.column + '}') + '\n';
            });
            output += '\n---------------------------------------------------------------------\n';
            logs.push({output,timestamp:e.timestamp});
        }catch(err){
            output += r( 'ERROR: failed for source map at:\n' );
            output += r( sourceMapPath + e.mapId + '.map\n' );
            output += r( err )
            output += '\n---------------------------------------------------------------------\n';
            logs.push({output,timestamp:e.timestamp});
        }
    }))
    let sortedLogs = logs.sort((a,b)=>a.timestamp - b.timestamp).map(l=>l.output);
    sortedLogs.forEach(l=>console.log(l));
    console.log(g('----------------------------END-------------------------------------\n\n'));
    process.exit();
})();