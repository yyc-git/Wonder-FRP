"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Log_1 = require("wonder-commonlib/dist/commonjs/Log");
var Main_1 = require("../../../core/Main");
function assert(cond, message) {
    if (message === void 0) { message = "contract error"; }
    Log_1.Log.error(!cond, message);
}
exports.assert = assert;
function requireCheck(InFunc) {
    return function (target, name, descriptor) {
        var value = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (Main_1.Main.isTest) {
                InFunc.apply(this, args);
            }
            return value.apply(this, args);
        };
        return descriptor;
    };
}
exports.requireCheck = requireCheck;
function ensure(OutFunc) {
    return function (target, name, descriptor) {
        var value = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var result = value.apply(this, args), params = [result].concat(args);
            if (Main_1.Main.isTest) {
                OutFunc.apply(this, params);
            }
            return result;
        };
        return descriptor;
    };
}
exports.ensure = ensure;
function requireGetter(InFunc) {
    return function (target, name, descriptor) {
        var getter = descriptor.get;
        descriptor.get = function () {
            if (Main_1.Main.isTest) {
                InFunc.call(this);
            }
            return getter.call(this);
        };
        return descriptor;
    };
}
exports.requireGetter = requireGetter;
function requireSetter(InFunc) {
    return function (target, name, descriptor) {
        var setter = descriptor.set;
        descriptor.set = function (val) {
            if (Main_1.Main.isTest) {
                InFunc.call(this, val);
            }
            setter.call(this, val);
        };
        return descriptor;
    };
}
exports.requireSetter = requireSetter;
function ensureGetter(OutFunc) {
    return function (target, name, descriptor) {
        var getter = descriptor.get;
        descriptor.get = function () {
            var result = getter.call(this);
            if (Main_1.Main.isTest) {
                OutFunc.call(this, result);
            }
            return result;
        };
        return descriptor;
    };
}
exports.ensureGetter = ensureGetter;
function ensureSetter(OutFunc) {
    return function (target, name, descriptor) {
        var setter = descriptor.set;
        descriptor.set = function (val) {
            var result = setter.call(this, val), params = [result, val];
            if (Main_1.Main.isTest) {
                OutFunc.apply(this, params);
            }
        };
        return descriptor;
    };
}
exports.ensureSetter = ensureSetter;
function invariant(func) {
    return function (target) {
        if (Main_1.Main.isTest) {
            func(target);
        }
    };
}
exports.invariant = invariant;
//# sourceMappingURL=contract.js.map