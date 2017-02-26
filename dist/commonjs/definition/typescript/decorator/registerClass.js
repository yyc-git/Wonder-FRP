"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ClassMapUtils_1 = require("../../../utils/ClassMapUtils");
function registerClass(className) {
    return function (target) {
        ClassMapUtils_1.ClassMapUtils.addClassMap(className, target);
    };
}
exports.registerClass = registerClass;
//# sourceMappingURL=registerClass.js.map