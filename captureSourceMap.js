let fs = require('fs')

module.export = options => {
    let {exp,log,projectRoot,iosSourceMap,androidSourceMap} = options
    // fs.writeFileSync(projectRoot+'/'+exp.manifest.version+'.map', iosSourceMap)
    fs.writeFile(projectRoot+'/'+exp.manifest.version+'.map', iosSourceMap, 'utf8', function (err) {
        if (err){return log(err); }
    }); 
}