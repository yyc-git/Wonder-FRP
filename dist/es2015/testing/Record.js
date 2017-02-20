var defaultIsEqual = function (a, b) {
    return a === b;
};
var Record = (function () {
    function Record(time, value, actionType, comparer) {
        this._time = null;
        this._value = null;
        this._actionType = null;
        this._comparer = null;
        this._time = time;
        this._value = value;
        this._actionType = actionType;
        this._comparer = comparer || defaultIsEqual;
    }
    Record.create = function (time, value, actionType, comparer) {
        var obj = new this(time, value, actionType, comparer);
        return obj;
    };
    Object.defineProperty(Record.prototype, "time", {
        get: function () {
            return this._time;
        },
        set: function (time) {
            this._time = time;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Record.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Record.prototype, "actionType", {
        get: function () {
            return this._actionType;
        },
        set: function (actionType) {
            this._actionType = actionType;
        },
        enumerable: true,
        configurable: true
    });
    Record.prototype.equals = function (other) {
        return this._time === other.time && this._comparer(this._value, other.value);
    };
    return Record;
}());
export { Record };
//# sourceMappingURL=Record.js.map