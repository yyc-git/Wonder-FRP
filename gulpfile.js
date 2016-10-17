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
var buildPublishFile = require("./gulp/publish_to_npm/buildPublishFile");
var config = require("./gulp/common/config");

require("./gulp/publish_to_npm/publishToNPM");

var tsFilePaths = config.tsFilePaths;
var distPath = config.distPath;
var definitionsPath = config.definitionsPath;
var tsconfigFile = config.tsconfigFile;

var PLUGIN_NAME = "gulp file";

gulp.task('clean', function() {
    return del.sync([distPath], {
        force: true
    });
});




gulp.task("compileTsConfig", function(){
    var mapFilePath = function(item){
        var result = /"([^"]+)"/g.exec(item)[1];

        if(result.indexOf(".d.ts") > -1){
            return result;
        }

        return result + ".ts";
    }

    var filterFilePath = function(item){
        return item !== "";
    }

    return gulp.src(tsconfigFile)
        .pipe(through(function (file, encoding, callback) {
            var arr = null,
                tsconfig = null,
                outputConfigStr = null;

            if (file.isNull()) {
                this.emit("error", new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
                return callback();
            }
            if (file.isBuffer()) {
                arr = fs.readFileSync(path.join(process.cwd(), definitionsPath), "utf8").split('\n').filter(filterFilePath).map(mapFilePath);

                tsconfig = JSON.parse(file.contents);
                tsconfig.files = arr;

                outputConfigStr = JSON.stringify(tsconfig,null,"\t");

                fs.writeFileSync(file.path,outputConfigStr);

                this.push(file);

                callback();
            }
            if (file.isStream()) {
                this.emit("error", new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
                return callback();
            }
        }, function (callback) {
            callback();
        }));
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




var distFilePaths = [
    'dist/*.ts',
    'dist/*.js'
];

gulp.task("removeReference", function(){
    return gulp.src(distFilePaths)
        .pipe(through(function (file, encoding, callback) {
            var map = null;

            if (file.isNull()) {
                this.emit("error", new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
                return callback();
            }
            if (file.isBuffer()) {
                file.contents = new Buffer(file.contents.toString().replace(
                    /\/\/\/\s*<reference[^>]+>/mg, ""
                ));
                this.push(file);

                fs.writeFileSync(file.path, file.contents.toString(), "utf8");

                callback();
            }
            if (file.isStream()) {
                this.emit("error", new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
                return callback();
            }
        }, function (callback) {
            callback();
        }));

});



//var gulp = require("gulp");
//var gulpSync = require("gulp-sync")(gulp);
//var path = require("path");

//gulp.task("combineInnerLib", function(done){
//
//    done();
//});


gulp.task("buildMultiDistFiles", function(done){
    buildCoreFile();
    buildAllFile();
    buildPublishFile();
    createInnerLibJs();
    removeOriginFile();

    done();
});

function buildCoreFile(){
    fs.copySync(path.join(distPath, "wdFrp.d.ts"),path.join(distPath, "wdFrp.core.d.ts"));
    fs.copySync(path.join(distPath, "wdFrp.js"),path.join(distPath, "wdFrp.core.js"));
}

function buildAllFile(){
    fs.copySync(path.join(distPath, "wdFrp.d.ts"),path.join(distPath, "wdFrp.all.d.ts"));
    fs.copySync(path.join(distPath, "wdFrp.js"),path.join(distPath, "wdFrp.all.js"));

    combineInnerLib(
        path.join(distPath, "wdFrp.all.js"),
        path.join(process.cwd(), "src/filePath.d.ts")
    );
}

function createInnerLibJs(){
    fs.createFileSync( path.join(distPath, "wdFrp.innerLib.js") );

    combineInnerLib(
        path.join(distPath, "wdFrp.innerLib.js"),
        path.join(process.cwd(), "src/filePath.d.ts")
    );
}



function removeOriginFile(){
    fs.removeSync(path.join(distPath, "wdFrp.d.ts"));
    fs.removeSync(path.join(distPath, "wdFrp.js"));
}



//todo removeReference
gulp.task("build", gulpSync.sync(["clean", "compileTsConfig", "compileTs",  "compileTsDebug", "publishToNPM", "buildMultiDistFiles", "removeReference"]));
















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


//var testFilePaths = ["test/unit/*Spec.js", "test/unit/**/*Spec.js"];

//gulp.task("watch", function(){
//    var watcher = gulp.watch(tsFilePaths.concat(testFilePaths), ["singleTest"]);
//    //var watcher = gulp.watch(tsFilePaths, function(){
//    //    try{
//    //        gulp.run("test");
//    //    }
//    //    catch(e){
//    //
//    //    }
//    //});
//    //
//    //watcher.on("error", function(e){
//    //    //console.log(e);
//    //})
//});
gulp.task("watch", function(){
    gulp.watch(tsFilePaths, ["compileTsConfig", "compileTsDebug"]);
});

//
//
//var karma = require('gulp-karma')({
//    configFile: karmaConfPath
//});
//
////// Run tests once
//gulp.task('test', gulpSync.sync(["build"]), function(done) {
//    console.log(karma);
//    // Override configuration for CI, etc
//    //return karma.once({
//    //    // reporters: ['coverage']
//    //});
//    karma.stop();
//    return karma.start({
//        //autoWatch: true
//    }, done);
//
//
//
//    //karma.run();
//    //done();
//    //karma.start({
//    //    configFile: karmaConfPath
//    //}, done);
//});
//
//// WATCH OPTION 1: gulp.watch style
//var watcher = gulp.task('watch', function() {
//    // Start a server, then, once it's ready, run tests
//    //karma.start().then(karma.run);
//
//    // Watch for changes with gulp and run tests accordingly
//    gulp.watch(tsFilePaths, function() {
//        //karma.run();
//        gulp.run("test")
//    });
//});
//
//watcher.on("error", function(){
//
//});

