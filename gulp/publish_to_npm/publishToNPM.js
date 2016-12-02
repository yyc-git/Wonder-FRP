var gulp = require("gulp");
var gulpTs = require("gulp-typescript");
var gulpSourcemaps = require("gulp-sourcemaps");
var gulpConcat = require("gulp-concat");
var merge = require("merge2");
var path = require("path");
var addModuleExports = require("./addModuleExports");
var config = require("../common/config");

// var tsFilePaths = config.tsFilePaths;
var distPath = config.distPath;
var tsconfigFile = config.tsconfigFile;

gulp.task('publishToNPM', function() {
    // var tsResult = gulp.src(tsFilePaths)
    //     .pipe(gulpSourcemaps.init())
    //     .pipe(gulpTs({
    //         declarationFiles: false,
    //         target: 'ES5',
    //         //module: "commonjs",
    //         //moduleResolution: "node",
    //         noEmitOnError: false,
    //         experimentalDecorators: true,
    //         typescript: require('typescript')
    //     }));


    var tsProject = gulpTs.createProject(path.join(process.cwd(), tsconfigFile), {
        // out: "wdFrp.debug.js",
        typescript: require('typescript')
    });

    var tsResult = tsProject.src()
        .pipe(gulpSourcemaps.init())
        .pipe(tsProject());


    return  merge([
        tsResult.dts
            .pipe(gulpConcat('wdFrp.node.d.ts'))
            .pipe(gulp.dest(distPath)),
        tsResult.js
            .pipe(gulpConcat('wdFrp.node.js'))
            .pipe(addModuleExports("wdFrp"))
            .pipe(gulpSourcemaps.write())
            .pipe(gulp.dest(distPath))
    ])
});

