var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
    })(wdCb.JudgeUtils);
    wdFrp.JudgeUtils = JudgeUtils;
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
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
    wdFrp.Entity = Entity;
})(wdFrp || (wdFrp = {}));




var wdFrp;
(function (wdFrp) {
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
    wdFrp.SingleDisposable = SingleDisposable;
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
    var GroupDisposable = (function () {
        function GroupDisposable(disposable) {
            this._group = wdCb.Collection.create();
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
    wdFrp.GroupDisposable = GroupDisposable;
})(wdFrp || (wdFrp = {}));




var wdFrp;
(function (wdFrp) {
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
    wdFrp.InnerSubscription = InnerSubscription;
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
    var InnerSubscriptionGroup = (function () {
        function InnerSubscriptionGroup() {
            this._container = wdCb.Collection.create();
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
    wdFrp.InnerSubscriptionGroup = InnerSubscriptionGroup;
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
    Object.defineProperty(wdFrp, "root", {
        get: function () {
            if (wdFrp.JudgeUtils.isNodeJs()) {
                return global;
            }
            return window;
        }
    });
})(wdFrp || (wdFrp = {}));

var wdFrp;
(function (wdFrp) {
    wdFrp.ABSTRACT_ATTRIBUTE = null;
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
    if (wdFrp.root.RSVP) {
        wdFrp.root.RSVP.onerror = function (e) {
            throw e;
        };
        wdFrp.root.RSVP.on('error', wdFrp.root.RSVP.onerror);
    }
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var Stream = (function (_super) {
        __extends(Stream, _super);
        function Stream(subscribeFunc) {
            _super.call(this, "Stream");
            this.scheduler = wdFrp.ABSTRACT_ATTRIBUTE;
            this.subscribeFunc = null;
            this.subscribeFunc = subscribeFunc || function () { };
        }
        Stream.prototype.buildStream = function (observer) {
            return wdFrp.SingleDisposable.create((this.subscribeFunc(observer) || function () { }));
        };
        Stream.prototype.do = function (onNext, onError, onCompleted) {
            return wdFrp.DoStream.create(this, onNext, onError, onCompleted);
        };
        Stream.prototype.map = function (selector) {
            return wdFrp.MapStream.create(this, selector);
        };
        Stream.prototype.flatMap = function (selector) {
            return this.map(selector).mergeAll();
        };
        Stream.prototype.mergeAll = function () {
            return wdFrp.MergeAllStream.create(this);
        };
        Stream.prototype.takeUntil = function (otherStream) {
            return wdFrp.TakeUntilStream.create(this, otherStream);
        };
        Stream.prototype.concat = function () {
            var args = null;
            if (wdFrp.JudgeUtils.isArray(arguments[0])) {
                args = arguments[0];
            }
            else {
                args = Array.prototype.slice.call(arguments, 0);
            }
            args.unshift(this);
            return wdFrp.ConcatStream.create(args);
        };
        Stream.prototype.merge = function () {
            var args = null, stream = null;
            if (wdFrp.JudgeUtils.isArray(arguments[0])) {
                args = arguments[0];
            }
            else {
                args = Array.prototype.slice.call(arguments, 0);
            }
            args.unshift(this);
            stream = wdFrp.fromArray(args).mergeAll();
            return stream;
        };
        Stream.prototype.repeat = function (count) {
            if (count === void 0) { count = -1; }
            return wdFrp.RepeatStream.create(this, count);
        };
        Stream.prototype.ignoreElements = function () {
            return wdFrp.IgnoreElementsStream.create(this);
        };
        Stream.prototype.handleSubject = function (arg) {
            if (this._isSubject(arg)) {
                this._setSubject(arg);
                return true;
            }
            return false;
        };
        Stream.prototype._isSubject = function (subject) {
            return subject instanceof wdFrp.Subject;
        };
        Stream.prototype._setSubject = function (subject) {
            subject.source = this;
        };
        return Stream;
    })(wdFrp.Entity);
    wdFrp.Stream = Stream;
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
    wdFrp.root.requestNextAnimationFrame = (function () {
        var originalRequestAnimationFrame = undefined, wrapper = undefined, callback = undefined, geckoVersion = null, userAgent = wdFrp.root.navigator && wdFrp.root.navigator.userAgent, index = 0, self = this;
        wrapper = function (time) {
            time = wdFrp.root.performance.now();
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
        if (wdFrp.root.requestAnimationFrame) {
            return requestAnimationFrame;
        }
        if (wdFrp.root.webkitRequestAnimationFrame) {
            originalRequestAnimationFrame = wdFrp.root.webkitRequestAnimationFrame;
            wdFrp.root.webkitRequestAnimationFrame = function (callback, element) {
                self.callback = callback;
                return originalRequestAnimationFrame(wrapper, element);
            };
        }
        if (wdFrp.root.msRequestAnimationFrame) {
            originalRequestAnimationFrame = wdFrp.root.msRequestAnimationFrame;
            wdFrp.root.msRequestAnimationFrame = function (callback) {
                self.callback = callback;
                return originalRequestAnimationFrame(wrapper);
            };
        }
        if (wdFrp.root.mozRequestAnimationFrame) {
            index = userAgent.indexOf('rv:');
            if (userAgent.indexOf('Gecko') != -1) {
                geckoVersion = userAgent.substr(index + 3, 3);
                if (geckoVersion === '2.0') {
                    wdFrp.root.mozRequestAnimationFrame = undefined;
                }
            }
        }
        return wdFrp.root.webkitRequestAnimationFrame ||
            wdFrp.root.mozRequestAnimationFrame ||
            wdFrp.root.oRequestAnimationFrame ||
            wdFrp.root.msRequestAnimationFrame ||
            function (callback, element) {
                var start, finish;
                wdFrp.root.setTimeout(function () {
                    start = wdFrp.root.performance.now();
                    callback(start);
                    finish = wdFrp.root.performance.now();
                    self.timeout = 1000 / 60 - (finish - start);
                }, self.timeout);
            };
    }());
    wdFrp.root.cancelNextRequestAnimationFrame = wdFrp.root.cancelRequestAnimationFrame
        || wdFrp.root.webkitCancelAnimationFrame
        || wdFrp.root.webkitCancelRequestAnimationFrame
        || wdFrp.root.mozCancelRequestAnimationFrame
        || wdFrp.root.oCancelRequestAnimationFrame
        || wdFrp.root.msCancelRequestAnimationFrame
        || clearTimeout;
    var Scheduler = (function () {
        function Scheduler() {
            this._requestLoopId = null;
        }
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
        Scheduler.prototype.publishRecursive = function (observer, initial, action) {
            action(initial);
        };
        Scheduler.prototype.publishInterval = function (observer, initial, interval, action) {
            return wdFrp.root.setInterval(function () {
                initial = action(initial);
            }, interval);
        };
        Scheduler.prototype.publishIntervalRequest = function (observer, action) {
            var self = this, loop = function (time) {
                var isEnd = action(time);
                if (isEnd) {
                    return;
                }
                self._requestLoopId = wdFrp.root.requestNextAnimationFrame(loop);
            };
            this._requestLoopId = wdFrp.root.requestNextAnimationFrame(loop);
        };
        return Scheduler;
    })();
    wdFrp.Scheduler = Scheduler;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var Observer = (function (_super) {
        __extends(Observer, _super);
        function Observer() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.call(this, "Observer");
            this._isDisposed = null;
            this.onUserNext = null;
            this.onUserError = null;
            this.onUserCompleted = null;
            this._isStop = false;
            this._disposable = null;
            if (args.length === 1) {
                var observer = args[0];
                this.onUserNext = function (v) {
                    observer.next(v);
                };
                this.onUserError = function (e) {
                    observer.error(e);
                };
                this.onUserCompleted = function () {
                    observer.completed();
                };
            }
            else {
                var onNext = args[0], onError = args[1], onCompleted = args[2];
                this.onUserNext = onNext || function (v) { };
                this.onUserError = onError || function (e) {
                    throw e;
                };
                this.onUserCompleted = onCompleted || function () { };
            }
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
    })(wdFrp.Entity);
    wdFrp.Observer = Observer;
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
    var Subject = (function () {
        function Subject() {
            this._source = null;
            this._observer = new wdFrp.SubjectObserver();
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
            var observer = arg1 instanceof wdFrp.Observer
                ? arg1
                : wdFrp.AutoDetachObserver.create(arg1, onError, onCompleted);
            this._observer.addChild(observer);
            return wdFrp.InnerSubscription.create(this, observer);
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
    wdFrp.Subject = Subject;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var GeneratorSubject = (function (_super) {
        __extends(GeneratorSubject, _super);
        function GeneratorSubject() {
            _super.call(this, "GeneratorSubject");
            this._isStart = false;
            this.observer = new wdFrp.SubjectObserver();
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
            var observer = arg1 instanceof wdFrp.Observer
                ? arg1
                : wdFrp.AutoDetachObserver.create(arg1, onError, onCompleted);
            this.observer.addChild(observer);
            return wdFrp.InnerSubscription.create(this, observer);
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
            stream = wdFrp.AnonymousStream.create(function (observer) {
                self.subscribe(observer);
            });
            return stream;
        };
        GeneratorSubject.prototype.start = function () {
            var self = this;
            this._isStart = true;
            this.observer.setDisposable(wdFrp.SingleDisposable.create(function () {
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
    })(wdFrp.Entity);
    wdFrp.GeneratorSubject = GeneratorSubject;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
    })(wdFrp.Observer);
    wdFrp.AnonymousObserver = AnonymousObserver;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var AutoDetachObserver = (function (_super) {
        __extends(AutoDetachObserver, _super);
        function AutoDetachObserver() {
            _super.apply(this, arguments);
        }
        AutoDetachObserver.create = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
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
                wdCb.Log.log("only can dispose once");
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
                throw e;
            }
        };
        return AutoDetachObserver;
    })(wdFrp.Observer);
    wdFrp.AutoDetachObserver = AutoDetachObserver;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
    })(wdFrp.Observer);
    wdFrp.MapObserver = MapObserver;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
    })(wdFrp.Observer);
    wdFrp.DoObserver = DoObserver;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
            wdCb.Log.error(!(innerSource instanceof wdFrp.Stream || wdFrp.JudgeUtils.isPromise(innerSource)), wdCb.Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));
            if (wdFrp.JudgeUtils.isPromise(innerSource)) {
                innerSource = wdFrp.fromPromise(innerSource);
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
    })(wdFrp.Observer);
    wdFrp.MergeAllObserver = MergeAllObserver;
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
                return wdFrp.JudgeUtils.isEqual(stream, currentStream);
            });
            /*!
            if this innerSource is async stream(as promise stream),
            it will first exec all parent.next and one parent.completed,
            then exec all this.next and all this.completed
            so in this case, it should invoke parent.currentObserver.completed after the last invokcation of this.completed(have invoked all the innerSource)
            */
            if (this._isAsync() && this._streamGroup.getCount() === 0) {
                parent.currentObserver.completed();
            }
        };
        InnerObserver.prototype._isAsync = function () {
            return this._parent.done;
        };
        return InnerObserver;
    })(wdFrp.Observer);
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
    })(wdFrp.Observer);
    wdFrp.TakeUntilObserver = TakeUntilObserver;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var ConcatObserver = (function (_super) {
        __extends(ConcatObserver, _super);
        function ConcatObserver(currentObserver, startNextStream) {
            _super.call(this, null, null, null);
            this.currentObserver = null;
            this._startNextStream = null;
            this.currentObserver = currentObserver;
            this._startNextStream = startNextStream;
        }
        ConcatObserver.create = function (currentObserver, startNextStream) {
            return new this(currentObserver, startNextStream);
        };
        ConcatObserver.prototype.onNext = function (value) {
            /*!
            if "this.currentObserver.next" error, it will pase to this.currentObserver->onError.
            so it shouldn't invoke this.currentObserver.error here again!
             */
            this.currentObserver.next(value);
        };
        ConcatObserver.prototype.onError = function (error) {
            this.currentObserver.error(error);
        };
        ConcatObserver.prototype.onCompleted = function () {
            this._startNextStream();
        };
        return ConcatObserver;
    })(wdFrp.Observer);
    wdFrp.ConcatObserver = ConcatObserver;
})(wdFrp || (wdFrp = {}));




