let fs = require('fs');

module.exports = options => {
    let {exp,log,projectRoot,iosSourceMap,androidSourceMap,iosManifest} = options;
    let buildId = iosManifest.revisionId
    let sourceMapPath = projectRoot + "/.source_maps/";
    if(!fs.existsSync(sourceMapPath)){
        fs.mkdirSync(sourceMapPath);
    }
    fs.writeFile(sourceMapPath + buildId + '.ios.map', iosSourceMap, 'utf8', function (err) {
        if (err){
            return log(err);
        }
    });
    fs.writeFile(sourceMapPath + buildId + '.android.map', androidSourceMap, 'utf8', function (err) {
        if (err){
            return log(err);
        }
    });
};