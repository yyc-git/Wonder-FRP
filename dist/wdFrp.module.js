function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

var JudgeUtils$1 = (function () {
    function JudgeUtils() {
    }
    JudgeUtils.isArray = function (arr) {
        var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
        var length = arr && arr.length;
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };
    JudgeUtils.isArrayExactly = function (arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    };
    JudgeUtils.isNumber = function (num) {
        return typeof num == "number";
    };
    JudgeUtils.isNumberExactly = function (num) {
        return Object.prototype.toString.call(num) === "[object Number]";
    };
    JudgeUtils.isString = function (str) {
        return typeof str == "string";
    };
    JudgeUtils.isStringExactly = function (str) {
        return Object.prototype.toString.call(str) === "[object String]";
    };
    JudgeUtils.isBoolean = function (bool) {
        return bool === true || bool === false || toString.call(bool) === '[boolect Boolean]';
    };
    JudgeUtils.isDom = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };
    JudgeUtils.isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };
    JudgeUtils.isDirectObject = function (obj) {
        return Object.prototype.toString.call(obj) === "[object Object]";
    };
    JudgeUtils.isHostMethod = function (object, property) {
        var type = typeof object[property];
        return type === "function" ||
            (type === "object" && !!object[property]);
    };
    JudgeUtils.isNodeJs = function () {
        return ((typeof global != "undefined" && global.module) || (typeof module != "undefined")) && typeof module.exports != "undefined";
    };
    JudgeUtils.isFunction = function (func) {
        return true;
    };
    return JudgeUtils;
}());
if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    JudgeUtils$1.isFunction = function (func) {
        return typeof func == 'function';
    };
}
else {
    JudgeUtils$1.isFunction = function (func) {
        return Object.prototype.toString.call(func) === "[object Function]";
    };
}

var JudgeUtils$$1 = (function (_super) {
    __extends(JudgeUtils$$1, _super);
    function JudgeUtils$$1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    JudgeUtils$$1.isPromise = function (obj) {
        return !!obj
            && !_super.isFunction.call(this, obj.subscribe)
            && _super.isFunction.call(this, obj.then);
    };
    JudgeUtils$$1.isEqual = function (ob1, ob2) {
        return ob1.uid === ob2.uid;
    };
    JudgeUtils$$1.isIObserver = function (i) {
        return i.next && i.error && i.completed;
    };
    return JudgeUtils$$1;
}(JudgeUtils$1));

var root;
if (JudgeUtils$1.isNodeJs() && typeof global != "undefined") {
    root = global;
}
else {
    root = window;
}

var Log = (function () {
    function Log() {
    }
    Log.log = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        if (!this._exec("log", messages)) {
            root.alert(messages.join(","));
        }
        this._exec("trace", messages);
    };
    Log.assert = function (cond) {
        var messages = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            messages[_i - 1] = arguments[_i];
        }
        if (cond) {
            if (!this._exec("assert", arguments, 1)) {
                this.log.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    };
    Log.error = function (cond) {
        var message = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            message[_i - 1] = arguments[_i];
        }
        if (cond) {
            throw new Error(Array.prototype.slice.call(arguments, 1).join("\n"));
        }
    };
    Log.warn = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        var result = this._exec("warn", arguments);
        if (!result) {
            this.log.apply(this, arguments);
        }
        else {
            this._exec("trace", ["warn trace"]);
        }
    };
    Log._exec = function (consoleMethod, args, sliceBegin) {
        if (sliceBegin === void 0) { sliceBegin = 0; }
        if (root.console && root.console[consoleMethod]) {
            root.console[consoleMethod].apply(root.console, Array.prototype.slice.call(args, sliceBegin));
            return true;
        }
        return false;
    };
    return Log;
}());
Log.info = {
    INVALID_PARAM: "invalid parameter",
    helperFunc: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var result = "";
        args.forEach(function (val) {
            result += String(val) + " ";
        });
        return result.slice(0, -1);
    },
    assertion: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 2) {
            return this.helperFunc(args[0], args[1]);
        }
        else if (args.length === 3) {
            return this.helperFunc(args[1], args[0], args[2]);
        }
        else {
            throw new Error("args.length must <= 3");
        }
    },
    FUNC_INVALID: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("invalid");
        return this.assertion.apply(this, args);
    },
    FUNC_MUST: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("must");
        return this.assertion.apply(this, args);
    },
    FUNC_MUST_BE: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("must be");
        return this.assertion.apply(this, args);
    },
    FUNC_MUST_NOT_BE: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("must not be");
        return this.assertion.apply(this, args);
    },
    FUNC_SHOULD: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("should");
        return this.assertion.apply(this, args);
    },
    FUNC_SHOULD_NOT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("should not");
        return this.assertion.apply(this, args);
    },
    FUNC_SUPPORT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("support");
        return this.assertion.apply(this, args);
    },
    FUNC_NOT_SUPPORT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("not support");
        return this.assertion.apply(this, args);
    },
    FUNC_MUST_DEFINE: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("must define");
        return this.assertion.apply(this, args);
    },
    FUNC_MUST_NOT_DEFINE: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("must not define");
        return this.assertion.apply(this, args);
    },
    FUNC_UNKNOW: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("unknow");
        return this.assertion.apply(this, args);
    },
    FUNC_EXPECT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("expect");
        return this.assertion.apply(this, args);
    },
    FUNC_UNEXPECT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("unexpect");
        return this.assertion.apply(this, args);
    },
    FUNC_EXIST: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("exist");
        return this.assertion.apply(this, args);
    },
    FUNC_NOT_EXIST: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("not exist");
        return this.assertion.apply(this, args);
    },
    FUNC_ONLY: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("only");
        return this.assertion.apply(this, args);
    },
    FUNC_CAN_NOT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("can't");
        return this.assertion.apply(this, args);
    }
};

var Entity = (function () {
    function Entity(uidPre) {
        this._uid = null;
        this._uid = uidPre + String(Entity.UID++);
    }
    Object.defineProperty(Entity.prototype, "uid", {
        get: function () {
            return this._uid;
        },
        set: function (uid) {
            this._uid = uid;
        },
        enumerable: true,
        configurable: true
    });
    return Entity;
}());
Entity.UID = 1;

var $BREAK = {
    break: true
};
var $REMOVE = void 0;

var List = (function () {
    function List() {
        this.children = null;
    }
    List.prototype.getCount = function () {
        return this.children.length;
    };
    List.prototype.hasChild = function (child) {
        var c = null, children = this.children;
        for (var i = 0, len = children.length; i < len; i++) {
            c = children[i];
            if (child.uid && c.uid && child.uid == c.uid) {
                return true;
            }
            else if (child === c) {
                return true;
            }
        }
        return false;
    };
    List.prototype.hasChildWithFunc = function (func) {
        for (var i = 0, len = this.children.length; i < len; i++) {
            if (func(this.children[i], i)) {
                return true;
            }
        }
        return false;
    };
    List.prototype.getChildren = function () {
        return this.children;
    };
    List.prototype.getChild = function (index) {
        return this.children[index];
    };
    List.prototype.addChild = function (child) {
        this.children.push(child);
        return this;
    };
    List.prototype.addChildren = function (arg) {
        if (JudgeUtils$1.isArray(arg)) {
            var children = arg;
            this.children = this.children.concat(children);
        }
        else if (arg instanceof List) {
            var children = arg;
            this.children = this.children.concat(children.getChildren());
        }
        else {
            var child = arg;
            this.addChild(child);
        }
        return this;
    };
    List.prototype.setChildren = function (children) {
        this.children = children;
        return this;
    };
    List.prototype.unShiftChild = function (child) {
        this.children.unshift(child);
    };
    List.prototype.removeAllChildren = function () {
        this.children = [];
        return this;
    };
    List.prototype.forEach = function (func, context) {
        this._forEach(this.children, func, context);
        return this;
    };
    List.prototype.toArray = function () {
        return this.children;
    };
    List.prototype.copyChildren = function () {
        return this.children.slice(0);
    };
    List.prototype.removeChildHelper = function (arg) {
        var result = null;
        if (JudgeUtils$1.isFunction(arg)) {
            var func = arg;
            result = this._removeChild(this.children, func);
        }
        else if (arg.uid) {
            result = this._removeChild(this.children, function (e) {
                if (!e.uid) {
                    return false;
                }
                return e.uid === arg.uid;
            });
        }
        else {
            result = this._removeChild(this.children, function (e) {
                return e === arg;
            });
        }
        return result;
    };
    List.prototype._forEach = function (arr, func, context) {
        var scope = context, i = 0, len = arr.length;
        for (i = 0; i < len; i++) {
            if (func.call(scope, arr[i], i) === $BREAK) {
                break;
            }
        }
    };
    List.prototype._removeChild = function (arr, func) {
        var self = this, removedElementArr = [], remainElementArr = [];
        this._forEach(arr, function (e, index) {
            if (!!func.call(self, e)) {
                removedElementArr.push(e);
            }
            else {
                remainElementArr.push(e);
            }
        });
        this.children = remainElementArr;
        return removedElementArr;
    };
    return List;
}());

var ExtendUtils = (function () {
    function ExtendUtils() {
    }
    ExtendUtils.extendDeep = function (parent, child, filter) {
        if (filter === void 0) { filter = function (val, i) { return true; }; }
        var i = null, len = 0, toStr = Object.prototype.toString, sArr = "[object Array]", sOb = "[object Object]", type = "", _child = null;
        if (toStr.call(parent) === sArr) {
            _child = child || [];
            for (i = 0, len = parent.length; i < len; i++) {
                var member = parent[i];
                if (!filter(member, i)) {
                    continue;
                }
                if (member.clone) {
                    _child[i] = member.clone();
                    continue;
                }
                type = toStr.call(member);
                if (type === sArr || type === sOb) {
                    _child[i] = type === sArr ? [] : {};
                    ExtendUtils.extendDeep(member, _child[i]);
                }
                else {
                    _child[i] = member;
                }
            }
        }
        else if (toStr.call(parent) === sOb) {
            _child = child || {};
            for (i in parent) {
                var member = parent[i];
                if (!filter(member, i)) {
                    continue;
                }
                if (member.clone) {
                    _child[i] = member.clone();
                    continue;
                }
                type = toStr.call(member);
                if (type === sArr || type === sOb) {
                    _child[i] = type === sArr ? [] : {};
                    ExtendUtils.extendDeep(member, _child[i]);
                }
                else {
                    _child[i] = member;
                }
            }
        }
        else {
            _child = parent;
        }
        return _child;
    };
    ExtendUtils.extend = function (destination, source) {
        var property = "";
        for (property in source) {
            destination[property] = source[property];
        }
        return destination;
    };
    ExtendUtils.copyPublicAttri = function (source) {
        var property = null, destination = {};
        this.extendDeep(source, destination, function (item, property) {
            return property.slice(0, 1) !== "_"
                && !JudgeUtils$1.isFunction(item);
        });
        return destination;
    };
    return ExtendUtils;
}());

