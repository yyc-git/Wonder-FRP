

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
        Stream.prototype.takeUntil = function (otherStream) {
            return dyRt.TakeUntilStream.create(this, otherStream);
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
            this._observers.removeAllChildren();
        };
        return Subject;
    })();
    dyRt.Subject = Subject;
})(dyRt || (dyRt = {}));

/// <reference path="../definitions.d.ts"/>
var dyRt;
(function (dyRt) {
    dyRt.root.requestNextAnimationFrame = (function () {
        var originalRequestAnimationFrame = undefined, wrapper = undefined, callback = undefined, geckoVersion = null, userAgent = navigator.userAgent, index = 0, self = this;
        wrapper = function (time) {
            time = +new Date();
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
        //            return  root.requestAnimationFrame ||  //传递给callback的time不是从1970年1月1日到当前所经过的毫秒数！
        return dyRt.root.webkitRequestAnimationFrame ||
            dyRt.root.mozRequestAnimationFrame ||
            dyRt.root.oRequestAnimationFrame ||
            dyRt.root.msRequestAnimationFrame ||
            function (callback, element) {
                var start, finish;
                dyRt.root.setTimeout(function () {
                    start = +new Date();
                    callback(start);
                    finish = +new Date();
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
        Scheduler.create = function () {
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
        //observer is for TestScheduler to inject
        //todo remove observer
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

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../definitions.d.ts"/>
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
        TakeUntilStream.prototype.buildStream = function (observer) {
            this._source.buildStream(observer);
            this._otherStream.buildStream(dyRt.TakeUntilObserver.create(observer));
        };
        return TakeUntilStream;
    })(dyRt.BaseStream);
    dyRt.TakeUntilStream = TakeUntilStream;
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
            var self = this, messages = [];
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

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../definitions.d.ts"/>
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpc3Bvc2FibGUvSURpc3Bvc2FibGUudHMiLCJvYnNlcnZlci9JT2JzZXJ2ZXIudHMiLCJnbG9iYWwvVmFyaWFibGUudHMiLCJnbG9iYWwvQ29uc3QudHMiLCJEaXNwb3NhYmxlL0lubmVyU3Vic2NyaXB0aW9uLnRzIiwiY29yZS9FbnRpdHkudHMiLCJjb3JlL1N0cmVhbS50cyIsImNvcmUvU3ViamVjdC50cyIsImNvcmUvU2NoZWR1bGVyLnRzIiwiY29yZS9PYnNlcnZlci50cyIsIm9ic2VydmVyL0Fub255bW91c09ic2VydmVyLnRzIiwib2JzZXJ2ZXIvQXV0b0RldGFjaE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvTWFwT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9Eb09ic2VydmVyLnRzIiwib2JzZXJ2ZXIvTWVyZ2VBbGxPYnNlcnZlci50cyIsIm9ic2VydmVyL1Rha2VVbnRpbE9ic2VydmVyLnRzIiwic3RyZWFtL0Jhc2VTdHJlYW0udHMiLCJzdHJlYW0vRG9TdHJlYW0udHMiLCJzdHJlYW0vTWFwU3RyZWFtLnRzIiwic3RyZWFtL0Zyb21BcnJheVN0cmVhbS50cyIsInN0cmVhbS9Gcm9tUHJvbWlzZVN0cmVhbS50cyIsInN0cmVhbS9Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLnRzIiwic3RyZWFtL0Fub255bW91c1N0cmVhbS50cyIsInN0cmVhbS9JbnRlcnZhbFN0cmVhbS50cyIsInN0cmVhbS9NZXJnZUFsbFN0cmVhbS50cyIsInN0cmVhbS9UYWtlVW50aWxTdHJlYW0udHMiLCJnbG9iYWwvT3BlcmF0b3IudHMiLCJ0ZXN0aW5nL1JlY29yZC50cyIsInRlc3RpbmcvTW9ja09ic2VydmVyLnRzIiwidGVzdGluZy9Nb2NrUHJvbWlzZS50cyIsInRlc3RpbmcvVGVzdFNjaGVkdWxlci50cyIsInRlc3RpbmcvQWN0aW9uVHlwZS50cyIsInRlc3RpbmcvVGVzdFN0cmVhbS50cyIsIkp1ZGdlVXRpbHMudHMiLCJzdHJlYW0vSW50ZXJ2YWxRdWVzdFN0cmVhbS50cyJdLCJuYW1lcyI6WyJkeVJ0IiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbiIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb24uY29uc3RydWN0b3IiLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uLmNyZWF0ZSIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb24uZGlzcG9zZSIsImR5UnQuRW50aXR5IiwiZHlSdC5FbnRpdHkuY29uc3RydWN0b3IiLCJkeVJ0LkVudGl0eS51aWQiLCJkeVJ0LlN0cmVhbSIsImR5UnQuU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5TdHJlYW0uZGlzcG9zZUhhbmRsZXIiLCJkeVJ0LlN0cmVhbS5zdWJzY3JpYmUiLCJkeVJ0LlN0cmVhbS5idWlsZFN0cmVhbSIsImR5UnQuU3RyZWFtLmFkZERpc3Bvc2VIYW5kbGVyIiwiZHlSdC5TdHJlYW0uaGFuZGxlU3ViamVjdCIsImR5UnQuU3RyZWFtLmRvIiwiZHlSdC5TdHJlYW0ubWFwIiwiZHlSdC5TdHJlYW0uZmxhdE1hcCIsImR5UnQuU3RyZWFtLm1lcmdlQWxsIiwiZHlSdC5TdHJlYW0udGFrZVVudGlsIiwiZHlSdC5TdHJlYW0uX2lzU3ViamVjdCIsImR5UnQuU3RyZWFtLl9zZXRTdWJqZWN0IiwiZHlSdC5TdWJqZWN0IiwiZHlSdC5TdWJqZWN0LmNvbnN0cnVjdG9yIiwiZHlSdC5TdWJqZWN0LmNyZWF0ZSIsImR5UnQuU3ViamVjdC5zb3VyY2UiLCJkeVJ0LlN1YmplY3Quc3Vic2NyaWJlIiwiZHlSdC5TdWJqZWN0Lm5leHQiLCJkeVJ0LlN1YmplY3QuZXJyb3IiLCJkeVJ0LlN1YmplY3QuY29tcGxldGVkIiwiZHlSdC5TdWJqZWN0LnN0YXJ0IiwiZHlSdC5TdWJqZWN0LnJlbW92ZSIsImR5UnQuU3ViamVjdC5kaXNwb3NlIiwiZHlSdC5TY2hlZHVsZXIiLCJkeVJ0LlNjaGVkdWxlci5jb25zdHJ1Y3RvciIsImR5UnQuU2NoZWR1bGVyLmNyZWF0ZSIsImR5UnQuU2NoZWR1bGVyLnJlcXVlc3RMb29wSWQiLCJkeVJ0LlNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlIiwiZHlSdC5TY2hlZHVsZXIucHVibGlzaEludGVydmFsIiwiZHlSdC5TY2hlZHVsZXIucHVibGlzaEludGVydmFsUmVxdWVzdCIsImR5UnQuT2JzZXJ2ZXIiLCJkeVJ0Lk9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5PYnNlcnZlci5pc0Rpc3Bvc2VkIiwiZHlSdC5PYnNlcnZlci5uZXh0IiwiZHlSdC5PYnNlcnZlci5lcnJvciIsImR5UnQuT2JzZXJ2ZXIuY29tcGxldGVkIiwiZHlSdC5PYnNlcnZlci5kaXNwb3NlIiwiZHlSdC5PYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlciIsImR5UnQuT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5PYnNlcnZlci5vbkVycm9yIiwiZHlSdC5PYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIiLCJkeVJ0LkFub255bW91c09ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5Bbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUiLCJkeVJ0LkFub255bW91c09ic2VydmVyLm9uTmV4dCIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlciIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIuZGlzcG9zZSIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLm9uTmV4dCIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuTWFwT2JzZXJ2ZXIiLCJkeVJ0Lk1hcE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5NYXBPYnNlcnZlci5jcmVhdGUiLCJkeVJ0Lk1hcE9ic2VydmVyLm9uTmV4dCIsImR5UnQuTWFwT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuTWFwT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LkRvT2JzZXJ2ZXIiLCJkeVJ0LkRvT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LkRvT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Eb09ic2VydmVyLm9uTmV4dCIsImR5UnQuRG9PYnNlcnZlci5vbkVycm9yIiwiZHlSdC5Eb09ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLmNyZWF0ZSIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5jdXJyZW50T2JzZXJ2ZXIiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIuZG9uZSIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5vbk5leHQiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuSW5uZXJPYnNlcnZlciIsImR5UnQuSW5uZXJPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuSW5uZXJPYnNlcnZlci5jcmVhdGUiLCJkeVJ0LklubmVyT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5Jbm5lck9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LklubmVyT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LklubmVyT2JzZXJ2ZXIuX2lzQXN5bmMiLCJkeVJ0LlRha2VVbnRpbE9ic2VydmVyIiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuVGFrZVVudGlsT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlci5vbk5leHQiLCJkeVJ0LlRha2VVbnRpbE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LlRha2VVbnRpbE9ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5CYXNlU3RyZWFtIiwiZHlSdC5CYXNlU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5CYXNlU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkJhc2VTdHJlYW0uc3Vic2NyaWJlIiwiZHlSdC5CYXNlU3RyZWFtLmJ1aWxkU3RyZWFtIiwiZHlSdC5Eb1N0cmVhbSIsImR5UnQuRG9TdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkRvU3RyZWFtLmNyZWF0ZSIsImR5UnQuRG9TdHJlYW0uYnVpbGRTdHJlYW0iLCJkeVJ0Lk1hcFN0cmVhbSIsImR5UnQuTWFwU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5NYXBTdHJlYW0uY3JlYXRlIiwiZHlSdC5NYXBTdHJlYW0uYnVpbGRTdHJlYW0iLCJkeVJ0LkZyb21BcnJheVN0cmVhbSIsImR5UnQuRnJvbUFycmF5U3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Gcm9tQXJyYXlTdHJlYW0uY3JlYXRlIiwiZHlSdC5Gcm9tQXJyYXlTdHJlYW0uc3Vic2NyaWJlQ29yZSIsImR5UnQuRnJvbUFycmF5U3RyZWFtLnN1YnNjcmliZUNvcmUubG9vcFJlY3Vyc2l2ZSIsImR5UnQuRnJvbVByb21pc2VTdHJlYW0iLCJkeVJ0LkZyb21Qcm9taXNlU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Gcm9tUHJvbWlzZVN0cmVhbS5jcmVhdGUiLCJkeVJ0LkZyb21Qcm9taXNlU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0iLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0uY3JlYXRlIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkZyb21FdmVudFBhdHRlcm5TdHJlYW0uc3Vic2NyaWJlQ29yZS5pbm5lckhhbmRsZXIiLCJkeVJ0LkFub255bW91c1N0cmVhbSIsImR5UnQuQW5vbnltb3VzU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Bbm9ueW1vdXNTdHJlYW0uY3JlYXRlIiwiZHlSdC5Bbm9ueW1vdXNTdHJlYW0uc3Vic2NyaWJlIiwiZHlSdC5JbnRlcnZhbFN0cmVhbSIsImR5UnQuSW50ZXJ2YWxTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LkludGVydmFsU3RyZWFtLmNyZWF0ZSIsImR5UnQuSW50ZXJ2YWxTdHJlYW0uaW5pdFdoZW5DcmVhdGUiLCJkeVJ0LkludGVydmFsU3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0Lk1lcmdlQWxsU3RyZWFtIiwiZHlSdC5NZXJnZUFsbFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuTWVyZ2VBbGxTdHJlYW0uY3JlYXRlIiwiZHlSdC5NZXJnZUFsbFN0cmVhbS5idWlsZFN0cmVhbSIsImR5UnQuVGFrZVVudGlsU3RyZWFtIiwiZHlSdC5UYWtlVW50aWxTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LlRha2VVbnRpbFN0cmVhbS5jcmVhdGUiLCJkeVJ0LlRha2VVbnRpbFN0cmVhbS5idWlsZFN0cmVhbSIsImR5UnQuUmVjb3JkIiwiZHlSdC5SZWNvcmQuY29uc3RydWN0b3IiLCJkeVJ0LlJlY29yZC5jcmVhdGUiLCJkeVJ0LlJlY29yZC50aW1lIiwiZHlSdC5SZWNvcmQudmFsdWUiLCJkeVJ0LlJlY29yZC5hY3Rpb25UeXBlIiwiZHlSdC5SZWNvcmQuZXF1YWxzIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIiLCJkeVJ0Lk1vY2tPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuTW9ja09ic2VydmVyLmNyZWF0ZSIsImR5UnQuTW9ja09ic2VydmVyLm1lc3NhZ2VzIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5Nb2NrT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuTW9ja09ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIuZGlzcG9zZSIsImR5UnQuTW9ja1Byb21pc2UiLCJkeVJ0Lk1vY2tQcm9taXNlLmNvbnN0cnVjdG9yIiwiZHlSdC5Nb2NrUHJvbWlzZS5jcmVhdGUiLCJkeVJ0Lk1vY2tQcm9taXNlLnRoZW4iLCJkeVJ0LlRlc3RTY2hlZHVsZXIiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY29uc3RydWN0b3IiLCJkeVJ0LlRlc3RTY2hlZHVsZXIubmV4dCIsImR5UnQuVGVzdFNjaGVkdWxlci5lcnJvciIsImR5UnQuVGVzdFNjaGVkdWxlci5jb21wbGV0ZWQiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNsb2NrIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnNldFN0cmVhbU1hcCIsImR5UnQuVGVzdFNjaGVkdWxlci5yZW1vdmUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZSIsImR5UnQuVGVzdFNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWwiLCJkeVJ0LlRlc3RTY2hlZHVsZXIucHVibGlzaEludGVydmFsUmVxdWVzdCIsImR5UnQuVGVzdFNjaGVkdWxlci5fc2V0Q2xvY2siLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc3RhcnRXaXRoVGltZSIsImR5UnQuVGVzdFNjaGVkdWxlci5zdGFydFdpdGhTdWJzY3JpYmUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc3RhcnRXaXRoRGlzcG9zZSIsImR5UnQuVGVzdFNjaGVkdWxlci5wdWJsaWNBYnNvbHV0ZSIsImR5UnQuVGVzdFNjaGVkdWxlci5zdGFydCIsImR5UnQuVGVzdFNjaGVkdWxlci5jcmVhdGVTdHJlYW0iLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlT2JzZXJ2ZXIiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlUmVzb2x2ZWRQcm9taXNlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNyZWF0ZVJlamVjdFByb21pc2UiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX2dldE1pbkFuZE1heFRpbWUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX2V4ZWMiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX3J1blN0cmVhbSIsImR5UnQuVGVzdFNjaGVkdWxlci5fcnVuQXQiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX3RpY2siLCJkeVJ0LkFjdGlvblR5cGUiLCJkeVJ0LlRlc3RTdHJlYW0iLCJkeVJ0LlRlc3RTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LlRlc3RTdHJlYW0uY3JlYXRlIiwiZHlSdC5UZXN0U3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0Lkp1ZGdlVXRpbHMiLCJkeVJ0Lkp1ZGdlVXRpbHMuY29uc3RydWN0b3IiLCJkeVJ0Lkp1ZGdlVXRpbHMuaXNQcm9taXNlIiwiZHlSdC5KdWRnZVV0aWxzLmlzRXF1YWwiLCJkeVJ0LkludGVydmFsUmVxdWVzdFN0cmVhbSIsImR5UnQuSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5JbnRlcnZhbFJlcXVlc3RTdHJlYW0uY3JlYXRlIiwiZHlSdC5JbnRlcnZhbFJlcXVlc3RTdHJlYW0uc3Vic2NyaWJlQ29yZSJdLCJtYXBwaW5ncyI6IkFBSUM7O0FDSkQsQUFDQSwyQ0FEMkM7QUFPMUM7QUNQRCxJQUFPLElBQUksQ0FFVjtBQUZELFdBQU8sSUFBSSxFQUFBLENBQUM7SUFDR0EsU0FBSUEsR0FBT0EsTUFBTUEsQ0FBQ0E7QUFDakNBLENBQUNBLEVBRk0sSUFBSSxLQUFKLElBQUksUUFFVjs7QUNGRCxJQUFPLElBQUksQ0FLVjtBQUxELFdBQU8sSUFBSSxFQUFBLENBQUM7SUFDR0Esb0JBQWVBLEdBQVlBO1FBQzlCLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQ3RELENBQUMsRUFDREEsdUJBQWtCQSxHQUFPQSxJQUFJQSxDQUFDQTtBQUN0Q0EsQ0FBQ0EsRUFMTSxJQUFJLEtBQUosSUFBSSxRQUtWOztBQ0xELDJDQUEyQztBQUMzQyxJQUFPLElBQUksQ0FzQlY7QUF0QkQsV0FBTyxJQUFJLEVBQUEsQ0FBQztJQUNYQTtRQVVDQywyQkFBWUEsT0FBZUEsRUFBRUEsUUFBaUJBO1lBSHRDQyxhQUFRQSxHQUFXQSxJQUFJQSxDQUFDQTtZQUN4QkEsY0FBU0EsR0FBWUEsSUFBSUEsQ0FBQ0E7WUFHakNBLElBQUlBLENBQUNBLFFB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QUlBLENBQUNBO1lBRWhCQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxzQkFBc0JBLENBQUNBLFFBQVFBLEVBQUVBLFVBQVNBLElBQUlBO2dCQUN6RCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQ0EsQ0FBQ0E7WUFFSEEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtnQkFDbkIsU0FBSSxDQUFDLCtCQUErQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFDQSxDQUFDQTtRQUNQQSxDQUFDQTtRQUNMSCw0QkFBQ0E7SUFBREEsQ0F4QkFwTSxBQXdCQ29NLEVBeEIwQ3BNLGVBQVVBLEVBd0JwREE7SUF4QllBLDBCQUFxQkEsd0JBd0JqQ0EsQ0FBQUE7QUFDTEEsQ0FBQ0EsRUExQk0sSUFBSSxLQUFKLElBQUksUUEwQlYiLCJmaWxlIjoiZHlSdC5kZWJ1Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgSURpc3Bvc2FibGV7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJT2JzZXJ2ZXIgZXh0ZW5kcyBJRGlzcG9zYWJsZXtcbiAgICAgICAgbmV4dCh2YWx1ZTphbnkpO1xuICAgICAgICBlcnJvcihlcnJvcjphbnkpO1xuICAgICAgICBjb21wbGV0ZWQoKTtcbiAgICB9XG59XG4iLCJtb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgdmFyIHJvb3Q6YW55ID0gd2luZG93O1xufVxuIiwibW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IHZhciBBQlNUUkFDVF9NRVRIT0Q6RnVuY3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihcImFic3RyYWN0IG1ldGhvZCBuZWVkIG92ZXJyaWRlXCIpO1xuICAgICAgICB9LFxuICAgICAgICBBQlNUUkFDVF9BVFRSSUJVVEU6YW55ID0gbnVsbDtcbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uIGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG5cdFx0cHVibGljIHN0YXRpYyBjcmVhdGUoc3ViamVjdDpTdWJqZWN0LCBvYnNlcnZlcjpPYnNlcnZlcikge1xuXHRcdFx0dmFyIG9iaiA9IG5ldyB0aGlzKHN1YmplY3QsIG9ic2VydmVyKTtcblxuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9XG5cblx0XHRwcml2YXRlIF9zdWJqZWN0OlN1YmplY3QgPSBudWxsO1xuXHRcdHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuXHRcdGNvbnN0cnVjdG9yKHN1YmplY3Q6U3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuXHRcdFx0dGhpcy5fc3ViamVjdCA9IHN1YmplY3Q7XG5cdFx0XHR0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9zdWJqZWN0LnJlbW92ZSh0aGlzLl9vYnNlcnZlcik7XG5cblx0XHRcdHRoaXMuX29ic2VydmVyLmRpc3Bvc2UoKTtcblx0XHR9XG5cdH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEVudGl0eXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBVSUQ6bnVtYmVyID0gMTtcblxuICAgICAgICBwcml2YXRlIF91aWQ6c3RyaW5nID0gbnVsbDtcbiAgICAgICAgZ2V0IHVpZCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3VpZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdWlkKHVpZDpzdHJpbmcpe1xuICAgICAgICAgICAgdGhpcy5fdWlkID0gdWlkO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IodWlkUHJlOnN0cmluZyl7XG4gICAgICAgICAgICB0aGlzLl91aWQgPSB1aWRQcmUgKyBTdHJpbmcoRW50aXR5LlVJRCsrKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIFN0cmVhbSBleHRlbmRzIEVudGl0eXtcbiAgICAgICAgcHVibGljIHNjaGVkdWxlcjpTY2hlZHVsZXIgPSBBQlNUUkFDVF9BVFRSSUJVVEU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9kaXNwb3NlSGFuZGxlcjpkeUNiLkNvbGxlY3Rpb24gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlKCk7XG4gICAgICAgIGdldCBkaXNwb3NlSGFuZGxlcigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyO1xuICAgICAgICB9XG4gICAgICAgIHNldCBkaXNwb3NlSGFuZGxlcihkaXNwb3NlSGFuZGxlcjpkeUNiLkNvbGxlY3Rpb24pe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIgPSBkaXNwb3NlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHN1YnNjcmliZUZ1bmMpe1xuICAgICAgICAgICAgc3VwZXIoXCJTdHJlYW1cIik7XG5cbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlRnVuYyA9IHN1YnNjcmliZUZ1bmMgfHwgZnVuY3Rpb24oKXsgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMTpGdW5jdGlvbnxPYnNlcnZlcnxTdWJqZWN0LCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKTpJRGlzcG9zYWJsZSB7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVGdW5jKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhZGREaXNwb3NlSGFuZGxlcihmdW5jOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyLmFkZENoaWxkKGZ1bmMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGhhbmRsZVN1YmplY3QoYXJnKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzU3ViamVjdChhcmcpKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRTdWJqZWN0KGFyZyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkbyhvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gRG9TdHJlYW0uY3JlYXRlKHRoaXMsIG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1hcChzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIE1hcFN0cmVhbS5jcmVhdGUodGhpcywgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGZsYXRNYXAoc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgLy9yZXR1cm4gRmxhdE1hcFN0cmVhbS5jcmVhdGUodGhpcywgc2VsZWN0b3IpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFwKHNlbGVjdG9yKS5tZXJnZUFsbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlQWxsKCl7XG4gICAgICAgICAgICByZXR1cm4gTWVyZ2VBbGxTdHJlYW0uY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRha2VVbnRpbChvdGhlclN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgcmV0dXJuIFRha2VVbnRpbFN0cmVhbS5jcmVhdGUodGhpcywgb3RoZXJTdHJlYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdWJqZWN0KHN1YmplY3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHN1YmplY3QgaW5zdGFuY2VvZiBTdWJqZWN0O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0U3ViamVjdChzdWJqZWN0KXtcbiAgICAgICAgICAgIHN1YmplY3Quc291cmNlID0gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIFN1YmplY3QgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgZ2V0IHNvdXJjZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgc291cmNlKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXJzOmR5Q2IuQ29sbGVjdGlvbiA9IGR5Q2IuQ29sbGVjdGlvbi5jcmVhdGUoKTtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE/OkZ1bmN0aW9ufE9ic2VydmVyLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gPEF1dG9EZXRhY2hPYnNlcnZlcj5hcmcxXG4gICAgICAgICAgICAgICAgOiBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxGdW5jdGlvbj5hcmcxLCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKHRoaXMuX3NvdXJjZS5kaXNwb3NlSGFuZGxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVycy5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBJbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUodGhpcywgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uKG9iOk9ic2VydmVyKXtcbiAgICAgICAgICAgICAgICBvYi5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbihvYjpPYnNlcnZlcil7XG4gICAgICAgICAgICAgICAgb2IuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbihvYjpPYnNlcnZlcil7XG4gICAgICAgICAgICAgICAgb2IuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZShvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMucmVtb3ZlQ2hpbGQoZnVuY3Rpb24ob2I6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgICAgIHJldHVybiBKdWRnZVV0aWxzLmlzRXF1YWwob2IsIG9ic2VydmVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uKG9iOk9ic2VydmVyKXtcbiAgICAgICAgICAgICAgICBvYi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXJzLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICB3cmFwcGVyID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgY2FsbGJhY2sgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBnZWNrb1ZlcnNpb24gPSBudWxsLFxuICAgICAgICAgICAgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHdyYXBwZXIgPSBmdW5jdGlvbiAodGltZSkge1xuICAgICAgICAgICAgdGltZSA9ICtuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgc2VsZi5jYWxsYmFjayh0aW1lKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKiFcbiAgICAgICAgIGJ1ZyFcbiAgICAgICAgIGJlbG93IGNvZGU6XG4gICAgICAgICB3aGVuIGludm9rZSBiIGFmdGVyIDFzLCB3aWxsIG9ubHkgaW52b2tlIGIsIG5vdCBpbnZva2UgYSFcblxuICAgICAgICAgZnVuY3Rpb24gYSh0aW1lKXtcbiAgICAgICAgIGNvbnNvbGUubG9nKFwiYVwiLCB0aW1lKTtcbiAgICAgICAgIHdlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZShhKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgZnVuY3Rpb24gYih0aW1lKXtcbiAgICAgICAgIGNvbnNvbGUubG9nKFwiYlwiLCB0aW1lKTtcbiAgICAgICAgIHdlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZShiKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgYSgpO1xuXG4gICAgICAgICBzZXRUaW1lb3V0KGIsIDEwMDApO1xuXG5cblxuICAgICAgICAgc28gdXNlIHJlcXVlc3RBbmltYXRpb25GcmFtZSBwcmlvcml0eSFcbiAgICAgICAgICovXG4gICAgICAgIGlmKHJvb3QucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBDaHJvbWUgMTAgYnVnIHdoZXJlIENocm9tZVxuICAgICAgICAvLyBkb2VzIG5vdCBwYXNzIHRoZSB0aW1lIHRvIHRoZSBhbmltYXRpb24gZnVuY3Rpb25cblxuICAgICAgICBpZiAocm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIC8vIERlZmluZSB0aGUgd3JhcHBlclxuXG4gICAgICAgICAgICAvLyBNYWtlIHRoZSBzd2l0Y2hcblxuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuICAgICAgICAgICAgcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgICAgICAgICAvLyBCcm93c2VyIGNhbGxzIHRoZSB3cmFwcGVyIGFuZCB3cmFwcGVyIGNhbGxzIHRoZSBjYWxsYmFja1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIsIGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/kv67mlLl0aW1l5Y+C5pWwXG4gICAgICAgIGlmIChyb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJvb3QubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3QubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUod3JhcHBlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBHZWNrbyAyLjAsIHdoaWNoIGhhcyBhIGJ1ZyBpblxuICAgICAgICAvLyBtb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKSB0aGF0IHJlc3RyaWN0cyBhbmltYXRpb25zXG4gICAgICAgIC8vIHRvIDMwLTQwIGZwcy5cblxuICAgICAgICBpZiAocm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIHRoZSBHZWNrbyB2ZXJzaW9uLiBHZWNrbyBpcyB1c2VkIGJ5IGJyb3dzZXJzXG4gICAgICAgICAgICAvLyBvdGhlciB0aGFuIEZpcmVmb3guIEdlY2tvIDIuMCBjb3JyZXNwb25kcyB0b1xuICAgICAgICAgICAgLy8gRmlyZWZveCA0LjAuXG5cbiAgICAgICAgICAgIGluZGV4ID0gdXNlckFnZW50LmluZGV4T2YoJ3J2OicpO1xuXG4gICAgICAgICAgICBpZiAodXNlckFnZW50LmluZGV4T2YoJ0dlY2tvJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICBnZWNrb1ZlcnNpb24gPSB1c2VyQWdlbnQuc3Vic3RyKGluZGV4ICsgMywgMyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZ2Vja29WZXJzaW9uID09PSAnMi4wJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBGb3JjZXMgdGhlIHJldHVybiBzdGF0ZW1lbnQgdG8gZmFsbCB0aHJvdWdoXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIHRoZSBzZXRUaW1lb3V0KCkgZnVuY3Rpb24uXG5cbiAgICAgICAgICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbi8vICAgICAgICAgICAgcmV0dXJuICByb290LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAgLy/kvKDpgJLnu5ljYWxsYmFja+eahHRpbWXkuI3mmK/ku44xOTcw5bm0MeaciDHml6XliLDlvZPliY3miYDnu4/ov4fnmoTmr6vnp5LmlbDvvIFcbiAgICAgICAgcmV0dXJuIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICByb290Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoO1xuXG4gICAgICAgICAgICAgICAgcm9vdC5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSArbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2ggPSArbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLnRpbWVvdXQgPSAxMDAwIC8gNjAgLSAoZmluaXNoIC0gc3RhcnQpO1xuXG4gICAgICAgICAgICAgICAgfSwgc2VsZi50aW1lb3V0KTtcbiAgICAgICAgICAgIH07XG4gICAgfSgpKTtcblxuICAgIHJvb3QuY2FuY2VsTmV4dFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJvb3QuY2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC53ZWJraXRDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC5tb3pDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC5vQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3QubXNDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgY2xlYXJUaW1lb3V0O1xuXG4gICAgZXhwb3J0IGNsYXNzIFNjaGVkdWxlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3JlcXVlc3RMb29wSWQ6YW55ID0gbnVsbDtcbiAgICAgICAgZ2V0IHJlcXVlc3RMb29wSWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG4gICAgICAgIHNldCByZXF1ZXN0TG9vcElkKHJlcXVlc3RMb29wSWQ6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9vYnNlcnZlciBpcyBmb3IgVGVzdFNjaGVkdWxlciB0byBpbmplY3RcbiAgICAgICAgLy90b2RvIHJlbW92ZSBvYnNlcnZlclxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICBhY3Rpb24oaW5pdGlhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGludGVydmFsOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbCA9IGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgICAgIH0sIGludGVydmFsKVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXI6SU9ic2VydmVyLCBhY3Rpb246RnVuY3Rpb24pe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGxvb3AgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGlvbih0aW1lKTtcblxuICAgICAgICAgICAgICAgIHNlbGYuX3JlcXVlc3RMb29wSWQgPSByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0TG9vcElkID0gcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGNsYXNzIE9ic2VydmVyIGV4dGVuZHMgRW50aXR5IGltcGxlbWVudHMgSU9ic2VydmVye1xuICAgICAgICBwcml2YXRlIF9pc0Rpc3Bvc2VkOmJvb2xlYW4gPSBudWxsO1xuICAgICAgICBnZXQgaXNEaXNwb3NlZCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzRGlzcG9zZWQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGlzRGlzcG9zZWQoaXNEaXNwb3NlZDpib29sZWFuKXtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSBpc0Rpc3Bvc2VkO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uVXNlck5leHQ6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyRXJyb3I6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyQ29tcGxldGVkOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9pc1N0b3A6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwcml2YXRlIF9kaXNwb3NlSGFuZGxlcjpkeUNiLkNvbGxlY3Rpb24gPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlKCk7XG5cbiAgICAgICAgY29uc3RydWN0b3Iob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIoXCJPYnNlcnZlclwiKTtcblxuICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0ID0gb25OZXh0IHx8IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IgPSBvbkVycm9yIHx8IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkID0gb25Db21wbGV0ZWQgfHwgZnVuY3Rpb24oKXt9O1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25OZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlci5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wdWJsaWMgZmFpbChlKSB7XG4gICAgICAgIC8vICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgIC8vICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAvLyAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgLy8gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2VIYW5kbGVyKGRpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbil7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlciA9IGRpc3Bvc2VIYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRocm93IEFCU1RSQUNUX01FVEhPRCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEFub255bW91c09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgQXV0b0RldGFjaE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBpZih0aGlzLmlzRGlzcG9zZWQpe1xuICAgICAgICAgICAgICAgIGR5Q2IuTG9nLmxvZyhcIm9ubHkgY2FuIGRpc3Bvc2Ugb25jZVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBjbGFzcyBNYXBPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHNlbGVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zZWxlY3RvcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2VsZWN0b3IodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIubmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBEb09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfcHJldk9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgcHJldk9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyID0gcHJldk9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgTWVyZ2VBbGxPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHN0cmVhbUdyb3VwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBnZXQgY3VycmVudE9ic2VydmVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG4gICAgICAgIHNldCBjdXJyZW50T2JzZXJ2ZXIoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9kb25lOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZ2V0IGRvbmUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kb25lO1xuICAgICAgICB9XG4gICAgICAgIHNldCBkb25lKGRvbmU6Ym9vbGVhbil7XG4gICAgICAgICAgICB0aGlzLl9kb25lID0gZG9uZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOmR5Q2IuQ29sbGVjdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAgPSBzdHJlYW1Hcm91cDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQoaW5uZXJTb3VyY2U6YW55KXtcbiAgICAgICAgICAgIGR5Q2IuTG9nLmVycm9yKCEoaW5uZXJTb3VyY2UgaW5zdGFuY2VvZiBTdHJlYW0gfHwgSnVkZ2VVdGlscy5pc1Byb21pc2UoaW5uZXJTb3VyY2UpKSwgZHlDYi5Mb2cuaW5mby5GVU5DX01VU1RfQkUoXCJpbm5lclNvdXJjZVwiLCBcIlN0cmVhbSBvciBQcm9taXNlXCIpKTtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc1Byb21pc2UoaW5uZXJTb3VyY2UpKXtcbiAgICAgICAgICAgICAgICBpbm5lclNvdXJjZSA9IGZyb21Qcm9taXNlKGlubmVyU291cmNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAuYWRkQ2hpbGQoaW5uZXJTb3VyY2UpO1xuXG4gICAgICAgICAgICBpbm5lclNvdXJjZS5idWlsZFN0cmVhbShJbm5lck9ic2VydmVyLmNyZWF0ZSh0aGlzLCB0aGlzLl9zdHJlYW1Hcm91cCwgaW5uZXJTb3VyY2UpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuX3N0cmVhbUdyb3VwLmdldENvdW50KCkgPT09IDApe1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsYXNzIElubmVyT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOmR5Q2IuQ29sbGVjdGlvbiwgY3VycmVudFN0cmVhbTpTdHJlYW0pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb24gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9jdXJyZW50U3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOmR5Q2IuQ29sbGVjdGlvbiwgY3VycmVudFN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RyZWFtID0gY3VycmVudFN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB2YXIgY3VycmVudFN0cmVhbSA9IHRoaXMuX2N1cnJlbnRTdHJlYW0sXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5fcGFyZW50O1xuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cC5yZW1vdmVDaGlsZChmdW5jdGlvbihzdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKHN0cmVhbSwgY3VycmVudFN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9pZiB0aGlzIGlubmVyU291cmNlIGlzIGFzeW5jIHN0cmVhbShhcyBwcm9taXNlIHN0cmVhbSksXG4gICAgICAgICAgICAvL2l0IHdpbGwgZmlyc3QgZXhlYyBhbGwgcGFyZW50Lm5leHQgYW5kIG9uZSBwYXJlbnQuY29tcGxldGVkLFxuICAgICAgICAgICAgLy90aGVuIGV4ZWMgYWxsIHRoaXMubmV4dCBhbmQgYWxsIHRoaXMuY29tcGxldGVkXG4gICAgICAgICAgICAvL3NvIGluIHRoaXMgY2FzZSwgaXQgc2hvdWxkIGludm9rZSBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCBhZnRlciB0aGUgbGFzdCBpbnZva2NhdGlvbiBvZiB0aGlzLmNvbXBsZXRlZChoYXZlIGludm9rZWQgYWxsIHRoZSBpbm5lclNvdXJjZSlcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzQXN5bmMoKSAmJiB0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNBc3luYygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudC5kb25lO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEJhc2VTdHJlYW0gZXh0ZW5kcyBTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMTpGdW5jdGlvbnxPYnNlcnZlcnxTdWJqZWN0LCBvbkVycm9yPywgb25Db21wbGV0ZWQ/KTpJRGlzcG9zYWJsZSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBpZih0aGlzLmhhbmRsZVN1YmplY3QoYXJnMSkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IGFyZzFcbiAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIodGhpcy5kaXNwb3NlSGFuZGxlcik7XG5cbiAgICAgICAgICAgIC8vdG9kbyBlbmNhcHN1bGF0ZSBpdCB0byBzY2hlZHVsZUl0ZW1cbiAgICAgICAgICAgIC8vdG9kbyBkZWxldGUgdGFyZ2V0P1xuICAgICAgICAgICAgLy90aGlzLnNjaGVkdWxlci50YXJnZXQgPSBvYnNlcnZlcjtcblxuICAgICAgICAgICAgLy9keUNiLkxvZy5lcnJvcih0aGlzLl9oYXNNdWx0aU9ic2VydmVycygpLCBcInNob3VsZCB1c2UgU3ViamVjdCB0byBoYW5kbGUgbXVsdGkgb2JzZXJ2ZXJzXCIpO1xuICAgICAgICAgICAgdGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgc3VwZXIuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZUNvcmUob2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIF9oYXNNdWx0aU9ic2VydmVycygpe1xuICAgICAgICAvLyAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXIuZ2V0T2JzZXJ2ZXJzKCkgPiAxO1xuICAgICAgICAvL31cbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIERvU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgb25OZXh0PzpGdW5jdGlvbiwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgb25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyID0gQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvcixvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKERvT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLl9vYnNlcnZlcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBNYXBTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgc2VsZWN0b3IpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBzZWxlY3RvcjpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgICAgICAvL3RoaXMuc2NoZWR1bGVyLmFkZFdyYXBUYXJnZXQoTWFwT2JzZXJ2ZXIuY3JlYXRlKHNlbGVjdG9yKSk7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWFwT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLl9zZWxlY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIC8vcHVibGljIHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/LCBvbkNvbXBsZXRlZD8pOklEaXNwb3NhYmxlIHtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5zdWJzY3JpYmUuYXBwbHkodGhpcy5fc291cmNlLCBhcmd1bWVudHMpO1xuICAgICAgICAvL31cbiAgICAgICAgLy9cbiAgICAgICAgLy9wdWJsaWMgc3Vic2NyaWJlQ29yZSgpe1xuICAgICAgICAvLyAgICBpZih0aGlzLl9zb3VyY2UgaW5zdGFuY2VvZiBCYXNlU3RyZWFtKXtcbiAgICAgICAgLy8gICAgICAgIGxldCBiYXNlU3RyZWFtID0gPEJhc2VTdHJlYW0+dGhpcy5fc291cmNlO1xuICAgICAgICAvLyAgICAgICAgYmFzZVN0cmVhbS5zdWJzY3JpYmVDb3JlKCk7XG4gICAgICAgIC8vICAgIH1cbiAgICAgICAgLy99XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbUFycmF5U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGFycmF5LCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYXJyYXk6QXJyYXk8YW55PiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnJheTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBhcnJheSA9IHRoaXMuX2FycmF5LFxuICAgICAgICAgICAgICAgIGxlbiA9IGFycmF5Lmxlbmd0aDtcblxuICAgICAgICAgICAgLy9uZXh0LGNvbXBsZXRlZCBpcyBmb3IgVGVzdFNjaGVkdWxlciB0byBpbmplY3RcbiAgICAgICAgICAgIC8vdG9kbyByZW1vdmUgaW5qZWN0IG5leHQsY29tcGxldGVkP1xuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShpLCBuZXh0LCBjb21wbGV0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICBpZihuZXh0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoYXJyYXlbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGFycmF5W2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHMuY2FsbGVlKGkgKyAxLCBuZXh0LCBjb21wbGV0ZWQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGNvbXBsZXRlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIDAsIGxvb3BSZWN1cnNpdmUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbVByb21pc2VTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwcm9taXNlOmFueSwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICBcdHZhciBvYmogPSBuZXcgdGhpcyhwcm9taXNlLCBzY2hlZHVsZXIpO1xuXG4gICAgICAgIFx0cmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3Byb21pc2U6YW55ID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm9taXNlOmFueSwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fcHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICAvL3RvZG8gcmVtb3ZlIHRlc3QgbG9naWMgZnJvbSBwcm9kdWN0IGxvZ2ljKGFzIFNjaGVkdWxlci0+cHVibGljeHh4LCBGcm9tUHJvbWlzZS0+dGhlbi4uLilcbiAgICAgICAgICAgIHRoaXMuX3Byb21pc2UudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0sIG9ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21FdmVudFBhdHRlcm5TdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hZGRIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYWRkSGFuZGxlcjpGdW5jdGlvbiwgcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlciA9IGFkZEhhbmRsZXI7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVIYW5kbGVyID0gcmVtb3ZlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlubmVySGFuZGxlcihldmVudCl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaW5uZXJIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5hZGREaXNwb3NlSGFuZGxlcihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHNlbGYuX3JlbW92ZUhhbmRsZXIoaW5uZXJIYW5kbGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBBbm9ueW1vdXNTdHJlYW0gZXh0ZW5kcyBTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHN1YnNjcmliZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzdWJzY3JpYmVGdW5jKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHN1YnNjcmliZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKHN1YnNjcmliZUZ1bmMpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICAgICAgaWYodGhpcy5oYW5kbGVTdWJqZWN0KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgLy90b2RvIGVuY2Fwc3VsYXRlIGl0IHRvIHNjaGVkdWxlSXRlbVxuICAgICAgICAgICAgLy90aGlzLnNjaGVkdWxlci50YXJnZXQgPSBvYnNlcnZlcjtcblxuICAgICAgICAgICAgdGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEludGVydmFsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaW50ZXJ2YWw6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoaW50ZXJ2YWwsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIG9iai5pbml0V2hlbkNyZWF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaW50ZXJ2YWw6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihpbnRlcnZhbDpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gaW50ZXJ2YWw7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbml0V2hlbkNyZWF0ZSgpe1xuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSB0aGlzLl9pbnRlcnZhbCA8PSAwID8gMSA6IHRoaXMuX2ludGVydmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlkID0gdGhpcy5zY2hlZHVsZXIucHVibGlzaEludGVydmFsKG9ic2VydmVyLCAwLCB0aGlzLl9pbnRlcnZhbCwgZnVuY3Rpb24oY291bnQpIHtcbiAgICAgICAgICAgICAgICAvL3NlbGYuc2NoZWR1bGVyLm5leHQoY291bnQpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoY291bnQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50ICsgMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmFkZERpc3Bvc2VIYW5kbGVyKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcm9vdC5jbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgTWVyZ2VBbGxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgLy90aGlzLl9vYnNlcnZlciA9IEFub255bW91c09ic2VydmVyLmNyZWF0ZShvbk5leHQsIG9uRXJyb3Isb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzdHJlYW1Hcm91cCA9IGR5Q2IuQ29sbGVjdGlvbi5jcmVhdGUoKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1lcmdlQWxsT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCBzdHJlYW1Hcm91cCkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBUYWtlVW50aWxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBvdGhlclN0ZWFtOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgb3RoZXJTdGVhbSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb3RoZXJTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBvdGhlclN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX290aGVyU3RyZWFtID0gSnVkZ2VVdGlscy5pc1Byb21pc2Uob3RoZXJTdHJlYW0pID8gZnJvbVByb21pc2Uob3RoZXJTdHJlYW0pIDogb3RoZXJTdHJlYW07XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKG9ic2VydmVyKTtcbiAgICAgICAgICAgIHRoaXMuX290aGVyU3RyZWFtLmJ1aWxkU3RyZWFtKFRha2VVbnRpbE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCB2YXIgY3JlYXRlU3RyZWFtID0gZnVuY3Rpb24oc3Vic2NyaWJlRnVuYykge1xuICAgICAgICByZXR1cm4gQW5vbnltb3VzU3RyZWFtLmNyZWF0ZShzdWJzY3JpYmVGdW5jKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tQXJyYXkgPSBmdW5jdGlvbihhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpe1xuICAgICAgICByZXR1cm4gRnJvbUFycmF5U3RyZWFtLmNyZWF0ZShhcnJheSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tUHJvbWlzZSA9IGZ1bmN0aW9uKHByb21pc2U6YW55LCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpe1xuICAgICAgICByZXR1cm4gRnJvbVByb21pc2VTdHJlYW0uY3JlYXRlKHByb21pc2UsIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbUV2ZW50UGF0dGVybiA9IGZ1bmN0aW9uKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICByZXR1cm4gRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5jcmVhdGUoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgaW50ZXJ2YWwgPSBmdW5jdGlvbiAoaW50ZXJ2YWwsIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkge1xuICAgICAgICByZXR1cm4gSW50ZXJ2YWxTdHJlYW0uY3JlYXRlKGludGVydmFsLCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGludGVydmFsUmVxdWVzdCA9IGZ1bmN0aW9uIChzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpIHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsUmVxdWVzdFN0cmVhbS5jcmVhdGUoc2NoZWR1bGVyKTtcbiAgICB9O1xufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICB2YXIgZGVmYXVsdElzRXF1YWwgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICB9O1xuXG4gICAgZXhwb3J0IGNsYXNzIFJlY29yZCB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHRpbWU6bnVtYmVyLCB2YWx1ZTphbnksIGFjdGlvblR5cGU/OkFjdGlvblR5cGUsIGNvbXBhcmVyPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHRpbWUsIHZhbHVlLCBhY3Rpb25UeXBlLCBjb21wYXJlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB0aW1lKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdGltZSh0aW1lOm51bWJlcil7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3ZhbHVlOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB2YWx1ZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHNldCB2YWx1ZSh2YWx1ZTpudW1iZXIpe1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FjdGlvblR5cGU6QWN0aW9uVHlwZSA9IG51bGw7XG4gICAgICAgIGdldCBhY3Rpb25UeXBlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aW9uVHlwZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgYWN0aW9uVHlwZShhY3Rpb25UeXBlOkFjdGlvblR5cGUpe1xuICAgICAgICAgICAgdGhpcy5fYWN0aW9uVHlwZSA9IGFjdGlvblR5cGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jb21wYXJlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IodGltZSwgdmFsdWUsIGFjdGlvblR5cGU6QWN0aW9uVHlwZSwgY29tcGFyZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX2FjdGlvblR5cGUgPSBhY3Rpb25UeXBlO1xuICAgICAgICAgICAgdGhpcy5fY29tcGFyZXIgPSBjb21wYXJlciB8fCBkZWZhdWx0SXNFcXVhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWUgPT09IG90aGVyLnRpbWUgJiYgdGhpcy5fY29tcGFyZXIodGhpcy5fdmFsdWUsIG90aGVyLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1vY2tPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IDxbUmVjb3JkXT5bXTtcbiAgICAgICAgZ2V0IG1lc3NhZ2VzKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXM7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IG1lc3NhZ2VzKG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgdmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIGVycm9yKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIG51bGwpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBNb2NrUHJvbWlzZXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIsIG1lc3NhZ2VzOltSZWNvcmRdKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyLCBtZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IDxbUmVjb3JkXT5bXTtcbiAgICAgICAgLy9nZXQgbWVzc2FnZXMoKXtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICAgICAgICAvL31cbiAgICAgICAgLy9zZXQgbWVzc2FnZXMobWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAvLyAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICAvL31cblxuICAgICAgICBwcml2YXRlIF9zY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIsIG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdGhlbihzdWNjZXNzQ2I6RnVuY3Rpb24sIGVycm9yQ2I6RnVuY3Rpb24sIG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICAvL3ZhciBzY2hlZHVsZXIgPSA8VGVzdFNjaGVkdWxlcj4odGhpcy5zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCB0aGlzLl9tZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBjb25zdCBTVUJTQ1JJQkVfVElNRSA9IDIwMDtcbiAgICBjb25zdCBESVNQT1NFX1RJTUUgPSAxMDAwO1xuXG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIG5leHQodGljaywgdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBlcnJvcih0aWNrLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgZXJyb3IsIEFjdGlvblR5cGUuRVJST1IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjb21wbGV0ZWQodGljaykge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgbnVsbCwgQWN0aW9uVHlwZS5DT01QTEVURUQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2Nsb2NrOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCBjbG9jaygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBjbG9jayhjbG9jazpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pbml0aWFsQ2xvY2s6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfaXNEaXNwb3NlZDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX3RpbWVyTWFwOmR5Q2IuSGFzaCA9IGR5Q2IuSGFzaC5jcmVhdGUoKTtcbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtTWFwOmR5Q2IuSGFzaCA9IGR5Q2IuSGFzaC5jcmVhdGUoKTtcbiAgICAgICAgcHJpdmF0ZSBfc3Vic2NyaWJlZFRpbWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfZGlzcG9zZWRUaW1lOm51bWJlciA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIHNldFN0cmVhbU1hcChvYnNlcnZlcjpJT2JzZXJ2ZXIsIG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgbWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbihyZWNvcmQ6UmVjb3JkKXtcbiAgICAgICAgICAgICAgICB2YXIgZnVuYyA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHJlY29yZC5hY3Rpb25UeXBlKXtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBBY3Rpb25UeXBlLk5FWFQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHJlY29yZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5FUlJPUjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKHJlY29yZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT01QTEVURUQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGR5Q2IuTG9nLmVycm9yKHRydWUsIGR5Q2IuTG9nLmluZm8uRlVOQ19VTktOT1coXCJhY3Rpb25UeXBlXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYuX3N0cmVhbU1hcC5hZGRDaGlsZChTdHJpbmcocmVjb3JkLnRpbWUpLCBmdW5jKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZShvYnNlcnZlcjpPYnNlcnZlcikge1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCByZWN1cnNpdmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgcmVjdXJzaXZlRnVuYyhpbml0aWFsLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5uZXh0KHNlbGYuX2Nsb2NrLCB2YWx1ZSkpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3RpY2soMSk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLmNvbXBsZXRlZChzZWxmLl9jbG9jaykpO1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGludGVydmFsOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICAvL3Byb2R1Y2UgMTAgdmFsIGZvciB0ZXN0XG4gICAgICAgICAgICB2YXIgQ09VTlQgPSAxMCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlcyA9IFtdO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB3aGlsZSAoQ09VTlQgPiAwICYmICF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGljayhpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIGluaXRpYWwpKTtcblxuICAgICAgICAgICAgICAgIC8vbm8gbmVlZCB0byBpbnZva2UgYWN0aW9uXG4gICAgICAgICAgICAgICAgLy9hY3Rpb24oaW5pdGlhbCk7XG5cbiAgICAgICAgICAgICAgICBpbml0aWFsKys7XG4gICAgICAgICAgICAgICAgQ09VTlQtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IDEwMDtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgd2hpbGUgKENPVU5UID4gMCAmJiAhdGhpcy5faXNEaXNwb3NlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RpY2soaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5uZXh0KHRoaXMuX2Nsb2NrLCBpbnRlcnZhbCkpO1xuXG4gICAgICAgICAgICAgICAgQ09VTlQtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXRDbG9jaygpe1xuICAgICAgICAgICAgaWYodGhpcy5faW5pdGlhbENsb2NrKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9jayA9ICBNYXRoLm1pbih0aGlzLl9jbG9jaywgdGhpcy5faW5pdGlhbENsb2NrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5faW5pdGlhbENsb2NrID0gdGhpcy5fY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoVGltZShjcmVhdGU6RnVuY3Rpb24sIHN1YnNjcmliZWRUaW1lOm51bWJlciwgZGlzcG9zZWRUaW1lOm51bWJlcikge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gdGhpcy5jcmVhdGVPYnNlcnZlcigpLFxuICAgICAgICAgICAgICAgIHNvdXJjZSwgc3Vic2NyaXB0aW9uO1xuXG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmVkVGltZSA9IHN1YnNjcmliZWRUaW1lO1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZWRUaW1lID0gZGlzcG9zZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9jbG9jayA9IHN1YnNjcmliZWRUaW1lO1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KHN1YnNjcmliZWRUaW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc291cmNlID0gY3JlYXRlKCk7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uID0gc291cmNlLnN1YnNjcmliZShvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fcnVuQXQoZGlzcG9zZWRUaW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydFdpdGhTdWJzY3JpYmUoY3JlYXRlLCBzdWJzY3JpYmVkVGltZSA9IFNVQlNDUklCRV9USU1FKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydFdpdGhUaW1lKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUsIERJU1BPU0VfVElNRSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoRGlzcG9zZShjcmVhdGUsIGRpc3Bvc2VkVGltZSA9IERJU1BPU0VfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIFNVQlNDUklCRV9USU1FLCBkaXNwb3NlZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1YmxpY0Fic29sdXRlKHRpbWUsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KHRpbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpIHtcbiAgICAgICAgICAgIHZhciBleHRyZW1lTnVtQXJyID0gdGhpcy5fZ2V0TWluQW5kTWF4VGltZSgpLFxuICAgICAgICAgICAgICAgIG1pbiA9IGV4dHJlbWVOdW1BcnJbMF0sXG4gICAgICAgICAgICAgICAgbWF4ID0gZXh0cmVtZU51bUFyclsxXSxcbiAgICAgICAgICAgICAgICB0aW1lID0gbWluO1xuXG4gICAgICAgICAgICAvL3RvZG8gcmVkdWNlIGxvb3AgdGltZVxuICAgICAgICAgICAgd2hpbGUgKHRpbWUgPD0gbWF4KSB7XG4gICAgICAgICAgICAgICAgLy9iZWNhdXNlIFwiX2V4ZWMsX3J1blN0cmVhbVwiIG1heSBjaGFuZ2UgXCJfY2xvY2tcIixcbiAgICAgICAgICAgICAgICAvL3NvIGl0IHNob3VsZCByZXNldCB0aGUgX2Nsb2NrXG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9jayA9IHRpbWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9leGVjKHRpbWUsIHRoaXMuX3RpbWVyTWFwKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGltZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3J1blN0cmVhbSh0aW1lKTtcblxuICAgICAgICAgICAgICAgIHRpbWUrKztcblxuICAgICAgICAgICAgICAgIC8vdG9kbyBnZXQgbWF4IHRpbWUgb25seSBmcm9tIHN0cmVhbU1hcD9cbiAgICAgICAgICAgICAgICAvL25lZWQgcmVmcmVzaCBtYXggdGltZS5cbiAgICAgICAgICAgICAgICAvL2JlY2F1c2UgaWYgdGltZXJNYXAgaGFzIGNhbGxiYWNrIHRoYXQgY3JlYXRlIGluZmluaXRlIHN0cmVhbShhcyBpbnRlcnZhbCksXG4gICAgICAgICAgICAgICAgLy9pdCB3aWxsIHNldCBzdHJlYW1NYXAgc28gdGhhdCB0aGUgbWF4IHRpbWUgd2lsbCBjaGFuZ2VcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLl9nZXRNaW5BbmRNYXhUaW1lKClbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlU3RyZWFtKGFyZ3Mpe1xuICAgICAgICAgICAgcmV0dXJuIFRlc3RTdHJlYW0uY3JlYXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZU9ic2VydmVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1vY2tPYnNlcnZlci5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlUmVzb2x2ZWRQcm9taXNlKHRpbWU6bnVtYmVyLCB2YWx1ZTphbnkpe1xuICAgICAgICAgICAgcmV0dXJuIE1vY2tQcm9taXNlLmNyZWF0ZSh0aGlzLCBbVGVzdFNjaGVkdWxlci5uZXh0KHRpbWUsIHZhbHVlKSwgVGVzdFNjaGVkdWxlci5jb21wbGV0ZWQodGltZSsxKV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVJlamVjdFByb21pc2UodGltZTpudW1iZXIsIGVycm9yOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gTW9ja1Byb21pc2UuY3JlYXRlKHRoaXMsIFtUZXN0U2NoZWR1bGVyLmVycm9yKHRpbWUsIGVycm9yKV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZ2V0TWluQW5kTWF4VGltZSgpe1xuICAgICAgICAgICAgdmFyIHRpbWVBcnIgPSB0aGlzLl90aW1lck1hcC5nZXRLZXlzKCkuYWRkQ2hpbGRyZW4odGhpcy5fc3RyZWFtTWFwLmdldEtleXMoKSlcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIoa2V5KTtcbiAgICAgICAgICAgICAgICB9KS50b0FycmF5KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBbTWF0aC5taW4uYXBwbHkoTWF0aCwgdGltZUFyciksIE1hdGgubWF4LmFwcGx5KE1hdGgsIHRpbWVBcnIpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2V4ZWModGltZSwgbWFwKXtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gbWFwLmdldENoaWxkKFN0cmluZyh0aW1lKSk7XG5cbiAgICAgICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3J1blN0cmVhbSh0aW1lKXtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fc3RyZWFtTWFwLmdldENoaWxkKFN0cmluZyh0aW1lKSk7XG5cbiAgICAgICAgICAgIC8vaWYoaGFuZGxlciAmJiB0aGlzLl9oYXNPYnNlcnZlcigpKXtcbiAgICAgICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHJpdmF0ZSBfaGFzT2JzZXJ2ZXIoKXtcbiAgICAgICAgLy8gICAgaWYodGhpcy50YXJnZXQgaW5zdGFuY2VvZiBTdWJqZWN0KXtcbiAgICAgICAgLy8gICAgICAgIGxldCBzdWJqZWN0ID0gPFN1YmplY3Q+dGhpcy50YXJnZXQ7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgICAgcmV0dXJuIHN1YmplY3QuZ2V0T2JzZXJ2ZXJzKCkgPiAwXG4gICAgICAgIC8vICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgcmV0dXJuICEhdGhpcy50YXJnZXQ7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIHByaXZhdGUgX3J1bkF0KHRpbWU6bnVtYmVyLCBjYWxsYmFjazpGdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fdGltZXJNYXAuYWRkQ2hpbGQoU3RyaW5nKHRpbWUpLCBjYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aWNrKHRpbWU6bnVtYmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9jbG9jayArPSB0aW1lO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbiIsIm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgZW51bSBBY3Rpb25UeXBle1xuICAgICAgICBORVhULFxuICAgICAgICBFUlJPUixcbiAgICAgICAgQ09NUExFVEVEXG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBjbGFzcyBUZXN0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbSB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG1lc3NhZ2VzOltSZWNvcmRdLCBzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKG1lc3NhZ2VzLCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2VzOltSZWNvcmRdLCBzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICAvL3ZhciBzY2hlZHVsZXIgPSA8VGVzdFNjaGVkdWxlcj4odGhpcy5zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIHRoaXMuX21lc3NhZ2VzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBjbGFzcyBKdWRnZVV0aWxzIGV4dGVuZHMgZHlDYi5KdWRnZVV0aWxzIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBpc1Byb21pc2Uob2JqKXtcbiAgICAgICAgICAgIHJldHVybiAhIW9ialxuICAgICAgICAgICAgICAgICYmICFzdXBlci5pc0Z1bmN0aW9uKG9iai5zdWJzY3JpYmUpXG4gICAgICAgICAgICAgICAgJiYgc3VwZXIuaXNGdW5jdGlvbihvYmoudGhlbik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGlzRXF1YWwob2IxOkVudGl0eSwgb2IyOkVudGl0eSl7XG4gICAgICAgICAgICByZXR1cm4gb2IxLnVpZCA9PT0gb2IyLnVpZDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEludGVydmFsUmVxdWVzdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0KG9ic2VydmVyLCBmdW5jdGlvbih0aW1lKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0aW1lKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmFkZERpc3Bvc2VIYW5kbGVyKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcm9vdC5jYW5jZWxOZXh0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNlbGYuc2NoZWR1bGVyLnJlcXVlc3RMb29wSWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=