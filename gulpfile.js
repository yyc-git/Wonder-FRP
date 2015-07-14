var gulp = require('gulp');
var gulpTs = require('gulp-typescript');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpConcat = require('gulp-concat');
var del = require('del');
var gulpSync = require('gulp-sync')(gulp);
var merge = require('merge2');
var path = require('path');

var tsFilePaths = [
    'src/*.ts',
    'src/**/*.ts'
];
var distPath = "dist";

gulp.task('clean', function() {
    return del.sync([distPath], {
        force: true
    });
});

gulp.task('compileTs', function() {
    var tsResult = gulp.src(tsFilePaths)
        .pipe(gulpSourcemaps.init())
        .pipe(gulpTs({
            declarationFiles: true,
            target: 'ES5',
            sortOutput:true,
            //out: 'dyR.js'
            typescript: require('typescript')
        }));


    return  merge([
        tsResult.dts
            .pipe(gulpConcat('dyRt.d.ts'))
            .pipe(gulp.dest('dist')),
        tsResult.js
            .pipe(gulpConcat('dyRt.js'))
            .pipe(gulpSourcemaps.write('./'))
            .pipe(gulp.dest('dist/'))
    ])
});

//gulp.task('compileTs', function() {
//    return gulp.src(tsFilePaths)
//        .pipe(gulpSourcemaps.init())
//        .pipe(gulpTs({
//            declarationFiles: true,
//            target: 'ES5'
//            //out: 'dyRt.js'
//            //typescript: require('typescript')
//        }))
//        .pipe(gulpConcat('dyR.js'))
//        .pipe(gulpSourcemaps.write())
//        .pipe(gulp.dest('dist/'));
//});

gulp.task("build", gulpSync.sync(["clean", "compileTs"]));






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

var testFilePaths = ["test/unit/*Spec.js", "test/unit/**/*Spec.js"];

gulp.task("watch", function(){
    var watcher = gulp.watch(tsFilePaths.concat(testFilePaths), ["singleTest"]);
    //var watcher = gulp.watch(tsFilePaths, function(){
    //    try{
    //        gulp.run("test");
    //    }
    //    catch(e){
    //
    //    }
    //});
    //
    //watcher.on("error", function(e){
    //    //console.log(e);
    //})
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