var Collection = (function (_super) {
    __extends(Collection, _super);
    function Collection(children) {
        if (children === void 0) { children = []; }
        var _this = _super.call(this) || this;
        _this.children = children;
        return _this;
    }
    Collection.create = function (children) {
        if (children === void 0) { children = []; }
        var obj = new this(children);
        return obj;
    };
    Collection.prototype.clone = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var target = null, isDeep = null;
        if (args.length === 0) {
            isDeep = false;
            target = Collection.create();
        }
        else if (args.length === 1) {
            if (JudgeUtils$1.isBoolean(args[0])) {
                target = Collection.create();
                isDeep = args[0];
            }
            else {
                target = args[0];
                isDeep = false;
            }
        }
        else {
            target = args[0];
            isDeep = args[1];
        }
        if (isDeep === true) {
            target.setChildren(ExtendUtils.extendDeep(this.children));
        }
        else {
            target.setChildren(ExtendUtils.extend([], this.children));
        }
        return target;
    };
    Collection.prototype.filter = function (func) {
        var children = this.children, result = [], value = null;
        for (var i = 0, len = children.length; i < len; i++) {
            value = children[i];
            if (func.call(children, value, i)) {
                result.push(value);
            }
        }
        return Collection.create(result);
    };
    Collection.prototype.findOne = function (func) {
        var scope = this.children, result = null;
        this.forEach(function (value, index) {
            if (!func.call(scope, value, index)) {
                return;
            }
            result = value;
            return $BREAK;
        });
        return result;
    };
    Collection.prototype.reverse = function () {
        return Collection.create(this.copyChildren().reverse());
    };
    Collection.prototype.removeChild = function (arg) {
        return Collection.create(this.removeChildHelper(arg));
    };
    Collection.prototype.sort = function (func, isSortSelf) {
        if (isSortSelf === void 0) { isSortSelf = false; }
        if (isSortSelf) {
            this.children.sort(func);
            return this;
        }
        return Collection.create(this.copyChildren().sort(func));
    };
    Collection.prototype.map = function (func) {
        var resultArr = [];
        this.forEach(function (e, index) {
            var result = func(e, index);
            if (result !== $REMOVE) {
                resultArr.push(result);
            }
        });
        return Collection.create(resultArr);
    };
    Collection.prototype.removeRepeatItems = function () {
        var noRepeatList = Collection.create();
        this.forEach(function (item) {
            if (noRepeatList.hasChild(item)) {
                return;
            }
            noRepeatList.addChild(item);
        });
        return noRepeatList;
    };
    Collection.prototype.hasRepeatItems = function () {
        var noRepeatList = Collection.create(), hasRepeat = false;
        this.forEach(function (item) {
            if (noRepeatList.hasChild(item)) {
                hasRepeat = true;
                return $BREAK;
            }
            noRepeatList.addChild(item);
        });
        return hasRepeat;
    };
    return Collection;
}(List));

var SubjectObserver = (function () {
    function SubjectObserver() {
        this.observers = Collection.create();
        this._disposable = null;
    }
    SubjectObserver.prototype.isEmpty = function () {
        return this.observers.getCount() === 0;
    };
    SubjectObserver.prototype.next = function (value) {
        this.observers.forEach(function (ob) {
            ob.next(value);
        });
    };
    SubjectObserver.prototype.error = function (error) {
        this.observers.forEach(function (ob) {
            ob.error(error);
        });
    };
    SubjectObserver.prototype.completed = function () {
        this.observers.forEach(function (ob) {
            ob.completed();
        });
    };
    SubjectObserver.prototype.addChild = function (observer) {
        this.observers.addChild(observer);
        observer.setDisposable(this._disposable);
    };
    SubjectObserver.prototype.removeChild = function (observer) {
        this.observers.removeChild(function (ob) {
            return JudgeUtils$$1.isEqual(ob, observer);
        });
    };
    SubjectObserver.prototype.dispose = function () {
        this.observers.forEach(function (ob) {
            ob.dispose();
        });
        this.observers.removeAllChildren();
    };
    SubjectObserver.prototype.setDisposable = function (disposable) {
        this.observers.forEach(function (observer) {
            observer.setDisposable(disposable);
        });
        this._disposable = disposable;
    };
    return SubjectObserver;
}());

var Observer = (function (_super) {
    __extends(Observer, _super);
    function Observer() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = _super.call(this, "Observer") || this;
        _this._isDisposed = null;
        _this.onUserNext = null;
        _this.onUserError = null;
        _this.onUserCompleted = null;
        _this._isStop = false;
        _this._disposable = null;
        if (args.length === 1) {
            var observer_1 = args[0];
            _this.onUserNext = function (v) {
                observer_1.next(v);
            };
            _this.onUserError = function (e) {
                observer_1.error(e);
            };
            _this.onUserCompleted = function () {
                observer_1.completed();
            };
        }
        else {
            var onNext = args[0], onError = args[1], onCompleted = args[2];
            _this.onUserNext = onNext || function (v) { };
            _this.onUserError = onError || function (e) {
                throw e;
            };
            _this.onUserCompleted = onCompleted || function () { };
        }
        return _this;
    }
    Object.defineProperty(Observer.prototype, "isDisposed", {
        get: function () {
            return this._isDisposed;
        },
        set: function (isDisposed) {
            this._isDisposed = isDisposed;
        },
        enumerable: true,
        configurable: true
    });
    Observer.prototype.next = function (value) {
        if (!this._isStop) {
            return this.onNext(value);
        }
    };
    Observer.prototype.error = function (error) {
        if (!this._isStop) {
            this._isStop = true;
            this.onError(error);
        }
    };
    Observer.prototype.completed = function () {
        if (!this._isStop) {
            this._isStop = true;
            this.onCompleted();
        }
    };
    Observer.prototype.dispose = function () {
        this._isStop = true;
        this._isDisposed = true;
        if (this._disposable) {
            this._disposable.dispose();
        }
    };
    Observer.prototype.setDisposable = function (disposable) {
        this._disposable = disposable;
    };
    return Observer;
}(Entity));

var Main = (function () {
    function Main() {
    }
    return Main;
}());
Main.isTest = false;

function assert(cond, message) {
    if (message === void 0) { message = "contract error"; }
    Log.error(!cond, message);
}
function requireCheck(InFunc) {
    return function (target, name, descriptor) {
        var value = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (Main.isTest) {
                InFunc.apply(this, args);
            }
            return value.apply(this, args);
        };
        return descriptor;
    };
}
function ensure(OutFunc) {
    return function (target, name, descriptor) {
        var value = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var result = value.apply(this, args), params = [result].concat(args);
            if (Main.isTest) {
                OutFunc.apply(this, params);
            }
            return result;
        };
        return descriptor;
    };
}
function requireGetter(InFunc) {
    return function (target, name, descriptor) {
        var getter = descriptor.get;
        descriptor.get = function () {
            if (Main.isTest) {
                InFunc.call(this);
            }
            return getter.call(this);
        };
        return descriptor;
    };
}
function requireSetter(InFunc) {
    return function (target, name, descriptor) {
        var setter = descriptor.set;
        descriptor.set = function (val) {
            if (Main.isTest) {
                InFunc.call(this, val);
            }
            setter.call(this, val);
        };
        return descriptor;
    };
}
function ensureGetter(OutFunc) {
    return function (target, name, descriptor) {
        var getter = descriptor.get;
        descriptor.get = function () {
            var result = getter.call(this);
            if (Main.isTest) {
                OutFunc.call(this, result);
            }
            return result;
        };
        return descriptor;
    };
}
function ensureSetter(OutFunc) {
    return function (target, name, descriptor) {
        var setter = descriptor.set;
        descriptor.set = function (val) {
            var result = setter.call(this, val), params = [result, val];
            if (Main.isTest) {
                OutFunc.apply(this, params);
            }
        };
        return descriptor;
    };
}
function invariant(func) {
    return function (target) {
        if (Main.isTest) {
            func(target);
        }
    };
}

var AutoDetachObserver = (function (_super) {
    __extends(AutoDetachObserver, _super);
    function AutoDetachObserver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AutoDetachObserver.create = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 1) {
            return new this(args[0]);
        }
        else {
            return new this(args[0], args[1], args[2]);
        }
    };
    AutoDetachObserver.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
    };
    AutoDetachObserver.prototype.onNext = function (value) {
        try {
            this.onUserNext(value);
        }
        catch (e) {
            this.onError(e);
        }
    };
    AutoDetachObserver.prototype.onError = function (error) {
        try {
            this.onUserError(error);
        }
        catch (e) {
            throw e;
        }
        finally {
            this.dispose();
        }
    };
    AutoDetachObserver.prototype.onCompleted = function () {
        try {
            this.onUserCompleted();
            this.dispose();
        }
        catch (e) {
            throw e;
        }
    };
    return AutoDetachObserver;
}(Observer));
__decorate([
    requireCheck(function () {
        if (this.isDisposed) {
            Log.warn("only can dispose once");
        }
    })
], AutoDetachObserver.prototype, "dispose", null);

var InnerSubscription = (function () {
    function InnerSubscription(subject, observer) {
        this._subject = null;
        this._observer = null;
        this._subject = subject;
        this._observer = observer;
    }
    InnerSubscription.create = function (subject, observer) {
        var obj = new this(subject, observer);
        return obj;
    };
    InnerSubscription.prototype.dispose = function () {
        this._subject.remove(this._observer);
        this._observer.dispose();
    };
    return InnerSubscription;
}());

var Subject = (function () {
    function Subject() {
        this._source = null;
        this._observer = new SubjectObserver();
    }
    Subject.create = function () {
        var obj = new this();
        return obj;
    };
    Object.defineProperty(Subject.prototype, "source", {
        get: function () {
            return this._source;
        },
        set: function (source) {
            this._source = source;
        },
        enumerable: true,
        configurable: true
    });
    Subject.prototype.subscribe = function (arg1, onError, onCompleted) {
        var observer = arg1 instanceof Observer
            ? arg1
            : AutoDetachObserver.create(arg1, onError, onCompleted);
        this._observer.addChild(observer);
        return InnerSubscription.create(this, observer);
    };
    Subject.prototype.next = function (value) {
        this._observer.next(value);
    };
    Subject.prototype.error = function (error) {
        this._observer.error(error);
    };
    Subject.prototype.completed = function () {
        this._observer.completed();
    };
    Subject.prototype.start = function () {
        if (!this._source) {
            return;
        }
        this._observer.setDisposable(this._source.buildStream(this));
    };
    Subject.prototype.remove = function (observer) {
        this._observer.removeChild(observer);
    };
    Subject.prototype.dispose = function () {
        this._observer.dispose();
    };
    return Subject;
}());

var SingleDisposable = (function (_super) {
    __extends(SingleDisposable, _super);
    function SingleDisposable(disposeHandler) {
        var _this = _super.call(this, "SingleDisposable") || this;
        _this._disposeHandler = null;
        _this._isDisposed = false;
        _this._disposeHandler = disposeHandler;
        return _this;
    }
    SingleDisposable.create = function (disposeHandler) {
        if (disposeHandler === void 0) { disposeHandler = function () { }; }
        var obj = new this(disposeHandler);
        return obj;
    };
    SingleDisposable.prototype.setDisposeHandler = function (handler) {
        this._disposeHandler = handler;
    };
    SingleDisposable.prototype.dispose = function () {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._disposeHandler();
    };
    return SingleDisposable;
}(Entity));

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

var FunctionUtils = (function () {
    function FunctionUtils() {
    }
    FunctionUtils.bind = function (object, func) {
        return function () {
            return func.apply(object, arguments);
        };
    };
    return FunctionUtils;
}());

