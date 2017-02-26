"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ClassMapUtils = (function () {
    function ClassMapUtils() {
    }
    ClassMapUtils.addClassMap = function (className, _class) {
        this._classMap[className] = _class;
    };
    ClassMapUtils.getClass = function (className) {
        return this._classMap[className];
    };
    return ClassMapUtils;
}());
ClassMapUtils._classMap = {};
exports.ClassMapUtils = ClassMapUtils;
//# sourceMappingURL=ClassMapUtils.js.map