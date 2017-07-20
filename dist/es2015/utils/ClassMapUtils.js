var ClassMapUtils = (function () {
    function ClassMapUtils() {
    }
    ClassMapUtils.addClassMap = function (className, _class) {
        this._classMap[className] = _class;
    };
    ClassMapUtils.getClass = function (className) {
        return this._classMap[className];
    };
    ClassMapUtils._classMap = {};
    return ClassMapUtils;
}());
export { ClassMapUtils };
//# sourceMappingURL=ClassMapUtils.js.map