var Stream = (function (_super) {
    __extends(Stream, _super);
    function Stream(subscribeFunc) {
        var _this = _super.call(this, "Stream") || this;
        _this.scheduler = null;
        _this.subscribeFunc = null;
        _this.subscribeFunc = subscribeFunc || function () { };
        return _this;
    }
    Stream.prototype.buildStream = function (observer) {
        return SingleDisposable.create((this.subscribeFunc(observer) || function () { }));
    };
    Stream.prototype.do = function (onNext, onError, onCompleted) {
        return ClassMapUtils.getClass("DoStream").create(this, onNext, onError, onCompleted);
    };
    Stream.prototype.map = function (selector) {
        return ClassMapUtils.getClass("MapStream").create(this, selector);
    };
    Stream.prototype.flatMap = function (selector) {
        return this.map(selector).mergeAll();
    };
    Stream.prototype.concatMap = function (selector) {
        return this.map(selector).concatAll();
    };
    Stream.prototype.mergeAll = function () {
        return ClassMapUtils.getClass("MergeAllStream").create(this);
    };
    Stream.prototype.concatAll = function () {
        return this.merge(1);
    };
    Stream.prototype.skipUntil = function (otherStream) {
        return ClassMapUtils.getClass("SkipUntilStream").create(this, otherStream);
    };
    Stream.prototype.takeUntil = function (otherStream) {
        return ClassMapUtils.getClass("TakeUntilStream").create(this, otherStream);
    };
    Stream.prototype.take = function (count) {
        if (count === void 0) { count = 1; }
        var self = this;
        if (count === 0) {
            return ClassMapUtils.getClass("Operator").empty();
        }
        return ClassMapUtils.getClass("Operator").createStream(function (observer) {
            self.subscribe(function (value) {
                if (count > 0) {
                    observer.next(value);
                }
                count--;
                if (count <= 0) {
                    observer.completed();
                }
            }, function (e) {
                observer.error(e);
            }, function () {
                observer.completed();
            });
        });
    };
    Stream.prototype.takeLast = function (count) {
        if (count === void 0) { count = 1; }
        var self = this;
        if (count === 0) {
            return ClassMapUtils.getClass("Operator").empty();
        }
        return ClassMapUtils.getClass("Operator").createStream(function (observer) {
            var queue = [];
            self.subscribe(function (value) {
                queue.push(value);
                if (queue.length > count) {
                    queue.shift();
                }
            }, function (e) {
                observer.error(e);
            }, function () {
                while (queue.length > 0) {
                    observer.next(queue.shift());
                }
                observer.completed();
            });
        });
    };
    Stream.prototype.takeWhile = function (predicate, thisArg) {
        if (thisArg === void 0) { thisArg = this; }
        var self = this, bindPredicate = null;
        bindPredicate = FunctionUtils.bind(thisArg, predicate);
        return ClassMapUtils.getClass("Operator").createStream(function (observer) {
            var i = 0, isStart = false;
            self.subscribe(function (value) {
                if (bindPredicate(value, i++, self)) {
                    try {
                        observer.next(value);
                        isStart = true;
                    }
                    catch (e) {
                        observer.error(e);
                        return;
                    }
                }
                else {
                    if (isStart) {
                        observer.completed();
                    }
                }
            }, function (e) {
                observer.error(e);
            }, function () {
                observer.completed();
            });
        });
    };
    Stream.prototype.lastOrDefault = function (defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        var self = this;
        return ClassMapUtils.getClass("Operator").createStream(function (observer) {
            var queue = [];
            self.subscribe(function (value) {
                queue.push(value);
                if (queue.length > 1) {
                    queue.shift();
                }
            }, function (e) {
                observer.error(e);
            }, function () {
                if (queue.length === 0) {
                    observer.next(defaultValue);
                }
                else {
                    while (queue.length > 0) {
                        observer.next(queue.shift());
                    }
                }
                observer.completed();
            });
        });
    };
    Stream.prototype.filter = function (predicate, thisArg) {
        if (thisArg === void 0) { thisArg = this; }
        if (this instanceof ClassMapUtils.getClass("FilterStream")) {
            var self = this;
            return self.internalFilter(predicate, thisArg);
        }
        return ClassMapUtils.getClass("FilterStream").create(this, predicate, thisArg);
    };
    Stream.prototype.filterWithState = function (predicate, thisArg) {
        if (thisArg === void 0) { thisArg = this; }
        if (this instanceof ClassMapUtils.getClass("FilterStream")) {
            var self = this;
            return self.internalFilter(predicate, thisArg);
        }
        return ClassMapUtils.getClass("FilterWithStateStream").create(this, predicate, thisArg);
    };
    Stream.prototype.concat = function () {
        var args = null;
        if (JudgeUtils$$1.isArray(arguments[0])) {
            args = arguments[0];
        }
        else {
            args = Array.prototype.slice.call(arguments, 0);
        }
        args.unshift(this);
        return ClassMapUtils.getClass("ConcatStream").create(args);
    };
    Stream.prototype.merge = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (JudgeUtils$$1.isNumber(args[0])) {
            var maxConcurrent = args[0];
            return ClassMapUtils.getClass("MergeStream").create(this, maxConcurrent);
        }
        if (JudgeUtils$$1.isArray(args[0])) {
            args = arguments[0];
        }
        else {
        }
        var stream = null;
        args.unshift(this);
        stream = ClassMapUtils.getClass("Operator").fromArray(args).mergeAll();
        return stream;
    };
    Stream.prototype.repeat = function (count) {
        if (count === void 0) { count = -1; }
        return ClassMapUtils.getClass("RepeatStream").create(this, count);
    };
    Stream.prototype.ignoreElements = function () {
        return ClassMapUtils.getClass("IgnoreElementsStream").create(this);
    };
    Stream.prototype.handleSubject = function (subject) {
        if (this._isSubject(subject)) {
            this._setSubject(subject);
            return true;
        }
        return false;
    };
    Stream.prototype._isSubject = function (subject) {
        return subject instanceof Subject;
    };
    Stream.prototype._setSubject = function (subject) {
        subject.source = this;
    };
    return Stream;
}(Entity));
__decorate([
    requireCheck(function (count) {
        if (count === void 0) { count = 1; }
        assert(count >= 0, Log.info.FUNC_SHOULD("count", ">= 0"));
    })
], Stream.prototype, "take", null);
__decorate([
    requireCheck(function (count) {
        if (count === void 0) { count = 1; }
        assert(count >= 0, Log.info.FUNC_SHOULD("count", ">= 0"));
    })
], Stream.prototype, "takeLast", null);

var root$1;
if (JudgeUtils$$1.isNodeJs() && typeof global != "undefined") {
    root$1 = global;
}
else {
    root$1 = window;
}

var Scheduler = (function () {
    function Scheduler() {
        this._requestLoopId = null;
    }
    Scheduler.create = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var obj = new this();
        return obj;
    };
    Object.defineProperty(Scheduler.prototype, "requestLoopId", {
        get: function () {
            return this._requestLoopId;
        },
        set: function (requestLoopId) {
            this._requestLoopId = requestLoopId;
        },
        enumerable: true,
        configurable: true
    });
    Scheduler.prototype.publishRecursive = function (observer, initial, action) {
        action(initial);
    };
    Scheduler.prototype.publishInterval = function (observer, initial, interval, action) {
        return root$1.setInterval(function () {
            initial = action(initial);
        }, interval);
    };
    Scheduler.prototype.publishIntervalRequest = function (observer, action) {
        var self = this, loop = function (time) {
            var isEnd = action(time);
            if (isEnd) {
                return;
            }
            self._requestLoopId = root$1.requestNextAnimationFrame(loop);
        };
        this._requestLoopId = root$1.requestNextAnimationFrame(loop);
    };
    Scheduler.prototype.publishTimeout = function (observer, time, action) {
        return root$1.setTimeout(function () {
            action(time);
            observer.completed();
        }, time);
    };
    return Scheduler;
}());

var AnonymousStream = (function (_super) {
    __extends(AnonymousStream, _super);
    function AnonymousStream(subscribeFunc) {
        var _this = _super.call(this, subscribeFunc) || this;
        _this.scheduler = Scheduler.create();
        return _this;
    }
    AnonymousStream.create = function (subscribeFunc) {
        var obj = new this(subscribeFunc);
        return obj;
    };
    AnonymousStream.prototype.buildStream = function (observer) {
        return SingleDisposable.create((this.subscribeFunc(observer) || function () { }));
    };
    AnonymousStream.prototype.subscribe = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var observer = null;
        if (args[0] instanceof Subject) {
            var subject = args[0];
            this.handleSubject(subject);
            return;
        }
        else if (JudgeUtils$$1.isIObserver(args[0])) {
            observer = AutoDetachObserver.create(args[0]);
        }
        else {
            var onNext = args[0], onError = args[1] || null, onCompleted = args[2] || null;
            observer = AutoDetachObserver.create(onNext, onError, onCompleted);
        }
        observer.setDisposable(this.buildStream(observer));
        return observer;
    };
    return AnonymousStream;
}(Stream));

var BaseStream = (function (_super) {
    __extends(BaseStream, _super);
    function BaseStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseStream.prototype.subscribe = function (arg1, onError, onCompleted) {
        var observer = null;
        if (this.handleSubject(arg1)) {
            return;
        }
        observer = arg1 instanceof Observer
            ? AutoDetachObserver.create(arg1)
            : AutoDetachObserver.create(arg1, onError, onCompleted);
        observer.setDisposable(this.buildStream(observer));
        return observer;
    };
    BaseStream.prototype.buildStream = function (observer) {
        _super.prototype.buildStream.call(this, observer);
        return this.subscribeCore(observer);
    };
    return BaseStream;
}(Stream));

var FromArrayStream = (function (_super) {
    __extends(FromArrayStream, _super);
    function FromArrayStream(array, scheduler) {
        var _this = _super.call(this, null) || this;
        _this._array = null;
        _this._array = array;
        _this.scheduler = scheduler;
        return _this;
    }
    FromArrayStream.create = function (array, scheduler) {
        var obj = new this(array, scheduler);
        return obj;
    };
    FromArrayStream.prototype.subscribeCore = function (observer) {
        var array = this._array, len = array.length;
        function loopRecursive(i) {
            if (i < len) {
                observer.next(array[i]);
                loopRecursive(i + 1);
            }
            else {
                observer.completed();
            }
        }
        this.scheduler.publishRecursive(observer, 0, loopRecursive);
        return SingleDisposable.create();
    };
    return FromArrayStream;
}(BaseStream));

var FromPromiseStream = (function (_super) {
    __extends(FromPromiseStream, _super);
    function FromPromiseStream(promise, scheduler) {
        var _this = _super.call(this, null) || this;
        _this._promise = null;
        _this._promise = promise;
        _this.scheduler = scheduler;
        return _this;
    }
    FromPromiseStream.create = function (promise, scheduler) {
        var obj = new this(promise, scheduler);
        return obj;
    };
    FromPromiseStream.prototype.subscribeCore = function (observer) {
        this._promise.then(function (data) {
            observer.next(data);
            observer.completed();
        }, function (err) {
            observer.error(err);
        }, observer);
        return SingleDisposable.create();
    };
    return FromPromiseStream;
}(BaseStream));

