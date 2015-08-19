var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var JudgeUtils = (function (_super) {
        __extends(JudgeUtils, _super);
        function JudgeUtils() {
            _super.apply(this, arguments);
        }
        JudgeUtils.isPromise = function (obj) {
            return !!obj
                && !_super.isFunction.call(this, obj.subscribe)
                && _super.isFunction.call(this, obj.then);
        };
        JudgeUtils.isEqual = function (ob1, ob2) {
            return ob1.uid === ob2.uid;
        };
        return JudgeUtils;
    })(dyCb.JudgeUtils);
    dyRt.JudgeUtils = JudgeUtils;
})(dyRt || (dyRt = {}));


var dyRt;
(function (dyRt) {
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
        Entity.UID = 1;
        return Entity;
    })();
    dyRt.Entity = Entity;
})(dyRt || (dyRt = {}));





var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var Disposer = (function (_super) {
        __extends(Disposer, _super);
        function Disposer() {
            _super.apply(this, arguments);
        }
        Disposer.addDisposeHandler = function (func) {
            this._disposeHandler.addChild(func);
        };
        Disposer.getDisposeHandler = function () {
            return this._disposeHandler.copy();
        };
        Disposer.removeAllDisposeHandler = function () {
            this._disposeHandler.removeAllChildren();
        };
        //private static _disposeHandler:dyCb.Stack<Function> = dyCb.Stack.create<Function>();
        Disposer._disposeHandler = dyCb.Collection.create();
        return Disposer;
    })(dyRt.Entity);
    dyRt.Disposer = Disposer;
})(dyRt || (dyRt = {}));


var dyRt;
(function (dyRt) {
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
    })();
    dyRt.InnerSubscription = InnerSubscription;
})(dyRt || (dyRt = {}));