var wdFrp;
(function (wdFrp) {
    var SubjectObserver = (function () {
        function SubjectObserver() {
            this.observers = wdCb.Collection.create();
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
                return wdFrp.JudgeUtils.isEqual(ob, observer);
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
    wdFrp.SubjectObserver = SubjectObserver;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
    })(wdFrp.Observer);
    wdFrp.IgnoreElementsObserver = IgnoreElementsObserver;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var BaseStream = (function (_super) {
        __extends(BaseStream, _super);
        function BaseStream() {
            _super.apply(this, arguments);
        }
        BaseStream.prototype.subscribe = function (arg1, onError, onCompleted) {
            var observer = null;
            if (this.handleSubject(arg1)) {
                return;
            }
            observer = arg1 instanceof wdFrp.Observer
                ? wdFrp.AutoDetachObserver.create(arg1)
                : wdFrp.AutoDetachObserver.create(arg1, onError, onCompleted);
            observer.setDisposable(this.buildStream(observer));
            return observer;
        };
        BaseStream.prototype.buildStream = function (observer) {
            _super.prototype.buildStream.call(this, observer);
            return this.subscribeCore(observer);
        };
        return BaseStream;
    })(wdFrp.Stream);
    wdFrp.BaseStream = BaseStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var DoStream = (function (_super) {
        __extends(DoStream, _super);
        function DoStream(source, onNext, onError, onCompleted) {
            _super.call(this, null);
            this._source = null;
            this._observer = null;
            this._source = source;
            this._observer = wdFrp.AnonymousObserver.create(onNext, onError, onCompleted);
            this.scheduler = this._source.scheduler;
        }
        DoStream.create = function (source, onNext, onError, onCompleted) {
            var obj = new this(source, onNext, onError, onCompleted);
            return obj;
        };
        DoStream.prototype.subscribeCore = function (observer) {
            return this._source.buildStream(wdFrp.DoObserver.create(observer, this._observer));
        };
        return DoStream;
    })(wdFrp.BaseStream);
    wdFrp.DoStream = DoStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
            return this._source.buildStream(wdFrp.MapObserver.create(observer, this._selector));
        };
        return MapStream;
    })(wdFrp.BaseStream);
    wdFrp.MapStream = MapStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
            return wdFrp.SingleDisposable.create();
        };
        return FromArrayStream;
    })(wdFrp.BaseStream);
    wdFrp.FromArrayStream = FromArrayStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
            return wdFrp.SingleDisposable.create();
        };
        return FromPromiseStream;
    })(wdFrp.BaseStream);
    wdFrp.FromPromiseStream = FromPromiseStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
            return wdFrp.SingleDisposable.create(function () {
                self._removeHandler(innerHandler);
            });
        };
        return FromEventPatternStream;
    })(wdFrp.BaseStream);
    wdFrp.FromEventPatternStream = FromEventPatternStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var AnonymousStream = (function (_super) {
        __extends(AnonymousStream, _super);
        function AnonymousStream(subscribeFunc) {
            _super.call(this, subscribeFunc);
            this.scheduler = wdFrp.Scheduler.create();
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
            observer = wdFrp.AutoDetachObserver.create(onNext, onError, onCompleted);
            observer.setDisposable(this.buildStream(observer));
            return observer;
        };
        return AnonymousStream;
    })(wdFrp.Stream);
    wdFrp.AnonymousStream = AnonymousStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
                observer.next(count);
                return count + 1;
            });
            return wdFrp.SingleDisposable.create(function () {
                wdFrp.root.clearInterval(id);
            });
        };
        return IntervalStream;
    })(wdFrp.BaseStream);
    wdFrp.IntervalStream = IntervalStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
            return wdFrp.SingleDisposable.create(function () {
                wdFrp.root.cancelNextRequestAnimationFrame(self.scheduler.requestLoopId);
                self._isEnd = true;
            });
        };
        return IntervalRequestStream;
    })(wdFrp.BaseStream);
    wdFrp.IntervalRequestStream = IntervalRequestStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var MergeAllStream = (function (_super) {
        __extends(MergeAllStream, _super);
        function MergeAllStream(source) {
            _super.call(this, null);
            this._source = null;
            this._observer = null;
            this._source = source;
            this.scheduler = this._source.scheduler;
        }
        MergeAllStream.create = function (source) {
            var obj = new this(source);
            return obj;
        };
        MergeAllStream.prototype.subscribeCore = function (observer) {
            var streamGroup = wdCb.Collection.create(), groupDisposable = wdFrp.GroupDisposable.create();
            this._source.buildStream(wdFrp.MergeAllObserver.create(observer, streamGroup, groupDisposable));
            return groupDisposable;
        };
        return MergeAllStream;
    })(wdFrp.BaseStream);
    wdFrp.MergeAllStream = MergeAllStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var TakeUntilStream = (function (_super) {
        __extends(TakeUntilStream, _super);
        function TakeUntilStream(source, otherStream) {
            _super.call(this, null);
            this._source = null;
            this._otherStream = null;
            this._source = source;
            this._otherStream = wdFrp.JudgeUtils.isPromise(otherStream) ? wdFrp.fromPromise(otherStream) : otherStream;
            this.scheduler = this._source.scheduler;
        }
        TakeUntilStream.create = function (source, otherSteam) {
            var obj = new this(source, otherSteam);
            return obj;
        };
        TakeUntilStream.prototype.subscribeCore = function (observer) {
            var group = wdFrp.GroupDisposable.create(), autoDetachObserver = wdFrp.AutoDetachObserver.create(observer), sourceDisposable = null;
            sourceDisposable = this._source.buildStream(observer);
            group.add(sourceDisposable);
            autoDetachObserver.setDisposable(sourceDisposable);
            group.add(this._otherStream.buildStream(wdFrp.TakeUntilObserver.create(autoDetachObserver)));
            return group;
        };
        return TakeUntilStream;
    })(wdFrp.BaseStream);
    wdFrp.TakeUntilStream = TakeUntilStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var ConcatStream = (function (_super) {
        __extends(ConcatStream, _super);
        function ConcatStream(sources) {
            _super.call(this, null);
            this._sources = wdCb.Collection.create();
            var self = this;
            this.scheduler = sources[0].scheduler;
            sources.forEach(function (source) {
                if (wdFrp.JudgeUtils.isPromise(source)) {
                    self._sources.addChild(wdFrp.fromPromise(source));
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
            var self = this, count = this._sources.getCount(), d = wdFrp.GroupDisposable.create();
            function loopRecursive(i) {
                if (i === count) {
                    observer.completed();
                    return;
                }
                d.add(self._sources.getChild(i).buildStream(wdFrp.ConcatObserver.create(observer, function () {
                    loopRecursive(i + 1);
                })));
            }
            this.scheduler.publishRecursive(observer, 0, loopRecursive);
            return wdFrp.GroupDisposable.create(d);
        };
        return ConcatStream;
    })(wdFrp.BaseStream);
    wdFrp.ConcatStream = ConcatStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var RepeatStream = (function (_super) {
        __extends(RepeatStream, _super);
        function RepeatStream(source, count) {
            _super.call(this, null);
            this._source = null;
            this._count = null;
            this._source = source;
            this._count = count;
            this.scheduler = this._source.scheduler;
        }
        RepeatStream.create = function (source, count) {
            var obj = new this(source, count);
            return obj;
        };
        RepeatStream.prototype.subscribeCore = function (observer) {
            var self = this, d = wdFrp.GroupDisposable.create();
            function loopRecursive(count) {
                if (count === 0) {
                    observer.completed();
                    return;
                }
                d.add(self._source.buildStream(wdFrp.ConcatObserver.create(observer, function () {
                    loopRecursive(count - 1);
                })));
            }
            this.scheduler.publishRecursive(observer, this._count, loopRecursive);
            return wdFrp.GroupDisposable.create(d);
        };
        return RepeatStream;
    })(wdFrp.BaseStream);
    wdFrp.RepeatStream = RepeatStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
            return this._source.buildStream(wdFrp.IgnoreElementsObserver.create(observer));
        };
        return IgnoreElementsStream;
    })(wdFrp.BaseStream);
    wdFrp.IgnoreElementsStream = IgnoreElementsStream;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var DeferStream = (function (_super) {
        __extends(DeferStream, _super);
        function DeferStream(buildStreamFunc) {
            _super.call(this, null);
            this._buildStreamFunc = null;
            this._buildStreamFunc = buildStreamFunc;
        }
        DeferStream.create = function (buildStreamFunc) {
            var obj = new this(buildStreamFunc);
            return obj;
        };
        DeferStream.prototype.subscribeCore = function (observer) {
            var group = wdFrp.GroupDisposable.create();
            group.add(this._buildStreamFunc().buildStream(observer));
            return group;
        };
        return DeferStream;
    })(wdFrp.BaseStream);
    wdFrp.DeferStream = DeferStream;
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
    wdFrp.createStream = function (subscribeFunc) {
        return wdFrp.AnonymousStream.create(subscribeFunc);
    };
    wdFrp.fromArray = function (array, scheduler) {
        if (scheduler === void 0) { scheduler = wdFrp.Scheduler.create(); }
        return wdFrp.FromArrayStream.create(array, scheduler);
    };
    wdFrp.fromPromise = function (promise, scheduler) {
        if (scheduler === void 0) { scheduler = wdFrp.Scheduler.create(); }
        return wdFrp.FromPromiseStream.create(promise, scheduler);
    };
    wdFrp.fromEventPattern = function (addHandler, removeHandler) {
        return wdFrp.FromEventPatternStream.create(addHandler, removeHandler);
    };
    wdFrp.interval = function (interval, scheduler) {
        if (scheduler === void 0) { scheduler = wdFrp.Scheduler.create(); }
        return wdFrp.IntervalStream.create(interval, scheduler);
    };
    wdFrp.intervalRequest = function (scheduler) {
        if (scheduler === void 0) { scheduler = wdFrp.Scheduler.create(); }
        return wdFrp.IntervalRequestStream.create(scheduler);
    };
    wdFrp.empty = function () {
        return wdFrp.createStream(function (observer) {
            observer.completed();
        });
    };
    wdFrp.callFunc = function (func, context) {
        if (context === void 0) { context = wdFrp.root; }
        return wdFrp.createStream(function (observer) {
            try {
                observer.next(func.call(context, null));
            }
            catch (e) {
                observer.error(e);
            }
            observer.completed();
        });
    };
    wdFrp.judge = function (condition, thenSource, elseSource) {
        return condition() ? thenSource() : elseSource();
    };
    wdFrp.defer = function (buildStreamFunc) {
        return wdFrp.DeferStream.create(buildStreamFunc);
    };
    wdFrp.just = function (returnValue) {
        return wdFrp.createStream(function (observer) {
            observer.next(returnValue);
            observer.completed();
        });
    };
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
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
    wdFrp.Record = Record;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
            this._messages.push(wdFrp.Record.create(this._scheduler.clock, value));
        };
        MockObserver.prototype.onError = function (error) {
            this._messages.push(wdFrp.Record.create(this._scheduler.clock, error));
        };
        MockObserver.prototype.onCompleted = function () {
            this._messages.push(wdFrp.Record.create(this._scheduler.clock, null));
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
    })(wdFrp.Observer);
    wdFrp.MockObserver = MockObserver;
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
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
            //var scheduler = <TestScheduler>(this.scheduler);
            this._scheduler.setStreamMap(observer, this._messages);
        };
        return MockPromise;
    })();
    wdFrp.MockPromise = MockPromise;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
    var SUBSCRIBE_TIME = 200;
    var DISPOSE_TIME = 1000;
    var TestScheduler = (function (_super) {
        __extends(TestScheduler, _super);
        function TestScheduler(isReset) {
            _super.call(this);
            this._clock = null;
            this._isReset = false;
            this._isDisposed = false;
            this._timerMap = wdCb.Hash.create();
            this._streamMap = wdCb.Hash.create();
            this._subscribedTime = null;
            this._disposedTime = null;
            this._observer = null;
            this._isReset = isReset;
        }
        TestScheduler.next = function (tick, value) {
            return wdFrp.Record.create(tick, value, wdFrp.ActionType.NEXT);
        };
        TestScheduler.error = function (tick, error) {
            return wdFrp.Record.create(tick, error, wdFrp.ActionType.ERROR);
        };
        TestScheduler.completed = function (tick) {
            return wdFrp.Record.create(tick, null, wdFrp.ActionType.COMPLETED);
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
                    case wdFrp.ActionType.NEXT:
                        func = function () {
                            observer.next(record.value);
                        };
                        break;
                    case wdFrp.ActionType.ERROR:
                        func = function () {
                            observer.error(record.value);
                        };
                        break;
                    case wdFrp.ActionType.COMPLETED:
                        func = function () {
                            observer.completed();
                        };
                        break;
                    default:
                        wdCb.Log.error(true, wdCb.Log.info.FUNC_UNKNOW("actionType"));
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
            return wdFrp.TestStream.create(Array.prototype.slice.call(arguments, 0), this);
        };
        TestScheduler.prototype.createObserver = function () {
            return wdFrp.MockObserver.create(this);
        };
        TestScheduler.prototype.createResolvedPromise = function (time, value) {
            return wdFrp.MockPromise.create(this, [TestScheduler.next(time, value), TestScheduler.completed(time + 1)]);
        };
        TestScheduler.prototype.createRejectPromise = function (time, error) {
            return wdFrp.MockPromise.create(this, [TestScheduler.error(time, error)]);
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
    })(wdFrp.Scheduler);
    wdFrp.TestScheduler = TestScheduler;
})(wdFrp || (wdFrp = {}));

var wdFrp;
(function (wdFrp) {
    (function (ActionType) {
        ActionType[ActionType["NEXT"] = 0] = "NEXT";
        ActionType[ActionType["ERROR"] = 1] = "ERROR";
        ActionType[ActionType["COMPLETED"] = 2] = "COMPLETED";
    })(wdFrp.ActionType || (wdFrp.ActionType = {}));
    var ActionType = wdFrp.ActionType;
})(wdFrp || (wdFrp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var wdFrp;
(function (wdFrp) {
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
            return wdFrp.SingleDisposable.create();
        };
        return TestStream;
    })(wdFrp.BaseStream);
    wdFrp.TestStream = TestStream;
})(wdFrp || (wdFrp = {}));