var FromEventPatternStream = (function (_super) {
    __extends(FromEventPatternStream, _super);
    function FromEventPatternStream(addHandler, removeHandler) {
        var _this = _super.call(this, null) || this;
        _this._addHandler = null;
        _this._removeHandler = null;
        _this._addHandler = addHandler;
        _this._removeHandler = removeHandler;
        return _this;
    }
    FromEventPatternStream.create = function (addHandler, removeHandler) {
        var obj = new this(addHandler, removeHandler);
        return obj;
    };
    FromEventPatternStream.prototype.subscribeCore = function (observer) {
        var self = this;
        function innerHandler(event) {
            observer.next(event);
        }
        this._addHandler(innerHandler);
        return SingleDisposable.create(function () {
            self._removeHandler(innerHandler);
        });
    };
    return FromEventPatternStream;
}(BaseStream));

var IntervalStream = (function (_super) {
    __extends(IntervalStream, _super);
    function IntervalStream(interval, scheduler) {
        var _this = _super.call(this, null) || this;
        _this._interval = null;
        _this._interval = interval;
        _this.scheduler = scheduler;
        return _this;
    }
    IntervalStream.create = function (interval, scheduler) {
        var obj = new this(interval, scheduler);
        obj.initWhenCreate();
        return obj;
    };
    IntervalStream.prototype.initWhenCreate = function () {
        this._interval = this._interval <= 0 ? 1 : this._interval;
    };
    IntervalStream.prototype.subscribeCore = function (observer) {
        var self = this, id = null;
        id = this.scheduler.publishInterval(observer, 0, this._interval, function (count) {
            observer.next(count);
            return count + 1;
        });
        return SingleDisposable.create(function () {
            root$1.clearInterval(id);
        });
    };
    return IntervalStream;
}(BaseStream));

var IntervalRequestStream = (function (_super) {
    __extends(IntervalRequestStream, _super);
    function IntervalRequestStream(scheduler) {
        var _this = _super.call(this, null) || this;
        _this._isEnd = false;
        _this.scheduler = scheduler;
        return _this;
    }
    IntervalRequestStream.create = function (scheduler) {
        var obj = new this(scheduler);
        return obj;
    };
    IntervalRequestStream.prototype.subscribeCore = function (observer) {
        var self = this;
        this.scheduler.publishIntervalRequest(observer, function (time) {
            observer.next(time);
            return self._isEnd;
        });
        return SingleDisposable.create(function () {
            root$1.cancelNextRequestAnimationFrame(self.scheduler.requestLoopId);
            self._isEnd = true;
        });
    };
    return IntervalRequestStream;
}(BaseStream));

var TimeoutStream = (function (_super) {
    __extends(TimeoutStream, _super);
    function TimeoutStream(time, scheduler) {
        var _this = _super.call(this, null) || this;
        _this._time = null;
        _this._time = time;
        _this.scheduler = scheduler;
        return _this;
    }
    TimeoutStream.create = function (time, scheduler) {
        var obj = new this(time, scheduler);
        return obj;
    };
    TimeoutStream.prototype.subscribeCore = function (observer) {
        var id = null;
        id = this.scheduler.publishTimeout(observer, this._time, function (time) {
            observer.next(time);
        });
        return SingleDisposable.create(function () {
            root$1.clearTimeout(id);
        });
    };
    return TimeoutStream;
}(BaseStream));
__decorate([
    requireCheck(function (time, scheduler) {
        assert(time > 0, Log.info.FUNC_SHOULD("time", "> 0"));
    })
], TimeoutStream, "create", null);

var GroupDisposable = (function (_super) {
    __extends(GroupDisposable, _super);
    function GroupDisposable(disposable) {
        var _this = _super.call(this, "GroupDisposable") || this;
        _this._group = Collection.create();
        _this._isDisposed = false;
        if (disposable) {
            _this._group.addChild(disposable);
        }
        return _this;
    }
    GroupDisposable.create = function (disposable) {
        var obj = new this(disposable);
        return obj;
    };
    GroupDisposable.prototype.add = function (disposable) {
        this._group.addChild(disposable);
        return this;
    };
    GroupDisposable.prototype.remove = function (disposable) {
        this._group.removeChild(disposable);
        return this;
    };
    GroupDisposable.prototype.dispose = function () {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._group.forEach(function (disposable) {
            disposable.dispose();
        });
    };
    return GroupDisposable;
}(Entity));

var DeferStream = (function (_super) {
    __extends(DeferStream, _super);
    function DeferStream(buildStreamFunc) {
        var _this = _super.call(this, null) || this;
        _this._buildStreamFunc = null;
        _this._buildStreamFunc = buildStreamFunc;
        return _this;
    }
    DeferStream.create = function (buildStreamFunc) {
        var obj = new this(buildStreamFunc);
        return obj;
    };
    DeferStream.prototype.subscribeCore = function (observer) {
        var group = GroupDisposable.create();
        group.add(this._buildStreamFunc().buildStream(observer));
        return group;
    };
    return DeferStream;
}(BaseStream));

function registerClass(className) {
    return function (target) {
        ClassMapUtils.addClassMap(className, target);
    };
}

var Operator = (function () {
    function Operator() {
    }
    Operator.empty = function () {
        return this.createStream(function (observer) {
            observer.completed();
        });
    };
    Operator.createStream = function (subscribeFunc) {
        return AnonymousStream.create(subscribeFunc);
    };
    Operator.fromArray = function (array, scheduler) {
        if (scheduler === void 0) { scheduler = Scheduler.create(); }
        return FromArrayStream.create(array, scheduler);
    };
    return Operator;
}());
Operator = __decorate([
    registerClass("Operator")
], Operator);
var createStream = Operator.createStream;
var empty = Operator.empty;
var fromArray = Operator.fromArray;
var fromPromise = function (promise, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler.create(); }
    return FromPromiseStream.create(promise, scheduler);
};
var fromEventPattern = function (addHandler, removeHandler) {
    return FromEventPatternStream.create(addHandler, removeHandler);
};
var interval = function (interval, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler.create(); }
    return IntervalStream.create(interval, scheduler);
};
var intervalRequest = function (scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler.create(); }
    return IntervalRequestStream.create(scheduler);
};
var timeout = function (time, scheduler) {
    if (scheduler === void 0) { scheduler = Scheduler.create(); }
    return TimeoutStream.create(time, scheduler);
};
var callFunc = function (func, context) {
    if (context === void 0) { context = root$1; }
    return createStream(function (observer) {
        try {
            observer.next(func.call(context, null));
        }
        catch (e) {
            observer.error(e);
        }
        observer.completed();
    });
};
var judge = function (condition, thenSource, elseSource) {
    return condition() ? thenSource() : elseSource();
};
var defer = function (buildStreamFunc) {
    return DeferStream.create(buildStreamFunc);
};
var just = function (returnValue) {
    return createStream(function (observer) {
        observer.next(returnValue);
        observer.completed();
    });
};

var fromNodeCallback = function (func, context) {
    return function () {
        var funcArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            funcArgs[_i] = arguments[_i];
        }
        return createStream(function (observer) {
            var hander = function (err) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (err) {
                    observer.error(err);
                    return;
                }
                if (args.length <= 1) {
                    observer.next.apply(observer, args);
                }
                else {
                    observer.next(args);
                }
                observer.completed();
            };
            funcArgs.push(hander);
            func.apply(context, funcArgs);
        });
    };
};
var fromStream = function (stream, finishEventName) {
    if (finishEventName === void 0) { finishEventName = "end"; }
    if (stream.pause) {
        stream.pause();
    }
    return createStream(function (observer) {
        var dataHandler = function (data) {
            observer.next(data);
        }, errorHandler = function (err) {
            observer.error(err);
        }, endHandler = function () {
            observer.completed();
        };
        stream.addListener("data", dataHandler);
        stream.addListener("error", errorHandler);
        stream.addListener(finishEventName, endHandler);
        if (stream.resume) {
            stream.resume();
        }
        return function () {
            stream.removeListener("data", dataHandler);
            stream.removeListener("error", errorHandler);
            stream.removeListener(finishEventName, endHandler);
        };
    });
};
var fromReadableStream = function (stream) {
    return fromStream(stream, "end");
};
var fromWritableStream = function (stream) {
    return fromStream(stream, "finish");
};
var fromTransformStream = function (stream) {
    return fromStream(stream, "finish");
};

var InnerSubscriptionGroup = (function () {
    function InnerSubscriptionGroup() {
        this._container = Collection.create();
    }
    InnerSubscriptionGroup.create = function () {
        var obj = new this();
        return obj;
    };
    InnerSubscriptionGroup.prototype.addChild = function (child) {
        this._container.addChild(child);
    };
    InnerSubscriptionGroup.prototype.dispose = function () {
        this._container.forEach(function (child) {
            child.dispose();
        });
    };
    return InnerSubscriptionGroup;
}());

var FilterState;
(function (FilterState) {
    FilterState[FilterState["TRIGGER"] = 0] = "TRIGGER";
    FilterState[FilterState["ENTER"] = 1] = "ENTER";
    FilterState[FilterState["LEAVE"] = 2] = "LEAVE";
})(FilterState || (FilterState = {}));

var AnonymousObserver = (function (_super) {
    __extends(AnonymousObserver, _super);
    function AnonymousObserver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnonymousObserver.create = function (onNext, onError, onCompleted) {
        return new this(onNext, onError, onCompleted);
    };
    AnonymousObserver.prototype.onNext = function (value) {
        this.onUserNext(value);
    };
    AnonymousObserver.prototype.onError = function (error) {
        this.onUserError(error);
    };
    AnonymousObserver.prototype.onCompleted = function () {
        this.onUserCompleted();
    };
    return AnonymousObserver;
}(Observer));

var ConcatObserver = (function (_super) {
    __extends(ConcatObserver, _super);
    function ConcatObserver(currentObserver, startNextStream) {
        var _this = _super.call(this, null, null, null) || this;
        _this.currentObserver = null;
        _this._startNextStream = null;
        _this.currentObserver = currentObserver;
        _this._startNextStream = startNextStream;
        return _this;
    }
    ConcatObserver.create = function (currentObserver, startNextStream) {
        return new this(currentObserver, startNextStream);
    };
    ConcatObserver.prototype.onNext = function (value) {
        this.currentObserver.next(value);
    };
    ConcatObserver.prototype.onError = function (error) {
        this.currentObserver.error(error);
    };
    ConcatObserver.prototype.onCompleted = function () {
        this._startNextStream();
    };
    return ConcatObserver;
}(Observer));

var DoObserver = (function (_super) {
    __extends(DoObserver, _super);
    function DoObserver(currentObserver, prevObserver) {
        var _this = _super.call(this, null, null, null) || this;
        _this._currentObserver = null;
        _this._prevObserver = null;
        _this._currentObserver = currentObserver;
        _this._prevObserver = prevObserver;
        return _this;
    }
    DoObserver.create = function (currentObserver, prevObserver) {
        return new this(currentObserver, prevObserver);
    };
    DoObserver.prototype.onNext = function (value) {
        try {
            this._prevObserver.next(value);
        }
        catch (e) {
            this._prevObserver.error(e);
            this._currentObserver.error(e);
        }
        finally {
            this._currentObserver.next(value);
        }
    };
    DoObserver.prototype.onError = function (error) {
        try {
            this._prevObserver.error(error);
        }
        catch (e) {
        }
        finally {
            this._currentObserver.error(error);
        }
    };
    DoObserver.prototype.onCompleted = function () {
        try {
            this._prevObserver.completed();
        }
        catch (e) {
            this._prevObserver.error(e);
            this._currentObserver.error(e);
        }
        finally {
            this._currentObserver.completed();
        }
    };
    return DoObserver;
}(Observer));