var dyRt;
(function (dyRt) {
    var InnerSubscriptionGroup = (function () {
        function InnerSubscriptionGroup() {
            this._container = dyCb.Collection.create();
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
    })();
    dyRt.InnerSubscriptionGroup = InnerSubscriptionGroup;
})(dyRt || (dyRt = {}));

var dyRt;
(function (dyRt) {
    dyRt.root = window;
})(dyRt || (dyRt = {}));

var dyRt;
(function (dyRt) {
    dyRt.ABSTRACT_METHOD = function () {
        return new Error("abstract method need override");
    }, dyRt.ABSTRACT_ATTRIBUTE = null;
})(dyRt || (dyRt = {}));


var dyRt;
(function (dyRt) {
    //not swallow the error
    if (window.RSVP) {
        window.RSVP.onerror = function (e) {
            throw e;
        };
        window.RSVP.on('error', window.RSVP.onerror);
    }
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var Stream = (function (_super) {
        __extends(Stream, _super);
        function Stream(subscribeFunc) {
            _super.call(this, "Stream");
            this.scheduler = dyRt.ABSTRACT_ATTRIBUTE;
            this.subscribeFunc = null;
            this.subscribeFunc = subscribeFunc || function () { };
        }
        Stream.prototype.subscribe = function (arg1, onError, onCompleted) {
            throw dyRt.ABSTRACT_METHOD();
        };
        Stream.prototype.buildStream = function (observer) {
            this.subscribeFunc(observer);
        };
        Stream.prototype.do = function (onNext, onError, onCompleted) {
            return dyRt.DoStream.create(this, onNext, onError, onCompleted);
        };
        Stream.prototype.map = function (selector) {
            return dyRt.MapStream.create(this, selector);
        };
        Stream.prototype.flatMap = function (selector) {
            return this.map(selector).mergeAll();
        };
        Stream.prototype.mergeAll = function () {
            return dyRt.MergeAllStream.create(this);
        };
        Stream.prototype.takeUntil = function (otherStream) {
            return dyRt.TakeUntilStream.create(this, otherStream);
        };
        Stream.prototype.concat = function () {
            var args = null;
            if (dyRt.JudgeUtils.isArray(arguments[0])) {
                args = arguments[0];
            }
            else {
                args = Array.prototype.slice.call(arguments, 0);
            }
            args.unshift(this);
            return dyRt.ConcatStream.create(args);
        };
        Stream.prototype.merge = function () {
            var args = null, stream = null;
            if (dyRt.JudgeUtils.isArray(arguments[0])) {
                args = arguments[0];
            }
            else {
                args = Array.prototype.slice.call(arguments, 0);
            }
            args.unshift(this);
            stream = dyRt.fromArray(args).mergeAll();
            return stream;
        };
        Stream.prototype.repeat = function (count) {
            if (count === void 0) { count = -1; }
            return dyRt.RepeatStream.create(this, count);
        };
        Stream.prototype.ignoreElements = function () {
            return dyRt.IgnoreElementsStream.create(this);
        };
        Stream.prototype.handleSubject = function (arg) {
            if (this._isSubject(arg)) {
                this._setSubject(arg);
                return true;
            }
            return false;
        };
        Stream.prototype._isSubject = function (subject) {
            return subject instanceof dyRt.Subject;
        };
        Stream.prototype._setSubject = function (subject) {
            subject.source = this;
        };
        return Stream;
    })(dyRt.Disposer);
    dyRt.Stream = Stream;
})(dyRt || (dyRt = {}));


var dyRt;
(function (dyRt) {
    dyRt.root.requestNextAnimationFrame = (function () {
        var originalRequestAnimationFrame = undefined, wrapper = undefined, callback = undefined, geckoVersion = null, userAgent = navigator.userAgent, index = 0, self = this;
        wrapper = function (time) {
            time = performance.now();
            self.callback(time);
        };
        /*!
         bug!
         below code:
         when invoke b after 1s, will only invoke b, not invoke a!

         function a(time){
         console.log("a", time);
         webkitRequestAnimationFrame(a);
         }

         function b(time){
         console.log("b", time);
         webkitRequestAnimationFrame(b);
         }

         a();

         setTimeout(b, 1000);



         so use requestAnimationFrame priority!
         */
        if (dyRt.root.requestAnimationFrame) {
            return requestAnimationFrame;
        }
        // Workaround for Chrome 10 bug where Chrome
        // does not pass the time to the animation function
        if (dyRt.root.webkitRequestAnimationFrame) {
            // Define the wrapper
            // Make the switch
            originalRequestAnimationFrame = dyRt.root.webkitRequestAnimationFrame;
            dyRt.root.webkitRequestAnimationFrame = function (callback, element) {
                self.callback = callback;
                // Browser calls the wrapper and wrapper calls the callback
                return originalRequestAnimationFrame(wrapper, element);
            };
        }
        //修改time参数
        if (dyRt.root.msRequestAnimationFrame) {
            originalRequestAnimationFrame = dyRt.root.msRequestAnimationFrame;
            dyRt.root.msRequestAnimationFrame = function (callback) {
                self.callback = callback;
                return originalRequestAnimationFrame(wrapper);
            };
        }
        // Workaround for Gecko 2.0, which has a bug in
        // mozRequestAnimationFrame() that restricts animations
        // to 30-40 fps.
        if (dyRt.root.mozRequestAnimationFrame) {
            // Check the Gecko version. Gecko is used by browsers
            // other than Firefox. Gecko 2.0 corresponds to
            // Firefox 4.0.
            index = userAgent.indexOf('rv:');
            if (userAgent.indexOf('Gecko') != -1) {
                geckoVersion = userAgent.substr(index + 3, 3);
                if (geckoVersion === '2.0') {
                    // Forces the return statement to fall through
                    // to the setTimeout() function.
                    dyRt.root.mozRequestAnimationFrame = undefined;
                }
            }
        }
        return dyRt.root.webkitRequestAnimationFrame ||
            dyRt.root.mozRequestAnimationFrame ||
            dyRt.root.oRequestAnimationFrame ||
            dyRt.root.msRequestAnimationFrame ||
            function (callback, element) {
                var start, finish;
                dyRt.root.setTimeout(function () {
                    start = performance.now();
                    callback(start);
                    finish = performance.now();
                    self.timeout = 1000 / 60 - (finish - start);
                }, self.timeout);
            };
    }());
    dyRt.root.cancelNextRequestAnimationFrame = dyRt.root.cancelRequestAnimationFrame
        || dyRt.root.webkitCancelAnimationFrame
        || dyRt.root.webkitCancelRequestAnimationFrame
        || dyRt.root.mozCancelRequestAnimationFrame
        || dyRt.root.oCancelRequestAnimationFrame
        || dyRt.root.msCancelRequestAnimationFrame
        || clearTimeout;
    var Scheduler = (function () {
        function Scheduler() {
            this._requestLoopId = null;
        }
        //todo remove "...args"
        Scheduler.create = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
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
        //observer is for TestScheduler to rewrite
        Scheduler.prototype.publishRecursive = function (observer, initial, action) {
            action(initial);
        };
        Scheduler.prototype.publishInterval = function (observer, initial, interval, action) {
            return dyRt.root.setInterval(function () {
                initial = action(initial);
            }, interval);
        };
        Scheduler.prototype.publishIntervalRequest = function (observer, action) {
            var self = this, loop = function (time) {
                action(time);
                self._requestLoopId = dyRt.root.requestNextAnimationFrame(loop);
            };
            this._requestLoopId = dyRt.root.requestNextAnimationFrame(loop);
        };
        return Scheduler;
    })();
    dyRt.Scheduler = Scheduler;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var Observer = (function (_super) {
        __extends(Observer, _super);
        function Observer(onNext, onError, onCompleted) {
            _super.call(this, "Observer");
            this._isDisposed = null;
            this.onUserNext = null;
            this.onUserError = null;
            this.onUserCompleted = null;
            this._isStop = false;
            this._disposeHandler = dyCb.Collection.create();
            this.onUserNext = onNext || function () { };
            this.onUserError = onError || function (e) {
                throw e;
            };
            this.onUserCompleted = onCompleted || function () { };
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
            this._disposeHandler.forEach(function (handler) {
                handler();
            });
        };
        //public fail(e) {
        //    if (!this._isStop) {
        //        this._isStop = true;
        //        this.error(e);
        //        return true;
        //    }
        //
        //    return false;
        //}
        Observer.prototype.setDisposeHandler = function (disposeHandler) {
            this._disposeHandler = disposeHandler;
        };
        Observer.prototype.onNext = function (value) {
            throw dyRt.ABSTRACT_METHOD();
        };
        Observer.prototype.onError = function (error) {
            throw dyRt.ABSTRACT_METHOD();
        };
        Observer.prototype.onCompleted = function () {
            throw dyRt.ABSTRACT_METHOD();
        };
        return Observer;
    })(dyRt.Entity);
    dyRt.Observer = Observer;
})(dyRt || (dyRt = {}));


var dyRt;
(function (dyRt) {
    var Subject = (function () {
        function Subject() {
            this._source = null;
            this._observer = new dyRt.SubjectObserver();
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
            var observer = arg1 instanceof dyRt.Observer
                ? arg1
                : dyRt.AutoDetachObserver.create(arg1, onError, onCompleted);
            //this._source && observer.setDisposeHandler(this._source.disposeHandler);
            this._observer.addChild(observer);
            return dyRt.InnerSubscription.create(this, observer);
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
            this._source.buildStream(this);
            this._observer.setDisposeHandler();
        };
        Subject.prototype.remove = function (observer) {
            this._observer.removeChild(observer);
        };
        Subject.prototype.dispose = function () {
            this._observer.dispose();
        };
        return Subject;
    })();
    dyRt.Subject = Subject;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var GeneratorSubject = (function (_super) {
        __extends(GeneratorSubject, _super);
        function GeneratorSubject() {
            _super.call(this, "GeneratorSubject");
            this._isStart = false;
            this.observer = new dyRt.SubjectObserver();
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
        /*!
        outer hook method
         */
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
            var observer = arg1 instanceof dyRt.Observer
                ? arg1
                : dyRt.AutoDetachObserver.create(arg1, onError, onCompleted);
            this.observer.addChild(observer);
            return dyRt.InnerSubscription.create(this, observer);
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
            stream = dyRt.AnonymousStream.create(function (observer) {
                self.subscribe(observer);
            });
            return stream;
        };
        GeneratorSubject.prototype.start = function () {
            this._isStart = true;
            this._setDisposeHandler();
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
        GeneratorSubject.prototype._setDisposeHandler = function () {
            var self = this;
            dyRt.Disposer.addDisposeHandler(function () {
                self.dispose();
            });
            this.observer.setDisposeHandler();
        };
        return GeneratorSubject;
    })(dyRt.Disposer);
    dyRt.GeneratorSubject = GeneratorSubject;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var AnonymousObserver = (function (_super) {
        __extends(AnonymousObserver, _super);
        function AnonymousObserver() {
            _super.apply(this, arguments);
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
    })(dyRt.Observer);
    dyRt.AnonymousObserver = AnonymousObserver;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var AutoDetachObserver = (function (_super) {
        __extends(AutoDetachObserver, _super);
        function AutoDetachObserver() {
            _super.apply(this, arguments);
        }
        AutoDetachObserver.create = function (onNext, onError, onCompleted) {
            return new this(onNext, onError, onCompleted);
        };
        AutoDetachObserver.prototype.dispose = function () {
            if (this.isDisposed) {
                dyCb.Log.log("only can dispose once");
                return;
            }
            _super.prototype.dispose.call(this);
        };
        AutoDetachObserver.prototype.onNext = function (value) {
            try {
                this.onUserNext(value);
            }
            catch (e) {
                this.error(e);
            }
        };
        AutoDetachObserver.prototype.onError = function (err) {
            try {
                this.onUserError(err);
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
                //this.error(e);
                throw e;
            }
        };
        return AutoDetachObserver;
    })(dyRt.Observer);
    dyRt.AutoDetachObserver = AutoDetachObserver;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var MapObserver = (function (_super) {
        __extends(MapObserver, _super);
        function MapObserver(currentObserver, selector) {
            _super.call(this, null, null, null);
            this._currentObserver = null;
            this._selector = null;
            this._currentObserver = currentObserver;
            this._selector = selector;
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
    })(dyRt.Observer);
    dyRt.MapObserver = MapObserver;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var DoObserver = (function (_super) {
        __extends(DoObserver, _super);
        function DoObserver(currentObserver, prevObserver) {
            _super.call(this, null, null, null);
            this._currentObserver = null;
            this._prevObserver = null;
            this._currentObserver = currentObserver;
            this._prevObserver = prevObserver;
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
    })(dyRt.Observer);
    dyRt.DoObserver = DoObserver;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var MergeAllObserver = (function (_super) {
        __extends(MergeAllObserver, _super);
        function MergeAllObserver(currentObserver, streamGroup) {
            _super.call(this, null, null, null);
            this._currentObserver = null;
            this._streamGroup = null;
            this._done = false;
            this._currentObserver = currentObserver;
            this._streamGroup = streamGroup;
        }
        MergeAllObserver.create = function (currentObserver, streamGroup) {
            return new this(currentObserver, streamGroup);
        };
        Object.defineProperty(MergeAllObserver.prototype, "currentObserver", {
            get: function () {
                return this._currentObserver;
            },
            set: function (currentObserver) {
                this._currentObserver = currentObserver;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MergeAllObserver.prototype, "done", {
            get: function () {
                return this._done;
            },
            set: function (done) {
                this._done = done;
            },
            enumerable: true,
            configurable: true
        });
        MergeAllObserver.prototype.onNext = function (innerSource) {
            dyCb.Log.error(!(innerSource instanceof dyRt.Stream || dyRt.JudgeUtils.isPromise(innerSource)), dyCb.Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));
            if (dyRt.JudgeUtils.isPromise(innerSource)) {
                innerSource = dyRt.fromPromise(innerSource);
            }
            this._streamGroup.addChild(innerSource);
            innerSource.buildStream(InnerObserver.create(this, this._streamGroup, innerSource));
        };
        MergeAllObserver.prototype.onError = function (error) {
            this._currentObserver.error(error);
        };
        MergeAllObserver.prototype.onCompleted = function () {
            this.done = true;
            if (this._streamGroup.getCount() === 0) {
                this._currentObserver.completed();
            }
        };
        return MergeAllObserver;
    })(dyRt.Observer);
    dyRt.MergeAllObserver = MergeAllObserver;
    var InnerObserver = (function (_super) {
        __extends(InnerObserver, _super);
        function InnerObserver(parent, streamGroup, currentStream) {
            _super.call(this, null, null, null);
            this._parent = null;
            this._streamGroup = null;
            this._currentStream = null;
            this._parent = parent;
            this._streamGroup = streamGroup;
            this._currentStream = currentStream;
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
                return dyRt.JudgeUtils.isEqual(stream, currentStream);
            });
            //if this innerSource is async stream(as promise stream),
            //it will first exec all parent.next and one parent.completed,
            //then exec all this.next and all this.completed
            //so in this case, it should invoke parent.currentObserver.completed after the last invokcation of this.completed(have invoked all the innerSource)
            if (this._isAsync() && this._streamGroup.getCount() === 0) {
                parent.currentObserver.completed();
            }
        };
        InnerObserver.prototype._isAsync = function () {
            return this._parent.done;
        };
        return InnerObserver;
    })(dyRt.Observer);
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var TakeUntilObserver = (function (_super) {
        __extends(TakeUntilObserver, _super);
        function TakeUntilObserver(prevObserver) {
            _super.call(this, null, null, null);
            this._prevObserver = null;
            this._prevObserver = prevObserver;
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
    })(dyRt.Observer);
    dyRt.TakeUntilObserver = TakeUntilObserver;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var ConcatObserver = (function (_super) {
        __extends(ConcatObserver, _super);
        function ConcatObserver(currentObserver, startNextStream) {
            _super.call(this, null, null, null);
            //private currentObserver:IObserver = null;
            this.currentObserver = null;
            this._startNextStream = null;
            this.currentObserver = currentObserver;
            this._startNextStream = startNextStream;
        }
        ConcatObserver.create = function (currentObserver, startNextStream) {
            return new this(currentObserver, startNextStream);
        };
        ConcatObserver.prototype.onNext = function (value) {
            try {
                this.currentObserver.next(value);
            }
            catch (e) {
                this.currentObserver.error(e);
            }
        };
        ConcatObserver.prototype.onError = function (error) {
            this.currentObserver.error(error);
        };
        ConcatObserver.prototype.onCompleted = function () {
            //this.currentObserver.completed();
            this._startNextStream();
        };
        return ConcatObserver;
    })(dyRt.Observer);
    dyRt.ConcatObserver = ConcatObserver;
})(dyRt || (dyRt = {}));




var dyRt;
(function (dyRt) {
    var SubjectObserver = (function () {
        function SubjectObserver() {
            this.observers = dyCb.Collection.create();
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
        };
        SubjectObserver.prototype.removeChild = function (observer) {
            this.observers.removeChild(function (ob) {
                return dyRt.JudgeUtils.isEqual(ob, observer);
            });
        };
        SubjectObserver.prototype.dispose = function () {
            this.observers.forEach(function (ob) {
                ob.dispose();
            });
            this.observers.removeAllChildren();
        };
        SubjectObserver.prototype.setDisposeHandler = function () {
            this.observers.forEach(function (observer) {
                observer.setDisposeHandler(dyRt.Disposer.getDisposeHandler());
            });
            dyRt.Disposer.removeAllDisposeHandler();
        };
        return SubjectObserver;
    })();
    dyRt.SubjectObserver = SubjectObserver;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var IgnoreElementsObserver = (function (_super) {
        __extends(IgnoreElementsObserver, _super);
        function IgnoreElementsObserver(currentObserver) {
            _super.call(this, null, null, null);
            this._currentObserver = null;
            this._currentObserver = currentObserver;
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
    })(dyRt.Observer);
    dyRt.IgnoreElementsObserver = IgnoreElementsObserver;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var BaseStream = (function (_super) {
        __extends(BaseStream, _super);
        function BaseStream() {
            _super.apply(this, arguments);
        }
        BaseStream.prototype.subscribeCore = function (observer) {
            throw dyRt.ABSTRACT_METHOD();
        };
        BaseStream.prototype.subscribe = function (arg1, onError, onCompleted) {
            var observer = null;
            if (this.handleSubject(arg1)) {
                return;
            }
            observer = arg1 instanceof dyRt.Observer
                ? arg1
                : dyRt.AutoDetachObserver.create(arg1, onError, onCompleted);
            //observer.setDisposeHandler(this.disposeHandler);
            this.buildStream(observer);
            observer.setDisposeHandler(dyRt.Disposer.getDisposeHandler());
            dyRt.Disposer.removeAllDisposeHandler();
            return observer;
        };
        BaseStream.prototype.buildStream = function (observer) {
            _super.prototype.buildStream.call(this, observer);
            this.subscribeCore(observer);
        };
        return BaseStream;
    })(dyRt.Stream);
    dyRt.BaseStream = BaseStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var DoStream = (function (_super) {
        __extends(DoStream, _super);
        function DoStream(source, onNext, onError, onCompleted) {
            _super.call(this, null);
            this._source = null;
            this._observer = null;
            this._source = source;
            this._observer = dyRt.AnonymousObserver.create(onNext, onError, onCompleted);
            this.scheduler = this._source.scheduler;
        }
        DoStream.create = function (source, onNext, onError, onCompleted) {
            var obj = new this(source, onNext, onError, onCompleted);
            return obj;
        };
        DoStream.prototype.subscribeCore = function (observer) {
            this._source.buildStream(dyRt.DoObserver.create(observer, this._observer));
        };
        return DoStream;
    })(dyRt.BaseStream);
    dyRt.DoStream = DoStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var MapStream = (function (_super) {
        __extends(MapStream, _super);
        function MapStream(source, selector) {
            _super.call(this, null);
            this._source = null;
            this._selector = null;
            this._source = source;
            this.scheduler = this._source.scheduler;
            this._selector = selector;
        }
        MapStream.create = function (source, selector) {
            var obj = new this(source, selector);
            return obj;
        };
        MapStream.prototype.subscribeCore = function (observer) {
            this._source.buildStream(dyRt.MapObserver.create(observer, this._selector));
        };
        return MapStream;
    })(dyRt.BaseStream);
    dyRt.MapStream = MapStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var FromArrayStream = (function (_super) {
        __extends(FromArrayStream, _super);
        function FromArrayStream(array, scheduler) {
            _super.call(this, null);
            this._array = null;
            this._array = array;
            this.scheduler = scheduler;
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
                    arguments.callee(i + 1);
                }
                else {
                    observer.completed();
                }
            }
            this.scheduler.publishRecursive(observer, 0, loopRecursive);
        };
        return FromArrayStream;
    })(dyRt.BaseStream);
    dyRt.FromArrayStream = FromArrayStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var FromPromiseStream = (function (_super) {
        __extends(FromPromiseStream, _super);
        function FromPromiseStream(promise, scheduler) {
            _super.call(this, null);
            this._promise = null;
            this._promise = promise;
            this.scheduler = scheduler;
        }
        FromPromiseStream.create = function (promise, scheduler) {
            var obj = new this(promise, scheduler);
            return obj;
        };
        FromPromiseStream.prototype.subscribeCore = function (observer) {
            //todo remove test logic from product logic(as Scheduler->publicxxx, FromPromise->then...)
            this._promise.then(function (data) {
                observer.next(data);
                observer.completed();
            }, function (err) {
                observer.error(err);
            }, observer);
        };
        return FromPromiseStream;
    })(dyRt.BaseStream);
    dyRt.FromPromiseStream = FromPromiseStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var FromEventPatternStream = (function (_super) {
        __extends(FromEventPatternStream, _super);
        function FromEventPatternStream(addHandler, removeHandler) {
            _super.call(this, null);
            this._addHandler = null;
            this._removeHandler = null;
            this._addHandler = addHandler;
            this._removeHandler = removeHandler;
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
            dyRt.Disposer.addDisposeHandler(function () {
                self._removeHandler(innerHandler);
            });
        };
        return FromEventPatternStream;
    })(dyRt.BaseStream);
    dyRt.FromEventPatternStream = FromEventPatternStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var AnonymousStream = (function (_super) {
        __extends(AnonymousStream, _super);
        function AnonymousStream(subscribeFunc) {
            _super.call(this, subscribeFunc);
        }
        AnonymousStream.create = function (subscribeFunc) {
            var obj = new this(subscribeFunc);
            return obj;
        };
        AnonymousStream.prototype.subscribe = function (onNext, onError, onCompleted) {
            var observer = null;
            if (this.handleSubject(arguments[0])) {
                return;
            }
            observer = dyRt.AutoDetachObserver.create(onNext, onError, onCompleted);
            //observer.setDisposeHandler(this.disposeHandler);
            this.buildStream(observer);
            observer.setDisposeHandler(dyRt.Disposer.getDisposeHandler());
            dyRt.Disposer.removeAllDisposeHandler();
            return observer;
        };
        return AnonymousStream;
    })(dyRt.Stream);
    dyRt.AnonymousStream = AnonymousStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var IntervalStream = (function (_super) {
        __extends(IntervalStream, _super);
        function IntervalStream(interval, scheduler) {
            _super.call(this, null);
            this._interval = null;
            this._interval = interval;
            this.scheduler = scheduler;
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
                //self.scheduler.next(count);
                observer.next(count);
                return count + 1;
            });
            dyRt.Disposer.addDisposeHandler(function () {
                dyRt.root.clearInterval(id);
            });
        };
        return IntervalStream;
    })(dyRt.BaseStream);
    dyRt.IntervalStream = IntervalStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var IntervalRequestStream = (function (_super) {
        __extends(IntervalRequestStream, _super);
        function IntervalRequestStream(scheduler) {
            _super.call(this, null);
            this.scheduler = scheduler;
        }
        IntervalRequestStream.create = function (scheduler) {
            var obj = new this(scheduler);
            return obj;
        };
        IntervalRequestStream.prototype.subscribeCore = function (observer) {
            var self = this;
            this.scheduler.publishIntervalRequest(observer, function (time) {
                observer.next(time);
            });
            dyRt.Disposer.addDisposeHandler(function () {
                dyRt.root.cancelNextRequestAnimationFrame(self.scheduler.requestLoopId);
            });
        };
        return IntervalRequestStream;
    })(dyRt.BaseStream);
    dyRt.IntervalRequestStream = IntervalRequestStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var MergeAllStream = (function (_super) {
        __extends(MergeAllStream, _super);
        function MergeAllStream(source) {
            _super.call(this, null);
            this._source = null;
            this._observer = null;
            this._source = source;
            //this._observer = AnonymousObserver.create(onNext, onError,onCompleted);
            this.scheduler = this._source.scheduler;
        }
        MergeAllStream.create = function (source) {
            var obj = new this(source);
            return obj;
        };
        MergeAllStream.prototype.subscribeCore = function (observer) {
            var streamGroup = dyCb.Collection.create();
            this._source.buildStream(dyRt.MergeAllObserver.create(observer, streamGroup));
        };
        return MergeAllStream;
    })(dyRt.BaseStream);
    dyRt.MergeAllStream = MergeAllStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var TakeUntilStream = (function (_super) {
        __extends(TakeUntilStream, _super);
        function TakeUntilStream(source, otherStream) {
            _super.call(this, null);
            this._source = null;
            this._otherStream = null;
            this._source = source;
            this._otherStream = dyRt.JudgeUtils.isPromise(otherStream) ? dyRt.fromPromise(otherStream) : otherStream;
            this.scheduler = this._source.scheduler;
        }
        TakeUntilStream.create = function (source, otherSteam) {
            var obj = new this(source, otherSteam);
            return obj;
        };
        TakeUntilStream.prototype.subscribeCore = function (observer) {
            this._source.buildStream(observer);
            this._otherStream.buildStream(dyRt.TakeUntilObserver.create(observer));
        };
        return TakeUntilStream;
    })(dyRt.BaseStream);
    dyRt.TakeUntilStream = TakeUntilStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var ConcatStream = (function (_super) {
        __extends(ConcatStream, _super);
        function ConcatStream(sources) {
            _super.call(this, null);
            this._sources = dyCb.Collection.create();
            var self = this;
            //todo don't set scheduler here?
            this.scheduler = sources[0].scheduler;
            sources.forEach(function (source) {
                if (dyRt.JudgeUtils.isPromise(source)) {
                    self._sources.addChild(dyRt.fromPromise(source));
                }
                else {
                    self._sources.addChild(source);
                }
            });
        }
        ConcatStream.create = function (sources) {
            var obj = new this(sources);
            return obj;
        };
        ConcatStream.prototype.subscribeCore = function (observer) {
            var self = this, count = this._sources.getCount();
            function loopRecursive(i) {
                if (i === count) {
                    observer.completed();
                    return;
                }
                self._sources.getChild(i).buildStream(dyRt.ConcatObserver.create(observer, function () {
                    loopRecursive(i + 1);
                }));
            }
            this.scheduler.publishRecursive(observer, 0, loopRecursive);
        };
        return ConcatStream;
    })(dyRt.BaseStream);
    dyRt.ConcatStream = ConcatStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var RepeatStream = (function (_super) {
        __extends(RepeatStream, _super);
        function RepeatStream(source, count) {
            _super.call(this, null);
            this._source = null;
            this._count = null;
            this._source = source;
            this._count = count;
            this.scheduler = this._source.scheduler;
            //this.subjectGroup = this._source.subjectGroup;
        }
        RepeatStream.create = function (source, count) {
            var obj = new this(source, count);
            return obj;
        };
        RepeatStream.prototype.subscribeCore = function (observer) {
            var self = this;
            function loopRecursive(count) {
                if (count === 0) {
                    observer.completed();
                    return;
                }
                self._source.buildStream(dyRt.ConcatObserver.create(observer, function () {
                    loopRecursive(count - 1);
                }));
            }
            this.scheduler.publishRecursive(observer, this._count, loopRecursive);
        };
        return RepeatStream;
    })(dyRt.BaseStream);
    dyRt.RepeatStream = RepeatStream;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var IgnoreElementsStream = (function (_super) {
        __extends(IgnoreElementsStream, _super);
        function IgnoreElementsStream(source) {
            _super.call(this, null);
            this._source = null;
            this._source = source;
            this.scheduler = this._source.scheduler;
        }
        IgnoreElementsStream.create = function (source) {
            var obj = new this(source);
            return obj;
        };
        IgnoreElementsStream.prototype.subscribeCore = function (observer) {
            this._source.buildStream(dyRt.IgnoreElementsObserver.create(observer));
        };
        return IgnoreElementsStream;
    })(dyRt.BaseStream);
    dyRt.IgnoreElementsStream = IgnoreElementsStream;
})(dyRt || (dyRt = {}));


var dyRt;
(function (dyRt) {
    dyRt.createStream = function (subscribeFunc) {
        return dyRt.AnonymousStream.create(subscribeFunc);
    };
    dyRt.fromArray = function (array, scheduler) {
        if (scheduler === void 0) { scheduler = dyRt.Scheduler.create(); }
        return dyRt.FromArrayStream.create(array, scheduler);
    };
    dyRt.fromPromise = function (promise, scheduler) {
        if (scheduler === void 0) { scheduler = dyRt.Scheduler.create(); }
        return dyRt.FromPromiseStream.create(promise, scheduler);
    };
    dyRt.fromEventPattern = function (addHandler, removeHandler) {
        return dyRt.FromEventPatternStream.create(addHandler, removeHandler);
    };
    dyRt.interval = function (interval, scheduler) {
        if (scheduler === void 0) { scheduler = dyRt.Scheduler.create(); }
        return dyRt.IntervalStream.create(interval, scheduler);
    };
    dyRt.intervalRequest = function (scheduler) {
        if (scheduler === void 0) { scheduler = dyRt.Scheduler.create(); }
        return dyRt.IntervalRequestStream.create(scheduler);
    };
    dyRt.empty = function () {
        return dyRt.createStream(function (observer) {
            observer.completed();
        });
    };
    dyRt.callFunc = function (func, context) {
        if (context === void 0) { context = dyRt.root; }
        return dyRt.createStream(function (observer) {
            try {
                observer.next(func.call(context, null));
            }
            catch (e) {
                observer.error(e);
            }
            observer.completed();
        });
    };
})(dyRt || (dyRt = {}));


var dyRt;
(function (dyRt) {
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
    })();
    dyRt.Record = Record;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var MockObserver = (function (_super) {
        __extends(MockObserver, _super);
        function MockObserver(scheduler) {
            _super.call(this, null, null, null);
            this._messages = [];
            this._scheduler = null;
            this._scheduler = scheduler;
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
            this._messages.push(dyRt.Record.create(this._scheduler.clock, value));
        };
        MockObserver.prototype.onError = function (error) {
            this._messages.push(dyRt.Record.create(this._scheduler.clock, error));
        };
        MockObserver.prototype.onCompleted = function () {
            this._messages.push(dyRt.Record.create(this._scheduler.clock, null));
        };
        MockObserver.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this._scheduler.remove(this);
        };
        MockObserver.prototype.copy = function () {
            var result = MockObserver.create(this._scheduler);
            result.messages = this._messages;
            return result;
        };
        return MockObserver;
    })(dyRt.Observer);
    dyRt.MockObserver = MockObserver;
})(dyRt || (dyRt = {}));


