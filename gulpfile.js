var through = require("through-gulp");
var gulp = require("gulp");
var gulpTs = require("gulp-typescript");
var gulpSourcemaps = require("gulp-sourcemaps");
var gulpConcat = require("gulp-concat");
var del = require("del");
var gulpSync = require("gulp-sync")(gulp);
var merge = require("merge2");
var path = require("path");
var fs = require("fs-extra");
var combineInnerLib = require("./gulp/common/combineInnerLib");
var config = require("./gulp/common/config");

var tsFilePaths = config.tsFilePaths;
var distPath = config.distPath;
var tsconfigFile = config.tsconfigFile;
var filePath = path.join(distPath, "wdFrp.js");
var dtsFilePath = path.join(distPath, "wdFrp.d.ts");


var wonderPackage = require("wonder-package");

var addModuleExports = wonderPackage.addModuleExports;
var browserify = wonderPackage.browserify;
var requireInnerLibToContent = wonderPackage.requireInnerLibToContent;








gulp.task('clean', function() {
    return del.sync([distPath], {
        force: true
    });
});



gulp.task("compileTs", function() {
    var tsProject = gulpTs.createProject(path.join(process.cwd(), tsconfigFile), {
        declaration: true,
        noEmitOnError: false,
        typescript: require('typescript')
    });

    var tsResult = tsProject.src()
        .pipe(tsProject());


    return merge([
        tsResult.dts
            .pipe(gulpConcat("wdFrp.d.ts"))
            .pipe(gulp.dest("dist")),
        tsResult.js
            .pipe(gulpConcat("wdFrp.js"))
            .pipe(gulp.dest("dist/"))
    ])
});

gulp.task("compileTsDebug", function() {
    var tsProject = gulpTs.createProject(path.join(process.cwd(), tsconfigFile), {
        out: "wdFrp.debug.js",
        typescript: require('typescript')
    });

    var tsResult = tsProject.src()
        .pipe(gulpSourcemaps.init())
        .pipe(tsProject());


    return merge([
        tsResult.js
            .pipe(gulpSourcemaps.write())
            .pipe(gulp.dest("dist/"))
    ])
});





gulp.task("combineInnerLib", function(done){
    requireInnerLibToContent(
        filePath,
        [
            {
                variableName:"wdCb",
                path:"wonder-commonlib"
            }
        ]
    );

    createInnerLibJs();

    done();
});

function createInnerLibJs(){
    fs.createFileSync( path.join(distPath, "wdFrp.innerLib.js") );

    combineInnerLib(
        path.join(distPath, "wdFrp.innerLib.js"),
        path.join(process.cwd(), "src/tsconfig.json")
    );
}


gulp.task("addNodejsVersion", function(done){
    fs.copySync(filePath, path.join(distPath, "wdFrp.node.js"));

    done();
});




gulp.task("addModuleExports", function(done){
    addModuleExports(filePath, "wdFrp");

    done();
});


gulp.task("browserify", function() {
    return browserify(filePath, distPath, "wdFrp");
});


gulp.task("build", gulpSync.sync(["clean", "compileTs",  "compileTsDebug", "combineInnerLib", "addModuleExports", "addNodejsVersion", "browserify"]));







var karma = require("karma").server;
var karmaConfPath = path.join(process.cwd(), "test/karma.conf.js");



gulp.task("test", gulpSync.sync(["build"]), function (done) {
    karma.start({
        configFile: karmaConfPath
    }, done);
});


//ci test(single test)

//todo if test failed, the "singleTest" task will error and it will log error info!how to eliminate it?
//reference:https://github.com/lazd/gulp-karma-test, https://github.com/lazd/gulp-karma/issues/21

gulp.task("singleTest", gulpSync.sync(["build"]), function (done) {
    karma.start({
        configFile: karmaConfPath,
        singleRun:true
    }, done);
});

gulp.task("test", function (done) {
    karma.start({
        configFile: karmaConfPath
        //singleRun:true,
        //autoWatch:false
    }, done);
});


gulp.task("watch", function(){
    gulp.watch(tsFilePaths, ["compileTsDebug"]);
});

