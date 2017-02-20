import { createStream } from "../../global/Operator";
export var fromNodeCallback = function (func, context) {
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
export var fromStream = function (stream, finishEventName) {
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
export var fromReadableStream = function (stream) {
    return fromStream(stream, "end");
};
export var fromWritableStream = function (stream) {
    return fromStream(stream, "finish");
};
export var fromTransformStream = function (stream) {
    return fromStream(stream, "finish");
};
//# sourceMappingURL=NodeOperator.js.map