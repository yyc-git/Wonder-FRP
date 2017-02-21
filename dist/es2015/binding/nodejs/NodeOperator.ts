import { createStream} from "../../global/Operator";
import { IObserver } from "../../observer/IObserver";
import { AnonymousStream } from "../../stream/AnonymousStream";

export var fromNodeCallback = (func: Function, context?: any) => {
    return (...funcArgs) => {
        return createStream((observer: IObserver) => {
            var hander = (err, ...args) => {
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
    }
};

/*!
 //todo has bug! need fix
 refer to rx-node:(need add .publish(), .refCount() methods!)
 https://github.com/Reactive-Extensions/rx-node/blob/master/index.js
 */
export var fromStream = (stream: any, finishEventName: string = "end") => {
    if (stream.pause) {
        stream.pause();
    }

    return createStream((observer) => {
        var dataHandler = (data) => {
                observer.next(data);
            },
            errorHandler = (err) => {
                observer.error(err);
            },
            endHandler = () => {
                observer.completed();
            };

        stream.addListener("data", dataHandler);
        stream.addListener("error", errorHandler);
        stream.addListener(finishEventName, endHandler);

        if (stream.resume) {
            stream.resume();
        }

        return () => {
            stream.removeListener("data", dataHandler);
            stream.removeListener("error", errorHandler);
            stream.removeListener(finishEventName, endHandler);
        };
    });
};

export var fromReadableStream = (stream: any) => {
    return fromStream(stream, "end");
};

export var fromWritableStream = (stream: any) => {
    return fromStream(stream, "finish");
};

export var fromTransformStream = (stream: any) => {
    return fromStream(stream, "finish");
};