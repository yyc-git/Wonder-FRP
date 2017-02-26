"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Operator_1 = require("../../global/Operator");
exports.fromNodeCallback = function (func, context) {
    return function () {
        var funcArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            funcArgs[_i] = arguments[_i];
        }
        return Operator_1.createStream(function (observer) {
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
exports.fromStream = function (stream, finishEventName) {
    if (finishEventName === void 0) { finishEventName = "end"; }
    if (stream.pause) {
        stream.pause();
    }
    return Operator_1.createStream(function (observer) {
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
exports.fromReadableStream = function (stream) {
    return exports.fromStream(stream, "end");
};
exports.fromWritableStream = function (stream) {
    return exports.fromStream(stream, "finish");
};
exports.fromTransformStream = function (stream) {
    return exports.fromStream(stream, "finish");
};
//# sourceMappingURL=NodeOperator.js.map