var FilterObserver = (function (_super) {
    __extends(FilterObserver, _super);
    function FilterObserver(prevObserver, predicate, source) {
        var _this = _super.call(this, null, null, null) || this;
        _this.prevObserver = null;
        _this.source = null;
        _this.i = 0;
        _this.predicate = null;
        _this.prevObserver = prevObserver;
        _this.predicate = predicate;
        _this.source = source;
        return _this;
    }
    FilterObserver.create = function (prevObserver, predicate, source) {
        return new this(prevObserver, predicate, source);
    };
    FilterObserver.prototype.onNext = function (value) {
        try {
            if (this.predicate(value, this.i++, this.source)) {
                this.prevObserver.next(value);
            }
        }
        catch (e) {
            this.prevObserver.error(e);
        }
    };
    FilterObserver.prototype.onError = function (error) {
        this.prevObserver.error(error);
    };
    FilterObserver.prototype.onCompleted = function () {
        this.prevObserver.completed();
    };
    return FilterObserver;
}(Observer));

var FilterWithStateObserver = (function (_super) {
    __extends(FilterWithStateObserver, _super);
    function FilterWithStateObserver() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._isTrigger = false;
        return _this;
    }
    FilterWithStateObserver.create = function (prevObserver, predicate, source) {
        return new this(prevObserver, predicate, source);
    };
    FilterWithStateObserver.prototype.onNext = function (value) {
        var data = null;
        try {
            if (this.predicate(value, this.i++, this.source)) {
                if (!this._isTrigger) {
                    data = {
                        value: value,
                        state: FilterState.ENTER
                    };
                }
                else {
                    data = {
                        value: value,
                        state: FilterState.TRIGGER
                    };
                }
                this.prevObserver.next(data);
                this._isTrigger = true;
            }
            else {
                if (this._isTrigger) {
                    data = {
                        value: value,
                        state: FilterState.LEAVE
                    };
                    this.prevObserver.next(data);
                }
                this._isTrigger = false;
            }
        }
        catch (e) {
            this.prevObserver.error(e);
        }
    };
    return FilterWithStateObserver;
}(FilterObserver));

var IgnoreElementsObserver = (function (_super) {
    __extends(IgnoreElementsObserver, _super);
    function IgnoreElementsObserver(currentObserver) {
        var _this = _super.call(this, null, null, null) || this;
        _this._currentObserver = null;
        _this._currentObserver = currentObserver;
        return _this;
    }
    IgnoreElementsObserver.create = function (currentObserver) {
        return new this(currentObserver);
    };
    IgnoreElementsObserver.prototype.onNext = function (value) {
    };
    IgnoreElementsObserver.prototype.onError = function (error) {
        this._currentObserver.error(error);
    };
    IgnoreElementsObserver.prototype.onCompleted = function () {
        this._currentObserver.completed();
    };
    return IgnoreElementsObserver;
}(Observer));

var MapObserver = (function (_super) {
    __extends(MapObserver, _super);
    function MapObserver(currentObserver, selector) {
        var _this = _super.call(this, null, null, null) || this;
        _this._currentObserver = null;
        _this._selector = null;
        _this._currentObserver = currentObserver;
        _this._selector = selector;
        return _this;
    }
    MapObserver.create = function (currentObserver, selector) {
        return new this(currentObserver, selector);
    };
    MapObserver.prototype.onNext = function (value) {
        var result = null;
        try {
            result = this._selector(value);
        }
        catch (e) {
            this._currentObserver.error(e);
        }
        finally {
            this._currentObserver.next(result);
        }
    };
    MapObserver.prototype.onError = function (error) {
        this._currentObserver.error(error);
    };
    MapObserver.prototype.onCompleted = function () {
        this._currentObserver.completed();
    };
    return MapObserver;
}(Observer));

var MergeAllObserver = (function (_super) {
    __extends(MergeAllObserver, _super);
    function MergeAllObserver(currentObserver, streamGroup, groupDisposable) {
        var _this = _super.call(this, null, null, null) || this;
        _this.done = false;
        _this.currentObserver = null;
        _this._streamGroup = null;
        _this._groupDisposable = null;
        _this.currentObserver = currentObserver;
        _this._streamGroup = streamGroup;
        _this._groupDisposable = groupDisposable;
        return _this;
    }
    MergeAllObserver.create = function (currentObserver, streamGroup, groupDisposable) {
        return new this(currentObserver, streamGroup, groupDisposable);
    };
    MergeAllObserver.prototype.onNext = function (innerSource) {
        if (JudgeUtils$$1.isPromise(innerSource)) {
            innerSource = fromPromise(innerSource);
        }
        this._streamGroup.addChild(innerSource);
        this._groupDisposable.add(innerSource.buildStream(InnerObserver.create(this, this._streamGroup, innerSource)));
    };
    MergeAllObserver.prototype.onError = function (error) {
        this.currentObserver.error(error);
    };
    MergeAllObserver.prototype.onCompleted = function () {
        this.done = true;
        if (this._streamGroup.getCount() === 0) {
            this.currentObserver.completed();
        }
    };
    return MergeAllObserver;
}(Observer));
__decorate([
    requireCheck(function (innerSource) {
        assert(innerSource instanceof Stream || JudgeUtils$$1.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));
    })
], MergeAllObserver.prototype, "onNext", null);
var InnerObserver = (function (_super) {
    __extends(InnerObserver, _super);
    function InnerObserver(parent, streamGroup, currentStream) {
        var _this = _super.call(this, null, null, null) || this;
        _this._parent = null;
        _this._streamGroup = null;
        _this._currentStream = null;
        _this._parent = parent;
        _this._streamGroup = streamGroup;
        _this._currentStream = currentStream;
        return _this;
    }
    InnerObserver.create = function (parent, streamGroup, currentStream) {
        var obj = new this(parent, streamGroup, currentStream);
        return obj;
    };
    InnerObserver.prototype.onNext = function (value) {
        this._parent.currentObserver.next(value);
    };
    InnerObserver.prototype.onError = function (error) {
        this._parent.currentObserver.error(error);
    };
    InnerObserver.prototype.onCompleted = function () {
        var currentStream = this._currentStream, parent = this._parent;
        this._streamGroup.removeChild(function (stream) {
            return JudgeUtils$$1.isEqual(stream, currentStream);
        });
        if (this._isAsync() && this._streamGroup.getCount() === 0) {
            parent.currentObserver.completed();
        }
    };
    InnerObserver.prototype._isAsync = function () {
        return this._parent.done;
    };
    return InnerObserver;
}(Observer));

var MergeObserver = (function (_super) {
    __extends(MergeObserver, _super);
    function MergeObserver(currentObserver, maxConcurrent, streamGroup, groupDisposable) {
        var _this = _super.call(this, null, null, null) || this;
        _this.done = false;
        _this.currentObserver = null;
        _this.activeCount = 0;
        _this.q = [];
        _this._maxConcurrent = null;
        _this._groupDisposable = null;
        _this._streamGroup = null;
        _this.currentObserver = currentObserver;
        _this._maxConcurrent = maxConcurrent;
        _this._streamGroup = streamGroup;
        _this._groupDisposable = groupDisposable;
        return _this;
    }
    MergeObserver.create = function (currentObserver, maxConcurrent, streamGroup, groupDisposable) {
        return new this(currentObserver, maxConcurrent, streamGroup, groupDisposable);
    };
    MergeObserver.prototype.handleSubscribe = function (innerSource) {
        if (JudgeUtils$$1.isPromise(innerSource)) {
            innerSource = fromPromise(innerSource);
        }
        this._streamGroup.addChild(innerSource);
        this._groupDisposable.add(innerSource.buildStream(InnerObserver$1.create(this, this._streamGroup, innerSource)));
    };
    MergeObserver.prototype.onNext = function (innerSource) {
        if (this._isReachMaxConcurrent()) {
            this.activeCount++;
            this.handleSubscribe(innerSource);
            return;
        }
        this.q.push(innerSource);
    };
    MergeObserver.prototype.onError = function (error) {
        this.currentObserver.error(error);
    };
    MergeObserver.prototype.onCompleted = function () {
        this.done = true;
        if (this._streamGroup.getCount() === 0) {
            this.currentObserver.completed();
        }
    };
    MergeObserver.prototype._isReachMaxConcurrent = function () {
        return this.activeCount < this._maxConcurrent;
    };
    return MergeObserver;
}(Observer));
__decorate([
    requireCheck(function (innerSource) {
        assert(innerSource instanceof Stream || JudgeUtils$$1.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));
    })
], MergeObserver.prototype, "onNext", null);
var InnerObserver$1 = (function (_super) {
    __extends(InnerObserver, _super);
    function InnerObserver(parent, streamGroup, currentStream) {
        var _this = _super.call(this, null, null, null) || this;
        _this._parent = null;
        _this._streamGroup = null;
        _this._currentStream = null;
        _this._parent = parent;
        _this._streamGroup = streamGroup;
        _this._currentStream = currentStream;
        return _this;
    }
    InnerObserver.create = function (parent, streamGroup, currentStream) {
        var obj = new this(parent, streamGroup, currentStream);
        return obj;
    };
    InnerObserver.prototype.onNext = function (value) {
        this._parent.currentObserver.next(value);
    };
    InnerObserver.prototype.onError = function (error) {
        this._parent.currentObserver.error(error);
    };
    InnerObserver.prototype.onCompleted = function () {
        var parent = this._parent;
        this._streamGroup.removeChild(this._currentStream);
        if (parent.q.length > 0) {
            parent.activeCount = 0;
            parent.handleSubscribe(parent.q.shift());
        }
        else {
            if (this._isAsync() && this._streamGroup.getCount() === 0) {
                parent.currentObserver.completed();
            }
        }
    };
    InnerObserver.prototype._isAsync = function () {
        return this._parent.done;
    };
    return InnerObserver;
}(Observer));

var SkipUntilOtherObserver = (function (_super) {
    __extends(SkipUntilOtherObserver, _super);
    function SkipUntilOtherObserver(prevObserver, skipUntilStream) {
        var _this = _super.call(this, null, null, null) || this;
        _this.otherDisposable = null;
        _this._prevObserver = null;
        _this._skipUntilStream = null;
        _this._prevObserver = prevObserver;
        _this._skipUntilStream = skipUntilStream;
        return _this;
    }
    SkipUntilOtherObserver.create = function (prevObserver, skipUntilStream) {
        return new this(prevObserver, skipUntilStream);
    };
    SkipUntilOtherObserver.prototype.onNext = function (value) {
        this._skipUntilStream.isOpen = true;
        this.otherDisposable.dispose();
    };
    SkipUntilOtherObserver.prototype.onError = function (error) {
        this._prevObserver.error(error);
    };
    SkipUntilOtherObserver.prototype.onCompleted = function () {
        this.otherDisposable.dispose();
    };
    return SkipUntilOtherObserver;
}(Observer));

