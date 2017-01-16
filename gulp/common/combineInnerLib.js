var fs = require("fs-extra");
var path = require("path");
var glob = require("glob");

//todo extract
function getInnerLibDTsPathArr(tsconfigPath){
    var regex = /\.d\.ts$/,
        files = null,
        resultArr = [];

    var tsconfigJson = JSON.parse(fs.readFileSync(tsconfigPath, "utf8").replace(/\/\/.+/g, "")),
        files = [];



    // var tsconfigFilePath = require("./pathData.js");
    var folderPath = path.dirname(tsconfigPath);

    // console.log(tsconfigJson.include);

    var allFileGlobs = null;

    if(tsconfigJson.include){
        allFileGlobs = tsconfigJson.include.concat(tsconfigJson.files);
    }
    else{
        allFileGlobs = tsconfigJson.files;
    }



    // console.log(allFileGlobs)

    allFileGlobs.forEach(function(globPattern) {
        files = files.concat(glob.sync(globPattern, {
            cwd: folderPath
        }));
    });

    // console.log(files);





    for(var i = 0, len = files.length; i < len; i++){
        var file = files[i];

        if(file.match(regex) !== null){
            resultArr.push(
                _parseInnerLibDTsPath(file)
            );
        }
    }

    return resultArr.reverse();
}

function _parseInnerLibDTsPath(pathInDefinitionFile){
    return path.join(process.cwd(), pathInDefinitionFile.slice(3));
}


module.exports = function combineInnerLib(mainFilePath, tsconfigPath){
    getInnerLibDTsPathArr(tsconfigPath).forEach(function(innerLibDtsPath){
        fs.writeFileSync(
            mainFilePath,
            fs.readFileSync(innerLibDtsPath.replace("d.ts", "js"), "utf8")
            + "\n"
            + fs.readFileSync(mainFilePath, "utf8")
        );
    });
}


