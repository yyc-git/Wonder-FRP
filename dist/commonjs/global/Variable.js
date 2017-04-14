"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JudgeUtils_1 = require("../JudgeUtils");
var Log_1 = require("wonder-commonlib/dist/commonjs/Log");
if (JudgeUtils_1.JudgeUtils.isNodeJs() && typeof global != "undefined") {
    exports.root = global;
}
else if (typeof window != "undefined") {
    exports.root = window;
}
else if (typeof self != "undefined") {
    exports.root = self;
}
else {
    Log_1.Log.error("no avaliable root!");
}
//# sourceMappingURL=Variable.js.map