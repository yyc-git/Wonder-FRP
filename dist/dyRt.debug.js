

/// <reference path="../definitions.d.ts"/>

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

/// <reference path="../definitions.d.ts"/>
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

/// <reference path="../definitions.d.ts"/>
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
/// <reference path="../definitions.d.ts"/>
var dyRt;
(function (dyRt) {
    var Stream = (function (_super) {
        __extends(Stream, _super);
        function Stream(subscribeFunc) {
            _super.call(this, "Stream");
            this.scheduler = dyRt.ABSTRACT_ATTRIBUTE;
            this.subscribeFunc = null;
            this._disposeHandler = dyCb.Collection.create();
            this.subscribeFunc = subscribeFunc || function () { };
        }
        Object.defineProperty(Stream.prototype, "disposeHandler", {
            get: function () {
                return this._disposeHandler;
            },
            set: function (disposeHandler) {
                this._disposeHandler = disposeHandler;
            },
            enumerable: true,
            configurable: true
        });
        Stream.prototype.subscribe = function (arg1, onError, onCompleted) {
            throw dyRt.ABSTRACT_METHOD();
        };
        Stream.prototype.buildStream = function (observer) {
            this.subscribeFunc(observer);
        };
        Stream.prototype.addDisposeHandler = function (func) {
            this._disposeHandler.addChild(func);
        };
        Stream.prototype.handleSubject = function (arg) {
            if (this._isSubject(arg)) {
                this._setSubject(arg);
                return true;
            }
            return false;
        };
        Stream.prototype.do = function (onNext, onError, onCompleted) {
            return dyRt.DoStream.create(this, onNext, onError, onCompleted);
        };
        Stream.prototype.map = function (selector) {
            return dyRt.MapStream.create(this, selector);
        };
        Stream.prototype.flatMap = function (selector) {
            //return FlatMapStream.create(this, selector);
            return this.map(selector).mergeAll();
        };
        Stream.prototype.mergeAll = function () {
            return dyRt.MergeAllStream.create(this);
        };
        Stream.prototype._isSubject = function (subject) {
            return subject instanceof dyRt.Subject;
        };
        Stream.prototype._setSubject = function (subject) {
            subject.source = this;
        };
        return Stream;
    })(dyRt.Entity);
    dyRt.Stream = Stream;
})(dyRt || (dyRt = {}));

/// <reference path="../definitions.d.ts"/>
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
            observer.setDisposeHandler(this._source.disposeHandler);
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
            this._source.buildStream(this);
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
            this._observers.removeAllChilds();
        };
        return Subject;
    })();
    dyRt.Subject = Subject;
})(dyRt || (dyRt = {}));

/// <reference path="../definitions.d.ts"/>
var dyRt;
(function (dyRt) {
    var Scheduler = (function () {
        function Scheduler() {
        }
        Scheduler.create = function () {
            var obj = new this();
            return obj;
        };
        Scheduler.prototype.publishRecursive = function (observer, initial, action) {
            action(initial);
        };
        Scheduler.prototype.publishInterval = function (observer, initial, interval, action) {
            return dyRt.root.setInterval(function () {
                initial = action(initial);
            }, interval);
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
/// <reference path="../definitions.d.ts"/>
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
            this.onUserError = onError || function () { };
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

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../definitions.d.ts"/>
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
/// <reference path="../definitions.d.ts"/>
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
/// <reference path="../definitions.d.ts"/>
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
/// <reference path="../definitions.d.ts"/>
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
                this._currentObserver.error(error);
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
/// <reference path="../definitions.d.ts"/>
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
/// <reference path="../definitions.d.ts"/>
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
            //todo encapsulate it to scheduleItem
            //todo delete target?
            //this.scheduler.target = observer;
            //dyCb.Log.error(this._hasMultiObservers(), "should use Subject to handle multi observers");
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
/// <reference path="../definitions.d.ts"/>
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
        DoStream.prototype.buildStream = function (observer) {
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
/// <reference path="../definitions.d.ts"/>
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
            //this.scheduler.addWrapTarget(MapObserver.create(selector));
            this._selector = selector;
        }
        MapStream.create = function (source, selector) {
            var obj = new this(source, selector);
            return obj;
        };
        MapStream.prototype.buildStream = function (observer) {
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
/// <reference path="../definitions.d.ts"/>
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
            //next,completed is for TestScheduler to inject
            //todo remove inject next,completed?
            function loopRecursive(i, next, completed) {
                if (i < len) {
                    if (next) {
                        next(array[i]);
                    }
                    else {
                        observer.next(array[i]);
                    }
                    arguments.callee(i + 1, next, completed);
                }
                else {
                    if (completed) {
                        completed();
                    }
                    else {
                        observer.completed();
                    }
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
/// <reference path="../definitions.d.ts"/>
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
/// <reference path="../definitions.d.ts"/>
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
            observer.setDisposeHandler(this.disposeHandler);
            //todo encapsulate it to scheduleItem
            //this.scheduler.target = observer;
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
/// <reference path="../definitions.d.ts"/>
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
/// <reference path="../definitions.d.ts"/>
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
        MergeAllStream.prototype.buildStream = function (observer) {
            var streamGroup = dyCb.Collection.create();
            this._source.buildStream(dyRt.MergeAllObserver.create(observer, streamGroup));
        };
        return MergeAllStream;
    })(dyRt.BaseStream);
    dyRt.MergeAllStream = MergeAllStream;
})(dyRt || (dyRt = {}));

/// <reference path="../definitions.d.ts"/>
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
        return new dyRt.FromPromiseStream(promise, scheduler);
    };
    dyRt.interval = function (interval, scheduler) {
        if (scheduler === void 0) { scheduler = dyRt.Scheduler.create(); }
        return dyRt.IntervalStream.create(interval, scheduler);
    };
})(dyRt || (dyRt = {}));

/// <reference path="../definitions.d.ts"/>
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
/// <reference path="../definitions.d.ts"/>
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
        return MockObserver;
    })(dyRt.Observer);
    dyRt.MockObserver = MockObserver;
})(dyRt || (dyRt = {}));

