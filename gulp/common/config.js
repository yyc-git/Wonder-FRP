var path = require("path");

module.exports.tsFilePaths = [
    'src/filePath.d.ts',
    'src/*.ts',
    'src/**/*.ts'
];
module.exports.distPath = path.join(process.cwd(), "dist");

