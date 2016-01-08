module wdFrp {
    export var fromNodeCallback = (func:Function, context?:any) => {
        return (...funcArgs) => {
            return createStream((observer:IObserver) => {
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

    export var fromStream = (stream:any, finishEventName:string = "end") => {
        stream.pause();

        return wdFrp.createStream((observer) => {
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

            stream.resume();

            return () => {
                stream.removeListener("data", dataHandler);
                stream.removeListener("error", errorHandler);
                stream.removeListener(finishEventName, endHandler);
            };
        });
    };

    export var fromReadableStream = (stream:any) => {
        return fromStream(stream, "end");
    };

    export var fromWritableStream = (stream:any) => {
        return fromStream(stream, "finish");
    };

    export var fromTransformStream = (stream:any) => {
        return fromStream(stream, "finish");
    };
}