var SkipUntilSourceObserver = (function (_super) {
    __extends(SkipUntilSourceObserver, _super);
    function SkipUntilSourceObserver(prevObserver, skipUntilStream) {
        var _this = _super.call(this, null, null, null) || this;
        _this._prevObserver = null;
        _this._skipUntilStream = null;
        _this._prevObserver = prevObserver;
        _this._skipUntilStream = skipUntilStream;
        return _this;
    }
    SkipUntilSourceObserver.create = function (prevObserver, skipUntilStream) {
        return new this(prevObserver, skipUntilStream);
    };
    SkipUntilSourceObserver.prototype.onNext = function (value) {
        if (this._skipUntilStream.isOpen) {
            this._prevObserver.next(value);
        }
    };
    SkipUntilSourceObserver.prototype.onError = function (error) {
        this._prevObserver.error(error);
    };
    SkipUntilSourceObserver.prototype.onCompleted = function () {
        if (this._skipUntilStream.isOpen) {
            this._prevObserver.completed();
        }
    };
    return SkipUntilSourceObserver;
}(Observer));

var TakeUntilObserver = (function (_super) {
    __extends(TakeUntilObserver, _super);
    function TakeUntilObserver(prevObserver) {
        var _this = _super.call(this, null, null, null) || this;
        _this._prevObserver = null;
        _this._prevObserver = prevObserver;
        return _this;
    }
    TakeUntilObserver.create = function (prevObserver) {
        return new this(prevObserver);
    };
    TakeUntilObserver.prototype.onNext = function (value) {
        this._prevObserver.completed();
    };
    TakeUntilObserver.prototype.onError = function (error) {
        this._prevObserver.error(error);
    };
    TakeUntilObserver.prototype.onCompleted = function () {
    };
    return TakeUntilObserver;
}(Observer));

var ConcatStream = (function (_super) {
    __extends(ConcatStream, _super);
    function ConcatStream(sources) {
        var _this = _super.call(this, null) || this;
        _this._sources = Collection.create();
        var self = _this;
        _this.scheduler = sources[0].scheduler;
        sources.forEach(function (source) {
            if (JudgeUtils$$1.isPromise(source)) {
                self._sources.addChild(fromPromise(source));
            }
            else {
                self._sources.addChild(source);
            }
        });
        return _this;
    }
    ConcatStream.create = function (sources) {
        var obj = new this(sources);
        return obj;
    };
    ConcatStream.prototype.subscribeCore = function (observer) {
        var self = this, count = this._sources.getCount(), d = GroupDisposable.create();
        function loopRecursive(i) {
            if (i === count) {
                observer.completed();
                return;
            }
            d.add(self._sources.getChild(i).buildStream(ConcatObserver.create(observer, function () {
                loopRecursive(i + 1);
            })));
        }
        this.scheduler.publishRecursive(observer, 0, loopRecursive);
        return GroupDisposable.create(d);
    };
    return ConcatStream;
}(BaseStream));
ConcatStream = __decorate([
    registerClass("ConcatStream")
], ConcatStream);

var DoStream = (function (_super) {
    __extends(DoStream, _super);
    function DoStream(source, onNext, onError, onCompleted) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._observer = null;
        _this._source = source;
        _this._observer = AnonymousObserver.create(onNext, onError, onCompleted);
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    DoStream.create = function (source, onNext, onError, onCompleted) {
        var obj = new this(source, onNext, onError, onCompleted);
        return obj;
    };
    DoStream.prototype.subscribeCore = function (observer) {
        return this._source.buildStream(DoObserver.create(observer, this._observer));
    };
    return DoStream;
}(BaseStream));
DoStream = __decorate([
    registerClass("DoStream")
], DoStream);

var FilterStream = FilterStream_1 = (function (_super) {
    __extends(FilterStream, _super);
    function FilterStream(source, predicate, thisArg) {
        var _this = _super.call(this, null) || this;
        _this.predicate = null;
        _this._source = null;
        _this._source = source;
        _this.predicate = FunctionUtils.bind(thisArg, predicate);
        return _this;
    }
    FilterStream.create = function (source, predicate, thisArg) {
        var obj = new this(source, predicate, thisArg);
        return obj;
    };
    FilterStream.prototype.subscribeCore = function (observer) {
        return this._source.subscribe(this.createObserver(observer));
    };
    FilterStream.prototype.internalFilter = function (predicate, thisArg) {
        return this.createStreamForInternalFilter(this._source, this._innerPredicate(predicate, this), thisArg);
    };
    FilterStream.prototype.createObserver = function (observer) {
        return FilterObserver.create(observer, this.predicate, this);
    };
    FilterStream.prototype.createStreamForInternalFilter = function (source, innerPredicate, thisArg) {
        return FilterStream_1.create(source, innerPredicate, thisArg);
    };
    FilterStream.prototype._innerPredicate = function (predicate, self) {
        var _this = this;
        return function (value, i, o) {
            return self.predicate(value, i, o) && predicate.call(_this, value, i, o);
        };
    };
    return FilterStream;
}(BaseStream));
FilterStream = FilterStream_1 = __decorate([
    registerClass("FilterStream")
], FilterStream);
var FilterStream_1;

var FilterWithStateStream = FilterWithStateStream_1 = (function (_super) {
    __extends(FilterWithStateStream, _super);
    function FilterWithStateStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterWithStateStream.create = function (source, predicate, thisArg) {
        var obj = new this(source, predicate, thisArg);
        return obj;
    };
    FilterWithStateStream.prototype.createObserver = function (observer) {
        return FilterWithStateObserver.create(observer, this.predicate, this);
    };
    FilterWithStateStream.prototype.createStreamForInternalFilter = function (source, innerPredicate, thisArg) {
        return FilterWithStateStream_1.create(source, innerPredicate, thisArg);
    };
    return FilterWithStateStream;
}(FilterStream));
FilterWithStateStream = FilterWithStateStream_1 = __decorate([
    registerClass("FilterWithStateStream")
], FilterWithStateStream);
var FilterWithStateStream_1;

var IgnoreElementsStream = (function (_super) {
    __extends(IgnoreElementsStream, _super);
    function IgnoreElementsStream(source) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._source = source;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    IgnoreElementsStream.create = function (source) {
        var obj = new this(source);
        return obj;
    };
    IgnoreElementsStream.prototype.subscribeCore = function (observer) {
        return this._source.buildStream(IgnoreElementsObserver.create(observer));
    };
    return IgnoreElementsStream;
}(BaseStream));
IgnoreElementsStream = __decorate([
    registerClass("IgnoreElementsStream")
], IgnoreElementsStream);

var MapStream = (function (_super) {
    __extends(MapStream, _super);
    function MapStream(source, selector) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._selector = null;
        _this._source = source;
        _this.scheduler = _this._source.scheduler;
        _this._selector = selector;
        return _this;
    }
    MapStream.create = function (source, selector) {
        var obj = new this(source, selector);
        return obj;
    };
    MapStream.prototype.subscribeCore = function (observer) {
        return this._source.buildStream(MapObserver.create(observer, this._selector));
    };
    return MapStream;
}(BaseStream));
MapStream = __decorate([
    registerClass("MapStream")
], MapStream);

var MergeAllStream = (function (_super) {
    __extends(MergeAllStream, _super);
    function MergeAllStream(source) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._observer = null;
        _this._source = source;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    MergeAllStream.create = function (source) {
        var obj = new this(source);
        return obj;
    };
    MergeAllStream.prototype.subscribeCore = function (observer) {
        var streamGroup = Collection.create(), groupDisposable = GroupDisposable.create();
        this._source.buildStream(MergeAllObserver.create(observer, streamGroup, groupDisposable));
        return groupDisposable;
    };
    return MergeAllStream;
}(BaseStream));
MergeAllStream = __decorate([
    registerClass("MergeAllStream")
], MergeAllStream);

var MergeStream = (function (_super) {
    __extends(MergeStream, _super);
    function MergeStream(source, maxConcurrent) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._maxConcurrent = null;
        _this._source = source;
        _this._maxConcurrent = maxConcurrent;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    MergeStream.create = function (source, maxConcurrent) {
        var obj = new this(source, maxConcurrent);
        return obj;
    };
    MergeStream.prototype.subscribeCore = function (observer) {
        var streamGroup = Collection.create(), groupDisposable = GroupDisposable.create();
        this._source.buildStream(MergeObserver.create(observer, this._maxConcurrent, streamGroup, groupDisposable));
        return groupDisposable;
    };
    return MergeStream;
}(BaseStream));
MergeStream = __decorate([
    registerClass("MergeStream")
], MergeStream);

var RepeatStream = (function (_super) {
    __extends(RepeatStream, _super);
    function RepeatStream(source, count) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._count = null;
        _this._source = source;
        _this._count = count;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    RepeatStream.create = function (source, count) {
        var obj = new this(source, count);
        return obj;
    };
    RepeatStream.prototype.subscribeCore = function (observer) {
        var self = this, d = GroupDisposable.create();
        function loopRecursive(count) {
            if (count === 0) {
                observer.completed();
                return;
            }
            d.add(self._source.buildStream(ConcatObserver.create(observer, function () {
                loopRecursive(count - 1);
            })));
        }
        this.scheduler.publishRecursive(observer, this._count, loopRecursive);
        return GroupDisposable.create(d);
    };
    return RepeatStream;
}(BaseStream));
RepeatStream = __decorate([
    registerClass("RepeatStream")
], RepeatStream);