/// <reference path="../definitions.d.ts"/>
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
/// <reference path="../definitions.d.ts"/>
var dyRt;
(function (dyRt) {
    var SUBSCRIBE_TIME = 200;
    var DISPOSE_TIME = 1000;
    var TestScheduler = (function (_super) {
        __extends(TestScheduler, _super);
        function TestScheduler() {
            _super.apply(this, arguments);
            this._clock = null;
            this._initialClock = null;
            this._isDisposed = false;
            this._timerMap = dyCb.Hash.create();
            this._streamMap = dyCb.Hash.create();
            this._subscribedTime = null;
            this._disposedTime = null;
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
        TestScheduler.create = function () {
            var obj = new this();
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
            var self = this;
            var messages = [];
            this._setClock();
            recursiveFunc(initial, function (value) {
                self._tick(1);
                messages.push(TestScheduler.next(self._clock, value));
            }, function () {
                self._tick(1);
                messages.push(TestScheduler.completed(self._clock));
                self.setStreamMap(observer, messages);
            });
        };
        TestScheduler.prototype.publishInterval = function (observer, initial, interval, action) {
            //produce 10 val for test
            var COUNT = 10;
            var messages = [];
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
        TestScheduler.prototype._setClock = function () {
            if (this._initialClock) {
                this._clock = Math.min(this._clock, this._initialClock);
            }
            this._initialClock = this._clock;
        };
        TestScheduler.prototype.startWithTime = function (create, subscribedTime, disposedTime) {
            var observer = this.createObserver(), source, subscription;
            this._subscribedTime = subscribedTime;
            this._disposedTime = disposedTime;
            this._clock = subscribedTime;
            var self = this;
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
            var timeArr = this._timerMap.getKeys().addChilds(this._streamMap.getKeys())
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
            //if(handler && this._hasObserver()){
            if (handler) {
                handler();
            }
        };
        //private _hasObserver(){
        //    if(this.target instanceof Subject){
        //        let subject = <Subject>this.target;
        //
        //         return subject.getObservers() > 0
        //    }
        //
        //    return !!this.target;
        //}
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
/// <reference path="../definitions"/>
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

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="definitions.d.ts"/>
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpc3Bvc2FibGUvSURpc3Bvc2FibGUudHMiLCJvYnNlcnZlci9JT2JzZXJ2ZXIudHMiLCJnbG9iYWwvVmFyaWFibGUudHMiLCJnbG9iYWwvQ29uc3QudHMiLCJEaXNwb3NhYmxlL0lubmVyU3Vic2NyaXB0aW9uLnRzIiwiY29yZS9FbnRpdHkudHMiLCJjb3JlL1N0cmVhbS50cyIsImNvcmUvU3ViamVjdC50cyIsImNvcmUvU2NoZWR1bGVyLnRzIiwiY29yZS9PYnNlcnZlci50cyIsIm9ic2VydmVyL0Fub255bW91c09ic2VydmVyLnRzIiwib2JzZXJ2ZXIvQXV0b0RldGFjaE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvTWFwT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9Eb09ic2VydmVyLnRzIiwib2JzZXJ2ZXIvTWVyZ2VBbGxPYnNlcnZlci50cyIsInN0cmVhbS9CYXNlU3RyZWFtLnRzIiwic3RyZWFtL0RvU3RyZWFtLnRzIiwic3RyZWFtL01hcFN0cmVhbS50cyIsInN0cmVhbS9Gcm9tQXJyYXlTdHJlYW0udHMiLCJzdHJlYW0vRnJvbVByb21pc2VTdHJlYW0udHMiLCJzdHJlYW0vQW5vbnltb3VzU3RyZWFtLnRzIiwic3RyZWFtL0ludGVydmFsU3RyZWFtLnRzIiwic3RyZWFtL01lcmdlQWxsU3RyZWFtLnRzIiwiZ2xvYmFsL09wZXJhdG9yLnRzIiwidGVzdGluZy9SZWNvcmQudHMiLCJ0ZXN0aW5nL01vY2tPYnNlcnZlci50cyIsInRlc3RpbmcvTW9ja1Byb21pc2UudHMiLCJ0ZXN0aW5nL1Rlc3RTY2hlZHVsZXIudHMiLCJ0ZXN0aW5nL0FjdGlvblR5cGUudHMiLCJ0ZXN0aW5nL1Rlc3RTdHJlYW0udHMiLCJKdWRnZVV0aWxzLnRzIl0sIm5hbWVzIjpbImR5UnQiLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uIiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbi5jb25zdHJ1Y3RvciIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb24uY3JlYXRlIiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbi5kaXNwb3NlIiwiZHlSdC5FbnRpdHkiLCJkeVJ0LkVudGl0eS5jb25zdHJ1Y3RvciIsImR5UnQuRW50aXR5LnVpZCIsImR5UnQuU3RyZWFtIiwiZHlSdC5TdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LlN0cmVhbS5kaXNwb3NlSGFuZGxlciIsImR5UnQuU3RyZWFtLnN1YnNjcmliZSIsImR5UnQuU3RyZWFtLmJ1aWxkU3RyZWFtIiwiZHlSdC5TdHJlYW0uYWRkRGlzcG9zZUhhbmRsZXIiLCJkeVJ0LlN0cmVhbS5oYW5kbGVTdWJqZWN0IiwiZHlSdC5TdHJlYW0uZG8iLCJkeVJ0LlN0cmVhbS5tYXAiLCJkeVJ0LlN0cmVhbS5mbGF0TWFwIiwiZHlSdC5TdHJlYW0ubWVyZ2VBbGwiLCJkeVJ0LlN0cmVhbS5faXNTdWJqZWN0IiwiZHlSdC5TdHJlYW0uX3NldFN1YmplY3QiLCJkeVJ0LlN1YmplY3QiLCJkeVJ0LlN1YmplY3QuY29uc3RydWN0b3IiLCJkeVJ0LlN1YmplY3QuY3JlYXRlIiwiZHlSdC5TdWJqZWN0LnNvdXJjZSIsImR5UnQuU3ViamVjdC5zdWJzY3JpYmUiLCJkeVJ0LlN1YmplY3QubmV4dCIsImR5UnQuU3ViamVjdC5lcnJvciIsImR5UnQuU3ViamVjdC5jb21wbGV0ZWQiLCJkeVJ0LlN1YmplY3Quc3RhcnQiLCJkeVJ0LlN1YmplY3QucmVtb3ZlIiwiZHlSdC5TdWJqZWN0LmRpc3Bvc2UiLCJkeVJ0LlNjaGVkdWxlciIsImR5UnQuU2NoZWR1bGVyLmNvbnN0cnVjdG9yIiwiZHlSdC5TY2hlZHVsZXIuY3JlYXRlIiwiZHlSdC5TY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZSIsImR5UnQuU2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbCIsImR5UnQuT2JzZXJ2ZXIiLCJkeVJ0Lk9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5PYnNlcnZlci5pc0Rpc3Bvc2VkIiwiZHlSdC5PYnNlcnZlci5uZXh0IiwiZHlSdC5PYnNlcnZlci5lcnJvciIsImR5UnQuT2JzZXJ2ZXIuY29tcGxldGVkIiwiZHlSdC5PYnNlcnZlci5kaXNwb3NlIiwiZHlSdC5PYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlciIsImR5UnQuT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5PYnNlcnZlci5vbkVycm9yIiwiZHlSdC5PYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIiLCJkeVJ0LkFub255bW91c09ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5Bbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUiLCJkeVJ0LkFub255bW91c09ic2VydmVyLm9uTmV4dCIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlciIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIuZGlzcG9zZSIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLm9uTmV4dCIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuTWFwT2JzZXJ2ZXIiLCJkeVJ0Lk1hcE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5NYXBPYnNlcnZlci5jcmVhdGUiLCJkeVJ0Lk1hcE9ic2VydmVyLm9uTmV4dCIsImR5UnQuTWFwT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuTWFwT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LkRvT2JzZXJ2ZXIiLCJkeVJ0LkRvT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LkRvT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Eb09ic2VydmVyLm9uTmV4dCIsImR5UnQuRG9PYnNlcnZlci5vbkVycm9yIiwiZHlSdC5Eb09ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLmNyZWF0ZSIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5jdXJyZW50T2JzZXJ2ZXIiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIuZG9uZSIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5vbk5leHQiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuSW5uZXJPYnNlcnZlciIsImR5UnQuSW5uZXJPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuSW5uZXJPYnNlcnZlci5jcmVhdGUiLCJkeVJ0LklubmVyT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5Jbm5lck9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LklubmVyT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LklubmVyT2JzZXJ2ZXIuX2lzQXN5bmMiLCJkeVJ0LkJhc2VTdHJlYW0iLCJkeVJ0LkJhc2VTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkJhc2VTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuQmFzZVN0cmVhbS5zdWJzY3JpYmUiLCJkeVJ0LkJhc2VTdHJlYW0uYnVpbGRTdHJlYW0iLCJkeVJ0LkRvU3RyZWFtIiwiZHlSdC5Eb1N0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuRG9TdHJlYW0uY3JlYXRlIiwiZHlSdC5Eb1N0cmVhbS5idWlsZFN0cmVhbSIsImR5UnQuTWFwU3RyZWFtIiwiZHlSdC5NYXBTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0Lk1hcFN0cmVhbS5jcmVhdGUiLCJkeVJ0Lk1hcFN0cmVhbS5idWlsZFN0cmVhbSIsImR5UnQuRnJvbUFycmF5U3RyZWFtIiwiZHlSdC5Gcm9tQXJyYXlTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkZyb21BcnJheVN0cmVhbS5jcmVhdGUiLCJkeVJ0LkZyb21BcnJheVN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5Gcm9tQXJyYXlTdHJlYW0uc3Vic2NyaWJlQ29yZS5sb29wUmVjdXJzaXZlIiwiZHlSdC5Gcm9tUHJvbWlzZVN0cmVhbSIsImR5UnQuRnJvbVByb21pc2VTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkZyb21Qcm9taXNlU3RyZWFtLmNyZWF0ZSIsImR5UnQuRnJvbVByb21pc2VTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuQW5vbnltb3VzU3RyZWFtIiwiZHlSdC5Bbm9ueW1vdXNTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkFub255bW91c1N0cmVhbS5jcmVhdGUiLCJkeVJ0LkFub255bW91c1N0cmVhbS5zdWJzY3JpYmUiLCJkeVJ0LkludGVydmFsU3RyZWFtIiwiZHlSdC5JbnRlcnZhbFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuSW50ZXJ2YWxTdHJlYW0uY3JlYXRlIiwiZHlSdC5JbnRlcnZhbFN0cmVhbS5pbml0V2hlbkNyZWF0ZSIsImR5UnQuSW50ZXJ2YWxTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuTWVyZ2VBbGxTdHJlYW0iLCJkeVJ0Lk1lcmdlQWxsU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5NZXJnZUFsbFN0cmVhbS5jcmVhdGUiLCJkeVJ0Lk1lcmdlQWxsU3RyZWFtLmJ1aWxkU3RyZWFtIiwiZHlSdC5SZWNvcmQiLCJkeVJ0LlJlY29yZC5jb25zdHJ1Y3RvciIsImR5UnQuUmVjb3JkLmNyZWF0ZSIsImR5UnQuUmVjb3JkLnRpbWUiLCJkeVJ0LlJlY29yZC52YWx1ZSIsImR5UnQuUmVjb3JkLmFjdGlvblR5cGUiLCJkeVJ0LlJlY29yZC5lcXVhbHMiLCJkeVJ0Lk1vY2tPYnNlcnZlciIsImR5UnQuTW9ja09ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIubWVzc2FnZXMiLCJkeVJ0Lk1vY2tPYnNlcnZlci5vbk5leHQiLCJkeVJ0Lk1vY2tPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0Lk1vY2tPYnNlcnZlci5kaXNwb3NlIiwiZHlSdC5Nb2NrUHJvbWlzZSIsImR5UnQuTW9ja1Byb21pc2UuY29uc3RydWN0b3IiLCJkeVJ0Lk1vY2tQcm9taXNlLmNyZWF0ZSIsImR5UnQuTW9ja1Byb21pc2UudGhlbiIsImR5UnQuVGVzdFNjaGVkdWxlciIsImR5UnQuVGVzdFNjaGVkdWxlci5jb25zdHJ1Y3RvciIsImR5UnQuVGVzdFNjaGVkdWxlci5uZXh0IiwiZHlSdC5UZXN0U2NoZWR1bGVyLmVycm9yIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNvbXBsZXRlZCIsImR5UnQuVGVzdFNjaGVkdWxlci5jcmVhdGUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY2xvY2siLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc2V0U3RyZWFtTWFwIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnJlbW92ZSIsImR5UnQuVGVzdFNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbCIsImR5UnQuVGVzdFNjaGVkdWxlci5fc2V0Q2xvY2siLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc3RhcnRXaXRoVGltZSIsImR5UnQuVGVzdFNjaGVkdWxlci5zdGFydFdpdGhTdWJzY3JpYmUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc3RhcnRXaXRoRGlzcG9zZSIsImR5UnQuVGVzdFNjaGVkdWxlci5wdWJsaWNBYnNvbHV0ZSIsImR5UnQuVGVzdFNjaGVkdWxlci5zdGFydCIsImR5UnQuVGVzdFNjaGVkdWxlci5jcmVhdGVTdHJlYW0iLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlT2JzZXJ2ZXIiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlUmVzb2x2ZWRQcm9taXNlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNyZWF0ZVJlamVjdFByb21pc2UiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX2dldE1pbkFuZE1heFRpbWUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX2V4ZWMiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX3J1blN0cmVhbSIsImR5UnQuVGVzdFNjaGVkdWxlci5fcnVuQXQiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX3RpY2siLCJkeVJ0LkFjdGlvblR5cGUiLCJkeVJ0LlRlc3RTdHJlYW0iLCJkeVJ0LlRlc3RTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LlRlc3RTdHJlYW0uY3JlYXRlIiwiZHlSdC5UZXN0U3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0Lkp1ZGdlVXRpbHMiLCJkeVJ0Lkp1ZGdlVXRpbHMuY29uc3RydWN0b3IiLCJkeVJ0Lkp1ZGdlVXRpbHMuaXNQcm9taXNlIiwiZHlSdC5KdWRnZVV0aWxzLmlzRXF1YWwiXSwibWFwcGluZ3MiOiJBQUlDOztBQ0pELEFBQ0EsMkNBRDJDO0FBTzFDO0FDUEQsSUFBTyxJQUFJLENBRVY7QUFGRCxXQUFPLElBQUksRUFBQSxDQUFDO0lBQ0dBLFNBQUlBLEdBQU9BLE1BQU1BLENBQUNBO0FBQ2pDQSxDQUFDQSxFQUZNLElBQUksS0FBSixJQUFJLFFBRVY7O0FDRkQsSUFBTyxJQUFJLENBS1Y7QUFMRCxXQUFPLElBQUksRUFBQSxDQUFDO0lBQ0dBLG9CQUFlQSxHQUFZQTtRQUM5QixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUN0RCxDQUFDLEVBQ0RBLHVCQUFrQkEsR0FBT0EsSUFBSUEsQ0FBQ0E7QUFDdENBLENBQUNBLEVBTE0sSUFBSSxLQUFKLElBQUksUUFLVjs7QUNMRCwyQ0FBMkM7QUFDM0MsSUFBTyxJQUFJLENBc0JWO0FBdEJELFdBQU8sSUFBSSxFQUFBLENBQUM7SUFDWEE7UUFVQ0MsMkJBQVlBLE9BQWVBLEVBQUVBLFFBQWlCQTtZQUh0Q0MsYUFBUUEsR0FBV0EsSUFBSUEsQ0FBQ0E7WUFDeEJBLGNBQVNBLEdBQVlBLElBQUlBLENBQUNBO1lBR2pDQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxPQUFPQSxDQUFDQTtZQUN4QkEsSUFBSUEsQ0FBQ0EsU0FB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L0NBO1lBQWdDQyw4QkFBZUE7UUFVL0NBLENBQUNBO1FBVGlCRCxvQkFBU0EsR0FBdkJBLFVBQXdCQSxHQUFHQTtZQUN2QkUsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0E7bUJBQ0xBLENBQUNBLE1BQUtBLENBQUNBLFVBQVVBLFlBQUNBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBO21CQUNoQ0EsTUFBS0EsQ0FBQ0EsVUFBVUEsWUFBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDdENBLENBQUNBO1FBRWFGLGtCQUFPQSxHQUFyQkEsVUFBc0JBLEdBQVVBLEVBQUVBLEdBQVVBO1lBQ3hDRyxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxLQUFLQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7UUFDTEgsaUJBQUNBO0lBQURBLENBVkE3SyxBQVVDNkssRUFWK0I3SyxJQUFJQSxDQUFDQSxVQUFVQSxFQVU5Q0E7SUFWWUEsZUFBVUEsYUFVdEJBLENBQUFBO0FBQ0xBLENBQUNBLEVBWk0sSUFBSSxLQUFKLElBQUksUUFZViIsImZpbGUiOiJkeVJ0LmRlYnVnLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJRGlzcG9zYWJsZXtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgaW50ZXJmYWNlIElPYnNlcnZlciBleHRlbmRzIElEaXNwb3NhYmxle1xuICAgICAgICBuZXh0KHZhbHVlOmFueSk7XG4gICAgICAgIGVycm9yKGVycm9yOmFueSk7XG4gICAgICAgIGNvbXBsZXRlZCgpO1xuICAgIH1cbn1cbiIsIm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCB2YXIgcm9vdDphbnkgPSB3aW5kb3c7XG59XG4iLCJtb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgdmFyIEFCU1RSQUNUX01FVEhPRDpGdW5jdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKFwiYWJzdHJhY3QgbWV0aG9kIG5lZWQgb3ZlcnJpZGVcIik7XG4gICAgICAgIH0sXG4gICAgICAgIEFCU1RSQUNUX0FUVFJJQlVURTphbnkgPSBudWxsO1xufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuXHRleHBvcnQgY2xhc3MgSW5uZXJTdWJzY3JpcHRpb24gaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJqZWN0OlN1YmplY3QsIG9ic2VydmVyOk9ic2VydmVyKSB7XG5cdFx0XHR2YXIgb2JqID0gbmV3IHRoaXMoc3ViamVjdCwgb2JzZXJ2ZXIpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX3N1YmplY3Q6U3ViamVjdCA9IG51bGw7XG5cdFx0cHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG5cdFx0Y29uc3RydWN0b3Ioc3ViamVjdDpTdWJqZWN0LCBvYnNlcnZlcjpPYnNlcnZlcil7XG5cdFx0XHR0aGlzLl9zdWJqZWN0ID0gc3ViamVjdDtcblx0XHRcdHRoaXMuX29ic2VydmVyID0gb2JzZXJ2ZXI7XG5cdFx0fVxuXG5cdFx0cHVibGljIGRpc3Bvc2UoKXtcblx0XHRcdHRoaXMuX3N1YmplY3QucmVtb3ZlKHRoaXMuX29ic2VydmVyKTtcblxuXHRcdFx0dGhpcy5fb2JzZXJ2ZXIuZGlzcG9zZSgpO1xuXHRcdH1cblx0fVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRW50aXR5e1xuICAgICAgICBwdWJsaWMgc3RhdGljIFVJRDpudW1iZXIgPSAxO1xuXG4gICAgICAgIHByaXZhdGUgX3VpZDpzdHJpbmcgPSBudWxsO1xuICAgICAgICBnZXQgdWlkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdWlkO1xuICAgICAgICB9XG4gICAgICAgIHNldCB1aWQodWlkOnN0cmluZyl7XG4gICAgICAgICAgICB0aGlzLl91aWQgPSB1aWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcih1aWRQcmU6c3RyaW5nKXtcbiAgICAgICAgICAgIHRoaXMuX3VpZCA9IHVpZFByZSArIFN0cmluZyhFbnRpdHkuVUlEKyspO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgU3RyZWFtIGV4dGVuZHMgRW50aXR5e1xuICAgICAgICBwdWJsaWMgc2NoZWR1bGVyOlNjaGVkdWxlciA9IEFCU1RSQUNUX0FUVFJJQlVURTtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZUZ1bmM6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbiA9IGR5Q2IuQ29sbGVjdGlvbi5jcmVhdGUoKTtcbiAgICAgICAgZ2V0IGRpc3Bvc2VIYW5kbGVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGlzcG9zZUhhbmRsZXI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGRpc3Bvc2VIYW5kbGVyKGRpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbil7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlciA9IGRpc3Bvc2VIYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc3Vic2NyaWJlRnVuYyl7XG4gICAgICAgICAgICBzdXBlcihcIlN0cmVhbVwiKTtcblxuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVGdW5jID0gc3Vic2NyaWJlRnVuYyB8fCBmdW5jdGlvbigpeyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZUZ1bmMob2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFkZERpc3Bvc2VIYW5kbGVyKGZ1bmM6RnVuY3Rpb24pe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIuYWRkQ2hpbGQoZnVuYyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgaGFuZGxlU3ViamVjdChhcmcpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNTdWJqZWN0KGFyZykpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFN1YmplY3QoYXJnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRvKG9uTmV4dD86RnVuY3Rpb24sIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBEb1N0cmVhbS5jcmVhdGUodGhpcywgb25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbWFwKHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gTWFwU3RyZWFtLmNyZWF0ZSh0aGlzLCBzZWxlY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmxhdE1hcChzZWxlY3RvcjpGdW5jdGlvbil7XG4gICAgICAgICAgICAvL3JldHVybiBGbGF0TWFwU3RyZWFtLmNyZWF0ZSh0aGlzLCBzZWxlY3Rvcik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXAoc2VsZWN0b3IpLm1lcmdlQWxsKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbWVyZ2VBbGwoKXtcbiAgICAgICAgICAgIHJldHVybiBNZXJnZUFsbFN0cmVhbS5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1N1YmplY3Qoc3ViamVjdCl7XG4gICAgICAgICAgICByZXR1cm4gc3ViamVjdCBpbnN0YW5jZW9mIFN1YmplY3Q7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXRTdWJqZWN0KHN1YmplY3Qpe1xuICAgICAgICAgICAgc3ViamVjdC5zb3VyY2UgPSB0aGlzO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdCBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBnZXQgc291cmNlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBzb3VyY2Uoc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcnM6ZHlDYi5Db2xsZWN0aW9uID0gZHlDYi5Db2xsZWN0aW9uLmNyZWF0ZSgpO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMT86RnVuY3Rpb258T2JzZXJ2ZXIsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyA8QXV0b0RldGFjaE9ic2VydmVyPmFyZzFcbiAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIodGhpcy5fc291cmNlLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXJzLmFkZENoaWxkKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIElubmVyU3Vic2NyaXB0aW9uLmNyZWF0ZSh0aGlzLCBvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24ob2I6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgICAgIG9iLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uKG9iOk9ic2VydmVyKXtcbiAgICAgICAgICAgICAgICBvYi5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uKG9iOk9ic2VydmVyKXtcbiAgICAgICAgICAgICAgICBvYi5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0KCl7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0odGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVycy5yZW1vdmVDaGlsZChmdW5jdGlvbihvYjpPYnNlcnZlcil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEp1ZGdlVXRpbHMuaXNFcXVhbChvYiwgb2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24ob2I6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgICAgIG9iLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMucmVtb3ZlQWxsQ2hpbGRzKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgU2NoZWR1bGVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgYWN0aW9uOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgaW50ZXJ2YWw6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIHJldHVybiByb290LnNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgaW5pdGlhbCA9IGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgICAgIH0sIGludGVydmFsKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGNsYXNzIE9ic2VydmVyIGV4dGVuZHMgRW50aXR5IGltcGxlbWVudHMgSU9ic2VydmVye1xuICAgICAgICBwcml2YXRlIF9pc0Rpc3Bvc2VkOmJvb2xlYW4gPSBudWxsO1xuICAgICAgICBnZXQgaXNEaXNwb3NlZCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzRGlzcG9zZWQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGlzRGlzcG9zZWQoaXNEaXNwb3NlZDpib29sZWFuKXtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSBpc0Rpc3Bvc2VkO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uVXNlck5leHQ6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyRXJyb3I6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyQ29tcGxldGVkOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9pc1N0b3A6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwcml2YXRlIF9kaXNwb3NlSGFuZGxlcjpkeUNiLkNvbGxlY3Rpb24gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlKCk7XG5cbiAgICAgICAgY29uc3RydWN0b3Iob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIoXCJPYnNlcnZlclwiKTtcblxuICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0ID0gb25OZXh0IHx8IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IgPSBvbkVycm9yIHx8IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkID0gb25Db21wbGV0ZWQgfHwgZnVuY3Rpb24oKXt9O1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25OZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlci5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wdWJsaWMgZmFpbChlKSB7XG4gICAgICAgIC8vICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgIC8vICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAvLyAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgLy8gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2VIYW5kbGVyKGRpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbil7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlciA9IGRpc3Bvc2VIYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEFub255bW91c09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQXV0b0RldGFjaE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBpZih0aGlzLmlzRGlzcG9zZWQpe1xuICAgICAgICAgICAgICAgIGR5Q2IuTG9nLmxvZyhcIm9ubHkgY2FuIGRpc3Bvc2Ugb25jZVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBjbGFzcyBNYXBPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHNlbGVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zZWxlY3RvcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2VsZWN0b3IodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIubmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBEb09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfcHJldk9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgcHJldk9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyID0gcHJldk9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgTWVyZ2VBbGxPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHN0cmVhbUdyb3VwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBnZXQgY3VycmVudE9ic2VydmVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG4gICAgICAgIHNldCBjdXJyZW50T2JzZXJ2ZXIoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9kb25lOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZ2V0IGRvbmUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kb25lO1xuICAgICAgICB9XG4gICAgICAgIHNldCBkb25lKGRvbmU6Ym9vbGVhbil7XG4gICAgICAgICAgICB0aGlzLl9kb25lID0gZG9uZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOmR5Q2IuQ29sbGVjdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAgPSBzdHJlYW1Hcm91cDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQoaW5uZXJTb3VyY2U6YW55KXtcbiAgICAgICAgICAgIGR5Q2IuTG9nLmVycm9yKCEoaW5uZXJTb3VyY2UgaW5zdGFuY2VvZiBTdHJlYW0gfHwgSnVkZ2VVdGlscy5pc1Byb21pc2UoaW5uZXJTb3VyY2UpKSwgZHlDYi5Mb2cuaW5mby5GVU5DX01VU1RfQkUoXCJpbm5lclNvdXJjZVwiLCBcIlN0cmVhbSBvciBQcm9taXNlXCIpKTtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc1Byb21pc2UoaW5uZXJTb3VyY2UpKXtcbiAgICAgICAgICAgICAgICBpbm5lclNvdXJjZSA9IGZyb21Qcm9taXNlKGlubmVyU291cmNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAuYWRkQ2hpbGQoaW5uZXJTb3VyY2UpO1xuXG4gICAgICAgICAgICBpbm5lclNvdXJjZS5idWlsZFN0cmVhbShJbm5lck9ic2VydmVyLmNyZWF0ZSh0aGlzLCB0aGlzLl9zdHJlYW1Hcm91cCwgaW5uZXJTb3VyY2UpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuX3N0cmVhbUdyb3VwLmdldENvdW50KCkgPT09IDApe1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsYXNzIElubmVyT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOmR5Q2IuQ29sbGVjdGlvbiwgY3VycmVudFN0cmVhbTpTdHJlYW0pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb24gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9jdXJyZW50U3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOmR5Q2IuQ29sbGVjdGlvbiwgY3VycmVudFN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RyZWFtID0gY3VycmVudFN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB2YXIgY3VycmVudFN0cmVhbSA9IHRoaXMuX2N1cnJlbnRTdHJlYW0sXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5fcGFyZW50O1xuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cC5yZW1vdmVDaGlsZChmdW5jdGlvbihzdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKHN0cmVhbSwgY3VycmVudFN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9pZiB0aGlzIGlubmVyU291cmNlIGlzIGFzeW5jIHN0cmVhbShhcyBwcm9taXNlIHN0cmVhbSksXG4gICAgICAgICAgICAvL2l0IHdpbGwgZmlyc3QgZXhlYyBhbGwgcGFyZW50Lm5leHQgYW5kIG9uZSBwYXJlbnQuY29tcGxldGVkLFxuICAgICAgICAgICAgLy90aGVuIGV4ZWMgYWxsIHRoaXMubmV4dCBhbmQgYWxsIHRoaXMuY29tcGxldGVkXG4gICAgICAgICAgICAvL3NvIGluIHRoaXMgY2FzZSwgaXQgc2hvdWxkIGludm9rZSBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCBhZnRlciB0aGUgbGFzdCBpbnZva2NhdGlvbiBvZiB0aGlzLmNvbXBsZXRlZChoYXZlIGludm9rZWQgYWxsIHRoZSBpbm5lclNvdXJjZSlcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzQXN5bmMoKSAmJiB0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNBc3luYygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudC5kb25lO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQmFzZVN0cmVhbSBleHRlbmRzIFN0cmVhbXtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/LCBvbkNvbXBsZXRlZD8pOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuaGFuZGxlU3ViamVjdChhcmcxKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gYXJnMVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgLy90b2RvIGVuY2Fwc3VsYXRlIGl0IHRvIHNjaGVkdWxlSXRlbVxuICAgICAgICAgICAgLy90b2RvIGRlbGV0ZSB0YXJnZXQ/XG4gICAgICAgICAgICAvL3RoaXMuc2NoZWR1bGVyLnRhcmdldCA9IG9ic2VydmVyO1xuXG4gICAgICAgICAgICAvL2R5Q2IuTG9nLmVycm9yKHRoaXMuX2hhc011bHRpT2JzZXJ2ZXJzKCksIFwic2hvdWxkIHVzZSBTdWJqZWN0IHRvIGhhbmRsZSBtdWx0aSBvYnNlcnZlcnNcIik7XG4gICAgICAgICAgICB0aGlzLmJ1aWxkU3RyZWFtKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICBzdXBlci5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlQ29yZShvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgX2hhc011bHRpT2JzZXJ2ZXJzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLnNjaGVkdWxlci5nZXRPYnNlcnZlcnMoKSA+IDE7XG4gICAgICAgIC8vfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRG9TdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgb25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBBbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oRG9PYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX29ic2VydmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1hcFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc2VsZWN0b3I6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIHNlbGVjdG9yOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgICAgIC8vdGhpcy5zY2hlZHVsZXIuYWRkV3JhcFRhcmdldChNYXBPYnNlcnZlci5jcmVhdGUoc2VsZWN0b3IpKTtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShNYXBPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX3NlbGVjdG9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9wdWJsaWMgc3Vic2NyaWJlKGFyZzE6RnVuY3Rpb258T2JzZXJ2ZXJ8U3ViamVjdCwgb25FcnJvcj8sIG9uQ29tcGxldGVkPyk6SURpc3Bvc2FibGUge1xuICAgICAgICAvLyAgICByZXR1cm4gdGhpcy5fc291cmNlLnN1YnNjcmliZS5hcHBseSh0aGlzLl9zb3VyY2UsIGFyZ3VtZW50cyk7XG4gICAgICAgIC8vfVxuICAgICAgICAvL1xuICAgICAgICAvL3B1YmxpYyBzdWJzY3JpYmVDb3JlKCl7XG4gICAgICAgIC8vICAgIGlmKHRoaXMuX3NvdXJjZSBpbnN0YW5jZW9mIEJhc2VTdHJlYW0pe1xuICAgICAgICAvLyAgICAgICAgbGV0IGJhc2VTdHJlYW0gPSA8QmFzZVN0cmVhbT50aGlzLl9zb3VyY2U7XG4gICAgICAgIC8vICAgICAgICBiYXNlU3RyZWFtLnN1YnNjcmliZUNvcmUoKTtcbiAgICAgICAgLy8gICAgfVxuICAgICAgICAvL31cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tQXJyYXlTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShhcnJheTpbYW55XSwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGFycmF5LCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYXJyYXk6W2FueV0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGFycmF5OlthbnldLCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9hcnJheSA9IGFycmF5O1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGFycmF5ID0gdGhpcy5fYXJyYXksXG4gICAgICAgICAgICAgICAgbGVuID0gYXJyYXkubGVuZ3RoO1xuXG4gICAgICAgICAgICAvL25leHQsY29tcGxldGVkIGlzIGZvciBUZXN0U2NoZWR1bGVyIHRvIGluamVjdFxuICAgICAgICAgICAgLy90b2RvIHJlbW92ZSBpbmplY3QgbmV4dCxjb21wbGV0ZWQ/XG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGksIG5leHQsIGNvbXBsZXRlZCkge1xuICAgICAgICAgICAgICAgIGlmIChpIDwgbGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5leHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dChhcnJheVtpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoYXJyYXlbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50cy5jYWxsZWUoaSArIDEsIG5leHQsIGNvbXBsZXRlZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoY29tcGxldGVkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlciwgMCwgbG9vcFJlY3Vyc2l2ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tUHJvbWlzZVN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHByb21pc2U6YW55LCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKHByb21pc2UsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcHJvbWlzZTphbnkgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByb21pc2U6YW55LCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdG9kbyByZW1vdmUgdGVzdCBsb2dpYyBmcm9tIHByb2R1Y3QgbG9naWMoYXMgU2NoZWR1bGVyLT5wdWJsaWN4eHgsIEZyb21Qcm9taXNlLT50aGVuLi4uKVxuICAgICAgICAgICAgdGhpcy5fcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChkYXRhKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSwgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc3Vic2NyaWJlRnVuYyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihzdWJzY3JpYmVGdW5jKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuaGFuZGxlU3ViamVjdChhcmd1bWVudHNbMF0pKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyID0gQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZShvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIodGhpcy5kaXNwb3NlSGFuZGxlcik7XG5cbiAgICAgICAgICAgIC8vdG9kbyBlbmNhcHN1bGF0ZSBpdCB0byBzY2hlZHVsZUl0ZW1cbiAgICAgICAgICAgIC8vdGhpcy5zY2hlZHVsZXIudGFyZ2V0ID0gb2JzZXJ2ZXI7XG5cbiAgICAgICAgICAgIHRoaXMuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBJbnRlcnZhbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGludGVydmFsOm51bWJlciwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGludGVydmFsLCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICBvYmouaW5pdFdoZW5DcmVhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2ludGVydmFsOm51bWJlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoaW50ZXJ2YWw6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgaW5pdFdoZW5DcmVhdGUoKXtcbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gdGhpcy5faW50ZXJ2YWwgPD0gMCA/IDEgOiB0aGlzLl9pbnRlcnZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaWQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZCA9IHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbChvYnNlcnZlciwgMCwgdGhpcy5faW50ZXJ2YWwsIGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgICAgICAgICAgICAgLy9zZWxmLnNjaGVkdWxlci5uZXh0KGNvdW50KTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGNvdW50KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudCArIDE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5hZGREaXNwb3NlSGFuZGxlcihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHJvb3QuY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlQWxsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIC8vdGhpcy5fb2JzZXJ2ZXIgPSBBbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc3RyZWFtR3JvdXAgPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShNZXJnZUFsbE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgc3RyZWFtR3JvdXApKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgdmFyIGNyZWF0ZVN0cmVhbSA9IGZ1bmN0aW9uKHN1YnNjcmliZUZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIEFub255bW91c1N0cmVhbS5jcmVhdGUoc3Vic2NyaWJlRnVuYyk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbUFycmF5ID0gZnVuY3Rpb24oYXJyYXk6W2FueV0sIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSl7XG4gICAgICAgIHJldHVybiBGcm9tQXJyYXlTdHJlYW0uY3JlYXRlKGFycmF5LCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21Qcm9taXNlID0gZnVuY3Rpb24ocHJvbWlzZTphbnksIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSl7XG4gICAgICAgIHJldHVybiBuZXcgRnJvbVByb21pc2VTdHJlYW0ocHJvbWlzZSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBpbnRlcnZhbCA9IGZ1bmN0aW9uIChpbnRlcnZhbCwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSB7XG4gICAgICAgIHJldHVybiBJbnRlcnZhbFN0cmVhbS5jcmVhdGUoaW50ZXJ2YWwsIHNjaGVkdWxlcik7XG4gICAgfTtcbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgdmFyIGRlZmF1bHRJc0VxdWFsID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgfTtcblxuICAgIGV4cG9ydCBjbGFzcyBSZWNvcmQge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSh0aW1lOm51bWJlciwgdmFsdWU6YW55LCBhY3Rpb25UeXBlPzpBY3Rpb25UeXBlLCBjb21wYXJlcj86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyh0aW1lLCB2YWx1ZSwgYWN0aW9uVHlwZSwgY29tcGFyZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdGltZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBnZXQgdGltZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHRpbWUodGltZTpudW1iZXIpe1xuICAgICAgICAgICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF92YWx1ZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBnZXQgdmFsdWUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdmFsdWUodmFsdWU6bnVtYmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hY3Rpb25UeXBlOkFjdGlvblR5cGUgPSBudWxsO1xuICAgICAgICBnZXQgYWN0aW9uVHlwZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGlvblR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGFjdGlvblR5cGUoYWN0aW9uVHlwZTpBY3Rpb25UeXBlKXtcbiAgICAgICAgICAgIHRoaXMuX2FjdGlvblR5cGUgPSBhY3Rpb25UeXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY29tcGFyZXI6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHRpbWUsIHZhbHVlLCBhY3Rpb25UeXBlOkFjdGlvblR5cGUsIGNvbXBhcmVyOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9hY3Rpb25UeXBlID0gYWN0aW9uVHlwZTtcbiAgICAgICAgICAgIHRoaXMuX2NvbXBhcmVyID0gY29tcGFyZXIgfHwgZGVmYXVsdElzRXF1YWw7XG4gICAgICAgIH1cblxuICAgICAgICBlcXVhbHMob3RoZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90aW1lID09PSBvdGhlci50aW1lICYmIHRoaXMuX2NvbXBhcmVyKHRoaXMuX3ZhbHVlLCBvdGhlci52YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBNb2NrT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSA8W1JlY29yZF0+W107XG4gICAgICAgIGdldCBtZXNzYWdlcygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICAgICAgICB9XG4gICAgICAgIHNldCBtZXNzYWdlcyhtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIHZhbHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCBlcnJvcikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCBudWxsKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgTW9ja1Byb21pc2V7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyLCBtZXNzYWdlczpbUmVjb3JkXSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlciwgbWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSA8W1JlY29yZF0+W107XG4gICAgICAgIC8vZ2V0IG1lc3NhZ2VzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgICAgICAgLy99XG4gICAgICAgIC8vc2V0IG1lc3NhZ2VzKG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgLy8gICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHJpdmF0ZSBfc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRoZW4oc3VjY2Vzc0NiOkZ1bmN0aW9uLCBlcnJvckNiOkZ1bmN0aW9uLCBvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgc2NoZWR1bGVyID0gPFRlc3RTY2hlZHVsZXI+KHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgY29uc3QgU1VCU0NSSUJFX1RJTUUgPSAyMDA7XG4gICAgY29uc3QgRElTUE9TRV9USU1FID0gMTAwMDtcblxuICAgIGV4cG9ydCBjbGFzcyBUZXN0U2NoZWR1bGVyIGV4dGVuZHMgU2NoZWR1bGVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBuZXh0KHRpY2ssIHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCB2YWx1ZSwgQWN0aW9uVHlwZS5ORVhUKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZXJyb3IodGljaywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIGVycm9yLCBBY3Rpb25UeXBlLkVSUk9SKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY29tcGxldGVkKHRpY2spIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIG51bGwsIEFjdGlvblR5cGUuQ09NUExFVEVEKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jbG9jazpudW1iZXIgPSBudWxsO1xuICAgICAgICBnZXQgY2xvY2soKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBzZXQgY2xvY2soY2xvY2s6bnVtYmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9jbG9jayA9IGNsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaW5pdGlhbENsb2NrOm51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwcml2YXRlIF90aW1lck1hcDpkeUNiLkhhc2ggPSBkeUNiLkhhc2guY3JlYXRlKCk7XG4gICAgICAgIHByaXZhdGUgX3N0cmVhbU1hcDpkeUNiLkhhc2ggPSBkeUNiLkhhc2guY3JlYXRlKCk7XG4gICAgICAgIHByaXZhdGUgX3N1YnNjcmliZWRUaW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VkVGltZTpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzZXRTdHJlYW1NYXAob2JzZXJ2ZXI6SU9ic2VydmVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24ocmVjb3JkOlJlY29yZCl7XG4gICAgICAgICAgICAgICAgdmFyIGZ1bmMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZWNvcmQuYWN0aW9uVHlwZSl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5ORVhUOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuRVJST1I6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBkeUNiLkxvZy5lcnJvcih0cnVlLCBkeUNiLkxvZy5pbmZvLkZVTkNfVU5LTk9XKFwiYWN0aW9uVHlwZVwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9zdHJlYW1NYXAuYWRkQ2hpbGQoU3RyaW5nKHJlY29yZC50aW1lKSwgZnVuYyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgcmVjdXJzaXZlRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHJlY3Vyc2l2ZUZ1bmMoaW5pdGlhbCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fdGljaygxKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dChzZWxmLl9jbG9jaywgdmFsdWUpKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5jb21wbGV0ZWQoc2VsZi5fY2xvY2spKTtcbiAgICAgICAgICAgICAgICBzZWxmLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCBpbnRlcnZhbDpudW1iZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTA7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgd2hpbGUgKENPVU5UID4gMCAmJiAhdGhpcy5faXNEaXNwb3NlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RpY2soaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5uZXh0KHRoaXMuX2Nsb2NrLCBpbml0aWFsKSk7XG5cbiAgICAgICAgICAgICAgICAvL25vIG5lZWQgdG8gaW52b2tlIGFjdGlvblxuICAgICAgICAgICAgICAgIC8vYWN0aW9uKGluaXRpYWwpO1xuXG4gICAgICAgICAgICAgICAgaW5pdGlhbCsrO1xuICAgICAgICAgICAgICAgIENPVU5ULS07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0Q2xvY2soKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2luaXRpYWxDbG9jayl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSAgTWF0aC5taW4odGhpcy5fY2xvY2ssIHRoaXMuX2luaXRpYWxDbG9jayk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2luaXRpYWxDbG9jayA9IHRoaXMuX2Nsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aFRpbWUoY3JlYXRlOkZ1bmN0aW9uLCBzdWJzY3JpYmVkVGltZTpudW1iZXIsIGRpc3Bvc2VkVGltZTpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IHRoaXMuY3JlYXRlT2JzZXJ2ZXIoKSxcbiAgICAgICAgICAgICAgICBzb3VyY2UsIHN1YnNjcmlwdGlvbjtcblxuICAgICAgICAgICAgdGhpcy5fc3Vic2NyaWJlZFRpbWUgPSBzdWJzY3JpYmVkVGltZTtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VkVGltZSA9IGRpc3Bvc2VkVGltZTtcblxuICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSBzdWJzY3JpYmVkVGltZTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl9ydW5BdChzdWJzY3JpYmVkVGltZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNvdXJjZSA9IGNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KGRpc3Bvc2VkVGltZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoU3Vic2NyaWJlKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUgPSBTVUJTQ1JJQkVfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIHN1YnNjcmliZWRUaW1lLCBESVNQT1NFX1RJTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aERpc3Bvc2UoY3JlYXRlLCBkaXNwb3NlZFRpbWUgPSBESVNQT1NFX1RJTUUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0V2l0aFRpbWUoY3JlYXRlLCBTVUJTQ1JJQkVfVElNRSwgZGlzcG9zZWRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaWNBYnNvbHV0ZSh0aW1lLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9ydW5BdCh0aW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgICAgICB2YXIgZXh0cmVtZU51bUFyciA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKSxcbiAgICAgICAgICAgICAgICBtaW4gPSBleHRyZW1lTnVtQXJyWzBdLFxuICAgICAgICAgICAgICAgIG1heCA9IGV4dHJlbWVOdW1BcnJbMV0sXG4gICAgICAgICAgICAgICAgdGltZSA9IG1pbjtcblxuICAgICAgICAgICAgLy90b2RvIHJlZHVjZSBsb29wIHRpbWVcbiAgICAgICAgICAgIHdoaWxlICh0aW1lIDw9IG1heCkge1xuICAgICAgICAgICAgICAgIC8vYmVjYXVzZSBcIl9leGVjLF9ydW5TdHJlYW1cIiBtYXkgY2hhbmdlIFwiX2Nsb2NrXCIsXG4gICAgICAgICAgICAgICAgLy9zbyBpdCBzaG91bGQgcmVzZXQgdGhlIF9jbG9ja1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aW1lO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fZXhlYyh0aW1lLCB0aGlzLl90aW1lck1hcCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9jayA9IHRpbWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ydW5TdHJlYW0odGltZSk7XG5cbiAgICAgICAgICAgICAgICB0aW1lKys7XG5cbiAgICAgICAgICAgICAgICAvL3RvZG8gZ2V0IG1heCB0aW1lIG9ubHkgZnJvbSBzdHJlYW1NYXA/XG4gICAgICAgICAgICAgICAgLy9uZWVkIHJlZnJlc2ggbWF4IHRpbWUuXG4gICAgICAgICAgICAgICAgLy9iZWNhdXNlIGlmIHRpbWVyTWFwIGhhcyBjYWxsYmFjayB0aGF0IGNyZWF0ZSBpbmZpbml0ZSBzdHJlYW0oYXMgaW50ZXJ2YWwpLFxuICAgICAgICAgICAgICAgIC8vaXQgd2lsbCBzZXQgc3RyZWFtTWFwIHNvIHRoYXQgdGhlIG1heCB0aW1lIHdpbGwgY2hhbmdlXG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5fZ2V0TWluQW5kTWF4VGltZSgpWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVN0cmVhbShhcmdzKXtcbiAgICAgICAgICAgIHJldHVybiBUZXN0U3RyZWFtLmNyZWF0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVPYnNlcnZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBNb2NrT2JzZXJ2ZXIuY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVJlc29sdmVkUHJvbWlzZSh0aW1lOm51bWJlciwgdmFsdWU6YW55KXtcbiAgICAgICAgICAgIHJldHVybiBNb2NrUHJvbWlzZS5jcmVhdGUodGhpcywgW1Rlc3RTY2hlZHVsZXIubmV4dCh0aW1lLCB2YWx1ZSksIFRlc3RTY2hlZHVsZXIuY29tcGxldGVkKHRpbWUrMSldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVSZWplY3RQcm9taXNlKHRpbWU6bnVtYmVyLCBlcnJvcjphbnkpe1xuICAgICAgICAgICAgcmV0dXJuIE1vY2tQcm9taXNlLmNyZWF0ZSh0aGlzLCBbVGVzdFNjaGVkdWxlci5lcnJvcih0aW1lLCBlcnJvcildKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2dldE1pbkFuZE1heFRpbWUoKXtcbiAgICAgICAgICAgIHZhciB0aW1lQXJyID0gdGhpcy5fdGltZXJNYXAuZ2V0S2V5cygpLmFkZENoaWxkcyh0aGlzLl9zdHJlYW1NYXAuZ2V0S2V5cygpKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlcihrZXkpO1xuICAgICAgICAgICAgICAgIH0pLnRvQXJyYXkoKTtcblxuICAgICAgICAgICAgcmV0dXJuIFtNYXRoLm1pbi5hcHBseShNYXRoLCB0aW1lQXJyKSwgTWF0aC5tYXguYXBwbHkoTWF0aCwgdGltZUFycildO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZXhlYyh0aW1lLCBtYXApe1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBtYXAuZ2V0Q2hpbGQoU3RyaW5nKHRpbWUpKTtcblxuICAgICAgICAgICAgaWYoaGFuZGxlcil7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcnVuU3RyZWFtKHRpbWUpe1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9zdHJlYW1NYXAuZ2V0Q2hpbGQoU3RyaW5nKHRpbWUpKTtcblxuICAgICAgICAgICAgLy9pZihoYW5kbGVyICYmIHRoaXMuX2hhc09ic2VydmVyKCkpe1xuICAgICAgICAgICAgaWYoaGFuZGxlcil7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIF9oYXNPYnNlcnZlcigpe1xuICAgICAgICAvLyAgICBpZih0aGlzLnRhcmdldCBpbnN0YW5jZW9mIFN1YmplY3Qpe1xuICAgICAgICAvLyAgICAgICAgbGV0IHN1YmplY3QgPSA8U3ViamVjdD50aGlzLnRhcmdldDtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICByZXR1cm4gc3ViamVjdC5nZXRPYnNlcnZlcnMoKSA+IDBcbiAgICAgICAgLy8gICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICByZXR1cm4gISF0aGlzLnRhcmdldDtcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHJpdmF0ZSBfcnVuQXQodGltZTpudW1iZXIsIGNhbGxiYWNrOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lck1hcC5hZGRDaGlsZChTdHJpbmcodGltZSksIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3RpY2sodGltZTpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrICs9IHRpbWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuIiwibW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBlbnVtIEFjdGlvblR5cGV7XG4gICAgICAgIE5FWFQsXG4gICAgICAgIEVSUk9SLFxuICAgICAgICBDT01QTEVURURcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFtIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMobWVzc2FnZXMsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdmFyIHNjaGVkdWxlciA9IDxUZXN0U2NoZWR1bGVyPih0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGNsYXNzIEp1ZGdlVXRpbHMgZXh0ZW5kcyBkeUNiLkp1ZGdlVXRpbHMge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGlzUHJvbWlzZShvYmope1xuICAgICAgICAgICAgcmV0dXJuICEhb2JqXG4gICAgICAgICAgICAgICAgJiYgIXN1cGVyLmlzRnVuY3Rpb24ob2JqLnN1YnNjcmliZSlcbiAgICAgICAgICAgICAgICAmJiBzdXBlci5pc0Z1bmN0aW9uKG9iai50aGVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNFcXVhbChvYjE6RW50aXR5LCBvYjI6RW50aXR5KXtcbiAgICAgICAgICAgIHJldHVybiBvYjEudWlkID09PSBvYjIudWlkO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9