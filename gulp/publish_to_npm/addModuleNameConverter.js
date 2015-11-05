var fs = require("fs-extra");

module.exports = function (targetFilePath, oldModuleName, newModuleName) {
    var converterAddition =
        '\ndeclare module "' + newModuleName + '" {' +
        '\nexport = ' + oldModuleName + ';' +
        '\n}';

    fs.writeFileSync(targetFilePath, fs.readFileSync(targetFilePath).toString().concat(converterAddition));
    //console.log(fs.readFileSync(targetFilePath));
    //fs.writeFileSync(targetFilePath, "aa");
};
//var through = require("through-gulp");
//
//module.exports = function (oldModuleName, newModuleName) {
//    return through(function (file, enc, cb) {
//
//        var converterAddition =
//            '\ndeclare module "' + newModuleName + '" {' +
//            '\nexport = ' + oldModuleName + ';' +
//            '\n}';
//
//        if (file.isNull()) {
//            cb(null, file);
//            return;
//        }
//
//        if (file.isStream()) {
//            //streams not supported, no need for now.
//            return;
//        }
//
//        try {
//            file.contents = new Buffer(String(file.contents).concat(converterAddition));
//            console.log(file.contents.toString())
//            this.push(file);
//
//        }
//        catch (err) {
//            //this.emit('error', new gutil.PluginError('gulp-add-module-exports', err, {fileName: file.path}));
//        }
//        cb();
//    });
//};