var SkipUntilStream = (function (_super) {
    __extends(SkipUntilStream, _super);
    function SkipUntilStream(source, otherStream) {
        var _this = _super.call(this, null) || this;
        _this.isOpen = false;
        _this._source = null;
        _this._otherStream = null;
        _this._source = source;
        _this._otherStream = JudgeUtils$$1.isPromise(otherStream) ? fromPromise(otherStream) : otherStream;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    SkipUntilStream.create = function (source, otherSteam) {
        var obj = new this(source, otherSteam);
        return obj;
    };
    SkipUntilStream.prototype.subscribeCore = function (observer) {
        var group = GroupDisposable.create(), otherDisposable = null, skipUntilOtherObserver = null;
        group.add(this._source.buildStream(SkipUntilSourceObserver.create(observer, this)));
        skipUntilOtherObserver = SkipUntilOtherObserver.create(observer, this);
        otherDisposable = this._otherStream.buildStream(skipUntilOtherObserver);
        skipUntilOtherObserver.otherDisposable = otherDisposable;
        group.add(otherDisposable);
        return group;
    };
    return SkipUntilStream;
}(BaseStream));
SkipUntilStream = __decorate([
    registerClass("SkipUntilStream")
], SkipUntilStream);

var TakeUntilStream = (function (_super) {
    __extends(TakeUntilStream, _super);
    function TakeUntilStream(source, otherStream) {
        var _this = _super.call(this, null) || this;
        _this._source = null;
        _this._otherStream = null;
        _this._source = source;
        _this._otherStream = JudgeUtils$$1.isPromise(otherStream) ? fromPromise(otherStream) : otherStream;
        _this.scheduler = _this._source.scheduler;
        return _this;
    }
    TakeUntilStream.create = function (source, otherSteam) {
        var obj = new this(source, otherSteam);
        return obj;
    };
    TakeUntilStream.prototype.subscribeCore = function (observer) {
        var group = GroupDisposable.create(), autoDetachObserver = AutoDetachObserver.create(observer), sourceDisposable = null;
        sourceDisposable = this._source.buildStream(observer);
        group.add(sourceDisposable);
        autoDetachObserver.setDisposable(sourceDisposable);
        group.add(this._otherStream.buildStream(TakeUntilObserver.create(autoDetachObserver)));
        return group;
    };
    return TakeUntilStream;
}(BaseStream));
TakeUntilStream = __decorate([
    registerClass("TakeUntilStream")
], TakeUntilStream);

var GeneratorSubject = (function (_super) {
    __extends(GeneratorSubject, _super);
    function GeneratorSubject() {
        var _this = _super.call(this, "GeneratorSubject") || this;
        _this._isStart = false;
        _this.observer = new SubjectObserver();
        return _this;
    }
    GeneratorSubject.create = function () {
        var obj = new this();
        return obj;
    };
    Object.defineProperty(GeneratorSubject.prototype, "isStart", {
        get: function () {
            return this._isStart;
        },
        set: function (isStart) {
            this._isStart = isStart;
        },
        enumerable: true,
        configurable: true
    });
    GeneratorSubject.prototype.onBeforeNext = function (value) {
    };
    GeneratorSubject.prototype.onAfterNext = function (value) {
    };
    GeneratorSubject.prototype.onIsCompleted = function (value) {
        return false;
    };
    GeneratorSubject.prototype.onBeforeError = function (error) {
    };
    GeneratorSubject.prototype.onAfterError = function (error) {
    };
    GeneratorSubject.prototype.onBeforeCompleted = function () {
    };
    GeneratorSubject.prototype.onAfterCompleted = function () {
    };
    GeneratorSubject.prototype.subscribe = function (arg1, onError, onCompleted) {
        var observer = arg1 instanceof Observer
            ? arg1
            : AutoDetachObserver.create(arg1, onError, onCompleted);
        this.observer.addChild(observer);
        return InnerSubscription.create(this, observer);
    };
    GeneratorSubject.prototype.next = function (value) {
        if (!this._isStart || this.observer.isEmpty()) {
            return;
        }
        try {
            this.onBeforeNext(value);
            this.observer.next(value);
            this.onAfterNext(value);
            if (this.onIsCompleted(value)) {
                this.completed();
            }
        }
        catch (e) {
            this.error(e);
        }
    };
    GeneratorSubject.prototype.error = function (error) {
        if (!this._isStart || this.observer.isEmpty()) {
            return;
        }
        this.onBeforeError(error);
        this.observer.error(error);
        this.onAfterError(error);
    };
    GeneratorSubject.prototype.completed = function () {
        if (!this._isStart || this.observer.isEmpty()) {
            return;
        }
        this.onBeforeCompleted();
        this.observer.completed();
        this.onAfterCompleted();
    };
    GeneratorSubject.prototype.toStream = function () {
        var self = this, stream = null;
        stream = AnonymousStream.create(function (observer) {
            self.subscribe(observer);
        });
        return stream;
    };
    GeneratorSubject.prototype.start = function () {
        var self = this;
        this._isStart = true;
        this.observer.setDisposable(SingleDisposable.create(function () {
            self.dispose();
        }));
    };
    GeneratorSubject.prototype.stop = function () {
        this._isStart = false;
    };
    GeneratorSubject.prototype.remove = function (observer) {
        this.observer.removeChild(observer);
    };
    GeneratorSubject.prototype.dispose = function () {
        this.observer.dispose();
    };
    return GeneratorSubject;
}(Entity));

var ActionType;
(function (ActionType) {
    ActionType[ActionType["NEXT"] = 0] = "NEXT";
    ActionType[ActionType["ERROR"] = 1] = "ERROR";
    ActionType[ActionType["COMPLETED"] = 2] = "COMPLETED";
})(ActionType || (ActionType = {}));

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

var MockObserver = (function (_super) {
    __extends(MockObserver, _super);
    function MockObserver(scheduler) {
        var _this = _super.call(this, null, null, null) || this;
        _this._messages = [];
        _this._scheduler = null;
        _this._scheduler = scheduler;
        return _this;
    }
    MockObserver.create = function (scheduler) {
        var obj = new this(scheduler);
        return obj;
    };
    Object.defineProperty(MockObserver.prototype, "messages", {
        get: function () {
            return this._messages;
        },
        set: function (messages) {
            this._messages = messages;
        },
        enumerable: true,
        configurable: true
    });
    MockObserver.prototype.onNext = function (value) {
        var record = null;
        if (JudgeUtils$$1.isDirectObject(value)) {
            record = Record.create(this._scheduler.clock, value, ActionType.NEXT, function (a, b) {
                var result = true;
                for (var i in a) {
                    if (a.hasOwnProperty(i)) {
                        if (a[i] !== b[i]) {
                            result = false;
                            break;
                        }
                    }
                }
                return result;
            });
        }
        else {
            record = Record.create(this._scheduler.clock, value, ActionType.NEXT);
        }
        this._messages.push(record);
    };
    MockObserver.prototype.onError = function (error) {
        this._messages.push(Record.create(this._scheduler.clock, error, ActionType.ERROR));
    };
    MockObserver.prototype.onCompleted = function () {
        this._messages.push(Record.create(this._scheduler.clock, null, ActionType.COMPLETED));
    };
    MockObserver.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._scheduler.remove(this);
    };
    MockObserver.prototype.clone = function () {
        var result = MockObserver.create(this._scheduler);
        result.messages = this._messages;
        return result;
    };
    return MockObserver;
}(Observer));

var MockPromise = (function () {
    function MockPromise(scheduler, messages) {
        this._messages = [];
        this._scheduler = null;
        this._scheduler = scheduler;
        this._messages = messages;
    }
    MockPromise.create = function (scheduler, messages) {
        var obj = new this(scheduler, messages);
        return obj;
    };
    MockPromise.prototype.then = function (successCb, errorCb, observer) {
        this._scheduler.setStreamMap(observer, this._messages);
    };
    return MockPromise;
}());

var Hash = (function () {
    function Hash(children) {
        if (children === void 0) { children = {}; }
        this._children = null;
        this._children = children;
    }
    Hash.create = function (children) {
        if (children === void 0) { children = {}; }
        var obj = new this(children);
        return obj;
    };
    Hash.prototype.getChildren = function () {
        return this._children;
    };
    Hash.prototype.getCount = function () {
        var result = 0, children = this._children, key = null;
        for (key in children) {
            if (children.hasOwnProperty(key)) {
                result++;
            }
        }
        return result;
    };
    Hash.prototype.getKeys = function () {
        var result = Collection.create(), children = this._children, key = null;
        for (key in children) {
            if (children.hasOwnProperty(key)) {
                result.addChild(key);
            }
        }
        return result;
    };
    Hash.prototype.getValues = function () {
        var result = Collection.create(), children = this._children, key = null;
        for (key in children) {
            if (children.hasOwnProperty(key)) {
                result.addChild(children[key]);
            }
        }
        return result;
    };
    Hash.prototype.getChild = function (key) {
        return this._children[key];
    };
    Hash.prototype.setValue = function (key, value) {
        this._children[key] = value;
        return this;
    };
    Hash.prototype.addChild = function (key, value) {
        this._children[key] = value;
        return this;
    };
    Hash.prototype.addChildren = function (arg) {
        var i = null, children = null;
        if (arg instanceof Hash) {
            children = arg.getChildren();
        }
        else {
            children = arg;
        }
        for (i in children) {
            if (children.hasOwnProperty(i)) {
                this.addChild(i, children[i]);
            }
        }
        return this;
    };
    Hash.prototype.appendChild = function (key, value) {
        if (this._children[key] instanceof Collection) {
            var c = (this._children[key]);
            c.addChild(value);
        }
        else {
            this._children[key] = (Collection.create().addChild(value));
        }
        return this;
    };
    Hash.prototype.setChildren = function (children) {
        this._children = children;
    };
    Hash.prototype.removeChild = function (arg) {
        var result = [];
        if (JudgeUtils$1.isString(arg)) {
            var key = arg;
            result.push(this._children[key]);
            this._children[key] = void 0;
            delete this._children[key];
        }
        else if (JudgeUtils$1.isFunction(arg)) {
            var func_1 = arg, self_1 = this;
            this.forEach(function (val, key) {
                if (func_1(val, key)) {
                    result.push(self_1._children[key]);
                    self_1._children[key] = void 0;
                    delete self_1._children[key];
                }
            });
        }
        return Collection.create(result);
    };
    Hash.prototype.removeAllChildren = function () {
        this._children = {};
    };
    Hash.prototype.hasChild = function (key) {
        return this._children[key] !== void 0;
    };
    Hash.prototype.hasChildWithFunc = function (func) {
        var result = false;
        this.forEach(function (val, key) {
            if (func(val, key)) {
                result = true;
                return $BREAK;
            }
        });
        return result;
    };
    Hash.prototype.forEach = function (func, context) {
        var children = this._children;
        for (var i in children) {
            if (children.hasOwnProperty(i)) {
                if (func.call(context, children[i], i) === $BREAK) {
                    break;
                }
            }
        }
        return this;
    };
    Hash.prototype.filter = function (func) {
        var result = {}, children = this._children, value = null;
        for (var key in children) {
            if (children.hasOwnProperty(key)) {
                value = children[key];
                if (func.call(children, value, key)) {
                    result[key] = value;
                }
            }
        }
        return Hash.create(result);
    };
    Hash.prototype.findOne = function (func) {
        var result = [], self = this, scope = this._children;
        this.forEach(function (val, key) {
            if (!func.call(scope, val, key)) {
                return;
            }
            result = [key, self.getChild(key)];
            return $BREAK;
        });
        return result;
    };
    Hash.prototype.map = function (func) {
        var resultMap = {};
        this.forEach(function (val, key) {
            var result = func(val, key);
            if (result !== $REMOVE) {
                Log.error(!JudgeUtils$1.isArray(result) || result.length !== 2, Log.info.FUNC_MUST_BE("iterator", "[key, value]"));
                resultMap[result[0]] = result[1];
            }
        });
        return Hash.create(resultMap);
    };
    Hash.prototype.toCollection = function () {
        var result = Collection.create();
        this.forEach(function (val, key) {
            if (val instanceof Collection) {
                result.addChildren(val);
            }
            else {
                result.addChild(val);
            }
        });
        return result;
    };
    Hash.prototype.toArray = function () {
        var result = [];
        this.forEach(function (val, key) {
            if (val instanceof Collection) {
                result = result.concat(val.getChildren());
            }
            else {
                result.push(val);
            }
        });
        return result;
    };
    Hash.prototype.clone = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var target = null, isDeep = null;
        if (args.length === 0) {
            isDeep = false;
            target = Hash.create();
        }
        else if (args.length === 1) {
            if (JudgeUtils$1.isBoolean(args[0])) {
                target = Hash.create();
                isDeep = args[0];
            }
            else {
                target = args[0];
                isDeep = false;
            }
        }
        else {
            target = args[0];
            isDeep = args[1];
        }
        if (isDeep === true) {
            target.setChildren(ExtendUtils.extendDeep(this._children));
        }
        else {
            target.setChildren(ExtendUtils.extend({}, this._children));
        }
        return target;
    };
    return Hash;
}());

