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
export { ClassMapUtils };
ClassMapUtils._classMap = {};
//# sourceMappingURL=ClassMapUtils.js.map