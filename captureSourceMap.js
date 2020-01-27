let fs = require('fs');

module.exports = options => {
    let {exp,log,projectRoot,iosSourceMap,androidSourceMap} = options;
    // fs.writeFileSync(projectRoot+'/'+exp.manifest.version+'.map', iosSourceMap)
    let sourceMapPath = projectRoot + "/source-maps/";
    let mapFileName = exp.version + '.map';
    if(!fs.existsSync(sourceMapPath)){
        fs.mkdirSync(sourceMapPath);
    }
    if(fs.existsSync(sourceMapPath + mapFileName)){
        log("\e[31m Source-map file for version " + exp.version + " already exists, \e[0m");
        log("\e[31m did you forget to incriment your build number in app.json? \e[0m");
        log("\e[31m EXPO-ERROR-LOG error: filename already exists, exiting \e[0m");
        log("\e[31m no map file will be saved for this build \e[0m");
    } else {
        fs.writeFile(sourceMapPath + mapFileName, iosSourceMap, 'utf8', function (err) {
            if (err){return log(err); }
        });
    }
};