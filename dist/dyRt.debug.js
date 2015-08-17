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
            this._disposeHandler = dyCb.Collection.create();
        }
        Object.defineProperty(Disposer.prototype, "disposeHandler", {
            get: function () {
                return this._disposeHandler;
            },
            set: function (disposeHandler) {
                this._disposeHandler = disposeHandler;
            },
            enumerable: true,
            configurable: true
        });
        Disposer.prototype.addDisposeHandler = function (func) {
            this._disposeHandler.addChild(func);
        };
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
            this._observers = dyCb.Collection.create();
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
            this._source && observer.setDisposeHandler(this._source.disposeHandler);
            this._observers.addChild(observer);
            return dyRt.InnerSubscription.create(this, observer);
        };
        Subject.prototype.next = function (value) {
            this._observers.forEach(function (ob) {
                ob.next(value);
            });
        };
        Subject.prototype.error = function (error) {
            this._observers.forEach(function (ob) {
                ob.error(error);
            });
        };
        Subject.prototype.completed = function () {
            this._observers.forEach(function (ob) {
                ob.completed();
            });
        };
        Subject.prototype.start = function () {
            this._source && this._source.buildStream(this);
        };
        Subject.prototype.remove = function (observer) {
            this._observers.removeChild(function (ob) {
                return dyRt.JudgeUtils.isEqual(ob, observer);
            });
        };
        Subject.prototype.dispose = function () {
            this._observers.forEach(function (ob) {
                ob.dispose();
            });
            this._observers.removeAllChildren();
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
            this._setDisposeHandler(observer);
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
        GeneratorSubject.prototype._setDisposeHandler = function (observer) {
            var self = this;
            this.addDisposeHandler(function () {
                self.dispose();
            });
            observer.setDisposeHandler(this.disposeHandler);
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
            observer.setDisposeHandler(this.disposeHandler);
            this.buildStream(observer);
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
            this.addDisposeHandler(function () {
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
            observer.setDisposeHandler(this.disposeHandler);
            this.buildStream(observer);
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
            this.addDisposeHandler(function () {
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
            this.addDisposeHandler(function () {
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
            var COUNT = 10, messages = [], interval = 100;
            this._setClock();
            while (COUNT > 0 && !this._isDisposed) {
                this._tick(interval);
                messages.push(TestScheduler.next(this._clock, interval));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkp1ZGdlVXRpbHMudHMiLCJjb3JlL0VudGl0eS50cyIsIkRpc3Bvc2FibGUvSURpc3Bvc2FibGUudHMiLCJvYnNlcnZlci9JT2JzZXJ2ZXIudHMiLCJEaXNwb3NhYmxlL0Rpc3Bvc2VyLnRzIiwiRGlzcG9zYWJsZS9Jbm5lclN1YnNjcmlwdGlvbi50cyIsIkRpc3Bvc2FibGUvSW5uZXJTdWJzY3JpcHRpb25Hcm91cC50cyIsImdsb2JhbC9WYXJpYWJsZS50cyIsImdsb2JhbC9Db25zdC50cyIsImdsb2JhbC9pbml0LnRzIiwiY29yZS9TdHJlYW0udHMiLCJjb3JlL1NjaGVkdWxlci50cyIsImNvcmUvT2JzZXJ2ZXIudHMiLCJzdWJqZWN0L1N1YmplY3QudHMiLCJzdWJqZWN0L0dlbmVyYXRvclN1YmplY3QudHMiLCJvYnNlcnZlci9Bbm9ueW1vdXNPYnNlcnZlci50cyIsIm9ic2VydmVyL0F1dG9EZXRhY2hPYnNlcnZlci50cyIsIm9ic2VydmVyL01hcE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvRG9PYnNlcnZlci50cyIsIm9ic2VydmVyL01lcmdlQWxsT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9UYWtlVW50aWxPYnNlcnZlci50cyIsIm9ic2VydmVyL0NvbmNhdE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvSVN1YmplY3RPYnNlcnZlci50cyIsIm9ic2VydmVyL1N1YmplY3RPYnNlcnZlci50cyIsInN0cmVhbS9CYXNlU3RyZWFtLnRzIiwic3RyZWFtL0RvU3RyZWFtLnRzIiwic3RyZWFtL01hcFN0cmVhbS50cyIsInN0cmVhbS9Gcm9tQXJyYXlTdHJlYW0udHMiLCJzdHJlYW0vRnJvbVByb21pc2VTdHJlYW0udHMiLCJzdHJlYW0vRnJvbUV2ZW50UGF0dGVyblN0cmVhbS50cyIsInN0cmVhbS9Bbm9ueW1vdXNTdHJlYW0udHMiLCJzdHJlYW0vSW50ZXJ2YWxTdHJlYW0udHMiLCJzdHJlYW0vSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLnRzIiwic3RyZWFtL01lcmdlQWxsU3RyZWFtLnRzIiwic3RyZWFtL1Rha2VVbnRpbFN0cmVhbS50cyIsInN0cmVhbS9Db25jYXRTdHJlYW0udHMiLCJzdHJlYW0vUmVwZWF0U3RyZWFtLnRzIiwiZ2xvYmFsL09wZXJhdG9yLnRzIiwidGVzdGluZy9SZWNvcmQudHMiLCJ0ZXN0aW5nL01vY2tPYnNlcnZlci50cyIsInRlc3RpbmcvTW9ja1Byb21pc2UudHMiLCJ0ZXN0aW5nL1Rlc3RTY2hlZHVsZXIudHMiLCJ0ZXN0aW5nL0FjdGlvblR5cGUudHMiLCJ0ZXN0aW5nL1Rlc3RTdHJlYW0udHMiXSwibmFtZXMiOlsiZHlSdCIsImR5UnQuSnVkZ2VVdGlscyIsImR5UnQuSnVkZ2VVdGlscy5jb25zdHJ1Y3RvciIsImR5UnQuSnVkZ2VVdGlscy5pc1Byb21pc2UiLCJkeVJ0Lkp1ZGdlVXRpbHMuaXNFcXVhbCIsImR5UnQuRW50aXR5IiwiZHlSdC5FbnRpdHkuY29uc3RydWN0b3IiLCJkeVJ0LkVudGl0eS51aWQiLCJkeVJ0LkRpc3Bvc2VyIiwiZHlSdC5EaXNwb3Nlci5jb25zdHJ1Y3RvciIsImR5UnQuRGlzcG9zZXIuZGlzcG9zZUhhbmRsZXIiLCJkeVJ0LkRpc3Bvc2VyLmFkZERpc3Bvc2VIYW5kbGVyIiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbiIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb24uY29uc3RydWN0b3IiLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uLmNyZWF0ZSIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb24uZGlzcG9zZSIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb25Hcm91cCIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb25Hcm91cC5jb25zdHJ1Y3RvciIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb25Hcm91cC5jcmVhdGUiLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uR3JvdXAuYWRkQ2hpbGQiLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uR3JvdXAuZGlzcG9zZSIsImR5UnQuU3RyZWFtIiwiZHlSdC5TdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LlN0cmVhbS5zdWJzY3JpYmUiLCJkeVJ0LlN0cmVhbS5idWlsZFN0cmVhbSIsImR5UnQuU3RyZWFtLmRvIiwiZHlSdC5TdHJlYW0ubWFwIiwiZHlSdC5TdHJlYW0uZmxhdE1hcCIsImR5UnQuU3RyZWFtLm1lcmdlQWxsIiwiZHlSdC5TdHJlYW0udGFrZVVudGlsIiwiZHlSdC5TdHJlYW0uY29uY2F0IiwiZHlSdC5TdHJlYW0ubWVyZ2UiLCJkeVJ0LlN0cmVhbS5yZXBlYXQiLCJkeVJ0LlN0cmVhbS5oYW5kbGVTdWJqZWN0IiwiZHlSdC5TdHJlYW0uX2lzU3ViamVjdCIsImR5UnQuU3RyZWFtLl9zZXRTdWJqZWN0IiwiZHlSdC5TY2hlZHVsZXIiLCJkeVJ0LlNjaGVkdWxlci5jb25zdHJ1Y3RvciIsImR5UnQuU2NoZWR1bGVyLmNyZWF0ZSIsImR5UnQuU2NoZWR1bGVyLnJlcXVlc3RMb29wSWQiLCJkeVJ0LlNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlIiwiZHlSdC5TY2hlZHVsZXIucHVibGlzaEludGVydmFsIiwiZHlSdC5TY2hlZHVsZXIucHVibGlzaEludGVydmFsUmVxdWVzdCIsImR5UnQuT2JzZXJ2ZXIiLCJkeVJ0Lk9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5PYnNlcnZlci5pc0Rpc3Bvc2VkIiwiZHlSdC5PYnNlcnZlci5uZXh0IiwiZHlSdC5PYnNlcnZlci5lcnJvciIsImR5UnQuT2JzZXJ2ZXIuY29tcGxldGVkIiwiZHlSdC5PYnNlcnZlci5kaXNwb3NlIiwiZHlSdC5PYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlciIsImR5UnQuT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5PYnNlcnZlci5vbkVycm9yIiwiZHlSdC5PYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuU3ViamVjdCIsImR5UnQuU3ViamVjdC5jb25zdHJ1Y3RvciIsImR5UnQuU3ViamVjdC5jcmVhdGUiLCJkeVJ0LlN1YmplY3Quc291cmNlIiwiZHlSdC5TdWJqZWN0LnN1YnNjcmliZSIsImR5UnQuU3ViamVjdC5uZXh0IiwiZHlSdC5TdWJqZWN0LmVycm9yIiwiZHlSdC5TdWJqZWN0LmNvbXBsZXRlZCIsImR5UnQuU3ViamVjdC5zdGFydCIsImR5UnQuU3ViamVjdC5yZW1vdmUiLCJkeVJ0LlN1YmplY3QuZGlzcG9zZSIsImR5UnQuR2VuZXJhdG9yU3ViamVjdCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5jb25zdHJ1Y3RvciIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5jcmVhdGUiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3QuaXNTdGFydCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5vbkJlZm9yZU5leHQiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3Qub25BZnRlck5leHQiLCJkeVJ0LkdlbmVyYXRvclN1YmplY3Qub25Jc0NvbXBsZXRlZCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5vbkJlZm9yZUVycm9yIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0Lm9uQWZ0ZXJFcnJvciIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5vbkJlZm9yZUNvbXBsZXRlZCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5vbkFmdGVyQ29tcGxldGVkIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LnN1YnNjcmliZSIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5uZXh0IiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LmVycm9yIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LmNvbXBsZXRlZCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC50b1N0cmVhbSIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5zdGFydCIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5zdG9wIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0LnJlbW92ZSIsImR5UnQuR2VuZXJhdG9yU3ViamVjdC5kaXNwb3NlIiwiZHlSdC5HZW5lcmF0b3JTdWJqZWN0Ll9zZXREaXNwb3NlSGFuZGxlciIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIiLCJkeVJ0LkFub255bW91c09ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5Bbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUiLCJkeVJ0LkFub255bW91c09ic2VydmVyLm9uTmV4dCIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlciIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIuZGlzcG9zZSIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLm9uTmV4dCIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuTWFwT2JzZXJ2ZXIiLCJkeVJ0Lk1hcE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5NYXBPYnNlcnZlci5jcmVhdGUiLCJkeVJ0Lk1hcE9ic2VydmVyLm9uTmV4dCIsImR5UnQuTWFwT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuTWFwT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LkRvT2JzZXJ2ZXIiLCJkeVJ0LkRvT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LkRvT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Eb09ic2VydmVyLm9uTmV4dCIsImR5UnQuRG9PYnNlcnZlci5vbkVycm9yIiwiZHlSdC5Eb09ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLmNyZWF0ZSIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5jdXJyZW50T2JzZXJ2ZXIiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIuZG9uZSIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5vbk5leHQiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuSW5uZXJPYnNlcnZlciIsImR5UnQuSW5uZXJPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuSW5uZXJPYnNlcnZlci5jcmVhdGUiLCJkeVJ0LklubmVyT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5Jbm5lck9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LklubmVyT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LklubmVyT2JzZXJ2ZXIuX2lzQXN5bmMiLCJkeVJ0LlRha2VVbnRpbE9ic2VydmVyIiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuVGFrZVVudGlsT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlci5vbk5leHQiLCJkeVJ0LlRha2VVbnRpbE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LlRha2VVbnRpbE9ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5Db25jYXRPYnNlcnZlciIsImR5UnQuQ29uY2F0T2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LkNvbmNhdE9ic2VydmVyLmNyZWF0ZSIsImR5UnQuQ29uY2F0T2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5Db25jYXRPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5Db25jYXRPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuU3ViamVjdE9ic2VydmVyIiwiZHlSdC5TdWJqZWN0T2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LlN1YmplY3RPYnNlcnZlci5pc0VtcHR5IiwiZHlSdC5TdWJqZWN0T2JzZXJ2ZXIubmV4dCIsImR5UnQuU3ViamVjdE9ic2VydmVyLmVycm9yIiwiZHlSdC5TdWJqZWN0T2JzZXJ2ZXIuY29tcGxldGVkIiwiZHlSdC5TdWJqZWN0T2JzZXJ2ZXIuYWRkQ2hpbGQiLCJkeVJ0LlN1YmplY3RPYnNlcnZlci5yZW1vdmVDaGlsZCIsImR5UnQuU3ViamVjdE9ic2VydmVyLmRpc3Bvc2UiLCJkeVJ0LkJhc2VTdHJlYW0iLCJkeVJ0LkJhc2VTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkJhc2VTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuQmFzZVN0cmVhbS5zdWJzY3JpYmUiLCJkeVJ0LkJhc2VTdHJlYW0uYnVpbGRTdHJlYW0iLCJkeVJ0LkRvU3RyZWFtIiwiZHlSdC5Eb1N0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuRG9TdHJlYW0uY3JlYXRlIiwiZHlSdC5Eb1N0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5NYXBTdHJlYW0iLCJkeVJ0Lk1hcFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuTWFwU3RyZWFtLmNyZWF0ZSIsImR5UnQuTWFwU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkZyb21BcnJheVN0cmVhbSIsImR5UnQuRnJvbUFycmF5U3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Gcm9tQXJyYXlTdHJlYW0uY3JlYXRlIiwiZHlSdC5Gcm9tQXJyYXlTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuRnJvbUFycmF5U3RyZWFtLnN1YnNjcmliZUNvcmUubG9vcFJlY3Vyc2l2ZSIsImR5UnQuRnJvbVByb21pc2VTdHJlYW0iLCJkeVJ0LkZyb21Qcm9taXNlU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Gcm9tUHJvbWlzZVN0cmVhbS5jcmVhdGUiLCJkeVJ0LkZyb21Qcm9taXNlU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0iLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0uY3JlYXRlIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0uc3Vic2NyaWJlQ29yZS5pbm5lckhhbmRsZXIiLCJkeVJ0LkFub255bW91c1N0cmVhbSIsImR5UnQuQW5vbnltb3VzU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Bbm9ueW1vdXNTdHJlYW0uY3JlYXRlIiwiZHlSdC5Bbm9ueW1vdXNTdHJlYW0uc3Vic2NyaWJlIiwiZHlSdC5JbnRlcnZhbFN0cmVhbSIsImR5UnQuSW50ZXJ2YWxTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkludGVydmFsU3RyZWFtLmNyZWF0ZSIsImR5UnQuSW50ZXJ2YWxTdHJlYW0uaW5pdFdoZW5DcmVhdGUiLCJkeVJ0LkludGVydmFsU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkludGVydmFsUmVxdWVzdFN0cmVhbSIsImR5UnQuSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5JbnRlcnZhbFJlcXVlc3RTdHJlYW0uY3JlYXRlIiwiZHlSdC5JbnRlcnZhbFJlcXVlc3RTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuTWVyZ2VBbGxTdHJlYW0iLCJkeVJ0Lk1lcmdlQWxsU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5NZXJnZUFsbFN0cmVhbS5jcmVhdGUiLCJkeVJ0Lk1lcmdlQWxsU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LlRha2VVbnRpbFN0cmVhbSIsImR5UnQuVGFrZVVudGlsU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5UYWtlVW50aWxTdHJlYW0uY3JlYXRlIiwiZHlSdC5UYWtlVW50aWxTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuQ29uY2F0U3RyZWFtIiwiZHlSdC5Db25jYXRTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkNvbmNhdFN0cmVhbS5jcmVhdGUiLCJkeVJ0LkNvbmNhdFN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5Db25jYXRTdHJlYW0uc3Vic2NyaWJlQ29yZS5sb29wUmVjdXJzaXZlIiwiZHlSdC5SZXBlYXRTdHJlYW0iLCJkeVJ0LlJlcGVhdFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuUmVwZWF0U3RyZWFtLmNyZWF0ZSIsImR5UnQuUmVwZWF0U3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LlJlcGVhdFN0cmVhbS5zdWJzY3JpYmVDb3JlLmxvb3BSZWN1cnNpdmUiLCJkeVJ0LlJlY29yZCIsImR5UnQuUmVjb3JkLmNvbnN0cnVjdG9yIiwiZHlSdC5SZWNvcmQuY3JlYXRlIiwiZHlSdC5SZWNvcmQudGltZSIsImR5UnQuUmVjb3JkLnZhbHVlIiwiZHlSdC5SZWNvcmQuYWN0aW9uVHlwZSIsImR5UnQuUmVjb3JkLmVxdWFscyIsImR5UnQuTW9ja09ic2VydmVyIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0Lk1vY2tPYnNlcnZlci5jcmVhdGUiLCJkeVJ0Lk1vY2tPYnNlcnZlci5tZXNzYWdlcyIsImR5UnQuTW9ja09ic2VydmVyLm9uTmV4dCIsImR5UnQuTW9ja09ic2VydmVyLm9uRXJyb3IiLCJkeVJ0Lk1vY2tPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuTW9ja09ic2VydmVyLmRpc3Bvc2UiLCJkeVJ0Lk1vY2tPYnNlcnZlci5jb3B5IiwiZHlSdC5Nb2NrUHJvbWlzZSIsImR5UnQuTW9ja1Byb21pc2UuY29uc3RydWN0b3IiLCJkeVJ0Lk1vY2tQcm9taXNlLmNyZWF0ZSIsImR5UnQuTW9ja1Byb21pc2UudGhlbiIsImR5UnQuVGVzdFNjaGVkdWxlciIsImR5UnQuVGVzdFNjaGVkdWxlci5jb25zdHJ1Y3RvciIsImR5UnQuVGVzdFNjaGVkdWxlci5uZXh0IiwiZHlSdC5UZXN0U2NoZWR1bGVyLmVycm9yIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNvbXBsZXRlZCIsImR5UnQuVGVzdFNjaGVkdWxlci5jcmVhdGUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY2xvY2siLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc2V0U3RyZWFtTWFwIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnJlbW92ZSIsImR5UnQuVGVzdFNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbCIsImR5UnQuVGVzdFNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0IiwiZHlSdC5UZXN0U2NoZWR1bGVyLl9zZXRDbG9jayIsImR5UnQuVGVzdFNjaGVkdWxlci5zdGFydFdpdGhUaW1lIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnN0YXJ0V2l0aFN1YnNjcmliZSIsImR5UnQuVGVzdFNjaGVkdWxlci5zdGFydFdpdGhEaXNwb3NlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnB1YmxpY0Fic29sdXRlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnN0YXJ0IiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNyZWF0ZVN0cmVhbSIsImR5UnQuVGVzdFNjaGVkdWxlci5jcmVhdGVPYnNlcnZlciIsImR5UnQuVGVzdFNjaGVkdWxlci5jcmVhdGVSZXNvbHZlZFByb21pc2UiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlUmVqZWN0UHJvbWlzZSIsImR5UnQuVGVzdFNjaGVkdWxlci5fZ2V0TWluQW5kTWF4VGltZSIsImR5UnQuVGVzdFNjaGVkdWxlci5fZXhlYyIsImR5UnQuVGVzdFNjaGVkdWxlci5fcnVuU3RyZWFtIiwiZHlSdC5UZXN0U2NoZWR1bGVyLl9ydW5BdCIsImR5UnQuVGVzdFNjaGVkdWxlci5fdGljayIsImR5UnQuQWN0aW9uVHlwZSIsImR5UnQuVGVzdFN0cmVhbSIsImR5UnQuVGVzdFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuVGVzdFN0cmVhbS5jcmVhdGUiLCJkeVJ0LlRlc3RTdHJlYW0uc3Vic2NyaWJlQ29yZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMENBQTBDO0FBQzFDLElBQU8sSUFBSSxDQVlWO0FBWkQsV0FBTyxJQUFJLEVBQUMsQ0FBQztJQUNUQTtRQUFnQ0MsOEJBQWVBO1FBQS9DQTtZQUFnQ0MsOEJBQWVBO1FBVS9DQSxDQUFDQTtRQVRpQkQsb0JBQVNBLEdBQXZCQSxVQUF3QkEsR0FBR0E7WUFDdkJFLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBO21CQUNMQSxDQUFDQSxNQUFLQSxDQUFDQSxVQUFVQSxZQUFDQSxHQUFHQSxDQUFDQSxT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LElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO1lBRXhDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtRQUNmQSxDQUFDQTtRQVlNRixrQ0FBYUEsR0FBcEJBLFVBQXFCQSxRQUFrQkE7WUFDbkNHLGtEQUFrREE7WUFFbERBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFlBQVlBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQzFEQSxDQUFDQTtRQUNMSCxpQkFBQ0E7SUFBREEsQ0F0QkE3UCxBQXNCQzZQLEVBdEIrQjdQLGVBQVVBLEVBc0J6Q0E7SUF0QllBLGVBQVVBLGFBc0J0QkEsQ0FBQUE7QUFDTEEsQ0FBQ0EsRUF4Qk0sSUFBSSxLQUFKLElBQUksUUF3QlYiLCJmaWxlIjoiZHlSdC5kZWJ1Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGNsYXNzIEp1ZGdlVXRpbHMgZXh0ZW5kcyBkeUNiLkp1ZGdlVXRpbHMge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGlzUHJvbWlzZShvYmope1xuICAgICAgICAgICAgcmV0dXJuICEhb2JqXG4gICAgICAgICAgICAgICAgJiYgIXN1cGVyLmlzRnVuY3Rpb24ob2JqLnN1YnNjcmliZSlcbiAgICAgICAgICAgICAgICAmJiBzdXBlci5pc0Z1bmN0aW9uKG9iai50aGVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNFcXVhbChvYjE6RW50aXR5LCBvYjI6RW50aXR5KXtcbiAgICAgICAgICAgIHJldHVybiBvYjEudWlkID09PSBvYjIudWlkO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRW50aXR5e1xuICAgICAgICBwdWJsaWMgc3RhdGljIFVJRDpudW1iZXIgPSAxO1xuXG4gICAgICAgIHByaXZhdGUgX3VpZDpzdHJpbmcgPSBudWxsO1xuICAgICAgICBnZXQgdWlkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdWlkO1xuICAgICAgICB9XG4gICAgICAgIHNldCB1aWQodWlkOnN0cmluZyl7XG4gICAgICAgICAgICB0aGlzLl91aWQgPSB1aWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcih1aWRQcmU6c3RyaW5nKXtcbiAgICAgICAgICAgIHRoaXMuX3VpZCA9IHVpZFByZSArIFN0cmluZyhFbnRpdHkuVUlEKyspO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJRGlzcG9zYWJsZXtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgaW50ZXJmYWNlIElPYnNlcnZlciBleHRlbmRzIElEaXNwb3NhYmxle1xuICAgICAgICBuZXh0KHZhbHVlOmFueSk7XG4gICAgICAgIGVycm9yKGVycm9yOmFueSk7XG4gICAgICAgIGNvbXBsZXRlZCgpO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIERpc3Bvc2VyIGV4dGVuZHMgRW50aXR5e1xuICAgICAgICBwcml2YXRlIF9kaXNwb3NlSGFuZGxlcjpkeUNiLkNvbGxlY3Rpb248RnVuY3Rpb24+ID0gZHlDYi5Db2xsZWN0aW9uLmNyZWF0ZTxGdW5jdGlvbj4oKTtcbiAgICAgICAgZ2V0IGRpc3Bvc2VIYW5kbGVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGlzcG9zZUhhbmRsZXI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGRpc3Bvc2VIYW5kbGVyKGRpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbjxGdW5jdGlvbj4pe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIgPSBkaXNwb3NlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhZGREaXNwb3NlSGFuZGxlcihmdW5jOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyLmFkZENoaWxkKGZ1bmMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuXHRleHBvcnQgY2xhc3MgSW5uZXJTdWJzY3JpcHRpb24gaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJqZWN0OlN1YmplY3R8R2VuZXJhdG9yU3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcyhzdWJqZWN0LCBvYnNlcnZlcik7XG5cblx0XHRcdHJldHVybiBvYmo7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfc3ViamVjdDpTdWJqZWN0fEdlbmVyYXRvclN1YmplY3QgPSBudWxsO1xuXHRcdHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuXHRcdGNvbnN0cnVjdG9yKHN1YmplY3Q6U3ViamVjdHxHZW5lcmF0b3JTdWJqZWN0LCBvYnNlcnZlcjpPYnNlcnZlcil7XG5cdFx0XHR0aGlzLl9zdWJqZWN0ID0gc3ViamVjdDtcblx0XHRcdHRoaXMuX29ic2VydmVyID0gb2JzZXJ2ZXI7XG5cdFx0fVxuXG5cdFx0cHVibGljIGRpc3Bvc2UoKXtcblx0XHRcdHRoaXMuX3N1YmplY3QucmVtb3ZlKHRoaXMuX29ic2VydmVyKTtcblxuXHRcdFx0dGhpcy5fb2JzZXJ2ZXIuZGlzcG9zZSgpO1xuXHRcdH1cblx0fVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uR3JvdXAgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX2NvbnRhaW5lcjpkeUNiLkNvbGxlY3Rpb248SURpc3Bvc2FibGU+ID0gZHlDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJRGlzcG9zYWJsZT4oKTtcblxuXHRcdHB1YmxpYyBhZGRDaGlsZChjaGlsZDpJRGlzcG9zYWJsZSl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuYWRkQ2hpbGQoY2hpbGQpO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuZm9yRWFjaCgoY2hpbGQ6SURpc3Bvc2FibGUpID0+IHtcblx0XHRcdFx0Y2hpbGQuZGlzcG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG4iLCJtb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgdmFyIHJvb3Q6YW55ID0gd2luZG93O1xufVxuIiwibW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IHZhciBBQlNUUkFDVF9NRVRIT0Q6RnVuY3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihcImFic3RyYWN0IG1ldGhvZCBuZWVkIG92ZXJyaWRlXCIpO1xuICAgICAgICB9LFxuICAgICAgICBBQlNUUkFDVF9BVFRSSUJVVEU6YW55ID0gbnVsbDtcbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5cbm1vZHVsZSBkeVJ0e1xuICAgIC8vcnN2cC5qc1xuICAgIC8vZGVjbGFyZSB2YXIgUlNWUDphbnk7XG4gICAgZGVjbGFyZSB2YXIgd2luZG93OmFueTtcblxuICAgIC8vbm90IHN3YWxsb3cgdGhlIGVycm9yXG4gICAgaWYod2luZG93LlJTVlApe1xuICAgICAgICB3aW5kb3cuUlNWUC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfTtcbiAgICAgICAgd2luZG93LlJTVlAub24oJ2Vycm9yJywgd2luZG93LlJTVlAub25lcnJvcik7XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBTdHJlYW0gZXh0ZW5kcyBEaXNwb3NlcntcbiAgICAgICAgcHVibGljIHNjaGVkdWxlcjpTY2hlZHVsZXIgPSBBQlNUUkFDVF9BVFRSSUJVVEU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jKXtcbiAgICAgICAgICAgIHN1cGVyKFwiU3RyZWFtXCIpO1xuXG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZUZ1bmMgPSBzdWJzY3JpYmVGdW5jIHx8IGZ1bmN0aW9uKCl7IH07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE6RnVuY3Rpb258T2JzZXJ2ZXJ8U3ViamVjdCwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdGhyb3cgQUJTVFJBQ1RfTUVUSE9EKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlRnVuYyhvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZG8ob25OZXh0PzpGdW5jdGlvbiwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIERvU3RyZWFtLmNyZWF0ZSh0aGlzLCBvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBtYXAoc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBNYXBTdHJlYW0uY3JlYXRlKHRoaXMsIHNlbGVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBmbGF0TWFwKHNlbGVjdG9yOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcChzZWxlY3RvcikubWVyZ2VBbGwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBtZXJnZUFsbCgpe1xuICAgICAgICAgICAgcmV0dXJuIE1lcmdlQWxsU3RyZWFtLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0YWtlVW50aWwob3RoZXJTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHJldHVybiBUYWtlVW50aWxTdHJlYW0uY3JlYXRlKHRoaXMsIG90aGVyU3RyZWFtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb25jYXQoc3RyZWFtQXJyOkFycmF5PFN0cmVhbT4pO1xuICAgICAgICBwdWJsaWMgY29uY2F0KC4uLm90aGVyU3RyZWFtKTtcblxuICAgICAgICBwdWJsaWMgY29uY2F0KCl7XG4gICAgICAgICAgICB2YXIgYXJnczpBcnJheTxTdHJlYW0+ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0FycmF5KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBDb25jYXRTdHJlYW0uY3JlYXRlKGFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlKHN0cmVhbUFycjpBcnJheTxTdHJlYW0+KTtcbiAgICAgICAgcHVibGljIG1lcmdlKC4uLm90aGVyU3RyZWFtKTtcblxuICAgICAgICBwdWJsaWMgbWVyZ2UoKXtcbiAgICAgICAgICAgIHZhciBhcmdzOkFycmF5PFN0cmVhbT4gPSBudWxsLFxuICAgICAgICAgICAgICAgIHN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzQXJyYXkoYXJndW1lbnRzWzBdKSl7XG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcblxuICAgICAgICAgICAgc3RyZWFtID0gZnJvbUFycmF5KGFyZ3MpLm1lcmdlQWxsKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVwZWF0KGNvdW50Om51bWJlciA9IC0xKXtcbiAgICAgICAgICAgIHJldHVybiBSZXBlYXRTdHJlYW0uY3JlYXRlKHRoaXMsIGNvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBoYW5kbGVTdWJqZWN0KGFyZyl7XG4gICAgICAgICAgICBpZih0aGlzLl9pc1N1YmplY3QoYXJnKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0U3ViamVjdChhcmcpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1N1YmplY3Qoc3ViamVjdCl7XG4gICAgICAgICAgICByZXR1cm4gc3ViamVjdCBpbnN0YW5jZW9mIFN1YmplY3Q7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXRTdWJqZWN0KHN1YmplY3Qpe1xuICAgICAgICAgICAgc3ViamVjdC5zb3VyY2UgPSB0aGlzO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgd3JhcHBlciA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gbnVsbCxcbiAgICAgICAgICAgIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcblxuICAgICAgICB3cmFwcGVyID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgICAgICAgICAgIHRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIHNlbGYuY2FsbGJhY2sodGltZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyohXG4gICAgICAgICBidWchXG4gICAgICAgICBiZWxvdyBjb2RlOlxuICAgICAgICAgd2hlbiBpbnZva2UgYiBhZnRlciAxcywgd2lsbCBvbmx5IGludm9rZSBiLCBub3QgaW52b2tlIGEhXG5cbiAgICAgICAgIGZ1bmN0aW9uIGEodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImFcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGZ1bmN0aW9uIGIodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImJcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYik7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGEoKTtcblxuICAgICAgICAgc2V0VGltZW91dChiLCAxMDAwKTtcblxuXG5cbiAgICAgICAgIHNvIHVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcHJpb3JpdHkhXG4gICAgICAgICAqL1xuICAgICAgICBpZihyb290LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgQ2hyb21lIDEwIGJ1ZyB3aGVyZSBDaHJvbWVcbiAgICAgICAgLy8gZG9lcyBub3QgcGFzcyB0aGUgdGltZSB0byB0aGUgYW5pbWF0aW9uIGZ1bmN0aW9uXG5cbiAgICAgICAgaWYgKHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBEZWZpbmUgdGhlIHdyYXBwZXJcblxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgc3dpdGNoXG5cbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgLy8gQnJvd3NlciBjYWxscyB0aGUgd3JhcHBlciBhbmQgd3JhcHBlciBjYWxscyB0aGUgY2FsbGJhY2tcblxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSh3cmFwcGVyLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v5L+u5pS5dGltZeWPguaVsFxuICAgICAgICBpZiAocm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgR2Vja28gMi4wLCB3aGljaCBoYXMgYSBidWcgaW5cbiAgICAgICAgLy8gbW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKCkgdGhhdCByZXN0cmljdHMgYW5pbWF0aW9uc1xuICAgICAgICAvLyB0byAzMC00MCBmcHMuXG5cbiAgICAgICAgaWYgKHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBDaGVjayB0aGUgR2Vja28gdmVyc2lvbi4gR2Vja28gaXMgdXNlZCBieSBicm93c2Vyc1xuICAgICAgICAgICAgLy8gb3RoZXIgdGhhbiBGaXJlZm94LiBHZWNrbyAyLjAgY29ycmVzcG9uZHMgdG9cbiAgICAgICAgICAgIC8vIEZpcmVmb3ggNC4wLlxuXG4gICAgICAgICAgICBpbmRleCA9IHVzZXJBZ2VudC5pbmRleE9mKCdydjonKTtcblxuICAgICAgICAgICAgaWYgKHVzZXJBZ2VudC5pbmRleE9mKCdHZWNrbycpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gdXNlckFnZW50LnN1YnN0cihpbmRleCArIDMsIDMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGdlY2tvVmVyc2lvbiA9PT0gJzIuMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yY2VzIHRoZSByZXR1cm4gc3RhdGVtZW50IHRvIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgc2V0VGltZW91dCgpIGZ1bmN0aW9uLlxuXG4gICAgICAgICAgICAgICAgICAgIHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHJvb3Qub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXG4gICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaDtcblxuICAgICAgICAgICAgICAgIHJvb3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi50aW1lb3V0ID0gMTAwMCAvIDYwIC0gKGZpbmlzaCAtIHN0YXJ0KTtcblxuICAgICAgICAgICAgICAgIH0sIHNlbGYudGltZW91dCk7XG4gICAgICAgICAgICB9O1xuICAgIH0oKSk7XG5cbiAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290LmNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qud2Via2l0Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3QubW96Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qub0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm1zQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IGNsZWFyVGltZW91dDtcblxuXG4gICAgZXhwb3J0IGNsYXNzIFNjaGVkdWxlcntcbiAgICAgICAgLy90b2RvIHJlbW92ZSBcIi4uLmFyZ3NcIlxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3JlcXVlc3RMb29wSWQ6YW55ID0gbnVsbDtcbiAgICAgICAgZ2V0IHJlcXVlc3RMb29wSWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG4gICAgICAgIHNldCByZXF1ZXN0TG9vcElkKHJlcXVlc3RMb29wSWQ6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9vYnNlcnZlciBpcyBmb3IgVGVzdFNjaGVkdWxlciB0byByZXdyaXRlXG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgYWN0aW9uOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgaW50ZXJ2YWw6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIHJldHVybiByb290LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpbml0aWFsID0gYWN0aW9uKGluaXRpYWwpO1xuICAgICAgICAgICAgfSwgaW50ZXJ2YWwpXG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbG9vcCA9ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uKHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5fcmVxdWVzdExvb3BJZCA9IHJvb3QucmVxdWVzdE5leHRBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgT2JzZXJ2ZXIgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IG51bGw7XG4gICAgICAgIGdldCBpc0Rpc3Bvc2VkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNEaXNwb3NlZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNEaXNwb3NlZChpc0Rpc3Bvc2VkOmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IGlzRGlzcG9zZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyTmV4dDpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJFcnJvcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJDb21wbGV0ZWQ6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2lzU3RvcDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbjxGdW5jdGlvbj4gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPEZ1bmN0aW9uPigpO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKFwiT2JzZXJ2ZXJcIik7XG5cbiAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCA9IG9uTmV4dCB8fCBmdW5jdGlvbigpe307XG4gICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yID0gb25FcnJvciB8fCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQgPSBvbkNvbXBsZXRlZCB8fCBmdW5jdGlvbigpe307XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vbk5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzU3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzU3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHVibGljIGZhaWwoZSkge1xuICAgICAgICAvLyAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAvLyAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgLy8gICAgICAgIHRoaXMuZXJyb3IoZSk7XG4gICAgICAgIC8vICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NlSGFuZGxlcihkaXNwb3NlSGFuZGxlcjpkeUNiLkNvbGxlY3Rpb248RnVuY3Rpb24+KXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyID0gZGlzcG9zZUhhbmRsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhyb3cgQUJTVFJBQ1RfTUVUSE9EKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdCBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBnZXQgc291cmNlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBzb3VyY2Uoc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcnM6ZHlDYi5Db2xsZWN0aW9uPElPYnNlcnZlcj4gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPElPYnNlcnZlcj4oKTtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE/OkZ1bmN0aW9ufE9ic2VydmVyLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gPEF1dG9EZXRhY2hPYnNlcnZlcj5hcmcxXG4gICAgICAgICAgICAgICAgOiBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxGdW5jdGlvbj5hcmcxLCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSAmJiBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLl9zb3VyY2UuZGlzcG9zZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gSW5uZXJTdWJzY3JpcHRpb24uY3JlYXRlKHRoaXMsIG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKXtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSAmJiB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0odGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVycy5yZW1vdmVDaGlsZCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKG9iLCBvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXJzLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBHZW5lcmF0b3JTdWJqZWN0IGV4dGVuZHMgRGlzcG9zZXIgaW1wbGVtZW50cyBJT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdGFydDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGdldCBpc1N0YXJ0KCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNTdGFydDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNTdGFydChpc1N0YXJ0OmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IGlzU3RhcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICAgICAgc3VwZXIoXCJHZW5lcmF0b3JTdWJqZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9ic2VydmVyOmFueSA9IG5ldyBTdWJqZWN0T2JzZXJ2ZXIoKTtcblxuICAgICAgICAvKiFcbiAgICAgICAgb3V0ZXIgaG9vayBtZXRob2RcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZU5leHQodmFsdWU6YW55KXtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkFmdGVyTmV4dCh2YWx1ZTphbnkpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbklzQ29tcGxldGVkKHZhbHVlOmFueSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQmVmb3JlRXJyb3IoZXJyb3I6YW55KSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25BZnRlckVycm9yKGVycm9yOmFueSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQmVmb3JlQ29tcGxldGVkKCkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQWZ0ZXJDb21wbGV0ZWQoKSB7XG4gICAgICAgIH1cblxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMT86RnVuY3Rpb258T2JzZXJ2ZXIsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyA8QXV0b0RldGFjaE9ic2VydmVyPmFyZzFcbiAgICAgICAgICAgICAgICAgICAgOiBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxGdW5jdGlvbj5hcmcxLCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXREaXNwb3NlSGFuZGxlcihvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBJbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUodGhpcywgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1N0YXJ0IHx8IHRoaXMub2JzZXJ2ZXIuaXNFbXB0eSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQmVmb3JlTmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9ic2VydmVyLm5leHQodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vbkFmdGVyTmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLm9uSXNDb21wbGV0ZWQodmFsdWUpKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNTdGFydCB8fCB0aGlzLm9ic2VydmVyLmlzRW1wdHkoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlRXJyb3IoZXJyb3IpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmVycm9yKGVycm9yKTtcblxuICAgICAgICAgICAgdGhpcy5vbkFmdGVyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzU3RhcnQgfHwgdGhpcy5vYnNlcnZlci5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZUNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLm9uQWZ0ZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0b1N0cmVhbSgpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgICAgIHN0cmVhbSA9IEFub255bW91c1N0cmVhbS5jcmVhdGUoKG9ic2VydmVyOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKXtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RhcnQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0b3AoKXtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RhcnQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5yZW1vdmVDaGlsZChvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXREaXNwb3NlSGFuZGxlcihvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkRGlzcG9zZUhhbmRsZXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKHRoaXMuZGlzcG9zZUhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlck5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJFcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBBdXRvRGV0YWNoT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgZHlDYi5Mb2cubG9nKFwib25seSBjYW4gZGlzcG9zZSBvbmNlXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlck5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vdGhpcy5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGNsYXNzIE1hcE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZWxlY3Rvcih2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIERvT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgcHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgcHJldk9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIC8vdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlQWxsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHN0cmVhbUdyb3VwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBnZXQgY3VycmVudE9ic2VydmVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG4gICAgICAgIHNldCBjdXJyZW50T2JzZXJ2ZXIoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2RvbmU6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBnZXQgZG9uZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RvbmU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGRvbmUoZG9uZTpib29sZWFuKXtcbiAgICAgICAgICAgIHRoaXMuX2RvbmUgPSBkb25lO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBkeUNiLkxvZy5lcnJvcighKGlubmVyU291cmNlIGluc3RhbmNlb2YgU3RyZWFtIHx8IEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSksIGR5Q2IuTG9nLmluZm8uRlVOQ19NVVNUX0JFKFwiaW5uZXJTb3VyY2VcIiwgXCJTdHJlYW0gb3IgUHJvbWlzZVwiKSk7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSl7XG4gICAgICAgICAgICAgICAgaW5uZXJTb3VyY2UgPSBmcm9tUHJvbWlzZShpbm5lclNvdXJjZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLmFkZENoaWxkKGlubmVyU291cmNlKTtcblxuICAgICAgICAgICAgaW5uZXJTb3VyY2UuYnVpbGRTdHJlYW0oSW5uZXJPYnNlcnZlci5jcmVhdGUodGhpcywgdGhpcy5fc3RyZWFtR3JvdXAsIGlubmVyU291cmNlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGFzcyBJbm5lck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHBhcmVudDpNZXJnZUFsbE9ic2VydmVyLCBzdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb248U3RyZWFtPiwgY3VycmVudFN0cmVhbTpTdHJlYW0pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0cmVhbSA9IGN1cnJlbnRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdHJlYW0gPSB0aGlzLl9jdXJyZW50U3RyZWFtLFxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHRoaXMuX3BhcmVudDtcblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAucmVtb3ZlQ2hpbGQoKHN0cmVhbTpTdHJlYW0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKHN0cmVhbSwgY3VycmVudFN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9pZiB0aGlzIGlubmVyU291cmNlIGlzIGFzeW5jIHN0cmVhbShhcyBwcm9taXNlIHN0cmVhbSksXG4gICAgICAgICAgICAvL2l0IHdpbGwgZmlyc3QgZXhlYyBhbGwgcGFyZW50Lm5leHQgYW5kIG9uZSBwYXJlbnQuY29tcGxldGVkLFxuICAgICAgICAgICAgLy90aGVuIGV4ZWMgYWxsIHRoaXMubmV4dCBhbmQgYWxsIHRoaXMuY29tcGxldGVkXG4gICAgICAgICAgICAvL3NvIGluIHRoaXMgY2FzZSwgaXQgc2hvdWxkIGludm9rZSBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCBhZnRlciB0aGUgbGFzdCBpbnZva2NhdGlvbiBvZiB0aGlzLmNvbXBsZXRlZChoYXZlIGludm9rZWQgYWxsIHRoZSBpbm5lclNvdXJjZSlcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzQXN5bmMoKSAmJiB0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNBc3luYygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudC5kb25lO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBjbGFzcyBDb25jYXRPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzdGFydE5leHRTdHJlYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgY3VycmVudE9ic2VydmVyOmFueSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3N0YXJ0TmV4dFN0cmVhbTpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zdGFydE5leHRTdHJlYW0gPSBzdGFydE5leHRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIC8vdGhpcy5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydE5leHRTdHJlYW0oKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJU3ViamVjdE9ic2VydmVyIHtcbiAgICAgICAgYWRkQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpO1xuICAgICAgICByZW1vdmVDaGlsZChvYnNlcnZlcjpPYnNlcnZlcik7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdE9ic2VydmVyIGltcGxlbWVudHMgSU9ic2VydmVye1xuICAgICAgICBwdWJsaWMgb2JzZXJ2ZXJzOmR5Q2IuQ29sbGVjdGlvbjxJT2JzZXJ2ZXI+ID0gZHlDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJT2JzZXJ2ZXI+KCk7XG5cbiAgICAgICAgcHVibGljIGlzRW1wdHkoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9ic2VydmVycy5nZXRDb3VudCgpID09PSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhZGRDaGlsZChvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5hZGRDaGlsZChvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMucmVtb3ZlQ2hpbGQoKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEp1ZGdlVXRpbHMuaXNFcXVhbChvYiwgb2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQmFzZVN0cmVhbSBleHRlbmRzIFN0cmVhbXtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/LCBvbkNvbXBsZXRlZD8pOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuaGFuZGxlU3ViamVjdChhcmcxKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gYXJnMVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgc3VwZXIuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZUNvcmUob2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIF9oYXNNdWx0aU9ic2VydmVycygpe1xuICAgICAgICAvLyAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXIuZ2V0T2JzZXJ2ZXJzKCkgPiAxO1xuICAgICAgICAvL31cbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIERvU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgb25OZXh0PzpGdW5jdGlvbiwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgb25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyID0gQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvcixvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oRG9PYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX29ic2VydmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1hcFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc2VsZWN0b3I6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIHNlbGVjdG9yOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1hcE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fc2VsZWN0b3IpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21BcnJheVN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhhcnJheSwgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FycmF5OkFycmF5PGFueT4gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyYXk7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgYXJyYXkgPSB0aGlzLl9hcnJheSxcbiAgICAgICAgICAgICAgICBsZW4gPSBhcnJheS5sZW5ndGg7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvb3BSZWN1cnNpdmUoaSkge1xuICAgICAgICAgICAgICAgIGlmIChpIDwgbGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoYXJyYXlbaV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50cy5jYWxsZWUoaSArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlciwgMCwgbG9vcFJlY3Vyc2l2ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tUHJvbWlzZVN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHByb21pc2U6YW55LCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKHByb21pc2UsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcHJvbWlzZTphbnkgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByb21pc2U6YW55LCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdG9kbyByZW1vdmUgdGVzdCBsb2dpYyBmcm9tIHByb2R1Y3QgbG9naWMoYXMgU2NoZWR1bGVyLT5wdWJsaWN4eHgsIEZyb21Qcm9taXNlLT50aGVuLi4uKVxuICAgICAgICAgICAgdGhpcy5fcHJvbWlzZS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChkYXRhKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSwgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbUV2ZW50UGF0dGVyblN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhhZGRIYW5kbGVyLCByZW1vdmVIYW5kbGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FkZEhhbmRsZXI6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9yZW1vdmVIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyID0gYWRkSGFuZGxlcjtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUhhbmRsZXIgPSByZW1vdmVIYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgZnVuY3Rpb24gaW5uZXJIYW5kbGVyKGV2ZW50KXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcihpbm5lckhhbmRsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLmFkZERpc3Bvc2VIYW5kbGVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLl9yZW1vdmVIYW5kbGVyKGlubmVySGFuZGxlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc3Vic2NyaWJlRnVuYyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihzdWJzY3JpYmVGdW5jKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICAgICAgaWYodGhpcy5oYW5kbGVTdWJqZWN0KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEludGVydmFsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaW50ZXJ2YWw6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoaW50ZXJ2YWwsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIG9iai5pbml0V2hlbkNyZWF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaW50ZXJ2YWw6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihpbnRlcnZhbDpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gaW50ZXJ2YWw7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbml0V2hlbkNyZWF0ZSgpe1xuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSB0aGlzLl9pbnRlcnZhbCA8PSAwID8gMSA6IHRoaXMuX2ludGVydmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlkID0gdGhpcy5zY2hlZHVsZXIucHVibGlzaEludGVydmFsKG9ic2VydmVyLCAwLCB0aGlzLl9pbnRlcnZhbCwgKGNvdW50KSA9PiB7XG4gICAgICAgICAgICAgICAgLy9zZWxmLnNjaGVkdWxlci5uZXh0KGNvdW50KTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGNvdW50KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudCArIDE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5hZGREaXNwb3NlSGFuZGxlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5jbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXIsICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0aW1lKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmFkZERpc3Bvc2VIYW5kbGVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2VsZi5zY2hlZHVsZXIucmVxdWVzdExvb3BJZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlQWxsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIC8vdGhpcy5fb2JzZXJ2ZXIgPSBBbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzdHJlYW1Hcm91cCA9IGR5Q2IuQ29sbGVjdGlvbi5jcmVhdGU8U3RyZWFtPigpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWVyZ2VBbGxPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHN0cmVhbUdyb3VwKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIFRha2VVbnRpbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIG90aGVyU3RlYW06U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBvdGhlclN0ZWFtKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vdGhlclN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIG90aGVyU3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fb3RoZXJTdHJlYW0gPSBKdWRnZVV0aWxzLmlzUHJvbWlzZShvdGhlclN0cmVhbSkgPyBmcm9tUHJvbWlzZShvdGhlclN0cmVhbSkgOiBvdGhlclN0cmVhbTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShvYnNlcnZlcik7XG4gICAgICAgICAgICB0aGlzLl9vdGhlclN0cmVhbS5idWlsZFN0cmVhbShUYWtlVW50aWxPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIENvbmNhdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZXM6QXJyYXk8U3RyZWFtPikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlczpkeUNiLkNvbGxlY3Rpb248U3RyZWFtPiA9IGR5Q2IuQ29sbGVjdGlvbi5jcmVhdGU8U3RyZWFtPigpO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZXM6QXJyYXk8U3RyZWFtPil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAvL3RvZG8gZG9uJ3Qgc2V0IHNjaGVkdWxlciBoZXJlP1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzb3VyY2VzWzBdLnNjaGVkdWxlcjtcblxuICAgICAgICAgICAgc291cmNlcy5mb3JFYWNoKChzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzUHJvbWlzZShzb3VyY2UpKXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc291cmNlcy5hZGRDaGlsZChmcm9tUHJvbWlzZShzb3VyY2UpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc291cmNlcy5hZGRDaGlsZChzb3VyY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb3VudCA9IHRoaXMuX3NvdXJjZXMuZ2V0Q291bnQoKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShpKSB7XG4gICAgICAgICAgICAgICAgaWYoaSA9PT0gY291bnQpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5fc291cmNlcy5nZXRDaGlsZChpKS5idWlsZFN0cmVhbShDb25jYXRPYnNlcnZlci5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlciwgKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wUmVjdXJzaXZlKGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlciwgMCwgbG9vcFJlY3Vyc2l2ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIFJlcGVhdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIGNvdW50Om51bWJlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgY291bnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2NvdW50Om51bWJlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgY291bnQ6bnVtYmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9jb3VudCA9IGNvdW50O1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG5cbiAgICAgICAgICAgIC8vdGhpcy5zdWJqZWN0R3JvdXAgPSB0aGlzLl9zb3VyY2Uuc3ViamVjdEdyb3VwO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShjb3VudCkge1xuICAgICAgICAgICAgICAgIGlmKGNvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZS5idWlsZFN0cmVhbShDb25jYXRPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9vcFJlY3Vyc2l2ZShjb3VudCAtIDEpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlciwgdGhpcy5fY291bnQsIGxvb3BSZWN1cnNpdmUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCB2YXIgY3JlYXRlU3RyZWFtID0gKHN1YnNjcmliZUZ1bmMpID0+IHtcbiAgICAgICAgcmV0dXJuIEFub255bW91c1N0cmVhbS5jcmVhdGUoc3Vic2NyaWJlRnVuYyk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbUFycmF5ID0gKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT57XG4gICAgICAgIHJldHVybiBGcm9tQXJyYXlTdHJlYW0uY3JlYXRlKGFycmF5LCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21Qcm9taXNlID0gKHByb21pc2U6YW55LCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+e1xuICAgICAgICByZXR1cm4gRnJvbVByb21pc2VTdHJlYW0uY3JlYXRlKHByb21pc2UsIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbUV2ZW50UGF0dGVybiA9IChhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKSA9PntcbiAgICAgICAgcmV0dXJuIEZyb21FdmVudFBhdHRlcm5TdHJlYW0uY3JlYXRlKGFkZEhhbmRsZXIsIHJlbW92ZUhhbmRsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGludGVydmFsID0gKGludGVydmFsLCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsU3RyZWFtLmNyZWF0ZShpbnRlcnZhbCwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBpbnRlcnZhbFJlcXVlc3QgPSAoc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PiB7XG4gICAgICAgIHJldHVybiBJbnRlcnZhbFJlcXVlc3RTdHJlYW0uY3JlYXRlKHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZW1wdHkgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT57XG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgdmFyIGRlZmF1bHRJc0VxdWFsID0gKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgfTtcblxuICAgIGV4cG9ydCBjbGFzcyBSZWNvcmQge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSh0aW1lOm51bWJlciwgdmFsdWU6YW55LCBhY3Rpb25UeXBlPzpBY3Rpb25UeXBlLCBjb21wYXJlcj86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyh0aW1lLCB2YWx1ZSwgYWN0aW9uVHlwZSwgY29tcGFyZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdGltZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBnZXQgdGltZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHRpbWUodGltZTpudW1iZXIpe1xuICAgICAgICAgICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF92YWx1ZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBnZXQgdmFsdWUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdmFsdWUodmFsdWU6bnVtYmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hY3Rpb25UeXBlOkFjdGlvblR5cGUgPSBudWxsO1xuICAgICAgICBnZXQgYWN0aW9uVHlwZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGlvblR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGFjdGlvblR5cGUoYWN0aW9uVHlwZTpBY3Rpb25UeXBlKXtcbiAgICAgICAgICAgIHRoaXMuX2FjdGlvblR5cGUgPSBhY3Rpb25UeXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY29tcGFyZXI6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHRpbWUsIHZhbHVlLCBhY3Rpb25UeXBlOkFjdGlvblR5cGUsIGNvbXBhcmVyOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9hY3Rpb25UeXBlID0gYWN0aW9uVHlwZTtcbiAgICAgICAgICAgIHRoaXMuX2NvbXBhcmVyID0gY29tcGFyZXIgfHwgZGVmYXVsdElzRXF1YWw7XG4gICAgICAgIH1cblxuICAgICAgICBlcXVhbHMob3RoZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90aW1lID09PSBvdGhlci50aW1lICYmIHRoaXMuX2NvbXBhcmVyKHRoaXMuX3ZhbHVlLCBvdGhlci52YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBNb2NrT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSA8W1JlY29yZF0+W107XG4gICAgICAgIGdldCBtZXNzYWdlcygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICAgICAgICB9XG4gICAgICAgIHNldCBtZXNzYWdlcyhtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIHZhbHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCBlcnJvcikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCBudWxsKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvcHkoKXtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBNb2NrT2JzZXJ2ZXIuY3JlYXRlKHRoaXMuX3NjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlcyA9IHRoaXMuX21lc3NhZ2VzO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgTW9ja1Byb21pc2V7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyLCBtZXNzYWdlczpbUmVjb3JkXSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlciwgbWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSA8W1JlY29yZF0+W107XG4gICAgICAgIC8vZ2V0IG1lc3NhZ2VzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgICAgICAgLy99XG4gICAgICAgIC8vc2V0IG1lc3NhZ2VzKG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgLy8gICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHJpdmF0ZSBfc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRoZW4oc3VjY2Vzc0NiOkZ1bmN0aW9uLCBlcnJvckNiOkZ1bmN0aW9uLCBvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgc2NoZWR1bGVyID0gPFRlc3RTY2hlZHVsZXI+KHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgY29uc3QgU1VCU0NSSUJFX1RJTUUgPSAyMDA7XG4gICAgY29uc3QgRElTUE9TRV9USU1FID0gMTAwMDtcblxuICAgIGV4cG9ydCBjbGFzcyBUZXN0U2NoZWR1bGVyIGV4dGVuZHMgU2NoZWR1bGVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBuZXh0KHRpY2ssIHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCB2YWx1ZSwgQWN0aW9uVHlwZS5ORVhUKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZXJyb3IodGljaywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIGVycm9yLCBBY3Rpb25UeXBlLkVSUk9SKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY29tcGxldGVkKHRpY2spIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIG51bGwsIEFjdGlvblR5cGUuQ09NUExFVEVEKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGlzUmVzZXQ6Ym9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoaXNSZXNldCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcihpc1Jlc2V0OmJvb2xlYW4pe1xuICAgICAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5faXNSZXNldCA9IGlzUmVzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jbG9jazpudW1iZXIgPSBudWxsO1xuICAgICAgICBnZXQgY2xvY2soKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBzZXQgY2xvY2soY2xvY2s6bnVtYmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9jbG9jayA9IGNsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNSZXNldDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwcml2YXRlIF90aW1lck1hcDpkeUNiLkhhc2g8RnVuY3Rpb24+ID0gZHlDYi5IYXNoLmNyZWF0ZTxGdW5jdGlvbj4oKTtcbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtTWFwOmR5Q2IuSGFzaDxGdW5jdGlvbj4gPSBkeUNiLkhhc2guY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIF9zdWJzY3JpYmVkVGltZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9kaXNwb3NlZFRpbWU6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBwdWJsaWMgc2V0U3RyZWFtTWFwKG9ic2VydmVyOklPYnNlcnZlciwgbWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBtZXNzYWdlcy5mb3JFYWNoKChyZWNvcmQ6UmVjb3JkKSA9PntcbiAgICAgICAgICAgICAgICB2YXIgZnVuYyA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHJlY29yZC5hY3Rpb25UeXBlKXtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBBY3Rpb25UeXBlLk5FWFQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gKCkgPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuRVJST1I6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gKCkgPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IocmVjb3JkLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBBY3Rpb25UeXBlLkNPTVBMRVRFRDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGR5Q2IuTG9nLmVycm9yKHRydWUsIGR5Q2IuTG9nLmluZm8uRlVOQ19VTktOT1coXCJhY3Rpb25UeXBlXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYuX3N0cmVhbU1hcC5hZGRDaGlsZChTdHJpbmcocmVjb3JkLnRpbWUpLCBmdW5jKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZShvYnNlcnZlcjpPYnNlcnZlcikge1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlcjpNb2NrT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCByZWN1cnNpdmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBjb3B5T2JzZXJ2ZXIgPSBvYnNlcnZlci5jb3B5PyBvYnNlcnZlci5jb3B5KCkgOiBvYnNlcnZlcjtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuX3RpY2soMSk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQoc2VsZi5fY2xvY2ssIHZhbHVlKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5fdGljaygxKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIuY29tcGxldGVkKHNlbGYuX2Nsb2NrKSk7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRTdHJlYW1NYXAoY29weU9ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVjdXJzaXZlRnVuYyhpbml0aWFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgaW50ZXJ2YWw6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIC8vcHJvZHVjZSAxMCB2YWwgZm9yIHRlc3RcbiAgICAgICAgICAgIHZhciBDT1VOVCA9IDEwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHdoaWxlIChDT1VOVCA+IDAgJiYgIXRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aWNrKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dCh0aGlzLl9jbG9jaywgaW5pdGlhbCkpO1xuXG4gICAgICAgICAgICAgICAgLy9ubyBuZWVkIHRvIGludm9rZSBhY3Rpb25cbiAgICAgICAgICAgICAgICAvL2FjdGlvbihpbml0aWFsKTtcblxuICAgICAgICAgICAgICAgIGluaXRpYWwrKztcbiAgICAgICAgICAgICAgICBDT1VOVC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0KG9ic2VydmVyOklPYnNlcnZlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICAvL3Byb2R1Y2UgMTAgdmFsIGZvciB0ZXN0XG4gICAgICAgICAgICB2YXIgQ09VTlQgPSAxMCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGludGVydmFsID0gMTAwO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB3aGlsZSAoQ09VTlQgPiAwICYmICF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGljayhpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIGludGVydmFsKSk7XG5cbiAgICAgICAgICAgICAgICBDT1VOVC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NldENsb2NrKCl7XG4gICAgICAgICAgICBpZih0aGlzLl9pc1Jlc2V0KXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9jayA9IHRoaXMuX3N1YnNjcmliZWRUaW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aFRpbWUoY3JlYXRlOkZ1bmN0aW9uLCBzdWJzY3JpYmVkVGltZTpudW1iZXIsIGRpc3Bvc2VkVGltZTpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IHRoaXMuY3JlYXRlT2JzZXJ2ZXIoKSxcbiAgICAgICAgICAgICAgICBzb3VyY2UsIHN1YnNjcmlwdGlvbjtcblxuICAgICAgICAgICAgdGhpcy5fc3Vic2NyaWJlZFRpbWUgPSBzdWJzY3JpYmVkVGltZTtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VkVGltZSA9IGRpc3Bvc2VkVGltZTtcblxuICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSBzdWJzY3JpYmVkVGltZTtcblxuICAgICAgICAgICAgdGhpcy5fcnVuQXQoc3Vic2NyaWJlZFRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBjcmVhdGUoKTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24gPSBzb3VyY2Uuc3Vic2NyaWJlKG9ic2VydmVyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9ydW5BdChkaXNwb3NlZFRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aFN1YnNjcmliZShjcmVhdGUsIHN1YnNjcmliZWRUaW1lID0gU1VCU0NSSUJFX1RJTUUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0V2l0aFRpbWUoY3JlYXRlLCBzdWJzY3JpYmVkVGltZSwgRElTUE9TRV9USU1FKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydFdpdGhEaXNwb3NlKGNyZWF0ZSwgZGlzcG9zZWRUaW1lID0gRElTUE9TRV9USU1FKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydFdpdGhUaW1lKGNyZWF0ZSwgU1VCU0NSSUJFX1RJTUUsIGRpc3Bvc2VkVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGljQWJzb2x1dGUodGltZSwgaGFuZGxlcikge1xuICAgICAgICAgICAgdGhpcy5fcnVuQXQodGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0KCkge1xuICAgICAgICAgICAgdmFyIGV4dHJlbWVOdW1BcnIgPSB0aGlzLl9nZXRNaW5BbmRNYXhUaW1lKCksXG4gICAgICAgICAgICAgICAgbWluID0gZXh0cmVtZU51bUFyclswXSxcbiAgICAgICAgICAgICAgICBtYXggPSBleHRyZW1lTnVtQXJyWzFdLFxuICAgICAgICAgICAgICAgIHRpbWUgPSBtaW47XG5cbiAgICAgICAgICAgIC8vdG9kbyByZWR1Y2UgbG9vcCB0aW1lXG4gICAgICAgICAgICB3aGlsZSAodGltZSA8PSBtYXgpIHtcbiAgICAgICAgICAgICAgICAvL2JlY2F1c2UgXCJfZXhlYyxfcnVuU3RyZWFtXCIgbWF5IGNoYW5nZSBcIl9jbG9ja1wiLFxuICAgICAgICAgICAgICAgIC8vc28gaXQgc2hvdWxkIHJlc2V0IHRoZSBfY2xvY2tcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGltZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2V4ZWModGltZSwgdGhpcy5fdGltZXJNYXApO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aW1lO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcnVuU3RyZWFtKHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgdGltZSsrO1xuXG4gICAgICAgICAgICAgICAgLy90b2RvIGdldCBtYXggdGltZSBvbmx5IGZyb20gc3RyZWFtTWFwP1xuICAgICAgICAgICAgICAgIC8vbmVlZCByZWZyZXNoIG1heCB0aW1lLlxuICAgICAgICAgICAgICAgIC8vYmVjYXVzZSBpZiB0aW1lck1hcCBoYXMgY2FsbGJhY2sgdGhhdCBjcmVhdGUgaW5maW5pdGUgc3RyZWFtKGFzIGludGVydmFsKSxcbiAgICAgICAgICAgICAgICAvL2l0IHdpbGwgc2V0IHN0cmVhbU1hcCBzbyB0aGF0IHRoZSBtYXggdGltZSB3aWxsIGNoYW5nZVxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVTdHJlYW0oYXJncyl7XG4gICAgICAgICAgICByZXR1cm4gVGVzdFN0cmVhbS5jcmVhdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlT2JzZXJ2ZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gTW9ja09ic2VydmVyLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVSZXNvbHZlZFByb21pc2UodGltZTpudW1iZXIsIHZhbHVlOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gTW9ja1Byb21pc2UuY3JlYXRlKHRoaXMsIFtUZXN0U2NoZWR1bGVyLm5leHQodGltZSwgdmFsdWUpLCBUZXN0U2NoZWR1bGVyLmNvbXBsZXRlZCh0aW1lKzEpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlUmVqZWN0UHJvbWlzZSh0aW1lOm51bWJlciwgZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHJldHVybiBNb2NrUHJvbWlzZS5jcmVhdGUodGhpcywgW1Rlc3RTY2hlZHVsZXIuZXJyb3IodGltZSwgZXJyb3IpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9nZXRNaW5BbmRNYXhUaW1lKCl7XG4gICAgICAgICAgICB2YXIgdGltZUFyciA9IHRoaXMuX3RpbWVyTWFwLmdldEtleXMoKS5hZGRDaGlsZHJlbih0aGlzLl9zdHJlYW1NYXAuZ2V0S2V5cygpKVxuICAgICAgICAgICAgICAgIC5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKGtleSk7XG4gICAgICAgICAgICAgICAgfSkudG9BcnJheSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gW01hdGgubWluLmFwcGx5KE1hdGgsIHRpbWVBcnIpLCBNYXRoLm1heC5hcHBseShNYXRoLCB0aW1lQXJyKV07XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9leGVjKHRpbWUsIG1hcCl7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IG1hcC5nZXRDaGlsZChTdHJpbmcodGltZSkpO1xuXG4gICAgICAgICAgICBpZihoYW5kbGVyKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9ydW5TdHJlYW0odGltZSl7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXMuX3N0cmVhbU1hcC5nZXRDaGlsZChTdHJpbmcodGltZSkpO1xuXG4gICAgICAgICAgICBpZihoYW5kbGVyKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9ydW5BdCh0aW1lOm51bWJlciwgY2FsbGJhY2s6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVyTWFwLmFkZENoaWxkKFN0cmluZyh0aW1lKSwgY2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdGljayh0aW1lOm51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5fY2xvY2sgKz0gdGltZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4iLCJtb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGVudW0gQWN0aW9uVHlwZXtcbiAgICAgICAgTkVYVCxcbiAgICAgICAgRVJST1IsXG4gICAgICAgIENPTVBMRVRFRFxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9uc1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgVGVzdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW0ge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShtZXNzYWdlczpbUmVjb3JkXSwgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhtZXNzYWdlcywgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihtZXNzYWdlczpbUmVjb3JkXSwgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgc2NoZWR1bGVyID0gPFRlc3RTY2hlZHVsZXI+KHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCB0aGlzLl9tZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=