var dyRt;
(function (dyRt) {
    var MockPromise = (function () {
        function MockPromise(scheduler, messages) {
            this._messages = [];
            //get messages(){
            //    return this._messages;
            //}
            //set messages(messages:[Record]){
            //    this._messages = messages;
            //}
            this._scheduler = null;
            this._scheduler = scheduler;
            this._messages = messages;
        }
        MockPromise.create = function (scheduler, messages) {
            var obj = new this(scheduler, messages);
            return obj;
        };
        MockPromise.prototype.then = function (successCb, errorCb, observer) {
            //var scheduler = <TestScheduler>(this.scheduler);
            this._scheduler.setStreamMap(observer, this._messages);
        };
        return MockPromise;
    })();
    dyRt.MockPromise = MockPromise;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var SUBSCRIBE_TIME = 200;
    var DISPOSE_TIME = 1000;
    var TestScheduler = (function (_super) {
        __extends(TestScheduler, _super);
        function TestScheduler(isReset) {
            _super.call(this);
            this._clock = null;
            this._isReset = false;
            this._isDisposed = false;
            this._timerMap = dyCb.Hash.create();
            this._streamMap = dyCb.Hash.create();
            this._subscribedTime = null;
            this._disposedTime = null;
            this._isReset = isReset;
        }
        TestScheduler.next = function (tick, value) {
            return dyRt.Record.create(tick, value, dyRt.ActionType.NEXT);
        };
        TestScheduler.error = function (tick, error) {
            return dyRt.Record.create(tick, error, dyRt.ActionType.ERROR);
        };
        TestScheduler.completed = function (tick) {
            return dyRt.Record.create(tick, null, dyRt.ActionType.COMPLETED);
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
                    case dyRt.ActionType.NEXT:
                        func = function () {
                            observer.next(record.value);
                        };
                        break;
                    case dyRt.ActionType.ERROR:
                        func = function () {
                            observer.error(record.value);
                        };
                        break;
                    case dyRt.ActionType.COMPLETED:
                        func = function () {
                            observer.completed();
                        };
                        break;
                    default:
                        dyCb.Log.error(true, dyCb.Log.info.FUNC_UNKNOW("actionType"));
                        break;
                }
                self._streamMap.addChild(String(record.time), func);
            });
        };
        TestScheduler.prototype.remove = function (observer) {
            this._isDisposed = true;
        };
        TestScheduler.prototype.publishRecursive = function (observer, initial, recursiveFunc) {
            var self = this, messages = [], copyObserver = observer.copy ? observer.copy() : observer;
            this._setClock();
            observer.next = function (value) {
                self._tick(1);
                messages.push(TestScheduler.next(self._clock, value));
            };
            observer.completed = function () {
                self._tick(1);
                messages.push(TestScheduler.completed(self._clock));
                self.setStreamMap(copyObserver, messages);
            };
            recursiveFunc(initial);
        };
        TestScheduler.prototype.publishInterval = function (observer, initial, interval, action) {
            //produce 10 val for test
            var COUNT = 10, messages = [];
            this._setClock();
            while (COUNT > 0 && !this._isDisposed) {
                this._tick(interval);
                messages.push(TestScheduler.next(this._clock, initial));
                //no need to invoke action
                //action(initial);
                initial++;
                COUNT--;
            }
            this.setStreamMap(observer, messages);
            return NaN;
        };
        TestScheduler.prototype.publishIntervalRequest = function (observer, action) {
            //produce 10 val for test
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
        TestScheduler.prototype._setClock = function () {
            if (this._isReset) {
                this._clock = this._subscribedTime;
            }
        };
        TestScheduler.prototype.startWithTime = function (create, subscribedTime, disposedTime) {
            var observer = this.createObserver(), source, subscription;
            this._subscribedTime = subscribedTime;
            this._disposedTime = disposedTime;
            this._clock = subscribedTime;
            this._runAt(subscribedTime, function () {
                source = create();
                subscription = source.subscribe(observer);
            });
            this._runAt(disposedTime, function () {
                subscription.dispose();
            });
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
            //todo reduce loop time
            while (time <= max) {
                //because "_exec,_runStream" may change "_clock",
                //so it should reset the _clock
                this._clock = time;
                this._exec(time, this._timerMap);
                this._clock = time;
                this._runStream(time);
                time++;
                //todo get max time only from streamMap?
                //need refresh max time.
                //because if timerMap has callback that create infinite stream(as interval),
                //it will set streamMap so that the max time will change
                max = this._getMinAndMaxTime()[1];
            }
        };
        TestScheduler.prototype.createStream = function (args) {
            return dyRt.TestStream.create(Array.prototype.slice.call(arguments, 0), this);
        };
        TestScheduler.prototype.createObserver = function () {
            return dyRt.MockObserver.create(this);
        };
        TestScheduler.prototype.createResolvedPromise = function (time, value) {
            return dyRt.MockPromise.create(this, [TestScheduler.next(time, value), TestScheduler.completed(time + 1)]);
        };
        TestScheduler.prototype.createRejectPromise = function (time, error) {
            return dyRt.MockPromise.create(this, [TestScheduler.error(time, error)]);
        };
        TestScheduler.prototype._getMinAndMaxTime = function () {
            var timeArr = this._timerMap.getKeys().addChildren(this._streamMap.getKeys())
                .map(function (key) {
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
    })(dyRt.Scheduler);
    dyRt.TestScheduler = TestScheduler;
})(dyRt || (dyRt = {}));

var dyRt;
(function (dyRt) {
    (function (ActionType) {
        ActionType[ActionType["NEXT"] = 0] = "NEXT";
        ActionType[ActionType["ERROR"] = 1] = "ERROR";
        ActionType[ActionType["COMPLETED"] = 2] = "COMPLETED";
    })(dyRt.ActionType || (dyRt.ActionType = {}));
    var ActionType = dyRt.ActionType;
})(dyRt || (dyRt = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var dyRt;
(function (dyRt) {
    var TestStream = (function (_super) {
        __extends(TestStream, _super);
        function TestStream(messages, scheduler) {
            _super.call(this, null);
            this.scheduler = null;
            this._messages = null;
            this._messages = messages;
            this.scheduler = scheduler;
        }
        TestStream.create = function (messages, scheduler) {
            var obj = new this(messages, scheduler);
            return obj;
        };
        TestStream.prototype.subscribeCore = function (observer) {
            //var scheduler = <TestScheduler>(this.scheduler);
            this.scheduler.setStreamMap(observer, this._messages);
        };
        return TestStream;
    })(dyRt.BaseStream);
    dyRt.TestStream = TestStream;
})(dyRt || (dyRt = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkp1ZGdlVXRpbHMudHMiLCJjb3JlL0VudGl0eS50cyIsIkRpc3Bvc2FibGUvSURpc3Bvc2FibGUudHMiLCJvYnNlcnZlci9JT2JzZXJ2ZXIudHMiLCJEaXNwb3NhYmxlL0Rpc3Bvc2VyLnRzIiwiRGlzcG9zYWJsZS9Jbm5lclN1YnNjcmlwdGlvbi50cyIsIkRpc3Bvc2FibGUvSW5uZXJTdWJzY3JpcHRpb25Hcm91cC50cyIsImdsb2JhbC9WYXJpYWJsZS50cyIsImdsb2JhbC9Db25zdC50cyIsImdsb2JhbC9pbml0LnRzIiwiY29yZS9TdHJlYW0udHMiLCJjb3JlL1NjaGVkdWxlci50cyIsImNvcmUvT2JzZXJ2ZXIudHMiLCJzdWJqZWN0L1N1YmplY3QudHMiLCJzdWJqZWN0L0dlbmVyYXRvclN1YmplY3QudHMiLCJvYnNlcnZlci9Bbm9ueW1vdXNPYnNlcnZlci50cyIsIm9ic2VydmVyL0F1dG9EZXRhY2hPYnNlcnZlci50cyIsIm9ic2VydmVyL01hcE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvRG9PYnNlcnZlci50cyIsIm9ic2VydmVyL01lcmdlQWxsT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9UYWtlVW50aWxPYnNlcnZlci50cyIsIm9ic2VydmVyL0NvbmNhdE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvSVN1YmplY3RPYnNlcnZlci50cyIsIm9ic2VydmVyL1N1YmplY3RPYnNlcnZlci50cyIsIm9ic2VydmVyL0lnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIudHMiLCJzdHJlYW0vQmFzZVN0cmVhbS50cyIsInN0cmVhbS9Eb1N0cmVhbS50cyIsInN0cmVhbS9NYXBTdHJlYW0udHMiLCJzdHJlYW0vRnJvbUFycmF5U3RyZWFtLnRzIiwic3RyZWFtL0Zyb21Qcm9taXNlU3RyZWFtLnRzIiwic3RyZWFtL0Zyb21FdmVudFBhdHRlcm5TdHJlYW0udHMiLCJzdHJlYW0vQW5vbnltb3VzU3RyZWFtLnRzIiwic3RyZWFtL0ludGVydmFsU3RyZWFtLnRzIiwic3RyZWFtL0ludGVydmFsUmVxdWVzdFN0cmVhbS50cyIsInN0cmVhbS9NZXJnZUFsbFN0cmVhbS50cyIsInN0cmVhbS9UYWtlVW50aWxTdHJlYW0udHMiLCJzdHJlYW0vQ29uY2F0U3RyZWFtLnRzIiwic3RyZWFtL1JlcGVhdFN0cmVhbS50cyIsInN0cmVhbS9JZ25vcmVFbGVtZW50c1N0cmVhbS50cyIsImdsb2JhbC9PcGVyYXRvci50cyIsInRlc3RpbmcvUmVjb3JkLnRzIiwidGVzdGluZy9Nb2NrT2JzZXJ2ZXIudHMiLCJ0ZXN0aW5nL01vY2tQcm9taXNlLnRzIiwidGVzdGluZy9UZXN0U2NoZWR1bGVyLnRzIiwidGVzdGluZy9BY3Rpb25UeXBlLnRzIiwidGVzdGluZy9UZXN0U3RyZWFtLnRzIl0sIm5hbWVzIjpbImR5UnQiLCJkeVJ0Lkp1ZGdlVXRpbHMiLCJkeVJ0Lkp1ZGdlVXRpbHMuY29uc3RydWN0b3IiLCJkeVJ0Lkp1ZGdlVXRpbHMuaXNQcm9taXNlIiwiZHlSdC5KdWRnZVV0aWxzLmlzRXF1YWwiLCJkeVJ0LkVudGl0eSIsImR5UnQuRW50aXR5LmNvbnN0cnVjdG9yIiwiZHlSdC5FbnRpdHkudWlkIiwiZHlSdC5EaXNwb3NlciIsImR5UnQuRGlzcG9zZXIuY29uc3RydWN0b3IiLCJkeVJ0LkRpc3Bvc2VyLmFkZERpc3Bvc2VIYW5kbGVyIiwiZHlSdC5EaXNwb3Nlci5nZXREaXNwb3NlSGFuZGxlciIsImR5UnQuRGlzcG9zZXIucmVtb3ZlQWxsRGlzcG9zZUhhbmRsZXIiLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uIiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbi5jb25zdHJ1Y3RvciIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb24uY3JlYXRlIiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbi5kaXNwb3NlIiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbkdyb3VwIiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbkdyb3VwLmNvbnN0cnVjdG9yIiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbkdyb3VwLmNyZWF0ZSIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb25Hcm91cC5hZGRDaGlsZCIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb25Hcm91cC5kaXNwb3NlIiwiZHlSdC5TdHJlYW0iLCJkeVJ0LlN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuU3RyZWFtLnN1YnNjcmliZSIsImR5UnQuU3RyZWFtLmJ1aWxkU3RyZWFtIiwiZHlSdC5TdHJlYW0uZG8iLCJkeVJ0LlN0cmVhbS5tYXAiLCJkeVJ0LlN0cmVhbS5mbGF0TWFwIiwiZHlSdC5TdHJlYW0ubWVyZ2VBbGwiLCJkeVJ0LlN0cmVhbS50YWtlVW50aWwiLCJkeVJ0LlN0cmVhbS5jb25jYXQiLCJkeVJ0LlN0cmVhbS5tZXJnZSIsImR5UnQuU3RyZWFtLnJlcGVhdCIsImR5UnQuU3RyZWFtLmlnbm9yZUVsZW1lbnRzIiwiZHlSdC5TdHJlYW0uaGFuZGxlU3ViamVjdCIsImR5UnQuU3RyZWFtLl9pc1N1YmplY3QiLCJkeVJ0LlN0cmVhbS5fc2V0U3ViamVjdCIsImR5UnQuU2NoZWR1bGVyIiwiZHlSdC5TY2hlZHVsZXIuY29uc3RydWN0b3IiLCJkeVJ0LlNjaGVkdWxlci5jcmVhdGUiLCJkeVJ0LlNjaGVkdWxlci5yZXF1ZXN0TG9vcElkIiwiZHlSdC5TY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZSIsImR5UnQuU2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbCIsImR5UnQuU2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbFJlcXVlc3QiLCJkeVJ0Lk9ic2VydmVyIiwiZHlSdC5PYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuT2JzZXJ2ZXIuaXNEaXNwb3NlZCIsImR5UnQuT2JzZXJ2ZXIubmV4dCIsImR5UnQuT2JzZXJ2ZXIuZXJyb3IiLCJkeVJ0Lk9ic2VydmVyLmNvbXBsZXRlZCIsImR5UnQuT2JzZXJ2ZXIuZGlzcG9zZSIsImR5UnQuT2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIiLCJkeVJ0Lk9ic2VydmVyLm9uTmV4dCIsImR5UnQuT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LlN1YmplY3QiLCJkeVJ0LlN1YmplY3QuY29uc3RydWN0b3IiLCJkeVJ0LlN1YmplY3QuY3JlYXRlIiwiZHlSdC5TdWJqZWN0LnNvdXJjZSIsImR5UnQuU3ViamVjdC5zdWJzY3JpYmUiLCJkeVJ0LlN1YmplY3QubmV4dCIsImR5UnQuU3ViamVjdC5lcnJvciIsImR5UnQuU3ViamVjdC5jb21wbGV0ZWQiLCJkeVJ0LlN1YmplY3Quc3RhcnQiLCJkeVJ0LlN1YmplY3QucmVtb3ZlIiwiZHlSdC5TdWJqZWN0LmRpc3Bvc2UiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3QiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3QuY29uc3RydWN0b3IiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3QuY3JlYXRlIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LmlzU3RhcnQiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3Qub25CZWZvcmVOZXh0IiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0Lm9uQWZ0ZXJOZXh0IiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0Lm9uSXNDb21wbGV0ZWQiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3Qub25CZWZvcmVFcnJvciIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5vbkFmdGVyRXJyb3IiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3Qub25CZWZvcmVDb21wbGV0ZWQiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3Qub25BZnRlckNvbXBsZXRlZCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5zdWJzY3JpYmUiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3QubmV4dCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5lcnJvciIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5jb21wbGV0ZWQiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3QudG9TdHJlYW0iLCJkeVJ0LkdlbmVyYXRvclN1YmplY3Quc3RhcnQiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3Quc3RvcCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5yZW1vdmUiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3QuZGlzcG9zZSIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5fc2V0RGlzcG9zZUhhbmRsZXIiLCJkeVJ0LkFub255bW91c09ic2VydmVyIiwiZHlSdC5Bbm9ueW1vdXNPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Bbm9ueW1vdXNPYnNlcnZlci5vbk5leHQiLCJkeVJ0LkFub255bW91c09ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LkFub255bW91c09ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLmRpc3Bvc2UiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5vbk5leHQiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0Lk1hcE9ic2VydmVyIiwiZHlSdC5NYXBPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuTWFwT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5NYXBPYnNlcnZlci5vbk5leHQiLCJkeVJ0Lk1hcE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0Lk1hcE9ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5Eb09ic2VydmVyIiwiZHlSdC5Eb09ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5Eb09ic2VydmVyLmNyZWF0ZSIsImR5UnQuRG9PYnNlcnZlci5vbk5leHQiLCJkeVJ0LkRvT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuRG9PYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlciIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5jcmVhdGUiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIuY3VycmVudE9ic2VydmVyIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLmRvbmUiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LklubmVyT2JzZXJ2ZXIiLCJkeVJ0LklubmVyT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LklubmVyT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Jbm5lck9ic2VydmVyLm9uTmV4dCIsImR5UnQuSW5uZXJPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5Jbm5lck9ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5Jbm5lck9ic2VydmVyLl9pc0FzeW5jIiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlciIsImR5UnQuVGFrZVVudGlsT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LlRha2VVbnRpbE9ic2VydmVyLmNyZWF0ZSIsImR5UnQuVGFrZVVudGlsT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuQ29uY2F0T2JzZXJ2ZXIiLCJkeVJ0LkNvbmNhdE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5Db25jYXRPYnNlcnZlci5jcmVhdGUiLCJkeVJ0LkNvbmNhdE9ic2VydmVyLm9uTmV4dCIsImR5UnQuQ29uY2F0T2JzZXJ2ZXIub25FcnJvciIsImR5UnQuQ29uY2F0T2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LlN1YmplY3RPYnNlcnZlciIsImR5UnQuU3ViamVjdE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5TdWJqZWN0T2JzZXJ2ZXIuaXNFbXB0eSIsImR5UnQuU3ViamVjdE9ic2VydmVyLm5leHQiLCJkeVJ0LlN1YmplY3RPYnNlcnZlci5lcnJvciIsImR5UnQuU3ViamVjdE9ic2VydmVyLmNvbXBsZXRlZCIsImR5UnQuU3ViamVjdE9ic2VydmVyLmFkZENoaWxkIiwiZHlSdC5TdWJqZWN0T2JzZXJ2ZXIucmVtb3ZlQ2hpbGQiLCJkeVJ0LlN1YmplY3RPYnNlcnZlci5kaXNwb3NlIiwiZHlSdC5TdWJqZWN0T2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIiLCJkeVJ0Lklnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIiLCJkeVJ0Lklnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0Lklnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5JZ25vcmVFbGVtZW50c09ic2VydmVyLm9uTmV4dCIsImR5UnQuSWdub3JlRWxlbWVudHNPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5JZ25vcmVFbGVtZW50c09ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5CYXNlU3RyZWFtIiwiZHlSdC5CYXNlU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5CYXNlU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkJhc2VTdHJlYW0uc3Vic2NyaWJlIiwiZHlSdC5CYXNlU3RyZWFtLmJ1aWxkU3RyZWFtIiwiZHlSdC5Eb1N0cmVhbSIsImR5UnQuRG9TdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkRvU3RyZWFtLmNyZWF0ZSIsImR5UnQuRG9TdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuTWFwU3RyZWFtIiwiZHlSdC5NYXBTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0Lk1hcFN0cmVhbS5jcmVhdGUiLCJkeVJ0Lk1hcFN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5Gcm9tQXJyYXlTdHJlYW0iLCJkeVJ0LkZyb21BcnJheVN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuRnJvbUFycmF5U3RyZWFtLmNyZWF0ZSIsImR5UnQuRnJvbUFycmF5U3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkZyb21BcnJheVN0cmVhbS5zdWJzY3JpYmVDb3JlLmxvb3BSZWN1cnNpdmUiLCJkeVJ0LkZyb21Qcm9taXNlU3RyZWFtIiwiZHlSdC5Gcm9tUHJvbWlzZVN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuRnJvbVByb21pc2VTdHJlYW0uY3JlYXRlIiwiZHlSdC5Gcm9tUHJvbWlzZVN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLmNyZWF0ZSIsImR5UnQuRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLnN1YnNjcmliZUNvcmUuaW5uZXJIYW5kbGVyIiwiZHlSdC5Bbm9ueW1vdXNTdHJlYW0iLCJkeVJ0LkFub255bW91c1N0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuQW5vbnltb3VzU3RyZWFtLmNyZWF0ZSIsImR5UnQuQW5vbnltb3VzU3RyZWFtLnN1YnNjcmliZSIsImR5UnQuSW50ZXJ2YWxTdHJlYW0iLCJkeVJ0LkludGVydmFsU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5JbnRlcnZhbFN0cmVhbS5jcmVhdGUiLCJkeVJ0LkludGVydmFsU3RyZWFtLmluaXRXaGVuQ3JlYXRlIiwiZHlSdC5JbnRlcnZhbFN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5JbnRlcnZhbFJlcXVlc3RTdHJlYW0iLCJkeVJ0LkludGVydmFsUmVxdWVzdFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLmNyZWF0ZSIsImR5UnQuSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0Lk1lcmdlQWxsU3RyZWFtIiwiZHlSdC5NZXJnZUFsbFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuTWVyZ2VBbGxTdHJlYW0uY3JlYXRlIiwiZHlSdC5NZXJnZUFsbFN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5UYWtlVW50aWxTdHJlYW0iLCJkeVJ0LlRha2VVbnRpbFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuVGFrZVVudGlsU3RyZWFtLmNyZWF0ZSIsImR5UnQuVGFrZVVudGlsU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkNvbmNhdFN0cmVhbSIsImR5UnQuQ29uY2F0U3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Db25jYXRTdHJlYW0uY3JlYXRlIiwiZHlSdC5Db25jYXRTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuQ29uY2F0U3RyZWFtLnN1YnNjcmliZUNvcmUubG9vcFJlY3Vyc2l2ZSIsImR5UnQuUmVwZWF0U3RyZWFtIiwiZHlSdC5SZXBlYXRTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LlJlcGVhdFN0cmVhbS5jcmVhdGUiLCJkeVJ0LlJlcGVhdFN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5SZXBlYXRTdHJlYW0uc3Vic2NyaWJlQ29yZS5sb29wUmVjdXJzaXZlIiwiZHlSdC5JZ25vcmVFbGVtZW50c1N0cmVhbSIsImR5UnQuSWdub3JlRWxlbWVudHNTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0Lklnbm9yZUVsZW1lbnRzU3RyZWFtLmNyZWF0ZSIsImR5UnQuSWdub3JlRWxlbWVudHNTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuUmVjb3JkIiwiZHlSdC5SZWNvcmQuY29uc3RydWN0b3IiLCJkeVJ0LlJlY29yZC5jcmVhdGUiLCJkeVJ0LlJlY29yZC50aW1lIiwiZHlSdC5SZWNvcmQudmFsdWUiLCJkeVJ0LlJlY29yZC5hY3Rpb25UeXBlIiwiZHlSdC5SZWNvcmQuZXF1YWxzIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIiLCJkeVJ0Lk1vY2tPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuTW9ja09ic2VydmVyLmNyZWF0ZSIsImR5UnQuTW9ja09ic2VydmVyLm1lc3NhZ2VzIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5Nb2NrT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuTW9ja09ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIuZGlzcG9zZSIsImR5UnQuTW9ja09ic2VydmVyLmNvcHkiLCJkeVJ0Lk1vY2tQcm9taXNlIiwiZHlSdC5Nb2NrUHJvbWlzZS5jb25zdHJ1Y3RvciIsImR5UnQuTW9ja1Byb21pc2UuY3JlYXRlIiwiZHlSdC5Nb2NrUHJvbWlzZS50aGVuIiwiZHlSdC5UZXN0U2NoZWR1bGVyIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNvbnN0cnVjdG9yIiwiZHlSdC5UZXN0U2NoZWR1bGVyLm5leHQiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuZXJyb3IiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY29tcGxldGVkIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNyZWF0ZSIsImR5UnQuVGVzdFNjaGVkdWxlci5jbG9jayIsImR5UnQuVGVzdFNjaGVkdWxlci5zZXRTdHJlYW1NYXAiLCJkeVJ0LlRlc3RTY2hlZHVsZXIucmVtb3ZlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIucHVibGlzaEludGVydmFsIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbFJlcXVlc3QiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX3NldENsb2NrIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnN0YXJ0V2l0aFRpbWUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc3RhcnRXaXRoU3Vic2NyaWJlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnN0YXJ0V2l0aERpc3Bvc2UiLCJkeVJ0LlRlc3RTY2hlZHVsZXIucHVibGljQWJzb2x1dGUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc3RhcnQiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlU3RyZWFtIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNyZWF0ZU9ic2VydmVyIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNyZWF0ZVJlc29sdmVkUHJvbWlzZSIsImR5UnQuVGVzdFNjaGVkdWxlci5jcmVhdGVSZWplY3RQcm9taXNlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLl9nZXRNaW5BbmRNYXhUaW1lIiwiZHlSdC5UZXN0U2NoZWR1bGVyLl9leGVjIiwiZHlSdC5UZXN0U2NoZWR1bGVyLl9ydW5TdHJlYW0iLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX3J1bkF0IiwiZHlSdC5UZXN0U2NoZWR1bGVyLl90aWNrIiwiZHlSdC5BY3Rpb25UeXBlIiwiZHlSdC5UZXN0U3RyZWFtIiwiZHlSdC5UZXN0U3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5UZXN0U3RyZWFtLmNyZWF0ZSIsImR5UnQuVGVzdFN0cmVhbS5zdWJzY3JpYmVDb3JlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwQ0FBMEM7QUFDMUMsSUFBTyxJQUFJLENBWVY7QUFaRCxXQUFPLElBQUksRUFBQyxDQUFDO0lBQ1RBO1FBQWdDQyw4QkFBZUE7UUFBL0NBO1lBQWdDQyw4QkFBZUE7UUFVL0NBLENBQUNBO1FBVGlCRCxvQkFBU0EsR0FBdkJBLFVBQXdCQSxHQUFHQTtZQUN2QkUsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0E7bUJBQ0xBLENBQUNBLE1BQUtBLENBQUNBLFVBQVVBLFlBQUNBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBO21CQUNoQ0EsTUFBS0EsQ0FBQ0EsVUFBVUEsWUFBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDdENBLENBQUNBO1FBRWFGLGtCQUFPQSxHQUFyQkEsVUFBc0JBLEdBQVVBLEVBQUVBLEdBQVVBO1lBQ3hDRyxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxLQUFLQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7UUFDTEgsaUJBQUNBO0lBQURBLENBVkFELEFBVUNDLEVBVitCRCxJQUFJQSxDQUFDQSxVQUFVQSxFQVU5Q0E7SUFWWUEsZUFBVUEsYUFVdEJBLENBQUFBO0FBQ0xBLENBQUNBLEVBWk0sSUFBSSxLQUFKLElBQUksUUFZVjs7QUNiRCwyQ0FB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LFNBQVNBLENBQUNBLENBQUNBO1FBQzFEQSxDQUFDQTtRQUNMSCxpQkFBQ0E7SUFBREEsQ0F0QkExUSxBQXNCQzBRLEVBdEIrQjFRLGVBQVVBLEVBc0J6Q0E7SUF0QllBLGVBQVVBLGFBc0J0QkEsQ0FBQUE7QUFDTEEsQ0FBQ0EsRUF4Qk0sSUFBSSxLQUFKLElBQUksUUF3QlYiLCJmaWxlIjoiZHlSdC5kZWJ1Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGNsYXNzIEp1ZGdlVXRpbHMgZXh0ZW5kcyBkeUNiLkp1ZGdlVXRpbHMge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGlzUHJvbWlzZShvYmope1xuICAgICAgICAgICAgcmV0dXJuICEhb2JqXG4gICAgICAgICAgICAgICAgJiYgIXN1cGVyLmlzRnVuY3Rpb24ob2JqLnN1YnNjcmliZSlcbiAgICAgICAgICAgICAgICAmJiBzdXBlci5pc0Z1bmN0aW9uKG9iai50aGVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNFcXVhbChvYjE6RW50aXR5LCBvYjI6RW50aXR5KXtcbiAgICAgICAgICAgIHJldHVybiBvYjEudWlkID09PSBvYjIudWlkO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRW50aXR5e1xuICAgICAgICBwdWJsaWMgc3RhdGljIFVJRDpudW1iZXIgPSAxO1xuXG4gICAgICAgIHByaXZhdGUgX3VpZDpzdHJpbmcgPSBudWxsO1xuICAgICAgICBnZXQgdWlkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdWlkO1xuICAgICAgICB9XG4gICAgICAgIHNldCB1aWQodWlkOnN0cmluZyl7XG4gICAgICAgICAgICB0aGlzLl91aWQgPSB1aWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcih1aWRQcmU6c3RyaW5nKXtcbiAgICAgICAgICAgIHRoaXMuX3VpZCA9IHVpZFByZSArIFN0cmluZyhFbnRpdHkuVUlEKyspO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJRGlzcG9zYWJsZXtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgaW50ZXJmYWNlIElPYnNlcnZlciBleHRlbmRzIElEaXNwb3NhYmxle1xuICAgICAgICBuZXh0KHZhbHVlOmFueSk7XG4gICAgICAgIGVycm9yKGVycm9yOmFueSk7XG4gICAgICAgIGNvbXBsZXRlZCgpO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIERpc3Bvc2VyIGV4dGVuZHMgRW50aXR5e1xuICAgICAgICBwdWJsaWMgc3RhdGljIGFkZERpc3Bvc2VIYW5kbGVyKGZ1bmM6RnVuY3Rpb24pe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIuYWRkQ2hpbGQoZnVuYyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldERpc3Bvc2VIYW5kbGVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGlzcG9zZUhhbmRsZXIuY29weSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyByZW1vdmVBbGxEaXNwb3NlSGFuZGxlcigpe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIHN0YXRpYyBfZGlzcG9zZUhhbmRsZXI6ZHlDYi5TdGFjazxGdW5jdGlvbj4gPSBkeUNiLlN0YWNrLmNyZWF0ZTxGdW5jdGlvbj4oKTtcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgX2Rpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbjxGdW5jdGlvbj4gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPEZ1bmN0aW9uPigpO1xuXG4gICAgICAgIC8vcHVibGljIGRpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbjxGdW5jdGlvbj4gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICAvL1xuICAgICAgICAvL3B1YmxpYyBhZGREaXNwb3NlSGFuZGxlcihmdW5jOkZ1bmN0aW9uKXtcbiAgICAgICAgLy8gICAgLy90aGlzLl9kaXNwb3NlSGFuZGxlci5hZGRDaGlsZChmdW5jKTtcbiAgICAgICAgLy99XG4gICAgICAgIC8vZ2V0IGRpc3Bvc2VIYW5kbGVyKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLl9kaXNwb3NlSGFuZGxlcjtcbiAgICAgICAgLy99XG4gICAgICAgIC8vc2V0IGRpc3Bvc2VIYW5kbGVyKGRpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbjxGdW5jdGlvbj4pe1xuICAgICAgICAvLyAgICB0aGlzLl9kaXNwb3NlSGFuZGxlciA9IGRpc3Bvc2VIYW5kbGVyO1xuICAgICAgICAvL31cblxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uIGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG5cdFx0cHVibGljIHN0YXRpYyBjcmVhdGUoc3ViamVjdDpTdWJqZWN0fEdlbmVyYXRvclN1YmplY3QsIG9ic2VydmVyOk9ic2VydmVyKSB7XG5cdFx0XHR2YXIgb2JqID0gbmV3IHRoaXMoc3ViamVjdCwgb2JzZXJ2ZXIpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX3N1YmplY3Q6U3ViamVjdHxHZW5lcmF0b3JTdWJqZWN0ID0gbnVsbDtcblx0XHRwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cblx0XHRjb25zdHJ1Y3RvcihzdWJqZWN0OlN1YmplY3R8R2VuZXJhdG9yU3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuXHRcdFx0dGhpcy5fc3ViamVjdCA9IHN1YmplY3Q7XG5cdFx0XHR0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9zdWJqZWN0LnJlbW92ZSh0aGlzLl9vYnNlcnZlcik7XG5cblx0XHRcdHRoaXMuX29ic2VydmVyLmRpc3Bvc2UoKTtcblx0XHR9XG5cdH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG5cdGV4cG9ydCBjbGFzcyBJbm5lclN1YnNjcmlwdGlvbkdyb3VwIGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG5cdFx0cHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG5cdFx0XHR2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9XG5cblx0XHRwcml2YXRlIF9jb250YWluZXI6ZHlDYi5Db2xsZWN0aW9uPElEaXNwb3NhYmxlPiA9IGR5Q2IuQ29sbGVjdGlvbi5jcmVhdGU8SURpc3Bvc2FibGU+KCk7XG5cblx0XHRwdWJsaWMgYWRkQ2hpbGQoY2hpbGQ6SURpc3Bvc2FibGUpe1xuXHRcdFx0dGhpcy5fY29udGFpbmVyLmFkZENoaWxkKGNoaWxkKTtcblx0XHR9XG5cblx0XHRwdWJsaWMgZGlzcG9zZSgpe1xuXHRcdFx0dGhpcy5fY29udGFpbmVyLmZvckVhY2goKGNoaWxkOklEaXNwb3NhYmxlKSA9PiB7XG5cdFx0XHRcdGNoaWxkLmRpc3Bvc2UoKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufVxuIiwibW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IHZhciByb290OmFueSA9IHdpbmRvdztcbn1cbiIsIm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCB2YXIgQUJTVFJBQ1RfTUVUSE9EOkZ1bmN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRXJyb3IoXCJhYnN0cmFjdCBtZXRob2QgbmVlZCBvdmVycmlkZVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgQUJTVFJBQ1RfQVRUUklCVVRFOmFueSA9IG51bGw7XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxuXG5tb2R1bGUgZHlSdHtcbiAgICAvL3JzdnAuanNcbiAgICAvL2RlY2xhcmUgdmFyIFJTVlA6YW55O1xuICAgIGRlY2xhcmUgdmFyIHdpbmRvdzphbnk7XG5cbiAgICAvL25vdCBzd2FsbG93IHRoZSBlcnJvclxuICAgIGlmKHdpbmRvdy5SU1ZQKXtcbiAgICAgICAgd2luZG93LlJTVlAub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH07XG4gICAgICAgIHdpbmRvdy5SU1ZQLm9uKCdlcnJvcicsIHdpbmRvdy5SU1ZQLm9uZXJyb3IpO1xuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgU3RyZWFtIGV4dGVuZHMgRGlzcG9zZXJ7XG4gICAgICAgIHB1YmxpYyBzY2hlZHVsZXI6U2NoZWR1bGVyID0gQUJTVFJBQ1RfQVRUUklCVVRFO1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlRnVuYzpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc3Vic2NyaWJlRnVuYyl7XG4gICAgICAgICAgICBzdXBlcihcIlN0cmVhbVwiKTtcblxuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVGdW5jID0gc3Vic2NyaWJlRnVuYyB8fCBmdW5jdGlvbigpeyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZUZ1bmMob2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRvKG9uTmV4dD86RnVuY3Rpb24sIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBEb1N0cmVhbS5jcmVhdGUodGhpcywgb25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbWFwKHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gTWFwU3RyZWFtLmNyZWF0ZSh0aGlzLCBzZWxlY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmxhdE1hcChzZWxlY3RvcjpGdW5jdGlvbil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXAoc2VsZWN0b3IpLm1lcmdlQWxsKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbWVyZ2VBbGwoKXtcbiAgICAgICAgICAgIHJldHVybiBNZXJnZUFsbFN0cmVhbS5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdGFrZVVudGlsKG90aGVyU3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICByZXR1cm4gVGFrZVVudGlsU3RyZWFtLmNyZWF0ZSh0aGlzLCBvdGhlclN0cmVhbSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIHB1YmxpYyBjb25jYXQoc3RyZWFtQXJyOkFycmF5PFN0cmVhbT4pO1xuICAgICAgICBwdWJsaWMgY29uY2F0KC4uLm90aGVyU3RyZWFtKTtcblxuICAgICAgICBwdWJsaWMgY29uY2F0KCl7XG4gICAgICAgICAgICB2YXIgYXJnczpBcnJheTxTdHJlYW0+ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0FycmF5KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBDb25jYXRTdHJlYW0uY3JlYXRlKGFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlKHN0cmVhbUFycjpBcnJheTxTdHJlYW0+KTtcbiAgICAgICAgcHVibGljIG1lcmdlKC4uLm90aGVyU3RyZWFtKTtcblxuICAgICAgICBwdWJsaWMgbWVyZ2UoKXtcbiAgICAgICAgICAgIHZhciBhcmdzOkFycmF5PFN0cmVhbT4gPSBudWxsLFxuICAgICAgICAgICAgICAgIHN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzQXJyYXkoYXJndW1lbnRzWzBdKSl7XG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcblxuICAgICAgICAgICAgc3RyZWFtID0gZnJvbUFycmF5KGFyZ3MpLm1lcmdlQWxsKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVwZWF0KGNvdW50Om51bWJlciA9IC0xKXtcbiAgICAgICAgICAgIHJldHVybiBSZXBlYXRTdHJlYW0uY3JlYXRlKHRoaXMsIGNvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpZ25vcmVFbGVtZW50cygpe1xuICAgICAgICAgICAgcmV0dXJuIElnbm9yZUVsZW1lbnRzU3RyZWFtLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBoYW5kbGVTdWJqZWN0KGFyZyl7XG4gICAgICAgICAgICBpZih0aGlzLl9pc1N1YmplY3QoYXJnKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0U3ViamVjdChhcmcpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1N1YmplY3Qoc3ViamVjdCl7XG4gICAgICAgICAgICByZXR1cm4gc3ViamVjdCBpbnN0YW5jZW9mIFN1YmplY3Q7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXRTdWJqZWN0KHN1YmplY3Qpe1xuICAgICAgICAgICAgc3ViamVjdC5zb3VyY2UgPSB0aGlzO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgd3JhcHBlciA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gbnVsbCxcbiAgICAgICAgICAgIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcblxuICAgICAgICB3cmFwcGVyID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgICAgICAgICAgIHRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIHNlbGYuY2FsbGJhY2sodGltZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyohXG4gICAgICAgICBidWchXG4gICAgICAgICBiZWxvdyBjb2RlOlxuICAgICAgICAgd2hlbiBpbnZva2UgYiBhZnRlciAxcywgd2lsbCBvbmx5IGludm9rZSBiLCBub3QgaW52b2tlIGEhXG5cbiAgICAgICAgIGZ1bmN0aW9uIGEodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImFcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGZ1bmN0aW9uIGIodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImJcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYik7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGEoKTtcblxuICAgICAgICAgc2V0VGltZW91dChiLCAxMDAwKTtcblxuXG5cbiAgICAgICAgIHNvIHVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcHJpb3JpdHkhXG4gICAgICAgICAqL1xuICAgICAgICBpZihyb290LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgQ2hyb21lIDEwIGJ1ZyB3aGVyZSBDaHJvbWVcbiAgICAgICAgLy8gZG9lcyBub3QgcGFzcyB0aGUgdGltZSB0byB0aGUgYW5pbWF0aW9uIGZ1bmN0aW9uXG5cbiAgICAgICAgaWYgKHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBEZWZpbmUgdGhlIHdyYXBwZXJcblxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgc3dpdGNoXG5cbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgLy8gQnJvd3NlciBjYWxscyB0aGUgd3JhcHBlciBhbmQgd3JhcHBlciBjYWxscyB0aGUgY2FsbGJhY2tcblxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSh3cmFwcGVyLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v5L+u5pS5dGltZeWPguaVsFxuICAgICAgICBpZiAocm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgR2Vja28gMi4wLCB3aGljaCBoYXMgYSBidWcgaW5cbiAgICAgICAgLy8gbW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKCkgdGhhdCByZXN0cmljdHMgYW5pbWF0aW9uc1xuICAgICAgICAvLyB0byAzMC00MCBmcHMuXG5cbiAgICAgICAgaWYgKHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBDaGVjayB0aGUgR2Vja28gdmVyc2lvbi4gR2Vja28gaXMgdXNlZCBieSBicm93c2Vyc1xuICAgICAgICAgICAgLy8gb3RoZXIgdGhhbiBGaXJlZm94LiBHZWNrbyAyLjAgY29ycmVzcG9uZHMgdG9cbiAgICAgICAgICAgIC8vIEZpcmVmb3ggNC4wLlxuXG4gICAgICAgICAgICBpbmRleCA9IHVzZXJBZ2VudC5pbmRleE9mKCdydjonKTtcblxuICAgICAgICAgICAgaWYgKHVzZXJBZ2VudC5pbmRleE9mKCdHZWNrbycpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gdXNlckFnZW50LnN1YnN0cihpbmRleCArIDMsIDMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGdlY2tvVmVyc2lvbiA9PT0gJzIuMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yY2VzIHRoZSByZXR1cm4gc3RhdGVtZW50IHRvIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgc2V0VGltZW91dCgpIGZ1bmN0aW9uLlxuXG4gICAgICAgICAgICAgICAgICAgIHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHJvb3Qub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXG4gICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaDtcblxuICAgICAgICAgICAgICAgIHJvb3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi50aW1lb3V0ID0gMTAwMCAvIDYwIC0gKGZpbmlzaCAtIHN0YXJ0KTtcblxuICAgICAgICAgICAgICAgIH0sIHNlbGYudGltZW91dCk7XG4gICAgICAgICAgICB9O1xuICAgIH0oKSk7XG5cbiAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290LmNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qud2Via2l0Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3QubW96Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qub0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm1zQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IGNsZWFyVGltZW91dDtcblxuXG4gICAgZXhwb3J0IGNsYXNzIFNjaGVkdWxlcntcbiAgICAgICAgLy90b2RvIHJlbW92ZSBcIi4uLmFyZ3NcIlxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3JlcXVlc3RMb29wSWQ6YW55ID0gbnVsbDtcbiAgICAgICAgZ2V0IHJlcXVlc3RMb29wSWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG4gICAgICAgIHNldCByZXF1ZXN0TG9vcElkKHJlcXVlc3RMb29wSWQ6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9vYnNlcnZlciBpcyBmb3IgVGVzdFNjaGVkdWxlciB0byByZXdyaXRlXG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgYWN0aW9uOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgaW50ZXJ2YWw6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIHJldHVybiByb290LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpbml0aWFsID0gYWN0aW9uKGluaXRpYWwpO1xuICAgICAgICAgICAgfSwgaW50ZXJ2YWwpXG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbG9vcCA9ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uKHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5fcmVxdWVzdExvb3BJZCA9IHJvb3QucmVxdWVzdE5leHRBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgT2JzZXJ2ZXIgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IG51bGw7XG4gICAgICAgIGdldCBpc0Rpc3Bvc2VkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNEaXNwb3NlZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNEaXNwb3NlZChpc0Rpc3Bvc2VkOmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IGlzRGlzcG9zZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyTmV4dDpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJFcnJvcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJDb21wbGV0ZWQ6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2lzU3RvcDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbjxGdW5jdGlvbj4gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPEZ1bmN0aW9uPigpO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKFwiT2JzZXJ2ZXJcIik7XG5cbiAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCA9IG9uTmV4dCB8fCBmdW5jdGlvbigpe307XG4gICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yID0gb25FcnJvciB8fCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQgPSBvbkNvbXBsZXRlZCB8fCBmdW5jdGlvbigpe307XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vbk5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzU3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzU3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHVibGljIGZhaWwoZSkge1xuICAgICAgICAvLyAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAvLyAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgLy8gICAgICAgIHRoaXMuZXJyb3IoZSk7XG4gICAgICAgIC8vICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NlSGFuZGxlcihkaXNwb3NlSGFuZGxlcjpkeUNiLkNvbGxlY3Rpb248RnVuY3Rpb24+KXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyID0gZGlzcG9zZUhhbmRsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhyb3cgQUJTVFJBQ1RfTUVUSE9EKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdCBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBnZXQgc291cmNlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBzb3VyY2Uoc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjphbnkgPSBuZXcgU3ViamVjdE9ic2VydmVyKCk7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxPzpGdW5jdGlvbnxPYnNlcnZlciwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IDxBdXRvRGV0YWNoT2JzZXJ2ZXI+YXJnMVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICAvL3RoaXMuX3NvdXJjZSAmJiBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLl9zb3VyY2UuZGlzcG9zZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBJbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUodGhpcywgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX3NvdXJjZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0odGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLnJlbW92ZUNoaWxkKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBHZW5lcmF0b3JTdWJqZWN0IGV4dGVuZHMgRGlzcG9zZXIgaW1wbGVtZW50cyBJT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdGFydDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGdldCBpc1N0YXJ0KCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNTdGFydDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNTdGFydChpc1N0YXJ0OmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IGlzU3RhcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICAgICAgc3VwZXIoXCJHZW5lcmF0b3JTdWJqZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9ic2VydmVyOmFueSA9IG5ldyBTdWJqZWN0T2JzZXJ2ZXIoKTtcblxuICAgICAgICAvKiFcbiAgICAgICAgb3V0ZXIgaG9vayBtZXRob2RcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZU5leHQodmFsdWU6YW55KXtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkFmdGVyTmV4dCh2YWx1ZTphbnkpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbklzQ29tcGxldGVkKHZhbHVlOmFueSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQmVmb3JlRXJyb3IoZXJyb3I6YW55KSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25BZnRlckVycm9yKGVycm9yOmFueSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQmVmb3JlQ29tcGxldGVkKCkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQWZ0ZXJDb21wbGV0ZWQoKSB7XG4gICAgICAgIH1cblxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMT86RnVuY3Rpb258T2JzZXJ2ZXIsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyA8QXV0b0RldGFjaE9ic2VydmVyPmFyZzFcbiAgICAgICAgICAgICAgICAgICAgOiBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxGdW5jdGlvbj5hcmcxLCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gSW5uZXJTdWJzY3JpcHRpb24uY3JlYXRlKHRoaXMsIG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNTdGFydCB8fCB0aGlzLm9ic2VydmVyLmlzRW1wdHkoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkJlZm9yZU5leHQodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5uZXh0KHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMub25BZnRlck5leHQodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgaWYodGhpcy5vbklzQ29tcGxldGVkKHZhbHVlKSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzU3RhcnQgfHwgdGhpcy5vYnNlcnZlci5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZUVycm9yKGVycm9yKTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5lcnJvcihlcnJvcik7XG5cbiAgICAgICAgICAgIHRoaXMub25BZnRlckVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1N0YXJ0IHx8IHRoaXMub2JzZXJ2ZXIuaXNFbXB0eSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub25CZWZvcmVDb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5vbkFmdGVyQ29tcGxldGVkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdG9TdHJlYW0oKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdHJlYW0gPSBudWxsO1xuXG4gICAgICAgICAgICBzdHJlYW0gPSBBbm9ueW1vdXNTdHJlYW0uY3JlYXRlKChvYnNlcnZlcjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlKG9ic2VydmVyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0KCl7XG4gICAgICAgICAgICB0aGlzLl9pc1N0YXJ0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5fc2V0RGlzcG9zZUhhbmRsZXIoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0b3AoKXtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RhcnQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5yZW1vdmVDaGlsZChvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXREaXNwb3NlSGFuZGxlcigpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBEaXNwb3Nlci5hZGREaXNwb3NlSGFuZGxlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlck5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJFcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBBdXRvRGV0YWNoT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgZHlDYi5Mb2cubG9nKFwib25seSBjYW4gZGlzcG9zZSBvbmNlXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlck5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vdGhpcy5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGNsYXNzIE1hcE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZWxlY3Rvcih2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIERvT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgcHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgcHJldk9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIC8vdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlQWxsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHN0cmVhbUdyb3VwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBnZXQgY3VycmVudE9ic2VydmVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG4gICAgICAgIHNldCBjdXJyZW50T2JzZXJ2ZXIoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2RvbmU6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBnZXQgZG9uZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RvbmU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGRvbmUoZG9uZTpib29sZWFuKXtcbiAgICAgICAgICAgIHRoaXMuX2RvbmUgPSBkb25lO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBkeUNiLkxvZy5lcnJvcighKGlubmVyU291cmNlIGluc3RhbmNlb2YgU3RyZWFtIHx8IEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSksIGR5Q2IuTG9nLmluZm8uRlVOQ19NVVNUX0JFKFwiaW5uZXJTb3VyY2VcIiwgXCJTdHJlYW0gb3IgUHJvbWlzZVwiKSk7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSl7XG4gICAgICAgICAgICAgICAgaW5uZXJTb3VyY2UgPSBmcm9tUHJvbWlzZShpbm5lclNvdXJjZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLmFkZENoaWxkKGlubmVyU291cmNlKTtcblxuICAgICAgICAgICAgaW5uZXJTb3VyY2UuYnVpbGRTdHJlYW0oSW5uZXJPYnNlcnZlci5jcmVhdGUodGhpcywgdGhpcy5fc3RyZWFtR3JvdXAsIGlubmVyU291cmNlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGFzcyBJbm5lck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHBhcmVudDpNZXJnZUFsbE9ic2VydmVyLCBzdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb248U3RyZWFtPiwgY3VycmVudFN0cmVhbTpTdHJlYW0pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0cmVhbSA9IGN1cnJlbnRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdHJlYW0gPSB0aGlzLl9jdXJyZW50U3RyZWFtLFxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHRoaXMuX3BhcmVudDtcblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAucmVtb3ZlQ2hpbGQoKHN0cmVhbTpTdHJlYW0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKHN0cmVhbSwgY3VycmVudFN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9pZiB0aGlzIGlubmVyU291cmNlIGlzIGFzeW5jIHN0cmVhbShhcyBwcm9taXNlIHN0cmVhbSksXG4gICAgICAgICAgICAvL2l0IHdpbGwgZmlyc3QgZXhlYyBhbGwgcGFyZW50Lm5leHQgYW5kIG9uZSBwYXJlbnQuY29tcGxldGVkLFxuICAgICAgICAgICAgLy90aGVuIGV4ZWMgYWxsIHRoaXMubmV4dCBhbmQgYWxsIHRoaXMuY29tcGxldGVkXG4gICAgICAgICAgICAvL3NvIGluIHRoaXMgY2FzZSwgaXQgc2hvdWxkIGludm9rZSBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCBhZnRlciB0aGUgbGFzdCBpbnZva2NhdGlvbiBvZiB0aGlzLmNvbXBsZXRlZChoYXZlIGludm9rZWQgYWxsIHRoZSBpbm5lclNvdXJjZSlcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzQXN5bmMoKSAmJiB0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNBc3luYygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudC5kb25lO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBjbGFzcyBDb25jYXRPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzdGFydE5leHRTdHJlYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgY3VycmVudE9ic2VydmVyOmFueSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3N0YXJ0TmV4dFN0cmVhbTpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zdGFydE5leHRTdHJlYW0gPSBzdGFydE5leHRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIC8vdGhpcy5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydE5leHRTdHJlYW0oKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJU3ViamVjdE9ic2VydmVyIHtcbiAgICAgICAgYWRkQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpO1xuICAgICAgICByZW1vdmVDaGlsZChvYnNlcnZlcjpPYnNlcnZlcik7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdE9ic2VydmVyIGltcGxlbWVudHMgSU9ic2VydmVye1xuICAgICAgICBwdWJsaWMgb2JzZXJ2ZXJzOmR5Q2IuQ29sbGVjdGlvbjxJT2JzZXJ2ZXI+ID0gZHlDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJT2JzZXJ2ZXI+KCk7XG5cbiAgICAgICAgcHVibGljIGlzRW1wdHkoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9ic2VydmVycy5nZXRDb3VudCgpID09PSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhZGRDaGlsZChvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5hZGRDaGlsZChvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMucmVtb3ZlQ2hpbGQoKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEp1ZGdlVXRpbHMuaXNFcXVhbChvYiwgb2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NlSGFuZGxlcigpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2JzZXJ2ZXI6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcihEaXNwb3Nlci5nZXREaXNwb3NlSGFuZGxlcigpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBEaXNwb3Nlci5yZW1vdmVBbGxEaXNwb3NlSGFuZGxlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEJhc2VTdHJlYW0gZXh0ZW5kcyBTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMTpGdW5jdGlvbnxPYnNlcnZlcnxTdWJqZWN0LCBvbkVycm9yPywgb25Db21wbGV0ZWQ/KTpJRGlzcG9zYWJsZSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBpZih0aGlzLmhhbmRsZVN1YmplY3QoYXJnMSkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IGFyZzFcbiAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgLy9vYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKERpc3Bvc2VyLmdldERpc3Bvc2VIYW5kbGVyKCkpO1xuICAgICAgICAgICAgRGlzcG9zZXIucmVtb3ZlQWxsRGlzcG9zZUhhbmRsZXIoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICBzdXBlci5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlQ29yZShvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgX2hhc011bHRpT2JzZXJ2ZXJzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLnNjaGVkdWxlci5nZXRPYnNlcnZlcnMoKSA+IDE7XG4gICAgICAgIC8vfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRG9TdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgb25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBBbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShEb09ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fb2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgTWFwU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIHNlbGVjdG9yKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zZWxlY3RvcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWFwT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLl9zZWxlY3RvcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbUFycmF5U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGFycmF5LCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYXJyYXk6QXJyYXk8YW55PiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnJheTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBhcnJheSA9IHRoaXMuX2FycmF5LFxuICAgICAgICAgICAgICAgIGxlbiA9IGFycmF5Lmxlbmd0aDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChhcnJheVtpXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzLmNhbGxlZShpICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyLCAwLCBsb29wUmVjdXJzaXZlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21Qcm9taXNlU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJvbWlzZTphbnksIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocHJvbWlzZSwgc2NoZWR1bGVyKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcm9taXNlOmFueSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJvbWlzZTphbnksIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy90b2RvIHJlbW92ZSB0ZXN0IGxvZ2ljIGZyb20gcHJvZHVjdCBsb2dpYyhhcyBTY2hlZHVsZXItPnB1YmxpY3h4eCwgRnJvbVByb21pc2UtPnRoZW4uLi4pXG4gICAgICAgICAgICB0aGlzLl9wcm9taXNlLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGRhdGEpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICB9LCBvYnNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tRXZlbnRQYXR0ZXJuU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoYWRkSGFuZGxlcjpGdW5jdGlvbiwgcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGFkZEhhbmRsZXIsIHJlbW92ZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYWRkSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3JlbW92ZUhhbmRsZXI6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIgPSBhZGRIYW5kbGVyO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlSGFuZGxlciA9IHJlbW92ZUhhbmRsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBpbm5lckhhbmRsZXIoZXZlbnQpe1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGlubmVySGFuZGxlcik7XG5cbiAgICAgICAgICAgIERpc3Bvc2VyLmFkZERpc3Bvc2VIYW5kbGVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLl9yZW1vdmVIYW5kbGVyKGlubmVySGFuZGxlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc3Vic2NyaWJlRnVuYyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihzdWJzY3JpYmVGdW5jKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyOkF1dG9EZXRhY2hPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuaGFuZGxlU3ViamVjdChhcmd1bWVudHNbMF0pKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyID0gQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZShvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgLy9vYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKERpc3Bvc2VyLmdldERpc3Bvc2VIYW5kbGVyKCkpO1xuICAgICAgICAgICAgRGlzcG9zZXIucmVtb3ZlQWxsRGlzcG9zZUhhbmRsZXIoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgSW50ZXJ2YWxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShpbnRlcnZhbDpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhpbnRlcnZhbCwgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgb2JqLmluaXRXaGVuQ3JlYXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pbnRlcnZhbDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGludGVydmFsOm51bWJlciwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSBpbnRlcnZhbDtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGluaXRXaGVuQ3JlYXRlKCl7XG4gICAgICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IHRoaXMuX2ludGVydmFsIDw9IDAgPyAxIDogdGhpcy5faW50ZXJ2YWw7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGlkID0gbnVsbDtcblxuICAgICAgICAgICAgaWQgPSB0aGlzLnNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXIsIDAsIHRoaXMuX2ludGVydmFsLCAoY291bnQpID0+IHtcbiAgICAgICAgICAgICAgICAvL3NlbGYuc2NoZWR1bGVyLm5leHQoY291bnQpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoY291bnQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50ICsgMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBEaXNwb3Nlci5hZGREaXNwb3NlSGFuZGxlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5jbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXIsICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0aW1lKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBEaXNwb3Nlci5hZGREaXNwb3NlSGFuZGxlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5jYW5jZWxOZXh0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNlbGYuc2NoZWR1bGVyLnJlcXVlc3RMb29wSWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICAvL3RoaXMuX29ic2VydmVyID0gQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvcixvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc3RyZWFtR3JvdXAgPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1lcmdlQWxsT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCBzdHJlYW1Hcm91cCkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBUYWtlVW50aWxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBvdGhlclN0ZWFtOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgb3RoZXJTdGVhbSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb3RoZXJTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBvdGhlclN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX290aGVyU3RyZWFtID0gSnVkZ2VVdGlscy5pc1Byb21pc2Uob3RoZXJTdHJlYW0pID8gZnJvbVByb21pc2Uob3RoZXJTdHJlYW0pIDogb3RoZXJTdHJlYW07XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgdGhpcy5fb3RoZXJTdHJlYW0uYnVpbGRTdHJlYW0oVGFrZVVudGlsT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBDb25jYXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2VzOkFycmF5PFN0cmVhbT4pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZXM6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKTtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2VzOkFycmF5PFN0cmVhbT4pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgLy90b2RvIGRvbid0IHNldCBzY2hlZHVsZXIgaGVyZT9cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc291cmNlc1swXS5zY2hlZHVsZXI7XG5cbiAgICAgICAgICAgIHNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc1Byb21pc2Uoc291cmNlKSl7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuYWRkQ2hpbGQoZnJvbVByb21pc2Uoc291cmNlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuYWRkQ2hpbGQoc291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY291bnQgPSB0aGlzLl9zb3VyY2VzLmdldENvdW50KCk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvb3BSZWN1cnNpdmUoaSkge1xuICAgICAgICAgICAgICAgIGlmKGkgPT09IGNvdW50KXtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuZ2V0Q2hpbGQoaSkuYnVpbGRTdHJlYW0oQ29uY2F0T2JzZXJ2ZXIuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIsICgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFJlY3Vyc2l2ZShpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIDAsIGxvb3BSZWN1cnNpdmUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBSZXBlYXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBjb3VudDpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIGNvdW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9jb3VudDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIGNvdW50Om51bWJlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fY291bnQgPSBjb3VudDtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuXG4gICAgICAgICAgICAvL3RoaXMuc3ViamVjdEdyb3VwID0gdGhpcy5fc291cmNlLnN1YmplY3RHcm91cDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvb3BSZWN1cnNpdmUoY291bnQpIHtcbiAgICAgICAgICAgICAgICBpZihjb3VudCA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9zb3VyY2UuYnVpbGRTdHJlYW0oQ29uY2F0T2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvb3BSZWN1cnNpdmUoY291bnQgLSAxKTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIHRoaXMuX2NvdW50LCBsb29wUmVjdXJzaXZlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShJZ25vcmVFbGVtZW50c09ic2VydmVyLmNyZWF0ZShvYnNlcnZlcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgdmFyIGNyZWF0ZVN0cmVhbSA9IChzdWJzY3JpYmVGdW5jKSA9PiB7XG4gICAgICAgIHJldHVybiBBbm9ueW1vdXNTdHJlYW0uY3JlYXRlKHN1YnNjcmliZUZ1bmMpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21BcnJheSA9IChhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+e1xuICAgICAgICByZXR1cm4gRnJvbUFycmF5U3RyZWFtLmNyZWF0ZShhcnJheSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tUHJvbWlzZSA9IChwcm9taXNlOmFueSwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PntcbiAgICAgICAgcmV0dXJuIEZyb21Qcm9taXNlU3RyZWFtLmNyZWF0ZShwcm9taXNlLCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21FdmVudFBhdHRlcm4gPSAoYWRkSGFuZGxlcjpGdW5jdGlvbiwgcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbikgPT57XG4gICAgICAgIHJldHVybiBGcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLmNyZWF0ZShhZGRIYW5kbGVyLCByZW1vdmVIYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBpbnRlcnZhbCA9IChpbnRlcnZhbCwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PiB7XG4gICAgICAgIHJldHVybiBJbnRlcnZhbFN0cmVhbS5jcmVhdGUoaW50ZXJ2YWwsIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgaW50ZXJ2YWxSZXF1ZXN0ID0gKHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT4ge1xuICAgICAgICByZXR1cm4gSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLmNyZWF0ZShzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGVtcHR5ID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+e1xuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGNhbGxGdW5jID0gKGZ1bmM6RnVuY3Rpb24sIGNvbnRleHQgPSByb290KSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZnVuYy5jYWxsKGNvbnRleHQsIG51bGwpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfSlcbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIHZhciBkZWZhdWx0SXNFcXVhbCA9IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBhID09PSBiO1xuICAgIH07XG5cbiAgICBleHBvcnQgY2xhc3MgUmVjb3JkIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUodGltZTpudW1iZXIsIHZhbHVlOmFueSwgYWN0aW9uVHlwZT86QWN0aW9uVHlwZSwgY29tcGFyZXI/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXModGltZSwgdmFsdWUsIGFjdGlvblR5cGUsIGNvbXBhcmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3RpbWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgZ2V0IHRpbWUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90aW1lO1xuICAgICAgICB9XG4gICAgICAgIHNldCB0aW1lKHRpbWU6bnVtYmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdmFsdWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgZ2V0IHZhbHVlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHZhbHVlKHZhbHVlOm51bWJlcil7XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYWN0aW9uVHlwZTpBY3Rpb25UeXBlID0gbnVsbDtcbiAgICAgICAgZ2V0IGFjdGlvblR5cGUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY3Rpb25UeXBlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBhY3Rpb25UeXBlKGFjdGlvblR5cGU6QWN0aW9uVHlwZSl7XG4gICAgICAgICAgICB0aGlzLl9hY3Rpb25UeXBlID0gYWN0aW9uVHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2NvbXBhcmVyOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih0aW1lLCB2YWx1ZSwgYWN0aW9uVHlwZTpBY3Rpb25UeXBlLCBjb21wYXJlcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fYWN0aW9uVHlwZSA9IGFjdGlvblR5cGU7XG4gICAgICAgICAgICB0aGlzLl9jb21wYXJlciA9IGNvbXBhcmVyIHx8IGRlZmF1bHRJc0VxdWFsO1xuICAgICAgICB9XG5cbiAgICAgICAgZXF1YWxzKG90aGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZSA9PT0gb3RoZXIudGltZSAmJiB0aGlzLl9jb21wYXJlcih0aGlzLl92YWx1ZSwgb3RoZXIudmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgTW9ja09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gPFtSZWNvcmRdPltdO1xuICAgICAgICBnZXQgbWVzc2FnZXMoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgICAgICAgfVxuICAgICAgICBzZXQgbWVzc2FnZXMobWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NjaGVkdWxlcjpUZXN0U2NoZWR1bGVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCB2YWx1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgZXJyb3IpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgbnVsbCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb3B5KCl7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gTW9ja09ic2VydmVyLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXN1bHQubWVzc2FnZXMgPSB0aGlzLl9tZXNzYWdlcztcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1vY2tQcm9taXNle1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciwgbWVzc2FnZXM6W1JlY29yZF0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIsIG1lc3NhZ2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gPFtSZWNvcmRdPltdO1xuICAgICAgICAvL2dldCBtZXNzYWdlcygpe1xuICAgICAgICAvLyAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXM7XG4gICAgICAgIC8vfVxuICAgICAgICAvL3NldCBtZXNzYWdlcyhtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgIC8vICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIHByaXZhdGUgX3NjaGVkdWxlcjpUZXN0U2NoZWR1bGVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciwgbWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0aGVuKHN1Y2Nlc3NDYjpGdW5jdGlvbiwgZXJyb3JDYjpGdW5jdGlvbiwgb2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdmFyIHNjaGVkdWxlciA9IDxUZXN0U2NoZWR1bGVyPih0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIHRoaXMuX21lc3NhZ2VzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIGNvbnN0IFNVQlNDUklCRV9USU1FID0gMjAwO1xuICAgIGNvbnN0IERJU1BPU0VfVElNRSA9IDEwMDA7XG5cbiAgICBleHBvcnQgY2xhc3MgVGVzdFNjaGVkdWxlciBleHRlbmRzIFNjaGVkdWxlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgbmV4dCh0aWNrLCB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgdmFsdWUsIEFjdGlvblR5cGUuTkVYVCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGVycm9yKHRpY2ssIGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCBlcnJvciwgQWN0aW9uVHlwZS5FUlJPUik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGNvbXBsZXRlZCh0aWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCBudWxsLCBBY3Rpb25UeXBlLkNPTVBMRVRFRCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShpc1Jlc2V0OmJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGlzUmVzZXQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoaXNSZXNldDpib29sZWFuKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVzZXQgPSBpc1Jlc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY2xvY2s6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgZ2V0IGNsb2NrKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Nsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0IGNsb2NrKGNsb2NrOm51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSBjbG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzUmVzZXQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwcml2YXRlIF9pc0Rpc3Bvc2VkOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHJpdmF0ZSBfdGltZXJNYXA6ZHlDYi5IYXNoPEZ1bmN0aW9uPiA9IGR5Q2IuSGFzaC5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX3N0cmVhbU1hcDpkeUNiLkhhc2g8RnVuY3Rpb24+ID0gZHlDYi5IYXNoLmNyZWF0ZTxGdW5jdGlvbj4oKTtcbiAgICAgICAgcHJpdmF0ZSBfc3Vic2NyaWJlZFRpbWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfZGlzcG9zZWRUaW1lOm51bWJlciA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIHNldFN0cmVhbU1hcChvYnNlcnZlcjpJT2JzZXJ2ZXIsIG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgbWVzc2FnZXMuZm9yRWFjaCgocmVjb3JkOlJlY29yZCkgPT57XG4gICAgICAgICAgICAgICAgdmFyIGZ1bmMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZWNvcmQuYWN0aW9uVHlwZSl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5ORVhUOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQocmVjb3JkLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBBY3Rpb25UeXBlLkVSUk9SOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKHJlY29yZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT01QTEVURUQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gKCkgPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBkeUNiLkxvZy5lcnJvcih0cnVlLCBkeUNiLkxvZy5pbmZvLkZVTkNfVU5LTk9XKFwiYWN0aW9uVHlwZVwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9zdHJlYW1NYXAuYWRkQ2hpbGQoU3RyaW5nKHJlY29yZC50aW1lKSwgZnVuYyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXI6TW9ja09ic2VydmVyLCBpbml0aWFsOmFueSwgcmVjdXJzaXZlRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzID0gW10sXG4gICAgICAgICAgICAgICAgY29weU9ic2VydmVyID0gb2JzZXJ2ZXIuY29weT8gb2JzZXJ2ZXIuY29weSgpIDogb2JzZXJ2ZXI7XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5uZXh0KHNlbGYuX2Nsb2NrLCB2YWx1ZSkpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuX3RpY2soMSk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLmNvbXBsZXRlZChzZWxmLl9jbG9jaykpO1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0U3RyZWFtTWFwKGNvcHlPYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJlY3Vyc2l2ZUZ1bmMoaW5pdGlhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGludGVydmFsOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICAvL3Byb2R1Y2UgMTAgdmFsIGZvciB0ZXN0XG4gICAgICAgICAgICB2YXIgQ09VTlQgPSAxMCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlcyA9IFtdO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB3aGlsZSAoQ09VTlQgPiAwICYmICF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGljayhpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIGluaXRpYWwpKTtcblxuICAgICAgICAgICAgICAgIC8vbm8gbmVlZCB0byBpbnZva2UgYWN0aW9uXG4gICAgICAgICAgICAgICAgLy9hY3Rpb24oaW5pdGlhbCk7XG5cbiAgICAgICAgICAgICAgICBpbml0aWFsKys7XG4gICAgICAgICAgICAgICAgQ09VTlQtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IDEwMCxcbiAgICAgICAgICAgICAgICBudW0gPSAwO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB3aGlsZSAoQ09VTlQgPiAwICYmICF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGljayhpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIG51bSkpO1xuXG4gICAgICAgICAgICAgICAgbnVtKys7XG4gICAgICAgICAgICAgICAgQ09VTlQtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXRDbG9jaygpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNSZXNldCl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aGlzLl9zdWJzY3JpYmVkVGltZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydFdpdGhUaW1lKGNyZWF0ZTpGdW5jdGlvbiwgc3Vic2NyaWJlZFRpbWU6bnVtYmVyLCBkaXNwb3NlZFRpbWU6bnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXIgPSB0aGlzLmNyZWF0ZU9ic2VydmVyKCksXG4gICAgICAgICAgICAgICAgc291cmNlLCBzdWJzY3JpcHRpb247XG5cbiAgICAgICAgICAgIHRoaXMuX3N1YnNjcmliZWRUaW1lID0gc3Vic2NyaWJlZFRpbWU7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlZFRpbWUgPSBkaXNwb3NlZFRpbWU7XG5cbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gc3Vic2NyaWJlZFRpbWU7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KHN1YnNjcmliZWRUaW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc291cmNlID0gY3JlYXRlKCk7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uID0gc291cmNlLnN1YnNjcmliZShvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fcnVuQXQoZGlzcG9zZWRUaW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydFdpdGhTdWJzY3JpYmUoY3JlYXRlLCBzdWJzY3JpYmVkVGltZSA9IFNVQlNDUklCRV9USU1FKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydFdpdGhUaW1lKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUsIERJU1BPU0VfVElNRSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoRGlzcG9zZShjcmVhdGUsIGRpc3Bvc2VkVGltZSA9IERJU1BPU0VfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIFNVQlNDUklCRV9USU1FLCBkaXNwb3NlZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1YmxpY0Fic29sdXRlKHRpbWUsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KHRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpIHtcbiAgICAgICAgICAgIHZhciBleHRyZW1lTnVtQXJyID0gdGhpcy5fZ2V0TWluQW5kTWF4VGltZSgpLFxuICAgICAgICAgICAgICAgIG1pbiA9IGV4dHJlbWVOdW1BcnJbMF0sXG4gICAgICAgICAgICAgICAgbWF4ID0gZXh0cmVtZU51bUFyclsxXSxcbiAgICAgICAgICAgICAgICB0aW1lID0gbWluO1xuXG4gICAgICAgICAgICAvL3RvZG8gcmVkdWNlIGxvb3AgdGltZVxuICAgICAgICAgICAgd2hpbGUgKHRpbWUgPD0gbWF4KSB7XG4gICAgICAgICAgICAgICAgLy9iZWNhdXNlIFwiX2V4ZWMsX3J1blN0cmVhbVwiIG1heSBjaGFuZ2UgXCJfY2xvY2tcIixcbiAgICAgICAgICAgICAgICAvL3NvIGl0IHNob3VsZCByZXNldCB0aGUgX2Nsb2NrXG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9jayA9IHRpbWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9leGVjKHRpbWUsIHRoaXMuX3RpbWVyTWFwKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGltZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3J1blN0cmVhbSh0aW1lKTtcblxuICAgICAgICAgICAgICAgIHRpbWUrKztcblxuICAgICAgICAgICAgICAgIC8vdG9kbyBnZXQgbWF4IHRpbWUgb25seSBmcm9tIHN0cmVhbU1hcD9cbiAgICAgICAgICAgICAgICAvL25lZWQgcmVmcmVzaCBtYXggdGltZS5cbiAgICAgICAgICAgICAgICAvL2JlY2F1c2UgaWYgdGltZXJNYXAgaGFzIGNhbGxiYWNrIHRoYXQgY3JlYXRlIGluZmluaXRlIHN0cmVhbShhcyBpbnRlcnZhbCksXG4gICAgICAgICAgICAgICAgLy9pdCB3aWxsIHNldCBzdHJlYW1NYXAgc28gdGhhdCB0aGUgbWF4IHRpbWUgd2lsbCBjaGFuZ2VcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLl9nZXRNaW5BbmRNYXhUaW1lKClbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlU3RyZWFtKGFyZ3Mpe1xuICAgICAgICAgICAgcmV0dXJuIFRlc3RTdHJlYW0uY3JlYXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZU9ic2VydmVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1vY2tPYnNlcnZlci5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlUmVzb2x2ZWRQcm9taXNlKHRpbWU6bnVtYmVyLCB2YWx1ZTphbnkpe1xuICAgICAgICAgICAgcmV0dXJuIE1vY2tQcm9taXNlLmNyZWF0ZSh0aGlzLCBbVGVzdFNjaGVkdWxlci5uZXh0KHRpbWUsIHZhbHVlKSwgVGVzdFNjaGVkdWxlci5jb21wbGV0ZWQodGltZSsxKV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVJlamVjdFByb21pc2UodGltZTpudW1iZXIsIGVycm9yOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gTW9ja1Byb21pc2UuY3JlYXRlKHRoaXMsIFtUZXN0U2NoZWR1bGVyLmVycm9yKHRpbWUsIGVycm9yKV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZ2V0TWluQW5kTWF4VGltZSgpe1xuICAgICAgICAgICAgdmFyIHRpbWVBcnIgPSB0aGlzLl90aW1lck1hcC5nZXRLZXlzKCkuYWRkQ2hpbGRyZW4odGhpcy5fc3RyZWFtTWFwLmdldEtleXMoKSlcbiAgICAgICAgICAgICAgICAubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlcihrZXkpO1xuICAgICAgICAgICAgICAgIH0pLnRvQXJyYXkoKTtcblxuICAgICAgICAgICAgcmV0dXJuIFtNYXRoLm1pbi5hcHBseShNYXRoLCB0aW1lQXJyKSwgTWF0aC5tYXguYXBwbHkoTWF0aCwgdGltZUFycildO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZXhlYyh0aW1lLCBtYXApe1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBtYXAuZ2V0Q2hpbGQoU3RyaW5nKHRpbWUpKTtcblxuICAgICAgICAgICAgaWYoaGFuZGxlcil7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcnVuU3RyZWFtKHRpbWUpe1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9zdHJlYW1NYXAuZ2V0Q2hpbGQoU3RyaW5nKHRpbWUpKTtcblxuICAgICAgICAgICAgaWYoaGFuZGxlcil7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcnVuQXQodGltZTpudW1iZXIsIGNhbGxiYWNrOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lck1hcC5hZGRDaGlsZChTdHJpbmcodGltZSksIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3RpY2sodGltZTpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrICs9IHRpbWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuIiwibW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBlbnVtIEFjdGlvblR5cGV7XG4gICAgICAgIE5FWFQsXG4gICAgICAgIEVSUk9SLFxuICAgICAgICBDT01QTEVURURcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFtIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMobWVzc2FnZXMsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdmFyIHNjaGVkdWxlciA9IDxUZXN0U2NoZWR1bGVyPih0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9