var TestStream = (function (_super) {
    __extends(TestStream, _super);
    function TestStream(messages, scheduler) {
        var _this = _super.call(this, null) || this;
        _this.scheduler = null;
        _this._messages = null;
        _this._messages = messages;
        _this.scheduler = scheduler;
        return _this;
    }
    TestStream.create = function (messages, scheduler) {
        var obj = new this(messages, scheduler);
        return obj;
    };
    TestStream.prototype.subscribeCore = function (observer) {
        this.scheduler.setStreamMap(observer, this._messages);
        return SingleDisposable.create();
    };
    return TestStream;
}(BaseStream));

var SUBSCRIBE_TIME = 200;
var DISPOSE_TIME = 1000;
var TestScheduler = (function (_super) {
    __extends(TestScheduler, _super);
    function TestScheduler(isReset) {
        var _this = _super.call(this) || this;
        _this._clock = null;
        _this._isReset = false;
        _this._isDisposed = false;
        _this._timerMap = Hash.create();
        _this._streamMap = Hash.create();
        _this._subscribedTime = null;
        _this._disposedTime = null;
        _this._observer = null;
        _this._isReset = isReset;
        return _this;
    }
    TestScheduler.next = function (tick, value) {
        if (JudgeUtils$$1.isDirectObject(value)) {
            return Record.create(tick, value, ActionType.NEXT, function (a, b) {
                var result = true;
                for (var i in a) {
                    if (a.hasOwnProperty(i)) {
                        if (a[i] !== b[i]) {
                            result = false;
                            break;
                        }
                    }
                }
                return result;
            });
        }
        else {
            return Record.create(tick, value, ActionType.NEXT);
        }
    };
    TestScheduler.error = function (tick, error) {
        return Record.create(tick, error, ActionType.ERROR);
    };
    TestScheduler.completed = function (tick) {
        return Record.create(tick, null, ActionType.COMPLETED);
    };
    TestScheduler.create = function (isReset) {
        if (isReset === void 0) { isReset = false; }
        var obj = new this(isReset);
        return obj;
    };
    Object.defineProperty(TestScheduler.prototype, "clock", {
        get: function () {
            return this._clock;
        },
        set: function (clock) {
            this._clock = clock;
        },
        enumerable: true,
        configurable: true
    });
    TestScheduler.prototype.setStreamMap = function (observer, messages) {
        var self = this;
        messages.forEach(function (record) {
            var func = null;
            switch (record.actionType) {
                case ActionType.NEXT:
                    func = function () {
                        observer.next(record.value);
                    };
                    break;
                case ActionType.ERROR:
                    func = function () {
                        observer.error(record.value);
                    };
                    break;
                case ActionType.COMPLETED:
                    func = function () {
                        observer.completed();
                    };
                    break;
                default:
                    Log.error(true, Log.info.FUNC_UNKNOW("actionType"));
                    break;
            }
            self._streamMap.addChild(String(record.time), func);
        });
    };
    TestScheduler.prototype.remove = function (observer) {
        this._isDisposed = true;
    };
    TestScheduler.prototype.publishRecursive = function (observer, initial, recursiveFunc) {
        var self = this, next = null, completed = null;
        this._setClock();
        next = observer.next;
        completed = observer.completed;
        observer.next = function (value) {
            next.call(observer, value);
            self._tick(1);
        };
        observer.completed = function () {
            completed.call(observer);
            self._tick(1);
        };
        recursiveFunc(initial);
    };
    TestScheduler.prototype.publishInterval = function (observer, initial, interval, action) {
        var COUNT = 10, messages = [];
        this._setClock();
        while (COUNT > 0 && !this._isDisposed) {
            this._tick(interval);
            messages.push(TestScheduler.next(this._clock, initial));
            initial++;
            COUNT--;
        }
        this.setStreamMap(observer, messages);
        return NaN;
    };
    TestScheduler.prototype.publishIntervalRequest = function (observer, action) {
        var COUNT = 10, messages = [], interval = 100, num = 0;
        this._setClock();
        while (COUNT > 0 && !this._isDisposed) {
            this._tick(interval);
            messages.push(TestScheduler.next(this._clock, num));
            num++;
            COUNT--;
        }
        this.setStreamMap(observer, messages);
        return NaN;
    };
    TestScheduler.prototype.publishTimeout = function (observer, time, action) {
        var messages = [];
        this._setClock();
        this._tick(time);
        messages.push(TestScheduler.next(this._clock, time), TestScheduler.completed(this._clock + 1));
        this.setStreamMap(observer, messages);
        return NaN;
    };
    TestScheduler.prototype._setClock = function () {
        if (this._isReset) {
            this._clock = this._subscribedTime;
        }
    };
    TestScheduler.prototype.startWithTime = function (create, subscribedTime, disposedTime) {
        var observer = this.createObserver(), source, subscription, self = this;
        this._subscribedTime = subscribedTime;
        this._disposedTime = disposedTime;
        this._clock = subscribedTime;
        this._runAt(subscribedTime, function () {
            source = create();
            subscription = source.subscribe(observer);
        });
        this._runAt(disposedTime, function () {
            subscription.dispose();
            self._isDisposed = true;
        });
        this._observer = observer;
        this.start();
        return observer;
    };
    TestScheduler.prototype.startWithSubscribe = function (create, subscribedTime) {
        if (subscribedTime === void 0) { subscribedTime = SUBSCRIBE_TIME; }
        return this.startWithTime(create, subscribedTime, DISPOSE_TIME);
    };
    TestScheduler.prototype.startWithDispose = function (create, disposedTime) {
        if (disposedTime === void 0) { disposedTime = DISPOSE_TIME; }
        return this.startWithTime(create, SUBSCRIBE_TIME, disposedTime);
    };
    TestScheduler.prototype.publicAbsolute = function (time, handler) {
        this._runAt(time, function () {
            handler();
        });
    };
    TestScheduler.prototype.start = function () {
        var extremeNumArr = this._getMinAndMaxTime(), min = extremeNumArr[0], max = extremeNumArr[1], time = min;
        while (time <= max) {
            this._clock = time;
            this._exec(time, this._timerMap);
            this._clock = time;
            this._runStream(time);
            time++;
            max = this._getMinAndMaxTime()[1];
        }
    };
    TestScheduler.prototype.createStream = function (args) {
        return TestStream.create(Array.prototype.slice.call(arguments, 0), this);
    };
    TestScheduler.prototype.createObserver = function () {
        return MockObserver.create(this);
    };
    TestScheduler.prototype.createResolvedPromise = function (time, value) {
        return MockPromise.create(this, [TestScheduler.next(time, value), TestScheduler.completed(time + 1)]);
    };
    TestScheduler.prototype.createRejectPromise = function (time, error) {
        return MockPromise.create(this, [TestScheduler.error(time, error)]);
    };
    TestScheduler.prototype._getMinAndMaxTime = function () {
        var timeArr = (this._timerMap.getKeys().addChildren(this._streamMap.getKeys()));
        timeArr = timeArr.map(function (key) {
            return Number(key);
        }).toArray();
        return [Math.min.apply(Math, timeArr), Math.max.apply(Math, timeArr)];
    };
    TestScheduler.prototype._exec = function (time, map) {
        var handler = map.getChild(String(time));
        if (handler) {
            handler();
        }
    };
    TestScheduler.prototype._runStream = function (time) {
        var handler = this._streamMap.getChild(String(time));
        if (handler) {
            handler();
        }
    };
    TestScheduler.prototype._runAt = function (time, callback) {
        this._timerMap.addChild(String(time), callback);
    };
    TestScheduler.prototype._tick = function (time) {
        this._clock += time;
    };
    return TestScheduler;
}(Scheduler));

root$1.requestNextAnimationFrame = (function () {
    var originalRequestAnimationFrame = undefined, wrapper = undefined, callback = undefined, geckoVersion = null, userAgent = root$1.navigator && root$1.navigator.userAgent, index = 0, self = this;
    wrapper = function (time) {
        time = root$1.performance.now();
        self.callback(time);
    };
    if (root$1.requestAnimationFrame) {
        return requestAnimationFrame;
    }
    if (root$1.webkitRequestAnimationFrame) {
        originalRequestAnimationFrame = root$1.webkitRequestAnimationFrame;
        root$1.webkitRequestAnimationFrame = function (callback, element) {
            self.callback = callback;
            return originalRequestAnimationFrame(wrapper, element);
        };
    }
    if (root$1.msRequestAnimationFrame) {
        originalRequestAnimationFrame = root$1.msRequestAnimationFrame;
        root$1.msRequestAnimationFrame = function (callback) {
            self.callback = callback;
            return originalRequestAnimationFrame(wrapper);
        };
    }
    if (root$1.mozRequestAnimationFrame) {
        index = userAgent.indexOf('rv:');
        if (userAgent.indexOf('Gecko') != -1) {
            geckoVersion = userAgent.substr(index + 3, 3);
            if (geckoVersion === '2.0') {
                root$1.mozRequestAnimationFrame = undefined;
            }
        }
    }
    return root$1.webkitRequestAnimationFrame ||
        root$1.mozRequestAnimationFrame ||
        root$1.oRequestAnimationFrame ||
        root$1.msRequestAnimationFrame ||
        function (callback, element) {
            var start, finish;
            root$1.setTimeout(function () {
                start = root$1.performance.now();
                callback(start);
                finish = root$1.performance.now();
                self.timeout = 1000 / 60 - (finish - start);
            }, self.timeout);
        };
}());
root$1.cancelNextRequestAnimationFrame = root$1.cancelRequestAnimationFrame
    || root$1.webkitCancelAnimationFrame
    || root$1.webkitCancelRequestAnimationFrame
    || root$1.mozCancelRequestAnimationFrame
    || root$1.oCancelRequestAnimationFrame
    || root$1.msCancelRequestAnimationFrame
    || clearTimeout;

export { JudgeUtils$$1 as JudgeUtils, fromNodeCallback, fromStream, fromReadableStream, fromWritableStream, fromTransformStream, Entity, Main, Observer, Scheduler, Stream, assert, requireCheck, ensure, requireGetter, requireSetter, ensureGetter, ensureSetter, invariant, GroupDisposable, InnerSubscription, InnerSubscriptionGroup, SingleDisposable, FilterState, createStream, fromArray, fromPromise, fromEventPattern, interval, intervalRequest, timeout, empty, callFunc, judge, defer, just, root$1 as root, AnonymousObserver, AutoDetachObserver, ConcatObserver, DoObserver, FilterObserver, FilterWithStateObserver, IgnoreElementsObserver, MapObserver, MergeAllObserver, MergeObserver, SkipUntilOtherObserver, SkipUntilSourceObserver, SubjectObserver, TakeUntilObserver, AnonymousStream, BaseStream, ConcatStream, DeferStream, DoStream, FilterStream, FilterWithStateStream, FromArrayStream, FromEventPatternStream, FromPromiseStream, IgnoreElementsStream, IntervalRequestStream, IntervalStream, MapStream, MergeAllStream, MergeStream, RepeatStream, SkipUntilStream, TakeUntilStream, TimeoutStream, GeneratorSubject, Subject, ActionType, MockObserver, MockPromise, Record, TestScheduler, TestStream };
//# sourceMappingURL=wdFrp.module.js.map
