var gulp = require("gulp");
var gulpTs = require("gulp-typescript");
var gulpSourcemaps = require("gulp-sourcemaps");
var gulpConcat = require("gulp-concat");
var merge = require("merge2");
var path = require("path");
var addModuleExports = require("./addModuleExports");
var config = require("../common/config");

var tsFilePaths = config.tsFilePaths;
var distPath = config.distPath;

gulp.task('publishToNPM', function() {
    var tsResult = gulp.src(tsFilePaths)
        .pipe(gulpSourcemaps.init())
        .pipe(gulpTs({
            declarationFiles: false,
            target: 'ES5',
            //module: "commonjs",
            //moduleResolution: "node",
            sortOutput:true,
            experimentalDecorators: true,
            typescript: require('typescript')
        }));


    return  merge([
        tsResult.dts
            .pipe(gulpConcat('dyRt.node.d.ts'))
            .pipe(gulp.dest(distPath)),
        tsResult.js
            .pipe(gulpConcat('dyRt.node.js'))
            .pipe(addModuleExports("dyRt"))
            .pipe(gulpSourcemaps.write())
            .pipe(gulp.dest(distPath))
    ])
});

