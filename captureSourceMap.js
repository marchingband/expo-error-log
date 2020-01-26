let fs = require('fs');

module.export = options => {
    let {exp,log,projectRoot,iosSourceMap,androidSourceMap} = options;
    // fs.writeFileSync(projectRoot+'/'+exp.manifest.version+'.map', iosSourceMap)
    let sourceMapPath = projectRoot + "/source-maps/";
    let mapFileName = exp.manifest.version + '.map';
    if(!fs.existsSync(sourceMapPath)){
        fs.mkdirSync(sourceMapPath);
    }
    if(fs.existsSync(sourceMapPath + mapFileName)){
        log("Source-map file for version " + exp.manifest.version + " already exists,");
        log("did you forget to incriment your build number in app.json?");
        log("EXPO-ERROR-LOG error: filename already exists, exiting");
        log("no map file will be saved for this build");
    } else {
        fs.writeFile(sourceMapPath + mapFileName, iosSourceMap, 'utf8', function (err) {
            if (err){return log(err); }
        });
    }
};