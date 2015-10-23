var path = require("path");

module.exports.tsFilePaths = [
    'src/definitions.d.ts',
    'src/*.ts',
    'src/**/*.ts'
];
module.exports.distPath = path.join(process.cwd(), "dist");