var wdFrp;
(function (wdFrp) {
    wdFrp.fromNodeCallback = function (func, context) {
        return function () {
            var funcArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                funcArgs[_i - 0] = arguments[_i];
            }
            return wdFrp.createStream(function (observer) {
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
    wdFrp.fromStream = function (stream, finishEventName) {
        if (finishEventName === void 0) { finishEventName = "end"; }
        stream.pause();
        return wdFrp.createStream(function (observer) {
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
            stream.resume();
            return function () {
                stream.removeListener("data", dataHandler);
                stream.removeListener("error", errorHandler);
                stream.removeListener(finishEventName, endHandler);
            };
        });
    };
    wdFrp.fromReadableStream = function (stream) {
        return wdFrp.fromStream(stream, "end");
    };
    wdFrp.fromWritableStream = function (stream) {
        return wdFrp.fromStream(stream, "finish");
    };
    wdFrp.fromTransformStream = function (stream) {
        return wdFrp.fromStream(stream, "finish");
    };
})(wdFrp || (wdFrp = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkp1ZGdlVXRpbHMudHMiLCJjb3JlL0VudGl0eS50cyIsIkRpc3Bvc2FibGUvSURpc3Bvc2FibGUudHMiLCJEaXNwb3NhYmxlL1NpbmdsZURpc3Bvc2FibGUudHMiLCJEaXNwb3NhYmxlL0dyb3VwRGlzcG9zYWJsZS50cyIsIm9ic2VydmVyL0lPYnNlcnZlci50cyIsIkRpc3Bvc2FibGUvSW5uZXJTdWJzY3JpcHRpb24udHMiLCJEaXNwb3NhYmxlL0lubmVyU3Vic2NyaXB0aW9uR3JvdXAudHMiLCJnbG9iYWwvVmFyaWFibGUudHMiLCJnbG9iYWwvQ29uc3QudHMiLCJnbG9iYWwvaW5pdC50cyIsImNvcmUvU3RyZWFtLnRzIiwiY29yZS9TY2hlZHVsZXIudHMiLCJjb3JlL09ic2VydmVyLnRzIiwic3ViamVjdC9TdWJqZWN0LnRzIiwic3ViamVjdC9HZW5lcmF0b3JTdWJqZWN0LnRzIiwib2JzZXJ2ZXIvQW5vbnltb3VzT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9BdXRvRGV0YWNoT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9NYXBPYnNlcnZlci50cyIsIm9ic2VydmVyL0RvT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9NZXJnZUFsbE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvVGFrZVVudGlsT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9Db25jYXRPYnNlcnZlci50cyIsIm9ic2VydmVyL0lTdWJqZWN0T2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9TdWJqZWN0T2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9JZ25vcmVFbGVtZW50c09ic2VydmVyLnRzIiwic3RyZWFtL0Jhc2VTdHJlYW0udHMiLCJzdHJlYW0vRG9TdHJlYW0udHMiLCJzdHJlYW0vTWFwU3RyZWFtLnRzIiwic3RyZWFtL0Zyb21BcnJheVN0cmVhbS50cyIsInN0cmVhbS9Gcm9tUHJvbWlzZVN0cmVhbS50cyIsInN0cmVhbS9Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLnRzIiwic3RyZWFtL0Fub255bW91c1N0cmVhbS50cyIsInN0cmVhbS9JbnRlcnZhbFN0cmVhbS50cyIsInN0cmVhbS9JbnRlcnZhbFJlcXVlc3RTdHJlYW0udHMiLCJzdHJlYW0vTWVyZ2VBbGxTdHJlYW0udHMiLCJzdHJlYW0vVGFrZVVudGlsU3RyZWFtLnRzIiwic3RyZWFtL0NvbmNhdFN0cmVhbS50cyIsInN0cmVhbS9SZXBlYXRTdHJlYW0udHMiLCJzdHJlYW0vSWdub3JlRWxlbWVudHNTdHJlYW0udHMiLCJzdHJlYW0vRGVmZXJTdHJlYW0udHMiLCJnbG9iYWwvT3BlcmF0b3IudHMiLCJ0ZXN0aW5nL1JlY29yZC50cyIsInRlc3RpbmcvTW9ja09ic2VydmVyLnRzIiwidGVzdGluZy9Nb2NrUHJvbWlzZS50cyIsInRlc3RpbmcvVGVzdFNjaGVkdWxlci50cyIsInRlc3RpbmcvQWN0aW9uVHlwZS50cyIsInRlc3RpbmcvVGVzdFN0cmVhbS50cyIsImJpbmRpbmcvbm9kZWpzL05vZGVPcGVyYXRvci50cyJdLCJuYW1lcyI6WyJ3ZEZycCIsIndkRnJwLkp1ZGdlVXRpbHMiLCJ3ZEZycC5KdWRnZVV0aWxzLmNvbnN0cnVjdG9yIiwid2RGcnAuSnVkZ2VVdGlscy5pc1Byb21pc2UiLCJ3ZEZycC5KdWRnZVV0aWxzLmlzRXF1YWwiLCJ3ZEZycC5FbnRpdHkiLCJ3ZEZycC5FbnRpdHkuY29uc3RydWN0b3IiLCJ3ZEZycC5FbnRpdHkudWlkIiwid2RGcnAuU2luZ2xlRGlzcG9zYWJsZSIsIndkRnJwLlNpbmdsZURpc3Bvc2FibGUuY29uc3RydWN0b3IiLCJ3ZEZycC5TaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSIsIndkRnJwLlNpbmdsZURpc3Bvc2FibGUuc2V0RGlzcG9zZUhhbmRsZXIiLCJ3ZEZycC5TaW5nbGVEaXNwb3NhYmxlLmRpc3Bvc2UiLCJ3ZEZycC5Hcm91cERpc3Bvc2FibGUiLCJ3ZEZycC5Hcm91cERpc3Bvc2FibGUuY29uc3RydWN0b3IiLCJ3ZEZycC5Hcm91cERpc3Bvc2FibGUuY3JlYXRlIiwid2RGcnAuR3JvdXBEaXNwb3NhYmxlLmFkZCIsIndkRnJwLkdyb3VwRGlzcG9zYWJsZS5kaXNwb3NlIiwid2RGcnAuSW5uZXJTdWJzY3JpcHRpb24iLCJ3ZEZycC5Jbm5lclN1YnNjcmlwdGlvbi5jb25zdHJ1Y3RvciIsIndkRnJwLklubmVyU3Vic2NyaXB0aW9uLmNyZWF0ZSIsIndkRnJwLklubmVyU3Vic2NyaXB0aW9uLmRpc3Bvc2UiLCJ3ZEZycC5Jbm5lclN1YnNjcmlwdGlvbkdyb3VwIiwid2RGcnAuSW5uZXJTdWJzY3JpcHRpb25Hcm91cC5jb25zdHJ1Y3RvciIsIndkRnJwLklubmVyU3Vic2NyaXB0aW9uR3JvdXAuY3JlYXRlIiwid2RGcnAuSW5uZXJTdWJzY3JpcHRpb25Hcm91cC5hZGRDaGlsZCIsIndkRnJwLklubmVyU3Vic2NyaXB0aW9uR3JvdXAuZGlzcG9zZSIsIndkRnJwLlN0cmVhbSIsIndkRnJwLlN0cmVhbS5jb25zdHJ1Y3RvciIsIndkRnJwLlN0cmVhbS5idWlsZFN0cmVhbSIsIndkRnJwLlN0cmVhbS5kbyIsIndkRnJwLlN0cmVhbS5tYXAiLCJ3ZEZycC5TdHJlYW0uZmxhdE1hcCIsIndkRnJwLlN0cmVhbS5tZXJnZUFsbCIsIndkRnJwLlN0cmVhbS50YWtlVW50aWwiLCJ3ZEZycC5TdHJlYW0uY29uY2F0Iiwid2RGcnAuU3RyZWFtLm1lcmdlIiwid2RGcnAuU3RyZWFtLnJlcGVhdCIsIndkRnJwLlN0cmVhbS5pZ25vcmVFbGVtZW50cyIsIndkRnJwLlN0cmVhbS5oYW5kbGVTdWJqZWN0Iiwid2RGcnAuU3RyZWFtLl9pc1N1YmplY3QiLCJ3ZEZycC5TdHJlYW0uX3NldFN1YmplY3QiLCJ3ZEZycC5TY2hlZHVsZXIiLCJ3ZEZycC5TY2hlZHVsZXIuY29uc3RydWN0b3IiLCJ3ZEZycC5TY2hlZHVsZXIuY3JlYXRlIiwid2RGcnAuU2NoZWR1bGVyLnJlcXVlc3RMb29wSWQiLCJ3ZEZycC5TY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZSIsIndkRnJwLlNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWwiLCJ3ZEZycC5TY2hlZHVsZXIucHVibGlzaEludGVydmFsUmVxdWVzdCIsIndkRnJwLk9ic2VydmVyIiwid2RGcnAuT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJ3ZEZycC5PYnNlcnZlci5pc0Rpc3Bvc2VkIiwid2RGcnAuT2JzZXJ2ZXIubmV4dCIsIndkRnJwLk9ic2VydmVyLmVycm9yIiwid2RGcnAuT2JzZXJ2ZXIuY29tcGxldGVkIiwid2RGcnAuT2JzZXJ2ZXIuZGlzcG9zZSIsIndkRnJwLk9ic2VydmVyLnNldERpc3Bvc2FibGUiLCJ3ZEZycC5TdWJqZWN0Iiwid2RGcnAuU3ViamVjdC5jb25zdHJ1Y3RvciIsIndkRnJwLlN1YmplY3QuY3JlYXRlIiwid2RGcnAuU3ViamVjdC5zb3VyY2UiLCJ3ZEZycC5TdWJqZWN0LnN1YnNjcmliZSIsIndkRnJwLlN1YmplY3QubmV4dCIsIndkRnJwLlN1YmplY3QuZXJyb3IiLCJ3ZEZycC5TdWJqZWN0LmNvbXBsZXRlZCIsIndkRnJwLlN1YmplY3Quc3RhcnQiLCJ3ZEZycC5TdWJqZWN0LnJlbW92ZSIsIndkRnJwLlN1YmplY3QuZGlzcG9zZSIsIndkRnJwLkdlbmVyYXRvclN1YmplY3QiLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0LmNvbnN0cnVjdG9yIiwid2RGcnAuR2VuZXJhdG9yU3ViamVjdC5jcmVhdGUiLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0LmlzU3RhcnQiLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0Lm9uQmVmb3JlTmV4dCIsIndkRnJwLkdlbmVyYXRvclN1YmplY3Qub25BZnRlck5leHQiLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0Lm9uSXNDb21wbGV0ZWQiLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0Lm9uQmVmb3JlRXJyb3IiLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0Lm9uQWZ0ZXJFcnJvciIsIndkRnJwLkdlbmVyYXRvclN1YmplY3Qub25CZWZvcmVDb21wbGV0ZWQiLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0Lm9uQWZ0ZXJDb21wbGV0ZWQiLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0LnN1YnNjcmliZSIsIndkRnJwLkdlbmVyYXRvclN1YmplY3QubmV4dCIsIndkRnJwLkdlbmVyYXRvclN1YmplY3QuZXJyb3IiLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0LmNvbXBsZXRlZCIsIndkRnJwLkdlbmVyYXRvclN1YmplY3QudG9TdHJlYW0iLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0LnN0YXJ0Iiwid2RGcnAuR2VuZXJhdG9yU3ViamVjdC5zdG9wIiwid2RGcnAuR2VuZXJhdG9yU3ViamVjdC5yZW1vdmUiLCJ3ZEZycC5HZW5lcmF0b3JTdWJqZWN0LmRpc3Bvc2UiLCJ3ZEZycC5Bbm9ueW1vdXNPYnNlcnZlciIsIndkRnJwLkFub255bW91c09ic2VydmVyLmNvbnN0cnVjdG9yIiwid2RGcnAuQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlIiwid2RGcnAuQW5vbnltb3VzT2JzZXJ2ZXIub25OZXh0Iiwid2RGcnAuQW5vbnltb3VzT2JzZXJ2ZXIub25FcnJvciIsIndkRnJwLkFub255bW91c09ic2VydmVyLm9uQ29tcGxldGVkIiwid2RGcnAuQXV0b0RldGFjaE9ic2VydmVyIiwid2RGcnAuQXV0b0RldGFjaE9ic2VydmVyLmNvbnN0cnVjdG9yIiwid2RGcnAuQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSIsIndkRnJwLkF1dG9EZXRhY2hPYnNlcnZlci5kaXNwb3NlIiwid2RGcnAuQXV0b0RldGFjaE9ic2VydmVyLm9uTmV4dCIsIndkRnJwLkF1dG9EZXRhY2hPYnNlcnZlci5vbkVycm9yIiwid2RGcnAuQXV0b0RldGFjaE9ic2VydmVyLm9uQ29tcGxldGVkIiwid2RGcnAuTWFwT2JzZXJ2ZXIiLCJ3ZEZycC5NYXBPYnNlcnZlci5jb25zdHJ1Y3RvciIsIndkRnJwLk1hcE9ic2VydmVyLmNyZWF0ZSIsIndkRnJwLk1hcE9ic2VydmVyLm9uTmV4dCIsIndkRnJwLk1hcE9ic2VydmVyLm9uRXJyb3IiLCJ3ZEZycC5NYXBPYnNlcnZlci5vbkNvbXBsZXRlZCIsIndkRnJwLkRvT2JzZXJ2ZXIiLCJ3ZEZycC5Eb09ic2VydmVyLmNvbnN0cnVjdG9yIiwid2RGcnAuRG9PYnNlcnZlci5jcmVhdGUiLCJ3ZEZycC5Eb09ic2VydmVyLm9uTmV4dCIsIndkRnJwLkRvT2JzZXJ2ZXIub25FcnJvciIsIndkRnJwLkRvT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJ3ZEZycC5NZXJnZUFsbE9ic2VydmVyIiwid2RGcnAuTWVyZ2VBbGxPYnNlcnZlci5jb25zdHJ1Y3RvciIsIndkRnJwLk1lcmdlQWxsT2JzZXJ2ZXIuY3JlYXRlIiwid2RGcnAuTWVyZ2VBbGxPYnNlcnZlci5jdXJyZW50T2JzZXJ2ZXIiLCJ3ZEZycC5NZXJnZUFsbE9ic2VydmVyLmRvbmUiLCJ3ZEZycC5NZXJnZUFsbE9ic2VydmVyLm9uTmV4dCIsIndkRnJwLk1lcmdlQWxsT2JzZXJ2ZXIub25FcnJvciIsIndkRnJwLk1lcmdlQWxsT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJ3ZEZycC5Jbm5lck9ic2VydmVyIiwid2RGcnAuSW5uZXJPYnNlcnZlci5jb25zdHJ1Y3RvciIsIndkRnJwLklubmVyT2JzZXJ2ZXIuY3JlYXRlIiwid2RGcnAuSW5uZXJPYnNlcnZlci5vbk5leHQiLCJ3ZEZycC5Jbm5lck9ic2VydmVyLm9uRXJyb3IiLCJ3ZEZycC5Jbm5lck9ic2VydmVyLm9uQ29tcGxldGVkIiwid2RGcnAuSW5uZXJPYnNlcnZlci5faXNBc3luYyIsIndkRnJwLlRha2VVbnRpbE9ic2VydmVyIiwid2RGcnAuVGFrZVVudGlsT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJ3ZEZycC5UYWtlVW50aWxPYnNlcnZlci5jcmVhdGUiLCJ3ZEZycC5UYWtlVW50aWxPYnNlcnZlci5vbk5leHQiLCJ3ZEZycC5UYWtlVW50aWxPYnNlcnZlci5vbkVycm9yIiwid2RGcnAuVGFrZVVudGlsT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJ3ZEZycC5Db25jYXRPYnNlcnZlciIsIndkRnJwLkNvbmNhdE9ic2VydmVyLmNvbnN0cnVjdG9yIiwid2RGcnAuQ29uY2F0T2JzZXJ2ZXIuY3JlYXRlIiwid2RGcnAuQ29uY2F0T2JzZXJ2ZXIub25OZXh0Iiwid2RGcnAuQ29uY2F0T2JzZXJ2ZXIub25FcnJvciIsIndkRnJwLkNvbmNhdE9ic2VydmVyLm9uQ29tcGxldGVkIiwid2RGcnAuU3ViamVjdE9ic2VydmVyIiwid2RGcnAuU3ViamVjdE9ic2VydmVyLmNvbnN0cnVjdG9yIiwid2RGcnAuU3ViamVjdE9ic2VydmVyLmlzRW1wdHkiLCJ3ZEZycC5TdWJqZWN0T2JzZXJ2ZXIubmV4dCIsIndkRnJwLlN1YmplY3RPYnNlcnZlci5lcnJvciIsIndkRnJwLlN1YmplY3RPYnNlcnZlci5jb21wbGV0ZWQiLCJ3ZEZycC5TdWJqZWN0T2JzZXJ2ZXIuYWRkQ2hpbGQiLCJ3ZEZycC5TdWJqZWN0T2JzZXJ2ZXIucmVtb3ZlQ2hpbGQiLCJ3ZEZycC5TdWJqZWN0T2JzZXJ2ZXIuZGlzcG9zZSIsIndkRnJwLlN1YmplY3RPYnNlcnZlci5zZXREaXNwb3NhYmxlIiwid2RGcnAuSWdub3JlRWxlbWVudHNPYnNlcnZlciIsIndkRnJwLklnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJ3ZEZycC5JZ25vcmVFbGVtZW50c09ic2VydmVyLmNyZWF0ZSIsIndkRnJwLklnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIub25OZXh0Iiwid2RGcnAuSWdub3JlRWxlbWVudHNPYnNlcnZlci5vbkVycm9yIiwid2RGcnAuSWdub3JlRWxlbWVudHNPYnNlcnZlci5vbkNvbXBsZXRlZCIsIndkRnJwLkJhc2VTdHJlYW0iLCJ3ZEZycC5CYXNlU3RyZWFtLmNvbnN0cnVjdG9yIiwid2RGcnAuQmFzZVN0cmVhbS5zdWJzY3JpYmUiLCJ3ZEZycC5CYXNlU3RyZWFtLmJ1aWxkU3RyZWFtIiwid2RGcnAuRG9TdHJlYW0iLCJ3ZEZycC5Eb1N0cmVhbS5jb25zdHJ1Y3RvciIsIndkRnJwLkRvU3RyZWFtLmNyZWF0ZSIsIndkRnJwLkRvU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJ3ZEZycC5NYXBTdHJlYW0iLCJ3ZEZycC5NYXBTdHJlYW0uY29uc3RydWN0b3IiLCJ3ZEZycC5NYXBTdHJlYW0uY3JlYXRlIiwid2RGcnAuTWFwU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJ3ZEZycC5Gcm9tQXJyYXlTdHJlYW0iLCJ3ZEZycC5Gcm9tQXJyYXlTdHJlYW0uY29uc3RydWN0b3IiLCJ3ZEZycC5Gcm9tQXJyYXlTdHJlYW0uY3JlYXRlIiwid2RGcnAuRnJvbUFycmF5U3RyZWFtLnN1YnNjcmliZUNvcmUiLCJ3ZEZycC5Gcm9tQXJyYXlTdHJlYW0uc3Vic2NyaWJlQ29yZS5sb29wUmVjdXJzaXZlIiwid2RGcnAuRnJvbVByb21pc2VTdHJlYW0iLCJ3ZEZycC5Gcm9tUHJvbWlzZVN0cmVhbS5jb25zdHJ1Y3RvciIsIndkRnJwLkZyb21Qcm9taXNlU3RyZWFtLmNyZWF0ZSIsIndkRnJwLkZyb21Qcm9taXNlU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJ3ZEZycC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtIiwid2RGcnAuRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5jb25zdHJ1Y3RvciIsIndkRnJwLkZyb21FdmVudFBhdHRlcm5TdHJlYW0uY3JlYXRlIiwid2RGcnAuRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5zdWJzY3JpYmVDb3JlIiwid2RGcnAuRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5zdWJzY3JpYmVDb3JlLmlubmVySGFuZGxlciIsIndkRnJwLkFub255bW91c1N0cmVhbSIsIndkRnJwLkFub255bW91c1N0cmVhbS5jb25zdHJ1Y3RvciIsIndkRnJwLkFub255bW91c1N0cmVhbS5jcmVhdGUiLCJ3ZEZycC5Bbm9ueW1vdXNTdHJlYW0uc3Vic2NyaWJlIiwid2RGcnAuSW50ZXJ2YWxTdHJlYW0iLCJ3ZEZycC5JbnRlcnZhbFN0cmVhbS5jb25zdHJ1Y3RvciIsIndkRnJwLkludGVydmFsU3RyZWFtLmNyZWF0ZSIsIndkRnJwLkludGVydmFsU3RyZWFtLmluaXRXaGVuQ3JlYXRlIiwid2RGcnAuSW50ZXJ2YWxTdHJlYW0uc3Vic2NyaWJlQ29yZSIsIndkRnJwLkludGVydmFsUmVxdWVzdFN0cmVhbSIsIndkRnJwLkludGVydmFsUmVxdWVzdFN0cmVhbS5jb25zdHJ1Y3RvciIsIndkRnJwLkludGVydmFsUmVxdWVzdFN0cmVhbS5jcmVhdGUiLCJ3ZEZycC5JbnRlcnZhbFJlcXVlc3RTdHJlYW0uc3Vic2NyaWJlQ29yZSIsIndkRnJwLk1lcmdlQWxsU3RyZWFtIiwid2RGcnAuTWVyZ2VBbGxTdHJlYW0uY29uc3RydWN0b3IiLCJ3ZEZycC5NZXJnZUFsbFN0cmVhbS5jcmVhdGUiLCJ3ZEZycC5NZXJnZUFsbFN0cmVhbS5zdWJzY3JpYmVDb3JlIiwid2RGcnAuVGFrZVVudGlsU3RyZWFtIiwid2RGcnAuVGFrZVVudGlsU3RyZWFtLmNvbnN0cnVjdG9yIiwid2RGcnAuVGFrZVVudGlsU3RyZWFtLmNyZWF0ZSIsIndkRnJwLlRha2VVbnRpbFN0cmVhbS5zdWJzY3JpYmVDb3JlIiwid2RGcnAuQ29uY2F0U3RyZWFtIiwid2RGcnAuQ29uY2F0U3RyZWFtLmNvbnN0cnVjdG9yIiwid2RGcnAuQ29uY2F0U3RyZWFtLmNyZWF0ZSIsIndkRnJwLkNvbmNhdFN0cmVhbS5zdWJzY3JpYmVDb3JlIiwid2RGcnAuQ29uY2F0U3RyZWFtLnN1YnNjcmliZUNvcmUubG9vcFJlY3Vyc2l2ZSIsIndkRnJwLlJlcGVhdFN0cmVhbSIsIndkRnJwLlJlcGVhdFN0cmVhbS5jb25zdHJ1Y3RvciIsIndkRnJwLlJlcGVhdFN0cmVhbS5jcmVhdGUiLCJ3ZEZycC5SZXBlYXRTdHJlYW0uc3Vic2NyaWJlQ29yZSIsIndkRnJwLlJlcGVhdFN0cmVhbS5zdWJzY3JpYmVDb3JlLmxvb3BSZWN1cnNpdmUiLCJ3ZEZycC5JZ25vcmVFbGVtZW50c1N0cmVhbSIsIndkRnJwLklnbm9yZUVsZW1lbnRzU3RyZWFtLmNvbnN0cnVjdG9yIiwid2RGcnAuSWdub3JlRWxlbWVudHNTdHJlYW0uY3JlYXRlIiwid2RGcnAuSWdub3JlRWxlbWVudHNTdHJlYW0uc3Vic2NyaWJlQ29yZSIsIndkRnJwLkRlZmVyU3RyZWFtIiwid2RGcnAuRGVmZXJTdHJlYW0uY29uc3RydWN0b3IiLCJ3ZEZycC5EZWZlclN0cmVhbS5jcmVhdGUiLCJ3ZEZycC5EZWZlclN0cmVhbS5zdWJzY3JpYmVDb3JlIiwid2RGcnAuUmVjb3JkIiwid2RGcnAuUmVjb3JkLmNvbnN0cnVjdG9yIiwid2RGcnAuUmVjb3JkLmNyZWF0ZSIsIndkRnJwLlJlY29yZC50aW1lIiwid2RGcnAuUmVjb3JkLnZhbHVlIiwid2RGcnAuUmVjb3JkLmFjdGlvblR5cGUiLCJ3ZEZycC5SZWNvcmQuZXF1YWxzIiwid2RGcnAuTW9ja09ic2VydmVyIiwid2RGcnAuTW9ja09ic2VydmVyLmNvbnN0cnVjdG9yIiwid2RGcnAuTW9ja09ic2VydmVyLmNyZWF0ZSIsIndkRnJwLk1vY2tPYnNlcnZlci5tZXNzYWdlcyIsIndkRnJwLk1vY2tPYnNlcnZlci5vbk5leHQiLCJ3ZEZycC5Nb2NrT2JzZXJ2ZXIub25FcnJvciIsIndkRnJwLk1vY2tPYnNlcnZlci5vbkNvbXBsZXRlZCIsIndkRnJwLk1vY2tPYnNlcnZlci5kaXNwb3NlIiwid2RGcnAuTW9ja09ic2VydmVyLmNvcHkiLCJ3ZEZycC5Nb2NrUHJvbWlzZSIsIndkRnJwLk1vY2tQcm9taXNlLmNvbnN0cnVjdG9yIiwid2RGcnAuTW9ja1Byb21pc2UuY3JlYXRlIiwid2RGcnAuTW9ja1Byb21pc2UudGhlbiIsIndkRnJwLlRlc3RTY2hlZHVsZXIiLCJ3ZEZycC5UZXN0U2NoZWR1bGVyLmNvbnN0cnVjdG9yIiwid2RGcnAuVGVzdFNjaGVkdWxlci5uZXh0Iiwid2RGcnAuVGVzdFNjaGVkdWxlci5lcnJvciIsIndkRnJwLlRlc3RTY2hlZHVsZXIuY29tcGxldGVkIiwid2RGcnAuVGVzdFNjaGVkdWxlci5jcmVhdGUiLCJ3ZEZycC5UZXN0U2NoZWR1bGVyLmNsb2NrIiwid2RGcnAuVGVzdFNjaGVkdWxlci5zZXRTdHJlYW1NYXAiLCJ3ZEZycC5UZXN0U2NoZWR1bGVyLnJlbW92ZSIsIndkRnJwLlRlc3RTY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZSIsIndkRnJwLlRlc3RTY2hlZHVsZXIucHVibGlzaEludGVydmFsIiwid2RGcnAuVGVzdFNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0Iiwid2RGcnAuVGVzdFNjaGVkdWxlci5fc2V0Q2xvY2siLCJ3ZEZycC5UZXN0U2NoZWR1bGVyLnN0YXJ0V2l0aFRpbWUiLCJ3ZEZycC5UZXN0U2NoZWR1bGVyLnN0YXJ0V2l0aFN1YnNjcmliZSIsIndkRnJwLlRlc3RTY2hlZHVsZXIuc3RhcnRXaXRoRGlzcG9zZSIsIndkRnJwLlRlc3RTY2hlZHVsZXIucHVibGljQWJzb2x1dGUiLCJ3ZEZycC5UZXN0U2NoZWR1bGVyLnN0YXJ0Iiwid2RGcnAuVGVzdFNjaGVkdWxlci5jcmVhdGVTdHJlYW0iLCJ3ZEZycC5UZXN0U2NoZWR1bGVyLmNyZWF0ZU9ic2VydmVyIiwid2RGcnAuVGVzdFNjaGVkdWxlci5jcmVhdGVSZXNvbHZlZFByb21pc2UiLCJ3ZEZycC5UZXN0U2NoZWR1bGVyLmNyZWF0ZVJlamVjdFByb21pc2UiLCJ3ZEZycC5UZXN0U2NoZWR1bGVyLl9nZXRNaW5BbmRNYXhUaW1lIiwid2RGcnAuVGVzdFNjaGVkdWxlci5fZXhlYyIsIndkRnJwLlRlc3RTY2hlZHVsZXIuX3J1blN0cmVhbSIsIndkRnJwLlRlc3RTY2hlZHVsZXIuX3J1bkF0Iiwid2RGcnAuVGVzdFNjaGVkdWxlci5fdGljayIsIndkRnJwLkFjdGlvblR5cGUiLCJ3ZEZycC5UZXN0U3RyZWFtIiwid2RGcnAuVGVzdFN0cmVhbS5jb25zdHJ1Y3RvciIsIndkRnJwLlRlc3RTdHJlYW0uY3JlYXRlIiwid2RGcnAuVGVzdFN0cmVhbS5zdWJzY3JpYmVDb3JlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVDQUF1QztBQUN2QyxJQUFPLEtBQUssQ0FZWDtBQVpELFdBQU8sS0FBSyxFQUFDLENBQUM7SUFDVkE7UUFBZ0NDLDhCQUFlQTtRQUEvQ0E7WUFBZ0NDLDhCQUFlQTtRQVUvQ0EsQ0FBQ0E7UUFUaUJELG9CQUFT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Y0EsQ0FBQ0EsTUFBTUEsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNDQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxPQUFPQSxFQUFFQSxZQUFZQSxDQUFDQSxDQUFDQTtnQkFDN0NBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLGVBQWVBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO1lBQ3ZEQSxDQUFDQSxDQUFDQTtRQUNOQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNQQSxDQUFDQSxDQUFDQTtJQUVTQSx3QkFBa0JBLEdBQUdBLFVBQUNBLE1BQVVBO1FBQ3ZDQSxNQUFNQSxDQUFDQSxnQkFBVUEsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDckNBLENBQUNBLENBQUNBO0lBRVNBLHdCQUFrQkEsR0FBR0EsVUFBQ0EsTUFBVUE7UUFDdkNBLE1BQU1BLENBQUNBLGdCQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUN4Q0EsQ0FBQ0EsQ0FBQ0E7SUFFU0EseUJBQW1CQSxHQUFHQSxVQUFDQSxNQUFVQTtRQUN4Q0EsTUFBTUEsQ0FBQ0EsZ0JBQVVBLENBQUNBLE1BQU1BLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO0lBQ3hDQSxDQUFDQSxDQUFDQTtBQUNOQSxDQUFDQSxFQWpFTSxLQUFLLEtBQUwsS0FBSyxRQWlFWCIsImZpbGUiOiJ3ZEZycC5kZWJ1Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2ZpbGVQYXRoLmQudHNcIi8+XG5tb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBKdWRnZVV0aWxzIGV4dGVuZHMgd2RDYi5KdWRnZVV0aWxzIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBpc1Byb21pc2Uob2JqKXtcbiAgICAgICAgICAgIHJldHVybiAhIW9ialxuICAgICAgICAgICAgICAgICYmICFzdXBlci5pc0Z1bmN0aW9uKG9iai5zdWJzY3JpYmUpXG4gICAgICAgICAgICAgICAgJiYgc3VwZXIuaXNGdW5jdGlvbihvYmoudGhlbik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGlzRXF1YWwob2IxOkVudGl0eSwgb2IyOkVudGl0eSl7XG4gICAgICAgICAgICByZXR1cm4gb2IxLnVpZCA9PT0gb2IyLnVpZDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbnRpdHl7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVUlEOm51bWJlciA9IDE7XG5cbiAgICAgICAgcHJpdmF0ZSBfdWlkOnN0cmluZyA9IG51bGw7XG4gICAgICAgIGdldCB1aWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl91aWQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHVpZCh1aWQ6c3RyaW5nKXtcbiAgICAgICAgICAgIHRoaXMuX3VpZCA9IHVpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHVpZFByZTpzdHJpbmcpe1xuICAgICAgICAgICAgdGhpcy5fdWlkID0gdWlkUHJlICsgU3RyaW5nKEVudGl0eS5VSUQrKyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJRGlzcG9zYWJsZXtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZpbGVQYXRoLmQudHNcIi8+XG5tb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFNpbmdsZURpc3Bvc2FibGUgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoZGlzcG9zZUhhbmRsZXI6RnVuY3Rpb24gPSBmdW5jdGlvbigpe30pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMoZGlzcG9zZUhhbmRsZXIpO1xuXG4gICAgICAgIFx0cmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihkaXNwb3NlSGFuZGxlcjpGdW5jdGlvbil7XG4gICAgICAgIFx0dGhpcy5fZGlzcG9zZUhhbmRsZXIgPSBkaXNwb3NlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NlSGFuZGxlcihoYW5kbGVyOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyID0gaGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZpbGVQYXRoLmQudHNcIi8+XG5tb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEdyb3VwRGlzcG9zYWJsZSBpbXBsZW1lbnRzIElEaXNwb3NhYmxle1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShkaXNwb3NhYmxlPzpJRGlzcG9zYWJsZSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGRpc3Bvc2FibGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZ3JvdXA6d2RDYi5Db2xsZWN0aW9uPElEaXNwb3NhYmxlPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8SURpc3Bvc2FibGU+KCk7XG5cbiAgICAgICAgY29uc3RydWN0b3IoZGlzcG9zYWJsZT86SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgaWYoZGlzcG9zYWJsZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fZ3JvdXAuYWRkQ2hpbGQoZGlzcG9zYWJsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYWRkKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXAuYWRkQ2hpbGQoZGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMuX2dyb3VwLmZvckVhY2goKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpID0+IHtcbiAgICAgICAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgSU9ic2VydmVyIGV4dGVuZHMgSURpc3Bvc2FibGV7XG4gICAgICAgIG5leHQodmFsdWU6YW55KTtcbiAgICAgICAgZXJyb3IoZXJyb3I6YW55KTtcbiAgICAgICAgY29tcGxldGVkKCk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZpbGVQYXRoLmQudHNcIi8+XG5tb2R1bGUgd2RGcnB7XG5cdGV4cG9ydCBjbGFzcyBJbm5lclN1YnNjcmlwdGlvbiBpbXBsZW1lbnRzIElEaXNwb3NhYmxle1xuXHRcdHB1YmxpYyBzdGF0aWMgY3JlYXRlKHN1YmplY3Q6U3ViamVjdHxHZW5lcmF0b3JTdWJqZWN0LCBvYnNlcnZlcjpPYnNlcnZlcikge1xuXHRcdFx0dmFyIG9iaiA9IG5ldyB0aGlzKHN1YmplY3QsIG9ic2VydmVyKTtcblxuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9XG5cblx0XHRwcml2YXRlIF9zdWJqZWN0OlN1YmplY3R8R2VuZXJhdG9yU3ViamVjdCA9IG51bGw7XG5cdFx0cHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG5cdFx0Y29uc3RydWN0b3Ioc3ViamVjdDpTdWJqZWN0fEdlbmVyYXRvclN1YmplY3QsIG9ic2VydmVyOk9ic2VydmVyKXtcblx0XHRcdHRoaXMuX3N1YmplY3QgPSBzdWJqZWN0O1xuXHRcdFx0dGhpcy5fb2JzZXJ2ZXIgPSBvYnNlcnZlcjtcblx0XHR9XG5cblx0XHRwdWJsaWMgZGlzcG9zZSgpe1xuXHRcdFx0dGhpcy5fc3ViamVjdC5yZW1vdmUodGhpcy5fb2JzZXJ2ZXIpO1xuXG5cdFx0XHR0aGlzLl9vYnNlcnZlci5kaXNwb3NlKCk7XG5cdFx0fVxuXHR9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uR3JvdXAgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX2NvbnRhaW5lcjp3ZENiLkNvbGxlY3Rpb248SURpc3Bvc2FibGU+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJRGlzcG9zYWJsZT4oKTtcblxuXHRcdHB1YmxpYyBhZGRDaGlsZChjaGlsZDpJRGlzcG9zYWJsZSl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuYWRkQ2hpbGQoY2hpbGQpO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuZm9yRWFjaCgoY2hpbGQ6SURpc3Bvc2FibGUpID0+IHtcblx0XHRcdFx0Y2hpbGQuZGlzcG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBkZWNsYXJlIHZhciBnbG9iYWw6YW55LHdpbmRvdzphbnk7XG5cbiAgICBleHBvcnQgdmFyIHJvb3Q6YW55O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3ZEZycCwgXCJyb290XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNOb2RlSnMoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdsb2JhbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdztcbiAgICAgICAgfVxuICAgIH0pO1xufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjb25zdCBBQlNUUkFDVF9BVFRSSUJVVEU6YW55ID0gbnVsbDtcbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZpbGVQYXRoLmQudHNcIi8+XG5cbm1vZHVsZSB3ZEZycHtcbiAgICAvL3JzdnAuanNcbiAgICAvL2RlY2xhcmUgdmFyIFJTVlA6YW55O1xuXG4gICAgLy9ub3Qgc3dhbGxvdyB0aGUgZXJyb3JcbiAgICBpZihyb290LlJTVlApe1xuICAgICAgICByb290LlJTVlAub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH07XG4gICAgICAgIHJvb3QuUlNWUC5vbignZXJyb3InLCByb290LlJTVlAub25lcnJvcik7XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RyZWFtIGV4dGVuZHMgRW50aXR5e1xuICAgICAgICBwdWJsaWMgc2NoZWR1bGVyOlNjaGVkdWxlciA9IEFCU1RSQUNUX0FUVFJJQlVURTtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZUZ1bmM6KG9ic2VydmVyOklPYnNlcnZlcikgPT4gRnVuY3Rpb258dm9pZCA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc3Vic2NyaWJlRnVuYyl7XG4gICAgICAgICAgICBzdXBlcihcIlN0cmVhbVwiKTtcblxuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVGdW5jID0gc3Vic2NyaWJlRnVuYyB8fCBmdW5jdGlvbigpeyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFic3RyYWN0IHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKDxGdW5jdGlvbj4odGhpcy5zdWJzY3JpYmVGdW5jKG9ic2VydmVyKSB8fCBmdW5jdGlvbigpe30pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkbyhvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gRG9TdHJlYW0uY3JlYXRlKHRoaXMsIG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1hcChzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIE1hcFN0cmVhbS5jcmVhdGUodGhpcywgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGZsYXRNYXAoc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFwKHNlbGVjdG9yKS5tZXJnZUFsbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlQWxsKCl7XG4gICAgICAgICAgICByZXR1cm4gTWVyZ2VBbGxTdHJlYW0uY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRha2VVbnRpbChvdGhlclN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgcmV0dXJuIFRha2VVbnRpbFN0cmVhbS5jcmVhdGUodGhpcywgb3RoZXJTdHJlYW0pO1xuICAgICAgICB9XG5cblxuICAgICAgICBwdWJsaWMgY29uY2F0KHN0cmVhbUFycjpBcnJheTxTdHJlYW0+KTtcbiAgICAgICAgcHVibGljIGNvbmNhdCguLi5vdGhlclN0cmVhbSk7XG5cbiAgICAgICAgcHVibGljIGNvbmNhdCgpe1xuICAgICAgICAgICAgdmFyIGFyZ3M6QXJyYXk8U3RyZWFtPiA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNBcnJheShhcmd1bWVudHNbMF0pKXtcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gQ29uY2F0U3RyZWFtLmNyZWF0ZShhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBtZXJnZShzdHJlYW1BcnI6QXJyYXk8U3RyZWFtPik7XG4gICAgICAgIHB1YmxpYyBtZXJnZSguLi5vdGhlclN0cmVhbSk7XG5cbiAgICAgICAgcHVibGljIG1lcmdlKCl7XG4gICAgICAgICAgICB2YXIgYXJnczpBcnJheTxTdHJlYW0+ID0gbnVsbCxcbiAgICAgICAgICAgICAgICBzdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0FycmF5KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG5cbiAgICAgICAgICAgIHN0cmVhbSA9IGZyb21BcnJheShhcmdzKS5tZXJnZUFsbCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlcGVhdChjb3VudDpudW1iZXIgPSAtMSl7XG4gICAgICAgICAgICByZXR1cm4gUmVwZWF0U3RyZWFtLmNyZWF0ZSh0aGlzLCBjb3VudCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgaWdub3JlRWxlbWVudHMoKXtcbiAgICAgICAgICAgIHJldHVybiBJZ25vcmVFbGVtZW50c1N0cmVhbS5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgaGFuZGxlU3ViamVjdChhcmcpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNTdWJqZWN0KGFyZykpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFN1YmplY3QoYXJnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdWJqZWN0KHN1YmplY3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHN1YmplY3QgaW5zdGFuY2VvZiBTdWJqZWN0O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0U3ViamVjdChzdWJqZWN0KXtcbiAgICAgICAgICAgIHN1YmplY3Quc291cmNlID0gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwIHtcbiAgICByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICB3cmFwcGVyID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgY2FsbGJhY2sgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBnZWNrb1ZlcnNpb24gPSBudWxsLFxuICAgICAgICAgICAgdXNlckFnZW50ID0gcm9vdC5uYXZpZ2F0b3IgJiYgcm9vdC5uYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgd3JhcHBlciA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gICAgICAgICAgICB0aW1lID0gcm9vdC5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIHNlbGYuY2FsbGJhY2sodGltZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyohXG4gICAgICAgICBidWchXG4gICAgICAgICBiZWxvdyBjb2RlOlxuICAgICAgICAgd2hlbiBpbnZva2UgYiBhZnRlciAxcywgd2lsbCBvbmx5IGludm9rZSBiLCBub3QgaW52b2tlIGEhXG5cbiAgICAgICAgIGZ1bmN0aW9uIGEodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImFcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGZ1bmN0aW9uIGIodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImJcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYik7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGEoKTtcblxuICAgICAgICAgc2V0VGltZW91dChiLCAxMDAwKTtcblxuXG5cbiAgICAgICAgIHNvIHVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcHJpb3JpdHkhXG4gICAgICAgICAqL1xuICAgICAgICBpZihyb290LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgQ2hyb21lIDEwIGJ1ZyB3aGVyZSBDaHJvbWVcbiAgICAgICAgLy8gZG9lcyBub3QgcGFzcyB0aGUgdGltZSB0byB0aGUgYW5pbWF0aW9uIGZ1bmN0aW9uXG5cbiAgICAgICAgaWYgKHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBEZWZpbmUgdGhlIHdyYXBwZXJcblxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgc3dpdGNoXG5cbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgLy8gQnJvd3NlciBjYWxscyB0aGUgd3JhcHBlciBhbmQgd3JhcHBlciBjYWxscyB0aGUgY2FsbGJhY2tcblxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSh3cmFwcGVyLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v5L+u5pS5dGltZeWPguaVsFxuICAgICAgICBpZiAocm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgR2Vja28gMi4wLCB3aGljaCBoYXMgYSBidWcgaW5cbiAgICAgICAgLy8gbW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKCkgdGhhdCByZXN0cmljdHMgYW5pbWF0aW9uc1xuICAgICAgICAvLyB0byAzMC00MCBmcHMuXG5cbiAgICAgICAgaWYgKHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBDaGVjayB0aGUgR2Vja28gdmVyc2lvbi4gR2Vja28gaXMgdXNlZCBieSBicm93c2Vyc1xuICAgICAgICAgICAgLy8gb3RoZXIgdGhhbiBGaXJlZm94LiBHZWNrbyAyLjAgY29ycmVzcG9uZHMgdG9cbiAgICAgICAgICAgIC8vIEZpcmVmb3ggNC4wLlxuXG4gICAgICAgICAgICBpbmRleCA9IHVzZXJBZ2VudC5pbmRleE9mKCdydjonKTtcblxuICAgICAgICAgICAgaWYgKHVzZXJBZ2VudC5pbmRleE9mKCdHZWNrbycpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gdXNlckFnZW50LnN1YnN0cihpbmRleCArIDMsIDMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGdlY2tvVmVyc2lvbiA9PT0gJzIuMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yY2VzIHRoZSByZXR1cm4gc3RhdGVtZW50IHRvIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgc2V0VGltZW91dCgpIGZ1bmN0aW9uLlxuXG4gICAgICAgICAgICAgICAgICAgIHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHJvb3Qub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXG4gICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaDtcblxuICAgICAgICAgICAgICAgIHJvb3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gcm9vdC5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2ggPSByb290LnBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYudGltZW91dCA9IDEwMDAgLyA2MCAtIChmaW5pc2ggLSBzdGFydCk7XG5cbiAgICAgICAgICAgICAgICB9LCBzZWxmLnRpbWVvdXQpO1xuICAgICAgICAgICAgfTtcbiAgICB9KCkpO1xuXG4gICAgcm9vdC5jYW5jZWxOZXh0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC5jYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290LndlYmtpdENhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm1vekNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm9DYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC5tc0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCBjbGVhclRpbWVvdXQ7XG5cblxuICAgIGV4cG9ydCBjbGFzcyBTY2hlZHVsZXJ7XG4gICAgICAgIC8vdG9kbyByZW1vdmUgXCIuLi5hcmdzXCJcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9yZXF1ZXN0TG9vcElkOmFueSA9IG51bGw7XG4gICAgICAgIGdldCByZXF1ZXN0TG9vcElkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgcmVxdWVzdExvb3BJZChyZXF1ZXN0TG9vcElkOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0TG9vcElkID0gcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vb2JzZXJ2ZXIgaXMgZm9yIFRlc3RTY2hlZHVsZXIgdG8gcmV3cml0ZVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICBhY3Rpb24oaW5pdGlhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGludGVydmFsOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbCA9IGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgICAgIH0sIGludGVydmFsKVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXI6SU9ic2VydmVyLCBhY3Rpb246RnVuY3Rpb24pe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGxvb3AgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNFbmQgPSBhY3Rpb24odGltZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoaXNFbmQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcmVxdWVzdExvb3BJZCA9IHJvb3QucmVxdWVzdE5leHRBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0TG9vcElkID0gcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZpbGVQYXRoLmQudHNcIi8+XG5tb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPYnNlcnZlciBleHRlbmRzIEVudGl0eSBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHJpdmF0ZSBfaXNEaXNwb3NlZDpib29sZWFuID0gbnVsbDtcbiAgICAgICAgZ2V0IGlzRGlzcG9zZWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc0Rpc3Bvc2VkO1xuICAgICAgICB9XG4gICAgICAgIHNldCBpc0Rpc3Bvc2VkKGlzRGlzcG9zZWQ6Ym9vbGVhbil7XG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gaXNEaXNwb3NlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJOZXh0OkZ1bmN0aW9uID0gbnVsbDtcbiAgICAgICAgcHJvdGVjdGVkIG9uVXNlckVycm9yOkZ1bmN0aW9uID0gbnVsbDtcbiAgICAgICAgcHJvdGVjdGVkIG9uVXNlckNvbXBsZXRlZDpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdG9wOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgLy9wcml2YXRlIF9kaXNwb3NlSGFuZGxlcjp3ZENiLkNvbGxlY3Rpb248RnVuY3Rpb24+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxGdW5jdGlvbj4oKTtcbiAgICAgICAgcHJpdmF0ZSBfZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSA9IG51bGw7XG5cblxuICAgICAgICBjb25zdHJ1Y3RvcihvYnNlcnZlcjpJT2JzZXJ2ZXIpO1xuICAgICAgICBjb25zdHJ1Y3Rvcihvbk5leHQ6RnVuY3Rpb24sIG9uRXJyb3I6RnVuY3Rpb24sIG9uQ29tcGxldGVkOkZ1bmN0aW9uKTtcblxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICAgICAgICBzdXBlcihcIk9ic2VydmVyXCIpO1xuXG4gICAgICAgICAgICBpZihhcmdzLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgICAgICAgbGV0IG9ic2VydmVyOklPYnNlcnZlciA9IGFyZ3NbMF07XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlck5leHQgPSBmdW5jdGlvbih2KXtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh2KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGxldCBvbk5leHQgPSBhcmdzWzBdLFxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yID0gYXJnc1sxXSxcbiAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZWQgPSBhcmdzWzJdO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0ID0gb25OZXh0IHx8IGZ1bmN0aW9uKHYpe307XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJFcnJvciA9IG9uRXJyb3IgfHwgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkID0gb25Db21wbGV0ZWQgfHwgZnVuY3Rpb24oKXt9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25OZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9kaXNwb3NhYmxlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy90aGlzLl9kaXNwb3NlSGFuZGxlci5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAvLyAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICAvL30pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wdWJsaWMgZmFpbChlKSB7XG4gICAgICAgIC8vICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgIC8vICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAvLyAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgLy8gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2FibGUoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlID0gZGlzcG9zYWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbk5leHQodmFsdWUpO1xuXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbkVycm9yKGVycm9yKTtcblxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25Db21wbGV0ZWQoKTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdCBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBnZXQgc291cmNlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBzb3VyY2Uoc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjphbnkgPSBuZXcgU3ViamVjdE9ic2VydmVyKCk7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxPzpGdW5jdGlvbnxPYnNlcnZlciwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IDxBdXRvRGV0YWNoT2JzZXJ2ZXI+YXJnMVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICAvL3RoaXMuX3NvdXJjZSAmJiBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLl9zb3VyY2UuZGlzcG9zZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBJbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUodGhpcywgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX3NvdXJjZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbSh0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLnJlbW92ZUNoaWxkKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgR2VuZXJhdG9yU3ViamVjdCBleHRlbmRzIEVudGl0eSBpbXBsZW1lbnRzIElPYnNlcnZlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1N0YXJ0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZ2V0IGlzU3RhcnQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc1N0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIHNldCBpc1N0YXJ0KGlzU3RhcnQ6Ym9vbGVhbil7XG4gICAgICAgICAgICB0aGlzLl9pc1N0YXJ0ID0gaXNTdGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgICAgICBzdXBlcihcIkdlbmVyYXRvclN1YmplY3RcIik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb2JzZXJ2ZXI6YW55ID0gbmV3IFN1YmplY3RPYnNlcnZlcigpO1xuXG4gICAgICAgIC8qIVxuICAgICAgICBvdXRlciBob29rIG1ldGhvZFxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIG9uQmVmb3JlTmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQWZ0ZXJOZXh0KHZhbHVlOmFueSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uSXNDb21wbGV0ZWQodmFsdWU6YW55KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25CZWZvcmVFcnJvcihlcnJvcjphbnkpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkFmdGVyRXJyb3IoZXJyb3I6YW55KSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25CZWZvcmVDb21wbGV0ZWQoKSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25BZnRlckNvbXBsZXRlZCgpIHtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy90b2RvXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMT86RnVuY3Rpb258T2JzZXJ2ZXIsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyA8QXV0b0RldGFjaE9ic2VydmVyPmFyZzFcbiAgICAgICAgICAgICAgICAgICAgOiBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxGdW5jdGlvbj5hcmcxLCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gSW5uZXJTdWJzY3JpcHRpb24uY3JlYXRlKHRoaXMsIG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNTdGFydCB8fCB0aGlzLm9ic2VydmVyLmlzRW1wdHkoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkJlZm9yZU5leHQodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5uZXh0KHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMub25BZnRlck5leHQodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgaWYodGhpcy5vbklzQ29tcGxldGVkKHZhbHVlKSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzU3RhcnQgfHwgdGhpcy5vYnNlcnZlci5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZUVycm9yKGVycm9yKTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5lcnJvcihlcnJvcik7XG5cbiAgICAgICAgICAgIHRoaXMub25BZnRlckVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1N0YXJ0IHx8IHRoaXMub2JzZXJ2ZXIuaXNFbXB0eSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub25CZWZvcmVDb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5vbkFmdGVyQ29tcGxldGVkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdG9TdHJlYW0oKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdHJlYW0gPSBudWxsO1xuXG4gICAgICAgICAgICBzdHJlYW0gPSBBbm9ueW1vdXNTdHJlYW0uY3JlYXRlKChvYnNlcnZlcjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlKG9ic2VydmVyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0KCl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuX2lzU3RhcnQgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLnNldERpc3Bvc2FibGUoU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0b3AoKXtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RhcnQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5yZW1vdmVDaGlsZChvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlck5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJFcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQXV0b0RldGFjaE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9ic2VydmVyOklPYnNlcnZlcik7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pO1xuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmKGFyZ3MubGVuZ3RoID09PSAxKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoYXJnc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBpZih0aGlzLmlzRGlzcG9zZWQpe1xuICAgICAgICAgICAgICAgIHdkQ2IuTG9nLmxvZyhcIm9ubHkgY2FuIGRpc3Bvc2Ugb25jZVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIE1hcE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZWxlY3Rvcih2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBEb09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfcHJldk9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgcHJldk9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyID0gcHJldk9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICAvL3RoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTWVyZ2VBbGxPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc3RyZWFtR3JvdXAsIGdyb3VwRGlzcG9zYWJsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgZ2V0IGN1cnJlbnRPYnNlcnZlcigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgfVxuICAgICAgICBzZXQgY3VycmVudE9ic2VydmVyKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZG9uZTpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGdldCBkb25lKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZG9uZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgZG9uZShkb25lOmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5fZG9uZSA9IGRvbmU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2dyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXBEaXNwb3NhYmxlID0gZ3JvdXBEaXNwb3NhYmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dChpbm5lclNvdXJjZTphbnkpe1xuICAgICAgICAgICAgd2RDYi5Mb2cuZXJyb3IoIShpbm5lclNvdXJjZSBpbnN0YW5jZW9mIFN0cmVhbSB8fCBKdWRnZVV0aWxzLmlzUHJvbWlzZShpbm5lclNvdXJjZSkpLCB3ZENiLkxvZy5pbmZvLkZVTkNfTVVTVF9CRShcImlubmVyU291cmNlXCIsIFwiU3RyZWFtIG9yIFByb21pc2VcIikpO1xuXG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzUHJvbWlzZShpbm5lclNvdXJjZSkpe1xuICAgICAgICAgICAgICAgIGlubmVyU291cmNlID0gZnJvbVByb21pc2UoaW5uZXJTb3VyY2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cC5hZGRDaGlsZChpbm5lclNvdXJjZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dyb3VwRGlzcG9zYWJsZS5hZGQoaW5uZXJTb3VyY2UuYnVpbGRTdHJlYW0oSW5uZXJPYnNlcnZlci5jcmVhdGUodGhpcywgdGhpcy5fc3RyZWFtR3JvdXAsIGlubmVyU291cmNlKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYodGhpcy5fc3RyZWFtR3JvdXAuZ2V0Q291bnQoKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xhc3MgSW5uZXJPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKHBhcmVudCwgc3RyZWFtR3JvdXAsIGN1cnJlbnRTdHJlYW0pO1xuXG4gICAgICAgIFx0cmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3BhcmVudDpNZXJnZUFsbE9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9jdXJyZW50U3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBjdXJyZW50U3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAgPSBzdHJlYW1Hcm91cDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdHJlYW0gPSBjdXJyZW50U3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LmN1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHZhciBjdXJyZW50U3RyZWFtID0gdGhpcy5fY3VycmVudFN0cmVhbSxcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSB0aGlzLl9wYXJlbnQ7XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLnJlbW92ZUNoaWxkKChzdHJlYW06U3RyZWFtKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEp1ZGdlVXRpbHMuaXNFcXVhbChzdHJlYW0sIGN1cnJlbnRTdHJlYW0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vcGFyZW50LmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIC8vdGhpcy5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgIC8qIVxuICAgICAgICAgICAgaWYgdGhpcyBpbm5lclNvdXJjZSBpcyBhc3luYyBzdHJlYW0oYXMgcHJvbWlzZSBzdHJlYW0pLFxuICAgICAgICAgICAgaXQgd2lsbCBmaXJzdCBleGVjIGFsbCBwYXJlbnQubmV4dCBhbmQgb25lIHBhcmVudC5jb21wbGV0ZWQsXG4gICAgICAgICAgICB0aGVuIGV4ZWMgYWxsIHRoaXMubmV4dCBhbmQgYWxsIHRoaXMuY29tcGxldGVkXG4gICAgICAgICAgICBzbyBpbiB0aGlzIGNhc2UsIGl0IHNob3VsZCBpbnZva2UgcGFyZW50LmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQgYWZ0ZXIgdGhlIGxhc3QgaW52b2tjYXRpb24gb2YgdGhpcy5jb21wbGV0ZWQoaGF2ZSBpbnZva2VkIGFsbCB0aGUgaW5uZXJTb3VyY2UpXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYodGhpcy5faXNBc3luYygpICYmIHRoaXMuX3N0cmVhbUdyb3VwLmdldENvdW50KCkgPT09IDApe1xuICAgICAgICAgICAgICAgIHBhcmVudC5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc0FzeW5jKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50LmRvbmU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgQ29uY2F0T2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0YXJ0TmV4dFN0cmVhbTpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHJpdmF0ZSBjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJvdGVjdGVkIGN1cnJlbnRPYnNlcnZlcjphbnkgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdGFydE5leHRTdHJlYW06RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0YXJ0TmV4dFN0cmVhbTpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnROZXh0U3RyZWFtID0gc3RhcnROZXh0U3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICAvKiFcbiAgICAgICAgICAgIGlmIFwidGhpcy5jdXJyZW50T2JzZXJ2ZXIubmV4dFwiIGVycm9yLCBpdCB3aWxsIHBhc2UgdG8gdGhpcy5jdXJyZW50T2JzZXJ2ZXItPm9uRXJyb3IuXG4gICAgICAgICAgICBzbyBpdCBzaG91bGRuJ3QgaW52b2tlIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yIGhlcmUgYWdhaW4hXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIC8vdHJ5e1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgICAgIC8vY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIC8vfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIC8vdGhpcy5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydE5leHRTdHJlYW0oKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVN1YmplY3RPYnNlcnZlciB7XG4gICAgICAgIGFkZENoaWxkKG9ic2VydmVyOk9ic2VydmVyKTtcbiAgICAgICAgcmVtb3ZlQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBTdWJqZWN0T2JzZXJ2ZXIgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBvYnNlcnZlcnM6d2RDYi5Db2xsZWN0aW9uPElPYnNlcnZlcj4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPElPYnNlcnZlcj4oKTtcblxuICAgICAgICBwcml2YXRlIF9kaXNwb3NhYmxlOklEaXNwb3NhYmxlID0gbnVsbDtcblxuICAgICAgICBwdWJsaWMgaXNFbXB0eSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2JzZXJ2ZXJzLmdldENvdW50KCkgPT09IDA7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFkZENoaWxkKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmFkZENoaWxkKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSh0aGlzLl9kaXNwb3NhYmxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmVDaGlsZChvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5yZW1vdmVDaGlsZCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKG9iLCBvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5yZW1vdmVBbGxDaGlsZHJlbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2FibGUoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYnNlcnZlcjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUoZGlzcG9zYWJsZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fZGlzcG9zYWJsZSA9IGRpc3Bvc2FibGU7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgYWJzdHJhY3Qgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMTpGdW5jdGlvbnxPYnNlcnZlcnxTdWJqZWN0LCBvbkVycm9yPywgb25Db21wbGV0ZWQ/KTpJRGlzcG9zYWJsZSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBpZih0aGlzLmhhbmRsZVN1YmplY3QoYXJnMSkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPElPYnNlcnZlcj5hcmcxKVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICAvL29ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKHRoaXMuZGlzcG9zZUhhbmRsZXIpO1xuXG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUodGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcikpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHN1cGVyLmJ1aWxkU3RyZWFtKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlQ29yZShvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgX2hhc011bHRpT2JzZXJ2ZXJzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLnNjaGVkdWxlci5nZXRPYnNlcnZlcnMoKSA+IDE7XG4gICAgICAgIC8vfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZpbGVQYXRoLmQudHNcIi8+XG5tb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIERvU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgb25OZXh0PzpGdW5jdGlvbiwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgb25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyID0gQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvcixvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKERvT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLl9vYnNlcnZlcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTWFwU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIHNlbGVjdG9yKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zZWxlY3RvcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1hcE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fc2VsZWN0b3IpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tQXJyYXlTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYXJyYXksIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hcnJheTpBcnJheTxhbnk+ID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9hcnJheSA9IGFycmF5O1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGFycmF5ID0gdGhpcy5fYXJyYXksXG4gICAgICAgICAgICAgICAgbGVuID0gYXJyYXkubGVuZ3RoO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGFycmF5W2ldKTtcblxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHMuY2FsbGVlKGkgKyAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIDAsIGxvb3BSZWN1cnNpdmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tUHJvbWlzZVN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHByb21pc2U6YW55LCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKHByb21pc2UsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcHJvbWlzZTphbnkgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByb21pc2U6YW55LCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3Byb21pc2UudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0sIG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbUV2ZW50UGF0dGVyblN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhhZGRIYW5kbGVyLCByZW1vdmVIYW5kbGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FkZEhhbmRsZXI6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9yZW1vdmVIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyID0gYWRkSGFuZGxlcjtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUhhbmRsZXIgPSByZW1vdmVIYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgZnVuY3Rpb24gaW5uZXJIYW5kbGVyKGV2ZW50KXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcihpbm5lckhhbmRsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuX3JlbW92ZUhhbmRsZXIoaW5uZXJIYW5kbGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc3Vic2NyaWJlRnVuYyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihzdWJzY3JpYmVGdW5jKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjpBdXRvRGV0YWNoT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBpZih0aGlzLmhhbmRsZVN1YmplY3QoYXJndW1lbnRzWzBdKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlciA9IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIC8vb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIodGhpcy5kaXNwb3NlSGFuZGxlcik7XG5cblxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIoRGlzcG9zZXIuZ2V0RGlzcG9zZUhhbmRsZXIoKSk7XG4gICAgICAgICAgICAvL0Rpc3Bvc2VyLnJlbW92ZUFsbERpc3Bvc2VIYW5kbGVyKCk7XG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZpbGVQYXRoLmQudHNcIi8+XG5tb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEludGVydmFsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaW50ZXJ2YWw6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoaW50ZXJ2YWwsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIG9iai5pbml0V2hlbkNyZWF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaW50ZXJ2YWw6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihpbnRlcnZhbDpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gaW50ZXJ2YWw7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbml0V2hlbkNyZWF0ZSgpe1xuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSB0aGlzLl9pbnRlcnZhbCA8PSAwID8gMSA6IHRoaXMuX2ludGVydmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlkID0gdGhpcy5zY2hlZHVsZXIucHVibGlzaEludGVydmFsKG9ic2VydmVyLCAwLCB0aGlzLl9pbnRlcnZhbCwgKGNvdW50KSA9PiB7XG4gICAgICAgICAgICAgICAgLy9zZWxmLnNjaGVkdWxlci5uZXh0KGNvdW50KTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGNvdW50KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudCArIDE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9EaXNwb3Nlci5hZGREaXNwb3NlSGFuZGxlcigoKSA9PiB7XG4gICAgICAgICAgICAvL30pO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QuY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBJbnRlcnZhbFJlcXVlc3RTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzRW5kOmJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXIsICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0aW1lKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9pc0VuZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QuY2FuY2VsTmV4dFJlcXVlc3RBbmltYXRpb25GcmFtZShzZWxmLnNjaGVkdWxlci5yZXF1ZXN0TG9vcElkKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pc0VuZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICAvL3RoaXMuX29ic2VydmVyID0gQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvcixvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc3RyZWFtR3JvdXAgPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKSxcbiAgICAgICAgICAgICAgICBncm91cERpc3Bvc2FibGUgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWVyZ2VBbGxPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHN0cmVhbUdyb3VwLCBncm91cERpc3Bvc2FibGUpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwRGlzcG9zYWJsZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZpbGVQYXRoLmQudHNcIi8+XG5tb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFRha2VVbnRpbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIG90aGVyU3RlYW06U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBvdGhlclN0ZWFtKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vdGhlclN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIG90aGVyU3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fb3RoZXJTdHJlYW0gPSBKdWRnZVV0aWxzLmlzUHJvbWlzZShvdGhlclN0cmVhbSkgPyBmcm9tUHJvbWlzZShvdGhlclN0cmVhbSkgOiBvdGhlclN0cmVhbTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBncm91cCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKSxcbiAgICAgICAgICAgICAgICBhdXRvRGV0YWNoT2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyKSxcbiAgICAgICAgICAgICAgICBzb3VyY2VEaXNwb3NhYmxlID0gbnVsbDtcblxuICAgICAgICAgICAgc291cmNlRGlzcG9zYWJsZSA9IHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIGdyb3VwLmFkZChzb3VyY2VEaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgYXV0b0RldGFjaE9ic2VydmVyLnNldERpc3Bvc2FibGUoc291cmNlRGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIGdyb3VwLmFkZCh0aGlzLl9vdGhlclN0cmVhbS5idWlsZFN0cmVhbShUYWtlVW50aWxPYnNlcnZlci5jcmVhdGUoYXV0b0RldGFjaE9ic2VydmVyKSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQ29uY2F0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlczpBcnJheTxTdHJlYW0+KSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2VzOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxTdHJlYW0+KCk7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlczpBcnJheTxTdHJlYW0+KXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vdG9kbyBkb24ndCBzZXQgc2NoZWR1bGVyIGhlcmU/XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNvdXJjZXNbMF0uc2NoZWR1bGVyO1xuXG4gICAgICAgICAgICBzb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKHNvdXJjZSkpe1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zb3VyY2VzLmFkZENoaWxkKGZyb21Qcm9taXNlKHNvdXJjZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zb3VyY2VzLmFkZENoaWxkKHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvdW50ID0gdGhpcy5fc291cmNlcy5nZXRDb3VudCgpLFxuICAgICAgICAgICAgICAgIGQgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvb3BSZWN1cnNpdmUoaSkge1xuICAgICAgICAgICAgICAgIGlmKGkgPT09IGNvdW50KXtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGQuYWRkKHNlbGYuX3NvdXJjZXMuZ2V0Q2hpbGQoaSkuYnVpbGRTdHJlYW0oQ29uY2F0T2JzZXJ2ZXIuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIsICgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFJlY3Vyc2l2ZShpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyLCAwLCBsb29wUmVjdXJzaXZlKTtcblxuICAgICAgICAgICAgcmV0dXJuIEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBSZXBlYXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBjb3VudDpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIGNvdW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9jb3VudDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIGNvdW50Om51bWJlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fY291bnQgPSBjb3VudDtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuXG4gICAgICAgICAgICAvL3RoaXMuc3ViamVjdEdyb3VwID0gdGhpcy5fc291cmNlLnN1YmplY3RHcm91cDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBkID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGNvdW50KSB7XG4gICAgICAgICAgICAgICAgaWYoY291bnQgPT09IDApe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZC5hZGQoXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZS5idWlsZFN0cmVhbShDb25jYXRPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BSZWN1cnNpdmUoY291bnQgLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyLCB0aGlzLl9jb3VudCwgbG9vcFJlY3Vyc2l2ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBHcm91cERpc3Bvc2FibGUuY3JlYXRlKGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZmlsZVBhdGguZC50c1wiLz5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oSWdub3JlRWxlbWVudHNPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBEZWZlclN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGJ1aWxkU3RyZWFtRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGJ1aWxkU3RyZWFtRnVuYyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9idWlsZFN0cmVhbUZ1bmM6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGJ1aWxkU3RyZWFtRnVuYzpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYnVpbGRTdHJlYW1GdW5jID0gYnVpbGRTdHJlYW1GdW5jO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBncm91cCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgZ3JvdXAuYWRkKHRoaXMuX2J1aWxkU3RyZWFtRnVuYygpLmJ1aWxkU3RyZWFtKG9ic2VydmVyKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBncm91cDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCB2YXIgY3JlYXRlU3RyZWFtID0gKHN1YnNjcmliZUZ1bmMpID0+IHtcbiAgICAgICAgcmV0dXJuIEFub255bW91c1N0cmVhbS5jcmVhdGUoc3Vic2NyaWJlRnVuYyk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbUFycmF5ID0gKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT57XG4gICAgICAgIHJldHVybiBGcm9tQXJyYXlTdHJlYW0uY3JlYXRlKGFycmF5LCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21Qcm9taXNlID0gKHByb21pc2U6YW55LCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+e1xuICAgICAgICByZXR1cm4gRnJvbVByb21pc2VTdHJlYW0uY3JlYXRlKHByb21pc2UsIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbUV2ZW50UGF0dGVybiA9IChhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKSA9PntcbiAgICAgICAgcmV0dXJuIEZyb21FdmVudFBhdHRlcm5TdHJlYW0uY3JlYXRlKGFkZEhhbmRsZXIsIHJlbW92ZUhhbmRsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGludGVydmFsID0gKGludGVydmFsLCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsU3RyZWFtLmNyZWF0ZShpbnRlcnZhbCwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBpbnRlcnZhbFJlcXVlc3QgPSAoc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PiB7XG4gICAgICAgIHJldHVybiBJbnRlcnZhbFJlcXVlc3RTdHJlYW0uY3JlYXRlKHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZW1wdHkgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT57XG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgY2FsbEZ1bmMgPSAoZnVuYzpGdW5jdGlvbiwgY29udGV4dCA9IHJvb3QpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChmdW5jLmNhbGwoY29udGV4dCwgbnVsbCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBqdWRnZSA9IChjb25kaXRpb246RnVuY3Rpb24sIHRoZW5Tb3VyY2U6RnVuY3Rpb24sIGVsc2VTb3VyY2U6RnVuY3Rpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbmRpdGlvbigpID8gdGhlblNvdXJjZSgpIDogZWxzZVNvdXJjZSgpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGRlZmVyID0gKGJ1aWxkU3RyZWFtRnVuYzpGdW5jdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gRGVmZXJTdHJlYW0uY3JlYXRlKGJ1aWxkU3RyZWFtRnVuYyk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIganVzdCA9IChyZXR1cm5WYWx1ZTphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5uZXh0KHJldHVyblZhbHVlKTtcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwIHtcbiAgICB2YXIgZGVmYXVsdElzRXF1YWwgPSAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICB9O1xuXG4gICAgZXhwb3J0IGNsYXNzIFJlY29yZCB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHRpbWU6bnVtYmVyLCB2YWx1ZTphbnksIGFjdGlvblR5cGU/OkFjdGlvblR5cGUsIGNvbXBhcmVyPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHRpbWUsIHZhbHVlLCBhY3Rpb25UeXBlLCBjb21wYXJlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB0aW1lKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdGltZSh0aW1lOm51bWJlcil7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3ZhbHVlOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB2YWx1ZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHNldCB2YWx1ZSh2YWx1ZTpudW1iZXIpe1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FjdGlvblR5cGU6QWN0aW9uVHlwZSA9IG51bGw7XG4gICAgICAgIGdldCBhY3Rpb25UeXBlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aW9uVHlwZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgYWN0aW9uVHlwZShhY3Rpb25UeXBlOkFjdGlvblR5cGUpe1xuICAgICAgICAgICAgdGhpcy5fYWN0aW9uVHlwZSA9IGFjdGlvblR5cGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jb21wYXJlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IodGltZSwgdmFsdWUsIGFjdGlvblR5cGU6QWN0aW9uVHlwZSwgY29tcGFyZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX2FjdGlvblR5cGUgPSBhY3Rpb25UeXBlO1xuICAgICAgICAgICAgdGhpcy5fY29tcGFyZXIgPSBjb21wYXJlciB8fCBkZWZhdWx0SXNFcXVhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWUgPT09IG90aGVyLnRpbWUgJiYgdGhpcy5fY29tcGFyZXIodGhpcy5fdmFsdWUsIG90aGVyLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNb2NrT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSA8W1JlY29yZF0+W107XG4gICAgICAgIGdldCBtZXNzYWdlcygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICAgICAgICB9XG4gICAgICAgIHNldCBtZXNzYWdlcyhtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIHZhbHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCBlcnJvcikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCBudWxsKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvcHkoKXtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBNb2NrT2JzZXJ2ZXIuY3JlYXRlKHRoaXMuX3NjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlcyA9IHRoaXMuX21lc3NhZ2VzO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2ZpbGVQYXRoLmQudHNcIi8+XG5tb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1vY2tQcm9taXNle1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciwgbWVzc2FnZXM6W1JlY29yZF0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIsIG1lc3NhZ2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gPFtSZWNvcmRdPltdO1xuICAgICAgICAvL2dldCBtZXNzYWdlcygpe1xuICAgICAgICAvLyAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXM7XG4gICAgICAgIC8vfVxuICAgICAgICAvL3NldCBtZXNzYWdlcyhtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgIC8vICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIHByaXZhdGUgX3NjaGVkdWxlcjpUZXN0U2NoZWR1bGVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciwgbWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0aGVuKHN1Y2Nlc3NDYjpGdW5jdGlvbiwgZXJyb3JDYjpGdW5jdGlvbiwgb2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdmFyIHNjaGVkdWxlciA9IDxUZXN0U2NoZWR1bGVyPih0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIHRoaXMuX21lc3NhZ2VzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwIHtcbiAgICBjb25zdCBTVUJTQ1JJQkVfVElNRSA9IDIwMDtcbiAgICBjb25zdCBESVNQT1NFX1RJTUUgPSAxMDAwO1xuXG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIG5leHQodGljaywgdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBlcnJvcih0aWNrLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgZXJyb3IsIEFjdGlvblR5cGUuRVJST1IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjb21wbGV0ZWQodGljaykge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgbnVsbCwgQWN0aW9uVHlwZS5DT01QTEVURUQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaXNSZXNldDpib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhpc1Jlc2V0KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKGlzUmVzZXQ6Ym9vbGVhbil7XG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICB0aGlzLl9pc1Jlc2V0ID0gaXNSZXNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2Nsb2NrOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCBjbG9jaygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBjbG9jayhjbG9jazpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1Jlc2V0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHJpdmF0ZSBfaXNEaXNwb3NlZDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX3RpbWVyTWFwOndkQ2IuSGFzaDxGdW5jdGlvbj4gPSB3ZENiLkhhc2guY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1NYXA6d2RDYi5IYXNoPEZ1bmN0aW9uPiA9IHdkQ2IuSGFzaC5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX3N1YnNjcmliZWRUaW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VkVGltZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpNb2NrT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzZXRTdHJlYW1NYXAob2JzZXJ2ZXI6SU9ic2VydmVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIG1lc3NhZ2VzLmZvckVhY2goKHJlY29yZDpSZWNvcmQpID0+e1xuICAgICAgICAgICAgICAgIHZhciBmdW5jID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVjb3JkLmFjdGlvblR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuTkVYVDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHJlY29yZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5FUlJPUjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgd2RDYi5Mb2cuZXJyb3IodHJ1ZSwgd2RDYi5Mb2cuaW5mby5GVU5DX1VOS05PVyhcImFjdGlvblR5cGVcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5fc3RyZWFtTWFwLmFkZENoaWxkKFN0cmluZyhyZWNvcmQudGltZSksIGZ1bmMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOk1vY2tPYnNlcnZlciwgaW5pdGlhbDphbnksIHJlY3Vyc2l2ZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAvL21lc3NhZ2VzID0gW10sXG4gICAgICAgICAgICAgICAgbmV4dCA9IG51bGwsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkID0gbnVsbDtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgbmV4dCA9IG9ic2VydmVyLm5leHQ7XG4gICAgICAgICAgICBjb21wbGV0ZWQgPSBvYnNlcnZlci5jb21wbGV0ZWQ7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0LmNhbGwob2JzZXJ2ZXIsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZC5jYWxsKG9ic2VydmVyKTtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVjdXJzaXZlRnVuYyhpbml0aWFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgaW50ZXJ2YWw6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIC8vcHJvZHVjZSAxMCB2YWwgZm9yIHRlc3RcbiAgICAgICAgICAgIHZhciBDT1VOVCA9IDEwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHdoaWxlIChDT1VOVCA+IDAgJiYgIXRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aWNrKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dCh0aGlzLl9jbG9jaywgaW5pdGlhbCkpO1xuXG4gICAgICAgICAgICAgICAgLy9ubyBuZWVkIHRvIGludm9rZSBhY3Rpb25cbiAgICAgICAgICAgICAgICAvL2FjdGlvbihpbml0aWFsKTtcblxuICAgICAgICAgICAgICAgIGluaXRpYWwrKztcbiAgICAgICAgICAgICAgICBDT1VOVC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcbiAgICAgICAgICAgIC8vdGhpcy5zZXRTdHJlYW1NYXAodGhpcy5fb2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IDEwMCxcbiAgICAgICAgICAgICAgICBudW0gPSAwO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB3aGlsZSAoQ09VTlQgPiAwICYmICF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGljayhpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIG51bSkpO1xuXG4gICAgICAgICAgICAgICAgbnVtKys7XG4gICAgICAgICAgICAgICAgQ09VTlQtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG4gICAgICAgICAgICAvL3RoaXMuc2V0U3RyZWFtTWFwKHRoaXMuX29ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0Q2xvY2soKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzUmVzZXQpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGhpcy5fc3Vic2NyaWJlZFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoVGltZShjcmVhdGU6RnVuY3Rpb24sIHN1YnNjcmliZWRUaW1lOm51bWJlciwgZGlzcG9zZWRUaW1lOm51bWJlcikge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gdGhpcy5jcmVhdGVPYnNlcnZlcigpLFxuICAgICAgICAgICAgICAgIHNvdXJjZSwgc3Vic2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmVkVGltZSA9IHN1YnNjcmliZWRUaW1lO1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZWRUaW1lID0gZGlzcG9zZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9jbG9jayA9IHN1YnNjcmliZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9ydW5BdChzdWJzY3JpYmVkVGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNvdXJjZSA9IGNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KGRpc3Bvc2VkVGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBvYnNlcnZlcjtcblxuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoU3Vic2NyaWJlKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUgPSBTVUJTQ1JJQkVfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIHN1YnNjcmliZWRUaW1lLCBESVNQT1NFX1RJTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aERpc3Bvc2UoY3JlYXRlLCBkaXNwb3NlZFRpbWUgPSBESVNQT1NFX1RJTUUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0V2l0aFRpbWUoY3JlYXRlLCBTVUJTQ1JJQkVfVElNRSwgZGlzcG9zZWRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaWNBYnNvbHV0ZSh0aW1lLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9ydW5BdCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgICAgICB2YXIgZXh0cmVtZU51bUFyciA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKSxcbiAgICAgICAgICAgICAgICBtaW4gPSBleHRyZW1lTnVtQXJyWzBdLFxuICAgICAgICAgICAgICAgIG1heCA9IGV4dHJlbWVOdW1BcnJbMV0sXG4gICAgICAgICAgICAgICAgdGltZSA9IG1pbjtcblxuICAgICAgICAgICAgLy90b2RvIHJlZHVjZSBsb29wIHRpbWVcbiAgICAgICAgICAgIHdoaWxlICh0aW1lIDw9IG1heCkge1xuICAgICAgICAgICAgICAgIC8vaWYodGhpcy5faXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgLy8gICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy99XG5cbiAgICAgICAgICAgICAgICAvL2JlY2F1c2UgXCJfZXhlYyxfcnVuU3RyZWFtXCIgbWF5IGNoYW5nZSBcIl9jbG9ja1wiLFxuICAgICAgICAgICAgICAgIC8vc28gaXQgc2hvdWxkIHJlc2V0IHRoZSBfY2xvY2tcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGltZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2V4ZWModGltZSwgdGhpcy5fdGltZXJNYXApO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aW1lO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcnVuU3RyZWFtKHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgdGltZSsrO1xuXG4gICAgICAgICAgICAgICAgLy90b2RvIGdldCBtYXggdGltZSBvbmx5IGZyb20gc3RyZWFtTWFwP1xuICAgICAgICAgICAgICAgIC8vbmVlZCByZWZyZXNoIG1heCB0aW1lLlxuICAgICAgICAgICAgICAgIC8vYmVjYXVzZSBpZiB0aW1lck1hcCBoYXMgY2FsbGJhY2sgdGhhdCBjcmVhdGUgaW5maW5pdGUgc3RyZWFtKGFzIGludGVydmFsKSxcbiAgICAgICAgICAgICAgICAvL2l0IHdpbGwgc2V0IHN0cmVhbU1hcCBzbyB0aGF0IHRoZSBtYXggdGltZSB3aWxsIGNoYW5nZVxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVTdHJlYW0oYXJncyl7XG4gICAgICAgICAgICByZXR1cm4gVGVzdFN0cmVhbS5jcmVhdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlT2JzZXJ2ZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gTW9ja09ic2VydmVyLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVSZXNvbHZlZFByb21pc2UodGltZTpudW1iZXIsIHZhbHVlOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gTW9ja1Byb21pc2UuY3JlYXRlKHRoaXMsIFtUZXN0U2NoZWR1bGVyLm5leHQodGltZSwgdmFsdWUpLCBUZXN0U2NoZWR1bGVyLmNvbXBsZXRlZCh0aW1lKzEpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlUmVqZWN0UHJvbWlzZSh0aW1lOm51bWJlciwgZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHJldHVybiBNb2NrUHJvbWlzZS5jcmVhdGUodGhpcywgW1Rlc3RTY2hlZHVsZXIuZXJyb3IodGltZSwgZXJyb3IpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9nZXRNaW5BbmRNYXhUaW1lKCl7XG4gICAgICAgICAgICB2YXIgdGltZUFycjphbnkgPSAodGhpcy5fdGltZXJNYXAuZ2V0S2V5cygpLmFkZENoaWxkcmVuKHRoaXMuX3N0cmVhbU1hcC5nZXRLZXlzKCkpKTtcblxuICAgICAgICAgICAgICAgIHRpbWVBcnIgPSB0aW1lQXJyLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIoa2V5KTtcbiAgICAgICAgICAgICAgICB9KS50b0FycmF5KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBbTWF0aC5taW4uYXBwbHkoTWF0aCwgdGltZUFyciksIE1hdGgubWF4LmFwcGx5KE1hdGgsIHRpbWVBcnIpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2V4ZWModGltZSwgbWFwKXtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gbWFwLmdldENoaWxkKFN0cmluZyh0aW1lKSk7XG5cbiAgICAgICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3J1blN0cmVhbSh0aW1lKXtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fc3RyZWFtTWFwLmdldENoaWxkKFN0cmluZyh0aW1lKSk7XG5cbiAgICAgICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3J1bkF0KHRpbWU6bnVtYmVyLCBjYWxsYmFjazpGdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fdGltZXJNYXAuYWRkQ2hpbGQoU3RyaW5nKHRpbWUpLCBjYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aWNrKHRpbWU6bnVtYmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9jbG9jayArPSB0aW1lO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGVudW0gQWN0aW9uVHlwZXtcbiAgICAgICAgTkVYVCxcbiAgICAgICAgRVJST1IsXG4gICAgICAgIENPTVBMRVRFRFxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9maWxlUGF0aFwiLz5cbm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFtIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMobWVzc2FnZXMsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdmFyIHNjaGVkdWxlciA9IDxUZXN0U2NoZWR1bGVyPih0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9maWxlUGF0aC5kLnRzXCIvPlxubW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgdmFyIGZyb21Ob2RlQ2FsbGJhY2sgPSAoZnVuYzpGdW5jdGlvbiwgY29udGV4dD86YW55KSA9PiB7XG4gICAgICAgIHJldHVybiAoLi4uZnVuY0FyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBoYW5kZXIgPSAoZXJyLCAuLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dC5hcHBseShvYnNlcnZlciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGZ1bmNBcmdzLnB1c2goaGFuZGVyKTtcbiAgICAgICAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGZ1bmNBcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVN0cmVhbSA9IChzdHJlYW06YW55LCBmaW5pc2hFdmVudE5hbWU6c3RyaW5nID0gXCJlbmRcIikgPT4ge1xuICAgICAgICBzdHJlYW0ucGF1c2UoKTtcblxuICAgICAgICByZXR1cm4gd2RGcnAuY3JlYXRlU3RyZWFtKChvYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgdmFyIGRhdGFIYW5kbGVyID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChkYXRhKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9ySGFuZGxlciA9IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVuZEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0cmVhbS5hZGRMaXN0ZW5lcihcImRhdGFcIiwgZGF0YUhhbmRsZXIpO1xuICAgICAgICAgICAgc3RyZWFtLmFkZExpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JIYW5kbGVyKTtcbiAgICAgICAgICAgIHN0cmVhbS5hZGRMaXN0ZW5lcihmaW5pc2hFdmVudE5hbWUsIGVuZEhhbmRsZXIpO1xuXG4gICAgICAgICAgICBzdHJlYW0ucmVzdW1lKCk7XG5cbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlbW92ZUxpc3RlbmVyKFwiZGF0YVwiLCBkYXRhSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlbW92ZUxpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICBzdHJlYW0ucmVtb3ZlTGlzdGVuZXIoZmluaXNoRXZlbnROYW1lLCBlbmRIYW5kbGVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21SZWFkYWJsZVN0cmVhbSA9IChzdHJlYW06YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyZWFtKHN0cmVhbSwgXCJlbmRcIik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVdyaXRhYmxlU3RyZWFtID0gKHN0cmVhbTphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGZyb21TdHJlYW0oc3RyZWFtLCBcImZpbmlzaFwiKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tVHJhbnNmb3JtU3RyZWFtID0gKHN0cmVhbTphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGZyb21TdHJlYW0oc3RyZWFtLCBcImZpbmlzaFwiKTtcbiAgICB9O1xufVxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=