var fs = require("fs-extra");
var path = require("path");
var combineInnerLib = require("../common/combineInnerLib");
var addModuleNameConverter = require("./addModuleNameConverter");
var config = require("../common/config");

var tsFilePaths = config.tsFilePaths;
var distPath = config.distPath;

function addDYCommonDts(targetFilePath, sourceFilePath) {
    fs.writeFileSync(targetFilePath, fs.readFileSync(sourceFilePath).toString().concat(fs.readFileSync(targetFilePath)));
}


module.exports = function buildPublishFile() {
    fs.copySync(path.join(distPath, "dyRt.d.ts"), path.join(distPath, "dyRt.node.d.ts"));

    addModuleNameConverter(path.join(distPath, "dyRt.node.d.ts"), "dyRt", "dyrt");

    var DYCommonDtsPath = path.join(process.cwd(), "lib/inner/DYCommonLib/dist", "dyCb.d.ts");
    addDYCommonDts(path.join(distPath, "dyRt.node.d.ts"), DYCommonDtsPath);

    combineInnerLib(
        path.join(distPath, "dyRt.node.js"),
        path.join(process.cwd(), "src/definitions.d.ts")
    );
}

