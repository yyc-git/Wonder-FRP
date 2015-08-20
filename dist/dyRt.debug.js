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




var dyRt;
(function (dyRt) {
    var SingleDisposable = (function () {
        function SingleDisposable(disposeHandler) {
            this._disposeHandler = null;
            this._disposeHandler = disposeHandler;
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
            this._disposeHandler();
        };
        return SingleDisposable;
    })();
    dyRt.SingleDisposable = SingleDisposable;
})(dyRt || (dyRt = {}));


var dyRt;
(function (dyRt) {
    var GroupDisposable = (function () {
        function GroupDisposable(disposable) {
            this._group = dyCb.Collection.create();
            if (disposable) {
                this._group.addChild(disposable);
            }
        }
        GroupDisposable.create = function (disposable) {
            var obj = new this(disposable);
            return obj;
        };
        GroupDisposable.prototype.add = function (disposable) {
            this._group.addChild(disposable);
            return this;
        };
        GroupDisposable.prototype.dispose = function () {
            this._group.forEach(function (disposable) {
                disposable.dispose();
            });
        };
        return GroupDisposable;
    })();
    dyRt.GroupDisposable = GroupDisposable;
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
            return dyRt.SingleDisposable.create();
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
                var isEnd = action(time);
                if (isEnd) {
                    return;
                }
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
            //private _disposeHandler:dyCb.Collection<Function> = dyCb.Collection.create<Function>();
            this._disposable = null;
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
            if (this._disposable) {
                this._disposable.dispose();
            }
            //this._disposeHandler.forEach((handler) => {
            //    handler();
            //});
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
            //this._disposeHandler = disposeHandler;
        };
        Observer.prototype.setDisposable = function (disposable) {
            this._disposable = disposable;
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
            this._observer.setDisposable(this._source.buildStream(this));
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
        //todo
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
            var self = this;
            this._isStart = true;
            this.observer.setDisposable(dyRt.SingleDisposable.create(function () {
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
        function MergeAllObserver(currentObserver, streamGroup, groupDisposable) {
            _super.call(this, null, null, null);
            this._currentObserver = null;
            this._done = false;
            this._streamGroup = null;
            this._groupDisposable = null;
            this._currentObserver = currentObserver;
            this._streamGroup = streamGroup;
            this._groupDisposable = groupDisposable;
        }
        MergeAllObserver.create = function (currentObserver, streamGroup, groupDisposable) {
            return new this(currentObserver, streamGroup, groupDisposable);
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
            this._groupDisposable.add(innerSource.buildStream(InnerObserver.create(this, this._streamGroup, innerSource)));
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
                return dyRt.JudgeUtils.isEqual(ob, observer);
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
            return dyCb.Log.error(true, dyCb.Log.info.ABSTRACT_METHOD);
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
            observer.setDisposable(this.buildStream(observer));
            return observer;
        };
        BaseStream.prototype.buildStream = function (observer) {
            _super.prototype.buildStream.call(this, observer);
            return this.subscribeCore(observer);
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
            return this._source.buildStream(dyRt.DoObserver.create(observer, this._observer));
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
            return this._source.buildStream(dyRt.MapObserver.create(observer, this._selector));
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
            return dyRt.SingleDisposable.create();
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
            this._promise.then(function (data) {
                observer.next(data);
                observer.completed();
            }, function (err) {
                observer.error(err);
            }, observer);
            return dyRt.SingleDisposable.create();
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
            return dyRt.SingleDisposable.create(function () {
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
            this.scheduler = dyRt.Scheduler.create();
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
            //
            //observer.setDisposeHandler(Disposer.getDisposeHandler());
            //Disposer.removeAllDisposeHandler();
            observer.setDisposable(this.buildStream(observer));
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
            //Disposer.addDisposeHandler(() => {
            //});
            return dyRt.SingleDisposable.create(function () {
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
            this._isEnd = false;
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
                return self._isEnd;
            });
            return dyRt.SingleDisposable.create(function () {
                dyRt.root.cancelNextRequestAnimationFrame(self.scheduler.requestLoopId);
                self._isEnd = true;
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
            var streamGroup = dyCb.Collection.create(), groupDisposable = dyRt.GroupDisposable.create();
            this._source.buildStream(dyRt.MergeAllObserver.create(observer, streamGroup, groupDisposable));
            return groupDisposable;
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
            var group = dyRt.GroupDisposable.create();
            group.add(this._source.buildStream(observer));
            group.add(this._otherStream.buildStream(dyRt.TakeUntilObserver.create(observer)));
            return group;
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
            var self = this, count = this._sources.getCount(), d = dyRt.GroupDisposable.create();
            function loopRecursive(i) {
                if (i === count) {
                    observer.completed();
                    return;
                }
                d.add(self._sources.getChild(i).buildStream(dyRt.ConcatObserver.create(observer, function () {
                    loopRecursive(i + 1);
                })));
            }
            this.scheduler.publishRecursive(observer, 0, loopRecursive);
            return dyRt.GroupDisposable.create(d);
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
            var self = this, d = dyRt.GroupDisposable.create();
            function loopRecursive(count) {
                if (count === 0) {
                    observer.completed();
                    return;
                }
                d.add(self._source.buildStream(dyRt.ConcatObserver.create(observer, function () {
                    loopRecursive(count - 1);
                })));
            }
            this.scheduler.publishRecursive(observer, this._count, loopRecursive);
            return dyRt.GroupDisposable.create(d);
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
            return this._source.buildStream(dyRt.IgnoreElementsObserver.create(observer));
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
    dyRt.judge = function (condition, thenSource, elseSource) {
        return condition() ? thenSource() : elseSource();
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
            this._observer = null;
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
            var self = this, 
            //messages = [],
            next = null, completed = null;
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
            //this.setStreamMap(this._observer, <[Record]>messages);
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
            //this.setStreamMap(this._observer, <[Record]>messages);
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
            //todo reduce loop time
            while (time <= max) {
                //if(this._isDisposed){
                //    break;
                //}
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
            return dyRt.SingleDisposable.create();
        };
        return TestStream;
    })(dyRt.BaseStream);
    dyRt.TestStream = TestStream;
})(dyRt || (dyRt = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkp1ZGdlVXRpbHMudHMiLCJjb3JlL0VudGl0eS50cyIsIkRpc3Bvc2FibGUvSURpc3Bvc2FibGUudHMiLCJEaXNwb3NhYmxlL1NpbmdsZURpc3Bvc2FibGUudHMiLCJEaXNwb3NhYmxlL0dyb3VwRGlzcG9zYWJsZS50cyIsIm9ic2VydmVyL0lPYnNlcnZlci50cyIsIkRpc3Bvc2FibGUvRGlzcG9zZXIudHMiLCJEaXNwb3NhYmxlL0lubmVyU3Vic2NyaXB0aW9uLnRzIiwiRGlzcG9zYWJsZS9Jbm5lclN1YnNjcmlwdGlvbkdyb3VwLnRzIiwiZ2xvYmFsL1ZhcmlhYmxlLnRzIiwiZ2xvYmFsL0NvbnN0LnRzIiwiZ2xvYmFsL2luaXQudHMiLCJjb3JlL1N0cmVhbS50cyIsImNvcmUvU2NoZWR1bGVyLnRzIiwiY29yZS9PYnNlcnZlci50cyIsInN1YmplY3QvU3ViamVjdC50cyIsInN1YmplY3QvR2VuZXJhdG9yU3ViamVjdC50cyIsIm9ic2VydmVyL0Fub255bW91c09ic2VydmVyLnRzIiwib2JzZXJ2ZXIvQXV0b0RldGFjaE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvTWFwT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9Eb09ic2VydmVyLnRzIiwib2JzZXJ2ZXIvTWVyZ2VBbGxPYnNlcnZlci50cyIsIm9ic2VydmVyL1Rha2VVbnRpbE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvQ29uY2F0T2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9JU3ViamVjdE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvU3ViamVjdE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvSWdub3JlRWxlbWVudHNPYnNlcnZlci50cyIsInN0cmVhbS9CYXNlU3RyZWFtLnRzIiwic3RyZWFtL0RvU3RyZWFtLnRzIiwic3RyZWFtL01hcFN0cmVhbS50cyIsInN0cmVhbS9Gcm9tQXJyYXlTdHJlYW0udHMiLCJzdHJlYW0vRnJvbVByb21pc2VTdHJlYW0udHMiLCJzdHJlYW0vRnJvbUV2ZW50UGF0dGVyblN0cmVhbS50cyIsInN0cmVhbS9Bbm9ueW1vdXNTdHJlYW0udHMiLCJzdHJlYW0vSW50ZXJ2YWxTdHJlYW0udHMiLCJzdHJlYW0vSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLnRzIiwic3RyZWFtL01lcmdlQWxsU3RyZWFtLnRzIiwic3RyZWFtL1Rha2VVbnRpbFN0cmVhbS50cyIsInN0cmVhbS9Db25jYXRTdHJlYW0udHMiLCJzdHJlYW0vUmVwZWF0U3RyZWFtLnRzIiwic3RyZWFtL0lnbm9yZUVsZW1lbnRzU3RyZWFtLnRzIiwiZ2xvYmFsL09wZXJhdG9yLnRzIiwidGVzdGluZy9SZWNvcmQudHMiLCJ0ZXN0aW5nL01vY2tPYnNlcnZlci50cyIsInRlc3RpbmcvTW9ja1Byb21pc2UudHMiLCJ0ZXN0aW5nL1Rlc3RTY2hlZHVsZXIudHMiLCJ0ZXN0aW5nL0FjdGlvblR5cGUudHMiLCJ0ZXN0aW5nL1Rlc3RTdHJlYW0udHMiXSwibmFtZXMiOlsiZHlSdCIsImR5UnQuSnVkZ2VVdGlscyIsImR5UnQuSnVkZ2VVdGlscy5jb25zdHJ1Y3RvciIsImR5UnQuSnVkZ2VVdGlscy5pc1Byb21pc2UiLCJkeVJ0Lkp1ZGdlVXRpbHMuaXNFcXVhbCIsImR5UnQuRW50aXR5IiwiZHlSdC5FbnRpdHkuY29uc3RydWN0b3IiLCJkeVJ0LkVudGl0eS51aWQiLCJkeVJ0LlNpbmdsZURpc3Bvc2FibGUiLCJkeVJ0LlNpbmdsZURpc3Bvc2FibGUuY29uc3RydWN0b3IiLCJkeVJ0LlNpbmdsZURpc3Bvc2FibGUuY3JlYXRlIiwiZHlSdC5TaW5nbGVEaXNwb3NhYmxlLnNldERpc3Bvc2VIYW5kbGVyIiwiZHlSdC5TaW5nbGVEaXNwb3NhYmxlLmRpc3Bvc2UiLCJkeVJ0Lkdyb3VwRGlzcG9zYWJsZSIsImR5UnQuR3JvdXBEaXNwb3NhYmxlLmNvbnN0cnVjdG9yIiwiZHlSdC5Hcm91cERpc3Bvc2FibGUuY3JlYXRlIiwiZHlSdC5Hcm91cERpc3Bvc2FibGUuYWRkIiwiZHlSdC5Hcm91cERpc3Bvc2FibGUuZGlzcG9zZSIsImR5UnQuRGlzcG9zZXIiLCJkeVJ0LkRpc3Bvc2VyLmNvbnN0cnVjdG9yIiwiZHlSdC5EaXNwb3Nlci5hZGREaXNwb3NlSGFuZGxlciIsImR5UnQuRGlzcG9zZXIuZ2V0RGlzcG9zZUhhbmRsZXIiLCJkeVJ0LkRpc3Bvc2VyLnJlbW92ZUFsbERpc3Bvc2VIYW5kbGVyIiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbiIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb24uY29uc3RydWN0b3IiLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uLmNyZWF0ZSIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb24uZGlzcG9zZSIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb25Hcm91cCIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb25Hcm91cC5jb25zdHJ1Y3RvciIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb25Hcm91cC5jcmVhdGUiLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uR3JvdXAuYWRkQ2hpbGQiLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uR3JvdXAuZGlzcG9zZSIsImR5UnQuU3RyZWFtIiwiZHlSdC5TdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LlN0cmVhbS5zdWJzY3JpYmUiLCJkeVJ0LlN0cmVhbS5idWlsZFN0cmVhbSIsImR5UnQuU3RyZWFtLmRvIiwiZHlSdC5TdHJlYW0ubWFwIiwiZHlSdC5TdHJlYW0uZmxhdE1hcCIsImR5UnQuU3RyZWFtLm1lcmdlQWxsIiwiZHlSdC5TdHJlYW0udGFrZVVudGlsIiwiZHlSdC5TdHJlYW0uY29uY2F0IiwiZHlSdC5TdHJlYW0ubWVyZ2UiLCJkeVJ0LlN0cmVhbS5yZXBlYXQiLCJkeVJ0LlN0cmVhbS5pZ25vcmVFbGVtZW50cyIsImR5UnQuU3RyZWFtLmhhbmRsZVN1YmplY3QiLCJkeVJ0LlN0cmVhbS5faXNTdWJqZWN0IiwiZHlSdC5TdHJlYW0uX3NldFN1YmplY3QiLCJkeVJ0LlNjaGVkdWxlciIsImR5UnQuU2NoZWR1bGVyLmNvbnN0cnVjdG9yIiwiZHlSdC5TY2hlZHVsZXIuY3JlYXRlIiwiZHlSdC5TY2hlZHVsZXIucmVxdWVzdExvb3BJZCIsImR5UnQuU2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUiLCJkeVJ0LlNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWwiLCJkeVJ0LlNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0IiwiZHlSdC5PYnNlcnZlciIsImR5UnQuT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0Lk9ic2VydmVyLmlzRGlzcG9zZWQiLCJkeVJ0Lk9ic2VydmVyLm5leHQiLCJkeVJ0Lk9ic2VydmVyLmVycm9yIiwiZHlSdC5PYnNlcnZlci5jb21wbGV0ZWQiLCJkeVJ0Lk9ic2VydmVyLmRpc3Bvc2UiLCJkeVJ0Lk9ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyIiwiZHlSdC5PYnNlcnZlci5zZXREaXNwb3NhYmxlIiwiZHlSdC5PYnNlcnZlci5vbk5leHQiLCJkeVJ0Lk9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0Lk9ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5TdWJqZWN0IiwiZHlSdC5TdWJqZWN0LmNvbnN0cnVjdG9yIiwiZHlSdC5TdWJqZWN0LmNyZWF0ZSIsImR5UnQuU3ViamVjdC5zb3VyY2UiLCJkeVJ0LlN1YmplY3Quc3Vic2NyaWJlIiwiZHlSdC5TdWJqZWN0Lm5leHQiLCJkeVJ0LlN1YmplY3QuZXJyb3IiLCJkeVJ0LlN1YmplY3QuY29tcGxldGVkIiwiZHlSdC5TdWJqZWN0LnN0YXJ0IiwiZHlSdC5TdWJqZWN0LnJlbW92ZSIsImR5UnQuU3ViamVjdC5kaXNwb3NlIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0IiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LmNvbnN0cnVjdG9yIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LmNyZWF0ZSIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5pc1N0YXJ0IiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0Lm9uQmVmb3JlTmV4dCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5vbkFmdGVyTmV4dCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5vbklzQ29tcGxldGVkIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0Lm9uQmVmb3JlRXJyb3IiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3Qub25BZnRlckVycm9yIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0Lm9uQmVmb3JlQ29tcGxldGVkIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0Lm9uQWZ0ZXJDb21wbGV0ZWQiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3Quc3Vic2NyaWJlIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0Lm5leHQiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3QuZXJyb3IiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3QuY29tcGxldGVkIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LnRvU3RyZWFtIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LnN0YXJ0IiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LnN0b3AiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3QucmVtb3ZlIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LmRpc3Bvc2UiLCJkeVJ0LkFub255bW91c09ic2VydmVyIiwiZHlSdC5Bbm9ueW1vdXNPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Bbm9ueW1vdXNPYnNlcnZlci5vbk5leHQiLCJkeVJ0LkFub255bW91c09ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LkFub255bW91c09ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLmRpc3Bvc2UiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5vbk5leHQiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0Lk1hcE9ic2VydmVyIiwiZHlSdC5NYXBPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuTWFwT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5NYXBPYnNlcnZlci5vbk5leHQiLCJkeVJ0Lk1hcE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0Lk1hcE9ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5Eb09ic2VydmVyIiwiZHlSdC5Eb09ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5Eb09ic2VydmVyLmNyZWF0ZSIsImR5UnQuRG9PYnNlcnZlci5vbk5leHQiLCJkeVJ0LkRvT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuRG9PYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlciIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5jcmVhdGUiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIuY3VycmVudE9ic2VydmVyIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLmRvbmUiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LklubmVyT2JzZXJ2ZXIiLCJkeVJ0LklubmVyT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LklubmVyT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Jbm5lck9ic2VydmVyLm9uTmV4dCIsImR5UnQuSW5uZXJPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5Jbm5lck9ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5Jbm5lck9ic2VydmVyLl9pc0FzeW5jIiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlciIsImR5UnQuVGFrZVVudGlsT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LlRha2VVbnRpbE9ic2VydmVyLmNyZWF0ZSIsImR5UnQuVGFrZVVudGlsT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuQ29uY2F0T2JzZXJ2ZXIiLCJkeVJ0LkNvbmNhdE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5Db25jYXRPYnNlcnZlci5jcmVhdGUiLCJkeVJ0LkNvbmNhdE9ic2VydmVyLm9uTmV4dCIsImR5UnQuQ29uY2F0T2JzZXJ2ZXIub25FcnJvciIsImR5UnQuQ29uY2F0T2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LlN1YmplY3RPYnNlcnZlciIsImR5UnQuU3ViamVjdE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5TdWJqZWN0T2JzZXJ2ZXIuaXNFbXB0eSIsImR5UnQuU3ViamVjdE9ic2VydmVyLm5leHQiLCJkeVJ0LlN1YmplY3RPYnNlcnZlci5lcnJvciIsImR5UnQuU3ViamVjdE9ic2VydmVyLmNvbXBsZXRlZCIsImR5UnQuU3ViamVjdE9ic2VydmVyLmFkZENoaWxkIiwiZHlSdC5TdWJqZWN0T2JzZXJ2ZXIucmVtb3ZlQ2hpbGQiLCJkeVJ0LlN1YmplY3RPYnNlcnZlci5kaXNwb3NlIiwiZHlSdC5TdWJqZWN0T2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSIsImR5UnQuSWdub3JlRWxlbWVudHNPYnNlcnZlciIsImR5UnQuSWdub3JlRWxlbWVudHNPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuSWdub3JlRWxlbWVudHNPYnNlcnZlci5jcmVhdGUiLCJkeVJ0Lklnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5JZ25vcmVFbGVtZW50c09ic2VydmVyLm9uRXJyb3IiLCJkeVJ0Lklnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LkJhc2VTdHJlYW0iLCJkeVJ0LkJhc2VTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkJhc2VTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuQmFzZVN0cmVhbS5zdWJzY3JpYmUiLCJkeVJ0LkJhc2VTdHJlYW0uYnVpbGRTdHJlYW0iLCJkeVJ0LkRvU3RyZWFtIiwiZHlSdC5Eb1N0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuRG9TdHJlYW0uY3JlYXRlIiwiZHlSdC5Eb1N0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5NYXBTdHJlYW0iLCJkeVJ0Lk1hcFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuTWFwU3RyZWFtLmNyZWF0ZSIsImR5UnQuTWFwU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkZyb21BcnJheVN0cmVhbSIsImR5UnQuRnJvbUFycmF5U3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Gcm9tQXJyYXlTdHJlYW0uY3JlYXRlIiwiZHlSdC5Gcm9tQXJyYXlTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuRnJvbUFycmF5U3RyZWFtLnN1YnNjcmliZUNvcmUubG9vcFJlY3Vyc2l2ZSIsImR5UnQuRnJvbVByb21pc2VTdHJlYW0iLCJkeVJ0LkZyb21Qcm9taXNlU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Gcm9tUHJvbWlzZVN0cmVhbS5jcmVhdGUiLCJkeVJ0LkZyb21Qcm9taXNlU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0iLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0uY3JlYXRlIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0uc3Vic2NyaWJlQ29yZS5pbm5lckhhbmRsZXIiLCJkeVJ0LkFub255bW91c1N0cmVhbSIsImR5UnQuQW5vbnltb3VzU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Bbm9ueW1vdXNTdHJlYW0uY3JlYXRlIiwiZHlSdC5Bbm9ueW1vdXNTdHJlYW0uc3Vic2NyaWJlIiwiZHlSdC5JbnRlcnZhbFN0cmVhbSIsImR5UnQuSW50ZXJ2YWxTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkludGVydmFsU3RyZWFtLmNyZWF0ZSIsImR5UnQuSW50ZXJ2YWxTdHJlYW0uaW5pdFdoZW5DcmVhdGUiLCJkeVJ0LkludGVydmFsU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkludGVydmFsUmVxdWVzdFN0cmVhbSIsImR5UnQuSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5JbnRlcnZhbFJlcXVlc3RTdHJlYW0uY3JlYXRlIiwiZHlSdC5JbnRlcnZhbFJlcXVlc3RTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuTWVyZ2VBbGxTdHJlYW0iLCJkeVJ0Lk1lcmdlQWxsU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5NZXJnZUFsbFN0cmVhbS5jcmVhdGUiLCJkeVJ0Lk1lcmdlQWxsU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LlRha2VVbnRpbFN0cmVhbSIsImR5UnQuVGFrZVVudGlsU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5UYWtlVW50aWxTdHJlYW0uY3JlYXRlIiwiZHlSdC5UYWtlVW50aWxTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuQ29uY2F0U3RyZWFtIiwiZHlSdC5Db25jYXRTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkNvbmNhdFN0cmVhbS5jcmVhdGUiLCJkeVJ0LkNvbmNhdFN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5Db25jYXRTdHJlYW0uc3Vic2NyaWJlQ29yZS5sb29wUmVjdXJzaXZlIiwiZHlSdC5SZXBlYXRTdHJlYW0iLCJkeVJ0LlJlcGVhdFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuUmVwZWF0U3RyZWFtLmNyZWF0ZSIsImR5UnQuUmVwZWF0U3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LlJlcGVhdFN0cmVhbS5zdWJzY3JpYmVDb3JlLmxvb3BSZWN1cnNpdmUiLCJkeVJ0Lklnbm9yZUVsZW1lbnRzU3RyZWFtIiwiZHlSdC5JZ25vcmVFbGVtZW50c1N0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuSWdub3JlRWxlbWVudHNTdHJlYW0uY3JlYXRlIiwiZHlSdC5JZ25vcmVFbGVtZW50c1N0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5SZWNvcmQiLCJkeVJ0LlJlY29yZC5jb25zdHJ1Y3RvciIsImR5UnQuUmVjb3JkLmNyZWF0ZSIsImR5UnQuUmVjb3JkLnRpbWUiLCJkeVJ0LlJlY29yZC52YWx1ZSIsImR5UnQuUmVjb3JkLmFjdGlvblR5cGUiLCJkeVJ0LlJlY29yZC5lcXVhbHMiLCJkeVJ0Lk1vY2tPYnNlcnZlciIsImR5UnQuTW9ja09ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIubWVzc2FnZXMiLCJkeVJ0Lk1vY2tPYnNlcnZlci5vbk5leHQiLCJkeVJ0Lk1vY2tPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0Lk1vY2tPYnNlcnZlci5kaXNwb3NlIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIuY29weSIsImR5UnQuTW9ja1Byb21pc2UiLCJkeVJ0Lk1vY2tQcm9taXNlLmNvbnN0cnVjdG9yIiwiZHlSdC5Nb2NrUHJvbWlzZS5jcmVhdGUiLCJkeVJ0Lk1vY2tQcm9taXNlLnRoZW4iLCJkeVJ0LlRlc3RTY2hlZHVsZXIiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY29uc3RydWN0b3IiLCJkeVJ0LlRlc3RTY2hlZHVsZXIubmV4dCIsImR5UnQuVGVzdFNjaGVkdWxlci5lcnJvciIsImR5UnQuVGVzdFNjaGVkdWxlci5jb21wbGV0ZWQiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNsb2NrIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnNldFN0cmVhbU1hcCIsImR5UnQuVGVzdFNjaGVkdWxlci5yZW1vdmUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZSIsImR5UnQuVGVzdFNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWwiLCJkeVJ0LlRlc3RTY2hlZHVsZXIucHVibGlzaEludGVydmFsUmVxdWVzdCIsImR5UnQuVGVzdFNjaGVkdWxlci5fc2V0Q2xvY2siLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc3RhcnRXaXRoVGltZSIsImR5UnQuVGVzdFNjaGVkdWxlci5zdGFydFdpdGhTdWJzY3JpYmUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc3RhcnRXaXRoRGlzcG9zZSIsImR5UnQuVGVzdFNjaGVkdWxlci5wdWJsaWNBYnNvbHV0ZSIsImR5UnQuVGVzdFNjaGVkdWxlci5zdGFydCIsImR5UnQuVGVzdFNjaGVkdWxlci5jcmVhdGVTdHJlYW0iLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlT2JzZXJ2ZXIiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlUmVzb2x2ZWRQcm9taXNlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNyZWF0ZVJlamVjdFByb21pc2UiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX2dldE1pbkFuZE1heFRpbWUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX2V4ZWMiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX3J1blN0cmVhbSIsImR5UnQuVGVzdFNjaGVkdWxlci5fcnVuQXQiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX3RpY2siLCJkeVJ0LkFjdGlvblR5cGUiLCJkeVJ0LlRlc3RTdHJlYW0iLCJkeVJ0LlRlc3RTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LlRlc3RTdHJlYW0uY3JlYXRlIiwiZHlSdC5UZXN0U3RyZWFtLnN1YnNjcmliZUNvcmUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDBDQUEwQztBQUMxQyxJQUFPLElBQUksQ0FZVjtBQVpELFdBQU8sSUFBSSxFQUFDLENBQUM7SUFDVEE7UUFBZ0NDLDhCQUFlQTtRQUEvQ0E7WUFBZ0NDLDhCQUFlQTtRQVUvQ0EsQ0FBQ0E7UUFUaUJELG9CQUFTQSxHQUF2QkEsVUFBd0JBLEdBQUdBO1lBQ3ZCRSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQTttQkFDTEEsQ0FBQ0EsTUFBS0EsQ0FBQ0EsVUFBVUEsWUFBQ0Es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LyA8cmVmZXJlbmNlIHBhdGg9XCIuL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGNsYXNzIEp1ZGdlVXRpbHMgZXh0ZW5kcyBkeUNiLkp1ZGdlVXRpbHMge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGlzUHJvbWlzZShvYmope1xuICAgICAgICAgICAgcmV0dXJuICEhb2JqXG4gICAgICAgICAgICAgICAgJiYgIXN1cGVyLmlzRnVuY3Rpb24ob2JqLnN1YnNjcmliZSlcbiAgICAgICAgICAgICAgICAmJiBzdXBlci5pc0Z1bmN0aW9uKG9iai50aGVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNFcXVhbChvYjE6RW50aXR5LCBvYjI6RW50aXR5KXtcbiAgICAgICAgICAgIHJldHVybiBvYjEudWlkID09PSBvYjIudWlkO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRW50aXR5e1xuICAgICAgICBwdWJsaWMgc3RhdGljIFVJRDpudW1iZXIgPSAxO1xuXG4gICAgICAgIHByaXZhdGUgX3VpZDpzdHJpbmcgPSBudWxsO1xuICAgICAgICBnZXQgdWlkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdWlkO1xuICAgICAgICB9XG4gICAgICAgIHNldCB1aWQodWlkOnN0cmluZyl7XG4gICAgICAgICAgICB0aGlzLl91aWQgPSB1aWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcih1aWRQcmU6c3RyaW5nKXtcbiAgICAgICAgICAgIHRoaXMuX3VpZCA9IHVpZFByZSArIFN0cmluZyhFbnRpdHkuVUlEKyspO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJRGlzcG9zYWJsZXtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgU2luZ2xlRGlzcG9zYWJsZSBpbXBsZW1lbnRzIElEaXNwb3NhYmxle1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShkaXNwb3NlSGFuZGxlcjpGdW5jdGlvbiA9IGZ1bmN0aW9uKCl7fSkge1xuICAgICAgICBcdHZhciBvYmogPSBuZXcgdGhpcyhkaXNwb3NlSGFuZGxlcik7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZGlzcG9zZUhhbmRsZXI6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGRpc3Bvc2VIYW5kbGVyOkZ1bmN0aW9uKXtcbiAgICAgICAgXHR0aGlzLl9kaXNwb3NlSGFuZGxlciA9IGRpc3Bvc2VIYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2VIYW5kbGVyKGhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIgPSBoYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBHcm91cERpc3Bvc2FibGUgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoZGlzcG9zYWJsZT86SURpc3Bvc2FibGUpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhkaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2dyb3VwOmR5Q2IuQ29sbGVjdGlvbjxJRGlzcG9zYWJsZT4gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPElEaXNwb3NhYmxlPigpO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGRpc3Bvc2FibGU/OklEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIGlmKGRpc3Bvc2FibGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2dyb3VwLmFkZENoaWxkKGRpc3Bvc2FibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFkZChkaXNwb3NhYmxlOklEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHRoaXMuX2dyb3VwLmFkZENoaWxkKGRpc3Bvc2FibGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9ncm91cC5mb3JFYWNoKChkaXNwb3NhYmxlOklEaXNwb3NhYmxlKSA9PiB7XG4gICAgICAgICAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgSU9ic2VydmVyIGV4dGVuZHMgSURpc3Bvc2FibGV7XG4gICAgICAgIG5leHQodmFsdWU6YW55KTtcbiAgICAgICAgZXJyb3IoZXJyb3I6YW55KTtcbiAgICAgICAgY29tcGxldGVkKCk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRGlzcG9zZXIgZXh0ZW5kcyBFbnRpdHl7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYWRkRGlzcG9zZUhhbmRsZXIoZnVuYzpGdW5jdGlvbil7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlci5hZGRDaGlsZChmdW5jKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RGlzcG9zZUhhbmRsZXIoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kaXNwb3NlSGFuZGxlci5jb3B5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUFsbERpc3Bvc2VIYW5kbGVyKCl7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlci5yZW1vdmVBbGxDaGlsZHJlbigpO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgc3RhdGljIF9kaXNwb3NlSGFuZGxlcjpkeUNiLlN0YWNrPEZ1bmN0aW9uPiA9IGR5Q2IuU3RhY2suY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIHN0YXRpYyBfZGlzcG9zZUhhbmRsZXI6ZHlDYi5Db2xsZWN0aW9uPEZ1bmN0aW9uPiA9IGR5Q2IuQ29sbGVjdGlvbi5jcmVhdGU8RnVuY3Rpb24+KCk7XG5cbiAgICAgICAgLy9wdWJsaWMgZGlzcG9zZUhhbmRsZXI6ZHlDYi5Db2xsZWN0aW9uPEZ1bmN0aW9uPiA9IGR5Q2IuQ29sbGVjdGlvbi5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vcHVibGljIGFkZERpc3Bvc2VIYW5kbGVyKGZ1bmM6RnVuY3Rpb24pe1xuICAgICAgICAvLyAgICAvL3RoaXMuX2Rpc3Bvc2VIYW5kbGVyLmFkZENoaWxkKGZ1bmMpO1xuICAgICAgICAvL31cbiAgICAgICAgLy9nZXQgZGlzcG9zZUhhbmRsZXIoKXtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyO1xuICAgICAgICAvL31cbiAgICAgICAgLy9zZXQgZGlzcG9zZUhhbmRsZXIoZGlzcG9zZUhhbmRsZXI6ZHlDYi5Db2xsZWN0aW9uPEZ1bmN0aW9uPil7XG4gICAgICAgIC8vICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyID0gZGlzcG9zZUhhbmRsZXI7XG4gICAgICAgIC8vfVxuXG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuXHRleHBvcnQgY2xhc3MgSW5uZXJTdWJzY3JpcHRpb24gaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJqZWN0OlN1YmplY3R8R2VuZXJhdG9yU3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcyhzdWJqZWN0LCBvYnNlcnZlcik7XG5cblx0XHRcdHJldHVybiBvYmo7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfc3ViamVjdDpTdWJqZWN0fEdlbmVyYXRvclN1YmplY3QgPSBudWxsO1xuXHRcdHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuXHRcdGNvbnN0cnVjdG9yKHN1YmplY3Q6U3ViamVjdHxHZW5lcmF0b3JTdWJqZWN0LCBvYnNlcnZlcjpPYnNlcnZlcil7XG5cdFx0XHR0aGlzLl9zdWJqZWN0ID0gc3ViamVjdDtcblx0XHRcdHRoaXMuX29ic2VydmVyID0gb2JzZXJ2ZXI7XG5cdFx0fVxuXG5cdFx0cHVibGljIGRpc3Bvc2UoKXtcblx0XHRcdHRoaXMuX3N1YmplY3QucmVtb3ZlKHRoaXMuX29ic2VydmVyKTtcblxuXHRcdFx0dGhpcy5fb2JzZXJ2ZXIuZGlzcG9zZSgpO1xuXHRcdH1cblx0fVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uR3JvdXAgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX2NvbnRhaW5lcjpkeUNiLkNvbGxlY3Rpb248SURpc3Bvc2FibGU+ID0gZHlDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJRGlzcG9zYWJsZT4oKTtcblxuXHRcdHB1YmxpYyBhZGRDaGlsZChjaGlsZDpJRGlzcG9zYWJsZSl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuYWRkQ2hpbGQoY2hpbGQpO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuZm9yRWFjaCgoY2hpbGQ6SURpc3Bvc2FibGUpID0+IHtcblx0XHRcdFx0Y2hpbGQuZGlzcG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG4iLCJtb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgdmFyIHJvb3Q6YW55ID0gd2luZG93O1xufVxuIiwibW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IHZhciBBQlNUUkFDVF9NRVRIT0Q6RnVuY3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihcImFic3RyYWN0IG1ldGhvZCBuZWVkIG92ZXJyaWRlXCIpO1xuICAgICAgICB9LFxuICAgICAgICBBQlNUUkFDVF9BVFRSSUJVVEU6YW55ID0gbnVsbDtcbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5cbm1vZHVsZSBkeVJ0e1xuICAgIC8vcnN2cC5qc1xuICAgIC8vZGVjbGFyZSB2YXIgUlNWUDphbnk7XG4gICAgZGVjbGFyZSB2YXIgd2luZG93OmFueTtcblxuICAgIC8vbm90IHN3YWxsb3cgdGhlIGVycm9yXG4gICAgaWYod2luZG93LlJTVlApe1xuICAgICAgICB3aW5kb3cuUlNWUC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfTtcbiAgICAgICAgd2luZG93LlJTVlAub24oJ2Vycm9yJywgd2luZG93LlJTVlAub25lcnJvcik7XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBTdHJlYW0gZXh0ZW5kcyBEaXNwb3NlcntcbiAgICAgICAgcHVibGljIHNjaGVkdWxlcjpTY2hlZHVsZXIgPSBBQlNUUkFDVF9BVFRSSUJVVEU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jKXtcbiAgICAgICAgICAgIHN1cGVyKFwiU3RyZWFtXCIpO1xuXG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZUZ1bmMgPSBzdWJzY3JpYmVGdW5jIHx8IGZ1bmN0aW9uKCl7IH07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE6RnVuY3Rpb258T2JzZXJ2ZXJ8U3ViamVjdCwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdGhyb3cgQUJTVFJBQ1RfTUVUSE9EKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlRnVuYyhvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRvKG9uTmV4dD86RnVuY3Rpb24sIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBEb1N0cmVhbS5jcmVhdGUodGhpcywgb25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbWFwKHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gTWFwU3RyZWFtLmNyZWF0ZSh0aGlzLCBzZWxlY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmxhdE1hcChzZWxlY3RvcjpGdW5jdGlvbil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXAoc2VsZWN0b3IpLm1lcmdlQWxsKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbWVyZ2VBbGwoKXtcbiAgICAgICAgICAgIHJldHVybiBNZXJnZUFsbFN0cmVhbS5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdGFrZVVudGlsKG90aGVyU3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICByZXR1cm4gVGFrZVVudGlsU3RyZWFtLmNyZWF0ZSh0aGlzLCBvdGhlclN0cmVhbSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIHB1YmxpYyBjb25jYXQoc3RyZWFtQXJyOkFycmF5PFN0cmVhbT4pO1xuICAgICAgICBwdWJsaWMgY29uY2F0KC4uLm90aGVyU3RyZWFtKTtcblxuICAgICAgICBwdWJsaWMgY29uY2F0KCl7XG4gICAgICAgICAgICB2YXIgYXJnczpBcnJheTxTdHJlYW0+ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0FycmF5KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBDb25jYXRTdHJlYW0uY3JlYXRlKGFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlKHN0cmVhbUFycjpBcnJheTxTdHJlYW0+KTtcbiAgICAgICAgcHVibGljIG1lcmdlKC4uLm90aGVyU3RyZWFtKTtcblxuICAgICAgICBwdWJsaWMgbWVyZ2UoKXtcbiAgICAgICAgICAgIHZhciBhcmdzOkFycmF5PFN0cmVhbT4gPSBudWxsLFxuICAgICAgICAgICAgICAgIHN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzQXJyYXkoYXJndW1lbnRzWzBdKSl7XG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcblxuICAgICAgICAgICAgc3RyZWFtID0gZnJvbUFycmF5KGFyZ3MpLm1lcmdlQWxsKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVwZWF0KGNvdW50Om51bWJlciA9IC0xKXtcbiAgICAgICAgICAgIHJldHVybiBSZXBlYXRTdHJlYW0uY3JlYXRlKHRoaXMsIGNvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpZ25vcmVFbGVtZW50cygpe1xuICAgICAgICAgICAgcmV0dXJuIElnbm9yZUVsZW1lbnRzU3RyZWFtLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBoYW5kbGVTdWJqZWN0KGFyZyl7XG4gICAgICAgICAgICBpZih0aGlzLl9pc1N1YmplY3QoYXJnKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0U3ViamVjdChhcmcpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1N1YmplY3Qoc3ViamVjdCl7XG4gICAgICAgICAgICByZXR1cm4gc3ViamVjdCBpbnN0YW5jZW9mIFN1YmplY3Q7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXRTdWJqZWN0KHN1YmplY3Qpe1xuICAgICAgICAgICAgc3ViamVjdC5zb3VyY2UgPSB0aGlzO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgd3JhcHBlciA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gbnVsbCxcbiAgICAgICAgICAgIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcblxuICAgICAgICB3cmFwcGVyID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgICAgICAgICAgIHRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIHNlbGYuY2FsbGJhY2sodGltZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyohXG4gICAgICAgICBidWchXG4gICAgICAgICBiZWxvdyBjb2RlOlxuICAgICAgICAgd2hlbiBpbnZva2UgYiBhZnRlciAxcywgd2lsbCBvbmx5IGludm9rZSBiLCBub3QgaW52b2tlIGEhXG5cbiAgICAgICAgIGZ1bmN0aW9uIGEodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImFcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGZ1bmN0aW9uIGIodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImJcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYik7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGEoKTtcblxuICAgICAgICAgc2V0VGltZW91dChiLCAxMDAwKTtcblxuXG5cbiAgICAgICAgIHNvIHVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcHJpb3JpdHkhXG4gICAgICAgICAqL1xuICAgICAgICBpZihyb290LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgQ2hyb21lIDEwIGJ1ZyB3aGVyZSBDaHJvbWVcbiAgICAgICAgLy8gZG9lcyBub3QgcGFzcyB0aGUgdGltZSB0byB0aGUgYW5pbWF0aW9uIGZ1bmN0aW9uXG5cbiAgICAgICAgaWYgKHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBEZWZpbmUgdGhlIHdyYXBwZXJcblxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgc3dpdGNoXG5cbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgLy8gQnJvd3NlciBjYWxscyB0aGUgd3JhcHBlciBhbmQgd3JhcHBlciBjYWxscyB0aGUgY2FsbGJhY2tcblxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSh3cmFwcGVyLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v5L+u5pS5dGltZeWPguaVsFxuICAgICAgICBpZiAocm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgR2Vja28gMi4wLCB3aGljaCBoYXMgYSBidWcgaW5cbiAgICAgICAgLy8gbW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKCkgdGhhdCByZXN0cmljdHMgYW5pbWF0aW9uc1xuICAgICAgICAvLyB0byAzMC00MCBmcHMuXG5cbiAgICAgICAgaWYgKHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBDaGVjayB0aGUgR2Vja28gdmVyc2lvbi4gR2Vja28gaXMgdXNlZCBieSBicm93c2Vyc1xuICAgICAgICAgICAgLy8gb3RoZXIgdGhhbiBGaXJlZm94LiBHZWNrbyAyLjAgY29ycmVzcG9uZHMgdG9cbiAgICAgICAgICAgIC8vIEZpcmVmb3ggNC4wLlxuXG4gICAgICAgICAgICBpbmRleCA9IHVzZXJBZ2VudC5pbmRleE9mKCdydjonKTtcblxuICAgICAgICAgICAgaWYgKHVzZXJBZ2VudC5pbmRleE9mKCdHZWNrbycpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gdXNlckFnZW50LnN1YnN0cihpbmRleCArIDMsIDMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGdlY2tvVmVyc2lvbiA9PT0gJzIuMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yY2VzIHRoZSByZXR1cm4gc3RhdGVtZW50IHRvIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgc2V0VGltZW91dCgpIGZ1bmN0aW9uLlxuXG4gICAgICAgICAgICAgICAgICAgIHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHJvb3Qub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXG4gICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaDtcblxuICAgICAgICAgICAgICAgIHJvb3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi50aW1lb3V0ID0gMTAwMCAvIDYwIC0gKGZpbmlzaCAtIHN0YXJ0KTtcblxuICAgICAgICAgICAgICAgIH0sIHNlbGYudGltZW91dCk7XG4gICAgICAgICAgICB9O1xuICAgIH0oKSk7XG5cbiAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290LmNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qud2Via2l0Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3QubW96Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qub0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm1zQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IGNsZWFyVGltZW91dDtcblxuXG4gICAgZXhwb3J0IGNsYXNzIFNjaGVkdWxlcntcbiAgICAgICAgLy90b2RvIHJlbW92ZSBcIi4uLmFyZ3NcIlxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3JlcXVlc3RMb29wSWQ6YW55ID0gbnVsbDtcbiAgICAgICAgZ2V0IHJlcXVlc3RMb29wSWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG4gICAgICAgIHNldCByZXF1ZXN0TG9vcElkKHJlcXVlc3RMb29wSWQ6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9vYnNlcnZlciBpcyBmb3IgVGVzdFNjaGVkdWxlciB0byByZXdyaXRlXG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgYWN0aW9uOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgaW50ZXJ2YWw6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIHJldHVybiByb290LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpbml0aWFsID0gYWN0aW9uKGluaXRpYWwpO1xuICAgICAgICAgICAgfSwgaW50ZXJ2YWwpXG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbG9vcCA9ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpc0VuZCA9IGFjdGlvbih0aW1lKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihpc0VuZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZXF1ZXN0TG9vcElkID0gcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgT2JzZXJ2ZXIgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IG51bGw7XG4gICAgICAgIGdldCBpc0Rpc3Bvc2VkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNEaXNwb3NlZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNEaXNwb3NlZChpc0Rpc3Bvc2VkOmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IGlzRGlzcG9zZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyTmV4dDpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJFcnJvcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJDb21wbGV0ZWQ6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2lzU3RvcDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIC8vcHJpdmF0ZSBfZGlzcG9zZUhhbmRsZXI6ZHlDYi5Db2xsZWN0aW9uPEZ1bmN0aW9uPiA9IGR5Q2IuQ29sbGVjdGlvbi5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2FibGU6SURpc3Bvc2FibGUgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKFwiT2JzZXJ2ZXJcIik7XG5cbiAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCA9IG9uTmV4dCB8fCBmdW5jdGlvbigpe307XG4gICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yID0gb25FcnJvciB8fCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQgPSBvbkNvbXBsZXRlZCB8fCBmdW5jdGlvbigpe307XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vbk5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzU3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzU3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuX2Rpc3Bvc2FibGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL3RoaXMuX2Rpc3Bvc2VIYW5kbGVyLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICAgIC8vICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIC8vfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL3B1YmxpYyBmYWlsKGUpIHtcbiAgICAgICAgLy8gICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgLy8gICAgICAgIHRoaXMuX2lzU3RvcCA9IHRydWU7XG4gICAgICAgIC8vICAgICAgICB0aGlzLmVycm9yKGUpO1xuICAgICAgICAvLyAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvL31cblxuICAgICAgICBwdWJsaWMgc2V0RGlzcG9zZUhhbmRsZXIoZGlzcG9zZUhhbmRsZXI6ZHlDYi5Db2xsZWN0aW9uPEZ1bmN0aW9uPil7XG4gICAgICAgICAgICAvL3RoaXMuX2Rpc3Bvc2VIYW5kbGVyID0gZGlzcG9zZUhhbmRsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2V0RGlzcG9zYWJsZShkaXNwb3NhYmxlOklEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2FibGUgPSBkaXNwb3NhYmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIFN1YmplY3QgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgZ2V0IHNvdXJjZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgc291cmNlKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6YW55ID0gbmV3IFN1YmplY3RPYnNlcnZlcigpO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMT86RnVuY3Rpb258T2JzZXJ2ZXIsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyOk9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyA8QXV0b0RldGFjaE9ic2VydmVyPmFyZzFcbiAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgLy90aGlzLl9zb3VyY2UgJiYgb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIodGhpcy5fc291cmNlLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gSW5uZXJTdWJzY3JpcHRpb24uY3JlYXRlKHRoaXMsIG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9zb3VyY2Upe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSh0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0odGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZShvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5yZW1vdmVDaGlsZChvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgR2VuZXJhdG9yU3ViamVjdCBleHRlbmRzIERpc3Bvc2VyIGltcGxlbWVudHMgSU9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzU3RhcnQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBnZXQgaXNTdGFydCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzU3RhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGlzU3RhcnQoaXNTdGFydDpib29sZWFuKXtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RhcnQgPSBpc1N0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKFwiR2VuZXJhdG9yU3ViamVjdFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvYnNlcnZlcjphbnkgPSBuZXcgU3ViamVjdE9ic2VydmVyKCk7XG5cbiAgICAgICAgLyohXG4gICAgICAgIG91dGVyIGhvb2sgbWV0aG9kXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgb25CZWZvcmVOZXh0KHZhbHVlOmFueSl7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25BZnRlck5leHQodmFsdWU6YW55KSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25Jc0NvbXBsZXRlZCh2YWx1ZTphbnkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZUVycm9yKGVycm9yOmFueSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQWZ0ZXJFcnJvcihlcnJvcjphbnkpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZUNvbXBsZXRlZCgpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkFmdGVyQ29tcGxldGVkKCkge1xuICAgICAgICB9XG5cblxuICAgICAgICAvL3RvZG9cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxPzpGdW5jdGlvbnxPYnNlcnZlciwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IDxBdXRvRGV0YWNoT2JzZXJ2ZXI+YXJnMVxuICAgICAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBJbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUodGhpcywgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1N0YXJ0IHx8IHRoaXMub2JzZXJ2ZXIuaXNFbXB0eSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQmVmb3JlTmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9ic2VydmVyLm5leHQodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vbkFmdGVyTmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLm9uSXNDb21wbGV0ZWQodmFsdWUpKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNTdGFydCB8fCB0aGlzLm9ic2VydmVyLmlzRW1wdHkoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlRXJyb3IoZXJyb3IpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmVycm9yKGVycm9yKTtcblxuICAgICAgICAgICAgdGhpcy5vbkFmdGVyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzU3RhcnQgfHwgdGhpcy5vYnNlcnZlci5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZUNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLm9uQWZ0ZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0b1N0cmVhbSgpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgICAgIHN0cmVhbSA9IEFub255bW91c1N0cmVhbS5jcmVhdGUoKG9ic2VydmVyOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZShTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RvcCgpe1xuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZShvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLnJlbW92ZUNoaWxkKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEFub255bW91c09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQXV0b0RldGFjaE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBpZih0aGlzLmlzRGlzcG9zZWQpe1xuICAgICAgICAgICAgICAgIGR5Q2IuTG9nLmxvZyhcIm9ubHkgY2FuIGRpc3Bvc2Ugb25jZVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBjbGFzcyBNYXBPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHNlbGVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zZWxlY3RvcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2VsZWN0b3IodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIubmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBEb09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfcHJldk9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgcHJldk9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyID0gcHJldk9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICAvL3RoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOmR5Q2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzdHJlYW1Hcm91cCwgZ3JvdXBEaXNwb3NhYmxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBnZXQgY3VycmVudE9ic2VydmVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG4gICAgICAgIHNldCBjdXJyZW50T2JzZXJ2ZXIoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9kb25lOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZ2V0IGRvbmUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kb25lO1xuICAgICAgICB9XG4gICAgICAgIHNldCBkb25lKGRvbmU6Ym9vbGVhbil7XG4gICAgICAgICAgICB0aGlzLl9kb25lID0gZG9uZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3N0cmVhbUdyb3VwOmR5Q2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGdyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgICAgICB0aGlzLl9ncm91cERpc3Bvc2FibGUgPSBncm91cERpc3Bvc2FibGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBkeUNiLkxvZy5lcnJvcighKGlubmVyU291cmNlIGluc3RhbmNlb2YgU3RyZWFtIHx8IEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSksIGR5Q2IuTG9nLmluZm8uRlVOQ19NVVNUX0JFKFwiaW5uZXJTb3VyY2VcIiwgXCJTdHJlYW0gb3IgUHJvbWlzZVwiKSk7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSl7XG4gICAgICAgICAgICAgICAgaW5uZXJTb3VyY2UgPSBmcm9tUHJvbWlzZShpbm5lclNvdXJjZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLmFkZENoaWxkKGlubmVyU291cmNlKTtcblxuICAgICAgICAgICAgdGhpcy5fZ3JvdXBEaXNwb3NhYmxlLmFkZChpbm5lclNvdXJjZS5idWlsZFN0cmVhbShJbm5lck9ic2VydmVyLmNyZWF0ZSh0aGlzLCB0aGlzLl9zdHJlYW1Hcm91cCwgaW5uZXJTb3VyY2UpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGFzcyBJbm5lck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHBhcmVudDpNZXJnZUFsbE9ic2VydmVyLCBzdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb248U3RyZWFtPiwgY3VycmVudFN0cmVhbTpTdHJlYW0pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0cmVhbSA9IGN1cnJlbnRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdHJlYW0gPSB0aGlzLl9jdXJyZW50U3RyZWFtLFxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHRoaXMuX3BhcmVudDtcblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAucmVtb3ZlQ2hpbGQoKHN0cmVhbTpTdHJlYW0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKHN0cmVhbSwgY3VycmVudFN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9pZiB0aGlzIGlubmVyU291cmNlIGlzIGFzeW5jIHN0cmVhbShhcyBwcm9taXNlIHN0cmVhbSksXG4gICAgICAgICAgICAvL2l0IHdpbGwgZmlyc3QgZXhlYyBhbGwgcGFyZW50Lm5leHQgYW5kIG9uZSBwYXJlbnQuY29tcGxldGVkLFxuICAgICAgICAgICAgLy90aGVuIGV4ZWMgYWxsIHRoaXMubmV4dCBhbmQgYWxsIHRoaXMuY29tcGxldGVkXG4gICAgICAgICAgICAvL3NvIGluIHRoaXMgY2FzZSwgaXQgc2hvdWxkIGludm9rZSBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCBhZnRlciB0aGUgbGFzdCBpbnZva2NhdGlvbiBvZiB0aGlzLmNvbXBsZXRlZChoYXZlIGludm9rZWQgYWxsIHRoZSBpbm5lclNvdXJjZSlcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzQXN5bmMoKSAmJiB0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNBc3luYygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudC5kb25lO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBjbGFzcyBDb25jYXRPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzdGFydE5leHRTdHJlYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgY3VycmVudE9ic2VydmVyOmFueSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3N0YXJ0TmV4dFN0cmVhbTpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zdGFydE5leHRTdHJlYW0gPSBzdGFydE5leHRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIC8vdGhpcy5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydE5leHRTdHJlYW0oKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJU3ViamVjdE9ic2VydmVyIHtcbiAgICAgICAgYWRkQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpO1xuICAgICAgICByZW1vdmVDaGlsZChvYnNlcnZlcjpPYnNlcnZlcik7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdE9ic2VydmVyIGltcGxlbWVudHMgSU9ic2VydmVye1xuICAgICAgICBwdWJsaWMgb2JzZXJ2ZXJzOmR5Q2IuQ29sbGVjdGlvbjxJT2JzZXJ2ZXI+ID0gZHlDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJT2JzZXJ2ZXI+KCk7XG5cbiAgICAgICAgcHJpdmF0ZSBfZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIGlzRW1wdHkoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9ic2VydmVycy5nZXRDb3VudCgpID09PSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhZGRDaGlsZChvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUodGhpcy5fZGlzcG9zYWJsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMucmVtb3ZlQ2hpbGQoKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEp1ZGdlVXRpbHMuaXNFcXVhbChvYiwgb2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NhYmxlKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2JzZXJ2ZXI6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKGRpc3Bvc2FibGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2FibGUgPSBkaXNwb3NhYmxlO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEJhc2VTdHJlYW0gZXh0ZW5kcyBTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICByZXR1cm4gZHlDYi5Mb2cuZXJyb3IodHJ1ZSwgZHlDYi5Mb2cuaW5mby5BQlNUUkFDVF9NRVRIT0QpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/LCBvbkNvbXBsZXRlZD8pOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuaGFuZGxlU3ViamVjdChhcmcxKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gYXJnMVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICAvL29ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKHRoaXMuZGlzcG9zZUhhbmRsZXIpO1xuXG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUodGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcikpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHN1cGVyLmJ1aWxkU3RyZWFtKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlQ29yZShvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgX2hhc011bHRpT2JzZXJ2ZXJzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLnNjaGVkdWxlci5nZXRPYnNlcnZlcnMoKSA+IDE7XG4gICAgICAgIC8vfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRG9TdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgb25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBBbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oRG9PYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX29ic2VydmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1hcFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc2VsZWN0b3I6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIHNlbGVjdG9yOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShNYXBPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX3NlbGVjdG9yKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tQXJyYXlTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYXJyYXksIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hcnJheTpBcnJheTxhbnk+ID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9hcnJheSA9IGFycmF5O1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGFycmF5ID0gdGhpcy5fYXJyYXksXG4gICAgICAgICAgICAgICAgbGVuID0gYXJyYXkubGVuZ3RoO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGFycmF5W2ldKTtcblxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHMuY2FsbGVlKGkgKyAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIDAsIGxvb3BSZWN1cnNpdmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21Qcm9taXNlU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJvbWlzZTphbnksIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocHJvbWlzZSwgc2NoZWR1bGVyKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcm9taXNlOmFueSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJvbWlzZTphbnksIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fcHJvbWlzZS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChkYXRhKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSwgb2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21FdmVudFBhdHRlcm5TdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hZGRIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYWRkSGFuZGxlcjpGdW5jdGlvbiwgcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlciA9IGFkZEhhbmRsZXI7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVIYW5kbGVyID0gcmVtb3ZlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlubmVySGFuZGxlcihldmVudCl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaW5uZXJIYW5kbGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLl9yZW1vdmVIYW5kbGVyKGlubmVySGFuZGxlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc3Vic2NyaWJlRnVuYyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihzdWJzY3JpYmVGdW5jKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjpBdXRvRGV0YWNoT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBpZih0aGlzLmhhbmRsZVN1YmplY3QoYXJndW1lbnRzWzBdKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlciA9IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIC8vb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIodGhpcy5kaXNwb3NlSGFuZGxlcik7XG5cblxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIoRGlzcG9zZXIuZ2V0RGlzcG9zZUhhbmRsZXIoKSk7XG4gICAgICAgICAgICAvL0Rpc3Bvc2VyLnJlbW92ZUFsbERpc3Bvc2VIYW5kbGVyKCk7XG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgSW50ZXJ2YWxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShpbnRlcnZhbDpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhpbnRlcnZhbCwgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgb2JqLmluaXRXaGVuQ3JlYXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pbnRlcnZhbDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGludGVydmFsOm51bWJlciwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSBpbnRlcnZhbDtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGluaXRXaGVuQ3JlYXRlKCl7XG4gICAgICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IHRoaXMuX2ludGVydmFsIDw9IDAgPyAxIDogdGhpcy5faW50ZXJ2YWw7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGlkID0gbnVsbDtcblxuICAgICAgICAgICAgaWQgPSB0aGlzLnNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXIsIDAsIHRoaXMuX2ludGVydmFsLCAoY291bnQpID0+IHtcbiAgICAgICAgICAgICAgICAvL3NlbGYuc2NoZWR1bGVyLm5leHQoY291bnQpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoY291bnQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50ICsgMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL0Rpc3Bvc2VyLmFkZERpc3Bvc2VIYW5kbGVyKCgpID0+IHtcbiAgICAgICAgICAgIC8vfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5jbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc0VuZDpib29sZWFuID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0KG9ic2VydmVyLCAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodGltZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5faXNFbmQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2VsZi5zY2hlZHVsZXIucmVxdWVzdExvb3BJZCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNFbmQgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICAvL3RoaXMuX29ic2VydmVyID0gQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvcixvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc3RyZWFtR3JvdXAgPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKSxcbiAgICAgICAgICAgICAgICBncm91cERpc3Bvc2FibGUgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWVyZ2VBbGxPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHN0cmVhbUdyb3VwLCBncm91cERpc3Bvc2FibGUpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwRGlzcG9zYWJsZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgb3RoZXJTdGVhbTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIG90aGVyU3RlYW0pO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX290aGVyU3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgb3RoZXJTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9vdGhlclN0cmVhbSA9IEp1ZGdlVXRpbHMuaXNQcm9taXNlKG90aGVyU3RyZWFtKSA/IGZyb21Qcm9taXNlKG90aGVyU3RyZWFtKSA6IG90aGVyU3RyZWFtO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGdyb3VwID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICBncm91cC5hZGQodGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKG9ic2VydmVyKSk7XG4gICAgICAgICAgICBncm91cC5hZGQodGhpcy5fb3RoZXJTdHJlYW0uYnVpbGRTdHJlYW0oVGFrZVVudGlsT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyKSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBDb25jYXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2VzOkFycmF5PFN0cmVhbT4pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZXM6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKTtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2VzOkFycmF5PFN0cmVhbT4pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgLy90b2RvIGRvbid0IHNldCBzY2hlZHVsZXIgaGVyZT9cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc291cmNlc1swXS5zY2hlZHVsZXI7XG5cbiAgICAgICAgICAgIHNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc1Byb21pc2Uoc291cmNlKSl7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuYWRkQ2hpbGQoZnJvbVByb21pc2Uoc291cmNlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuYWRkQ2hpbGQoc291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY291bnQgPSB0aGlzLl9zb3VyY2VzLmdldENvdW50KCksXG4gICAgICAgICAgICAgICAgZCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShpKSB7XG4gICAgICAgICAgICAgICAgaWYoaSA9PT0gY291bnQpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZC5hZGQoc2VsZi5fc291cmNlcy5nZXRDaGlsZChpKS5idWlsZFN0cmVhbShDb25jYXRPYnNlcnZlci5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlciwgKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wUmVjdXJzaXZlKGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIDAsIGxvb3BSZWN1cnNpdmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZShkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgUmVwZWF0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgY291bnQ6bnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBjb3VudCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfY291bnQ6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBjb3VudDpudW1iZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX2NvdW50ID0gY291bnQ7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcblxuICAgICAgICAgICAgLy90aGlzLnN1YmplY3RHcm91cCA9IHRoaXMuX3NvdXJjZS5zdWJqZWN0R3JvdXA7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgZCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShjb3VudCkge1xuICAgICAgICAgICAgICAgIGlmKGNvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGQuYWRkKFxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zb3VyY2UuYnVpbGRTdHJlYW0oQ29uY2F0T2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wUmVjdXJzaXZlKGNvdW50IC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlciwgdGhpcy5fY291bnQsIGxvb3BSZWN1cnNpdmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZShkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oSWdub3JlRWxlbWVudHNPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IHZhciBjcmVhdGVTdHJlYW0gPSAoc3Vic2NyaWJlRnVuYykgPT4ge1xuICAgICAgICByZXR1cm4gQW5vbnltb3VzU3RyZWFtLmNyZWF0ZShzdWJzY3JpYmVGdW5jKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tQXJyYXkgPSAoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PntcbiAgICAgICAgcmV0dXJuIEZyb21BcnJheVN0cmVhbS5jcmVhdGUoYXJyYXksIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVByb21pc2UgPSAocHJvbWlzZTphbnksIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT57XG4gICAgICAgIHJldHVybiBGcm9tUHJvbWlzZVN0cmVhbS5jcmVhdGUocHJvbWlzZSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tRXZlbnRQYXR0ZXJuID0gKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pID0+e1xuICAgICAgICByZXR1cm4gRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5jcmVhdGUoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgaW50ZXJ2YWwgPSAoaW50ZXJ2YWwsIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT4ge1xuICAgICAgICByZXR1cm4gSW50ZXJ2YWxTdHJlYW0uY3JlYXRlKGludGVydmFsLCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGludGVydmFsUmVxdWVzdCA9IChzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsUmVxdWVzdFN0cmVhbS5jcmVhdGUoc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBlbXB0eSA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PntcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBjYWxsRnVuYyA9IChmdW5jOkZ1bmN0aW9uLCBjb250ZXh0ID0gcm9vdCkgPT4ge1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGZ1bmMuY2FsbChjb250ZXh0LCBudWxsKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH0pXG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIganVkZ2UgPSAoY29uZGl0aW9uOkZ1bmN0aW9uLCB0aGVuU291cmNlOkZ1bmN0aW9uLCBlbHNlU291cmNlOkZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25kaXRpb24oKSA/IHRoZW5Tb3VyY2UoKSA6IGVsc2VTb3VyY2UoKTtcbiAgICB9O1xufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICB2YXIgZGVmYXVsdElzRXF1YWwgPSAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICB9O1xuXG4gICAgZXhwb3J0IGNsYXNzIFJlY29yZCB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHRpbWU6bnVtYmVyLCB2YWx1ZTphbnksIGFjdGlvblR5cGU/OkFjdGlvblR5cGUsIGNvbXBhcmVyPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHRpbWUsIHZhbHVlLCBhY3Rpb25UeXBlLCBjb21wYXJlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB0aW1lKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdGltZSh0aW1lOm51bWJlcil7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3ZhbHVlOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB2YWx1ZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHNldCB2YWx1ZSh2YWx1ZTpudW1iZXIpe1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FjdGlvblR5cGU6QWN0aW9uVHlwZSA9IG51bGw7XG4gICAgICAgIGdldCBhY3Rpb25UeXBlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aW9uVHlwZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgYWN0aW9uVHlwZShhY3Rpb25UeXBlOkFjdGlvblR5cGUpe1xuICAgICAgICAgICAgdGhpcy5fYWN0aW9uVHlwZSA9IGFjdGlvblR5cGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jb21wYXJlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IodGltZSwgdmFsdWUsIGFjdGlvblR5cGU6QWN0aW9uVHlwZSwgY29tcGFyZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX2FjdGlvblR5cGUgPSBhY3Rpb25UeXBlO1xuICAgICAgICAgICAgdGhpcy5fY29tcGFyZXIgPSBjb21wYXJlciB8fCBkZWZhdWx0SXNFcXVhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWUgPT09IG90aGVyLnRpbWUgJiYgdGhpcy5fY29tcGFyZXIodGhpcy5fdmFsdWUsIG90aGVyLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1vY2tPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IDxbUmVjb3JkXT5bXTtcbiAgICAgICAgZ2V0IG1lc3NhZ2VzKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXM7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IG1lc3NhZ2VzKG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgdmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIGVycm9yKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIG51bGwpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29weSgpe1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IE1vY2tPYnNlcnZlci5jcmVhdGUodGhpcy5fc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmVzdWx0Lm1lc3NhZ2VzID0gdGhpcy5fbWVzc2FnZXM7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBNb2NrUHJvbWlzZXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIsIG1lc3NhZ2VzOltSZWNvcmRdKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyLCBtZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IDxbUmVjb3JkXT5bXTtcbiAgICAgICAgLy9nZXQgbWVzc2FnZXMoKXtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICAgICAgICAvL31cbiAgICAgICAgLy9zZXQgbWVzc2FnZXMobWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAvLyAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICAvL31cblxuICAgICAgICBwcml2YXRlIF9zY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIsIG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdGhlbihzdWNjZXNzQ2I6RnVuY3Rpb24sIGVycm9yQ2I6RnVuY3Rpb24sIG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICAvL3ZhciBzY2hlZHVsZXIgPSA8VGVzdFNjaGVkdWxlcj4odGhpcy5zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCB0aGlzLl9tZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBjb25zdCBTVUJTQ1JJQkVfVElNRSA9IDIwMDtcbiAgICBjb25zdCBESVNQT1NFX1RJTUUgPSAxMDAwO1xuXG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIG5leHQodGljaywgdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBlcnJvcih0aWNrLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgZXJyb3IsIEFjdGlvblR5cGUuRVJST1IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjb21wbGV0ZWQodGljaykge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgbnVsbCwgQWN0aW9uVHlwZS5DT01QTEVURUQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaXNSZXNldDpib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhpc1Jlc2V0KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKGlzUmVzZXQ6Ym9vbGVhbil7XG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICB0aGlzLl9pc1Jlc2V0ID0gaXNSZXNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2Nsb2NrOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCBjbG9jaygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBjbG9jayhjbG9jazpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1Jlc2V0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHJpdmF0ZSBfaXNEaXNwb3NlZDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX3RpbWVyTWFwOmR5Q2IuSGFzaDxGdW5jdGlvbj4gPSBkeUNiLkhhc2guY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1NYXA6ZHlDYi5IYXNoPEZ1bmN0aW9uPiA9IGR5Q2IuSGFzaC5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX3N1YnNjcmliZWRUaW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VkVGltZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpNb2NrT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzZXRTdHJlYW1NYXAob2JzZXJ2ZXI6SU9ic2VydmVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIG1lc3NhZ2VzLmZvckVhY2goKHJlY29yZDpSZWNvcmQpID0+e1xuICAgICAgICAgICAgICAgIHZhciBmdW5jID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVjb3JkLmFjdGlvblR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuTkVYVDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHJlY29yZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5FUlJPUjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgZHlDYi5Mb2cuZXJyb3IodHJ1ZSwgZHlDYi5Mb2cuaW5mby5GVU5DX1VOS05PVyhcImFjdGlvblR5cGVcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5fc3RyZWFtTWFwLmFkZENoaWxkKFN0cmluZyhyZWNvcmQudGltZSksIGZ1bmMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOk1vY2tPYnNlcnZlciwgaW5pdGlhbDphbnksIHJlY3Vyc2l2ZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAvL21lc3NhZ2VzID0gW10sXG4gICAgICAgICAgICAgICAgbmV4dCA9IG51bGwsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkID0gbnVsbDtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgbmV4dCA9IG9ic2VydmVyLm5leHQ7XG4gICAgICAgICAgICBjb21wbGV0ZWQgPSBvYnNlcnZlci5jb21wbGV0ZWQ7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0LmNhbGwob2JzZXJ2ZXIsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZC5jYWxsKG9ic2VydmVyKTtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVjdXJzaXZlRnVuYyhpbml0aWFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgaW50ZXJ2YWw6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIC8vcHJvZHVjZSAxMCB2YWwgZm9yIHRlc3RcbiAgICAgICAgICAgIHZhciBDT1VOVCA9IDEwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHdoaWxlIChDT1VOVCA+IDAgJiYgIXRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aWNrKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dCh0aGlzLl9jbG9jaywgaW5pdGlhbCkpO1xuXG4gICAgICAgICAgICAgICAgLy9ubyBuZWVkIHRvIGludm9rZSBhY3Rpb25cbiAgICAgICAgICAgICAgICAvL2FjdGlvbihpbml0aWFsKTtcblxuICAgICAgICAgICAgICAgIGluaXRpYWwrKztcbiAgICAgICAgICAgICAgICBDT1VOVC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcbiAgICAgICAgICAgIC8vdGhpcy5zZXRTdHJlYW1NYXAodGhpcy5fb2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IDEwMCxcbiAgICAgICAgICAgICAgICBudW0gPSAwO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB3aGlsZSAoQ09VTlQgPiAwICYmICF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGljayhpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIG51bSkpO1xuXG4gICAgICAgICAgICAgICAgbnVtKys7XG4gICAgICAgICAgICAgICAgQ09VTlQtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG4gICAgICAgICAgICAvL3RoaXMuc2V0U3RyZWFtTWFwKHRoaXMuX29ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0Q2xvY2soKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzUmVzZXQpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGhpcy5fc3Vic2NyaWJlZFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoVGltZShjcmVhdGU6RnVuY3Rpb24sIHN1YnNjcmliZWRUaW1lOm51bWJlciwgZGlzcG9zZWRUaW1lOm51bWJlcikge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gdGhpcy5jcmVhdGVPYnNlcnZlcigpLFxuICAgICAgICAgICAgICAgIHNvdXJjZSwgc3Vic2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmVkVGltZSA9IHN1YnNjcmliZWRUaW1lO1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZWRUaW1lID0gZGlzcG9zZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9jbG9jayA9IHN1YnNjcmliZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9ydW5BdChzdWJzY3JpYmVkVGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNvdXJjZSA9IGNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KGRpc3Bvc2VkVGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBvYnNlcnZlcjtcblxuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoU3Vic2NyaWJlKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUgPSBTVUJTQ1JJQkVfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIHN1YnNjcmliZWRUaW1lLCBESVNQT1NFX1RJTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aERpc3Bvc2UoY3JlYXRlLCBkaXNwb3NlZFRpbWUgPSBESVNQT1NFX1RJTUUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0V2l0aFRpbWUoY3JlYXRlLCBTVUJTQ1JJQkVfVElNRSwgZGlzcG9zZWRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaWNBYnNvbHV0ZSh0aW1lLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9ydW5BdCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgICAgICB2YXIgZXh0cmVtZU51bUFyciA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKSxcbiAgICAgICAgICAgICAgICBtaW4gPSBleHRyZW1lTnVtQXJyWzBdLFxuICAgICAgICAgICAgICAgIG1heCA9IGV4dHJlbWVOdW1BcnJbMV0sXG4gICAgICAgICAgICAgICAgdGltZSA9IG1pbjtcblxuICAgICAgICAgICAgLy90b2RvIHJlZHVjZSBsb29wIHRpbWVcbiAgICAgICAgICAgIHdoaWxlICh0aW1lIDw9IG1heCkge1xuICAgICAgICAgICAgICAgIC8vaWYodGhpcy5faXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgLy8gICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy99XG5cbiAgICAgICAgICAgICAgICAvL2JlY2F1c2UgXCJfZXhlYyxfcnVuU3RyZWFtXCIgbWF5IGNoYW5nZSBcIl9jbG9ja1wiLFxuICAgICAgICAgICAgICAgIC8vc28gaXQgc2hvdWxkIHJlc2V0IHRoZSBfY2xvY2tcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGltZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2V4ZWModGltZSwgdGhpcy5fdGltZXJNYXApO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aW1lO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcnVuU3RyZWFtKHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgdGltZSsrO1xuXG4gICAgICAgICAgICAgICAgLy90b2RvIGdldCBtYXggdGltZSBvbmx5IGZyb20gc3RyZWFtTWFwP1xuICAgICAgICAgICAgICAgIC8vbmVlZCByZWZyZXNoIG1heCB0aW1lLlxuICAgICAgICAgICAgICAgIC8vYmVjYXVzZSBpZiB0aW1lck1hcCBoYXMgY2FsbGJhY2sgdGhhdCBjcmVhdGUgaW5maW5pdGUgc3RyZWFtKGFzIGludGVydmFsKSxcbiAgICAgICAgICAgICAgICAvL2l0IHdpbGwgc2V0IHN0cmVhbU1hcCBzbyB0aGF0IHRoZSBtYXggdGltZSB3aWxsIGNoYW5nZVxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVTdHJlYW0oYXJncyl7XG4gICAgICAgICAgICByZXR1cm4gVGVzdFN0cmVhbS5jcmVhdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlT2JzZXJ2ZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gTW9ja09ic2VydmVyLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVSZXNvbHZlZFByb21pc2UodGltZTpudW1iZXIsIHZhbHVlOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gTW9ja1Byb21pc2UuY3JlYXRlKHRoaXMsIFtUZXN0U2NoZWR1bGVyLm5leHQodGltZSwgdmFsdWUpLCBUZXN0U2NoZWR1bGVyLmNvbXBsZXRlZCh0aW1lKzEpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlUmVqZWN0UHJvbWlzZSh0aW1lOm51bWJlciwgZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHJldHVybiBNb2NrUHJvbWlzZS5jcmVhdGUodGhpcywgW1Rlc3RTY2hlZHVsZXIuZXJyb3IodGltZSwgZXJyb3IpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9nZXRNaW5BbmRNYXhUaW1lKCl7XG4gICAgICAgICAgICB2YXIgdGltZUFyciA9IHRoaXMuX3RpbWVyTWFwLmdldEtleXMoKS5hZGRDaGlsZHJlbih0aGlzLl9zdHJlYW1NYXAuZ2V0S2V5cygpKVxuICAgICAgICAgICAgICAgIC5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKGtleSk7XG4gICAgICAgICAgICAgICAgfSkudG9BcnJheSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gW01hdGgubWluLmFwcGx5KE1hdGgsIHRpbWVBcnIpLCBNYXRoLm1heC5hcHBseShNYXRoLCB0aW1lQXJyKV07XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9leGVjKHRpbWUsIG1hcCl7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IG1hcC5nZXRDaGlsZChTdHJpbmcodGltZSkpO1xuXG4gICAgICAgICAgICBpZihoYW5kbGVyKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9ydW5TdHJlYW0odGltZSl7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXMuX3N0cmVhbU1hcC5nZXRDaGlsZChTdHJpbmcodGltZSkpO1xuXG4gICAgICAgICAgICBpZihoYW5kbGVyKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9ydW5BdCh0aW1lOm51bWJlciwgY2FsbGJhY2s6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVyTWFwLmFkZENoaWxkKFN0cmluZyh0aW1lKSwgY2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdGljayh0aW1lOm51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5fY2xvY2sgKz0gdGltZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4iLCJtb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGVudW0gQWN0aW9uVHlwZXtcbiAgICAgICAgTkVYVCxcbiAgICAgICAgRVJST1IsXG4gICAgICAgIENPTVBMRVRFRFxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9uc1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgVGVzdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW0ge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShtZXNzYWdlczpbUmVjb3JkXSwgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhtZXNzYWdlcywgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihtZXNzYWdlczpbUmVjb3JkXSwgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgc2NoZWR1bGVyID0gPFRlc3RTY2hlZHVsZXI+KHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCB0aGlzLl9tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9