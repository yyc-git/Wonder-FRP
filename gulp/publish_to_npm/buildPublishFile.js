var fs = require("fs-extra");
var path = require("path");
var combineInnerLib = require("../common/combineInnerLib");
var addModuleNameConverter = require("./addModuleNameConverter");
var config = require("../common/config");

//var tsFilePaths = config.tsFilePaths;
var distPath = config.distPath;


module.exports = function buildPublishFile() {
    fs.copySync(path.join(distPath, "wdFrp.d.ts"), path.join(distPath, "wdFrp.node.d.ts"));

    addModuleNameConverter(path.join(distPath, "wdFrp.node.d.ts"), "wdFrp", "wdfrp");

    combineInnerLib(
        path.join(distPath, "wdFrp.node.js"),
        path.join(process.cwd(), "src/filePath.d.ts")
    );
}

