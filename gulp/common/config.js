var path = require("path");

module.exports.tsFilePaths = [
    //'src/filePath.d.ts',
    'src/*.ts',
    'src/**/*.ts'
];
module.exports.distPath = path.join(process.cwd(), "dist");

module.exports.definitionsPath = "src/filePath.d.ts";
module.exports.tsconfigFile = "src/tsconfig.json";
