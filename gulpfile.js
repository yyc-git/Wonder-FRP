var gulp = require("gulp");
var del = require("del");
var gulpSync = require("gulp-sync")(gulp);
var path = require("path");


var wonderPackage = require("wonder-package");

var bundleDTS = wonderPackage.bundleDTS;
var compileTs = wonderPackage.compileTs;
var package = wonderPackage.package;
var format = wonderPackage.format;


var config = require("./gulp/common/config");




var tsFilePaths = config.tsFilePaths;
var tsFileDir = config.tsFileDir;
var distPath = config.distPath;
var tsconfigFile = config.tsconfigFile;
var indexFileDir = config.indexFileDir;


gulp.task('clean', function() {
    return del.sync([distPath], {
        force: true
    });
});

gulp.task("compileTsES2015", function(done) {
    compileTs.compileTsES2015(path.join(process.cwd(), tsconfigFile), {
        sourceDir: tsFileDir,
        cwd:"/",
        targetDir:path.join(distPath, "./es2015/")
    }, done);
});

gulp.task("generateDTS", function(done) {
    var indexDTSPath = path.join(indexFileDir, "index.d.ts"),
        name = "wonder-frp/dist/es2015";

    bundleDTS.generateDTS(indexDTSPath, name, path.join(distPath, "wdFrp.d.ts"), path.join(distPath, "wdFrp.noDelcareModule.d.ts"));

    _replaceDTSFileContent(path.join(distPath, "wdFrp.d.ts"));
    // _replaceDTSFileContent(path.join(distPath, "wdFrp.noDelcareModule.d.ts"));

    done();
});

function _replaceDTSFileContent(dtsFilePath) {
    var fs = require("fs-extra");

    var replaceTargetArr = [
        "import \"./extend/root\";",
        "import \"./global/init\";"
    ];
    var dtsFileContent = fs.readFileSync(dtsFilePath).toString();

    replaceTargetArr.forEach(function(target){
        dtsFileContent = dtsFileContent.replace(target, "//" + target);
    });

    fs.writeFileSync(dtsFilePath, dtsFileContent);
}

gulp.task("rollup", function(done) {
    package.rollup(path.join(process.cwd(), "./rollup.config.js"), done);
});

gulp.task("formatTs", function(done) {
    format.formatTs(tsFilePaths, "/", done);
});







gulp.task("build", gulpSync.sync(["clean", "compileTsES2015", "generateDTS", "generateDTS", "rollup", "formatTs"]));



gulp.task("watch", function(){
    gulp.watch(tsFilePaths, gulpSync.sync(["compileTsES2015", "rollup"]));
});




var karma = require("karma").server;
var karmaConfPath = path.join(process.cwd(), "test/karma.conf.js");



gulp.task("test", function (done) {
    karma.start({
        configFile: karmaConfPath
    }, done);
});

