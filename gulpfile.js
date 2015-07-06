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
        //singleRun:true,
        //autoWatch:false
    }, done);
});

