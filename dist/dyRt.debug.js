

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
    //not swallow the error
    if (RSVP) {
        RSVP.onerror = function (e) {
            throw e;
        };
        RSVP.on('error', RSVP.onerror);
    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpc3Bvc2FibGUvSURpc3Bvc2FibGUudHMiLCJvYnNlcnZlci9JT2JzZXJ2ZXIudHMiLCJnbG9iYWwvVmFyaWFibGUudHMiLCJnbG9iYWwvQ29uc3QudHMiLCJnbG9iYWwvaW5pdC50cyIsIkRpc3Bvc2FibGUvSW5uZXJTdWJzY3JpcHRpb24udHMiLCJjb3JlL0VudGl0eS50cyIsImNvcmUvU3RyZWFtLnRzIiwiY29yZS9TdWJqZWN0LnRzIiwiY29yZS9TY2hlZHVsZXIudHMiLCJjb3JlL09ic2VydmVyLnRzIiwib2JzZXJ2ZXIvQW5vbnltb3VzT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9BdXRvRGV0YWNoT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9NYXBPYnNlcnZlci50cyIsIm9ic2VydmVyL0RvT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9NZXJnZUFsbE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvVGFrZVVudGlsT2JzZXJ2ZXIudHMiLCJzdHJlYW0vQmFzZVN0cmVhbS50cyIsInN0cmVhbS9Eb1N0cmVhbS50cyIsInN0cmVhbS9NYXBTdHJlYW0udHMiLCJzdHJlYW0vRnJvbUFycmF5U3RyZWFtLnRzIiwic3RyZWFtL0Zyb21Qcm9taXNlU3RyZWFtLnRzIiwic3RyZWFtL0Zyb21FdmVudFBhdHRlcm5TdHJlYW0udHMiLCJzdHJlYW0vQW5vbnltb3VzU3RyZWFtLnRzIiwic3RyZWFtL0ludGVydmFsU3RyZWFtLnRzIiwic3RyZWFtL0ludGVydmFsUmVxdWVzdFN0cmVhbS50cyIsInN0cmVhbS9NZXJnZUFsbFN0cmVhbS50cyIsInN0cmVhbS9UYWtlVW50aWxTdHJlYW0udHMiLCJnbG9iYWwvT3BlcmF0b3IudHMiLCJ0ZXN0aW5nL1JlY29yZC50cyIsInRlc3RpbmcvTW9ja09ic2VydmVyLnRzIiwidGVzdGluZy9Nb2NrUHJvbWlzZS50cyIsInRlc3RpbmcvVGVzdFNjaGVkdWxlci50cyIsInRlc3RpbmcvQWN0aW9uVHlwZS50cyIsInRlc3RpbmcvVGVzdFN0cmVhbS50cyIsIkp1ZGdlVXRpbHMudHMiXSwibmFtZXMiOlsiZHlSdCIsImR5UnQuSW5uZXJTdWJzY3JpcHRpb24iLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uLmNvbnN0cnVjdG9yIiwiZHlSdC5Jbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUiLCJkeVJ0LklubmVyU3Vic2NyaXB0aW9uLmRpc3Bvc2UiLCJkeVJ0LkVudGl0eSIsImR5UnQuRW50aXR5LmNvbnN0cnVjdG9yIiwiZHlSdC5FbnRpdHkudWlkIiwiZHlSdC5TdHJlYW0iLCJkeVJ0LlN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuU3RyZWFtLmRpc3Bvc2VIYW5kbGVyIiwiZHlSdC5TdHJlYW0uc3Vic2NyaWJlIiwiZHlSdC5TdHJlYW0uYnVpbGRTdHJlYW0iLCJkeVJ0LlN0cmVhbS5hZGREaXNwb3NlSGFuZGxlciIsImR5UnQuU3RyZWFtLmhhbmRsZVN1YmplY3QiLCJkeVJ0LlN0cmVhbS5kbyIsImR5UnQuU3RyZWFtLm1hcCIsImR5UnQuU3RyZWFtLmZsYXRNYXAiLCJkeVJ0LlN0cmVhbS5tZXJnZUFsbCIsImR5UnQuU3RyZWFtLnRha2VVbnRpbCIsImR5UnQuU3RyZWFtLl9pc1N1YmplY3QiLCJkeVJ0LlN0cmVhbS5fc2V0U3ViamVjdCIsImR5UnQuU3ViamVjdCIsImR5UnQuU3ViamVjdC5jb25zdHJ1Y3RvciIsImR5UnQuU3ViamVjdC5jcmVhdGUiLCJkeVJ0LlN1YmplY3Quc291cmNlIiwiZHlSdC5TdWJqZWN0LnN1YnNjcmliZSIsImR5UnQuU3ViamVjdC5uZXh0IiwiZHlSdC5TdWJqZWN0LmVycm9yIiwiZHlSdC5TdWJqZWN0LmNvbXBsZXRlZCIsImR5UnQuU3ViamVjdC5zdGFydCIsImR5UnQuU3ViamVjdC5yZW1vdmUiLCJkeVJ0LlN1YmplY3QuZGlzcG9zZSIsImR5UnQuU2NoZWR1bGVyIiwiZHlSdC5TY2hlZHVsZXIuY29uc3RydWN0b3IiLCJkeVJ0LlNjaGVkdWxlci5jcmVhdGUiLCJkeVJ0LlNjaGVkdWxlci5yZXF1ZXN0TG9vcElkIiwiZHlSdC5TY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZSIsImR5UnQuU2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbCIsImR5UnQuU2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbFJlcXVlc3QiLCJkeVJ0Lk9ic2VydmVyIiwiZHlSdC5PYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuT2JzZXJ2ZXIuaXNEaXNwb3NlZCIsImR5UnQuT2JzZXJ2ZXIubmV4dCIsImR5UnQuT2JzZXJ2ZXIuZXJyb3IiLCJkeVJ0Lk9ic2VydmVyLmNvbXBsZXRlZCIsImR5UnQuT2JzZXJ2ZXIuZGlzcG9zZSIsImR5UnQuT2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIiLCJkeVJ0Lk9ic2VydmVyLm9uTmV4dCIsImR5UnQuT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LkFub255bW91c09ic2VydmVyIiwiZHlSdC5Bbm9ueW1vdXNPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Bbm9ueW1vdXNPYnNlcnZlci5vbk5leHQiLCJkeVJ0LkFub255bW91c09ic2VydmVyLm9uRXJyb3IiLCJkeVJ0LkFub255bW91c09ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSIsImR5UnQuQXV0b0RldGFjaE9ic2VydmVyLmRpc3Bvc2UiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5vbk5leHQiLCJkeVJ0LkF1dG9EZXRhY2hPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5BdXRvRGV0YWNoT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0Lk1hcE9ic2VydmVyIiwiZHlSdC5NYXBPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuTWFwT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5NYXBPYnNlcnZlci5vbk5leHQiLCJkeVJ0Lk1hcE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0Lk1hcE9ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5Eb09ic2VydmVyIiwiZHlSdC5Eb09ic2VydmVyLmNvbnN0cnVjdG9yIiwiZHlSdC5Eb09ic2VydmVyLmNyZWF0ZSIsImR5UnQuRG9PYnNlcnZlci5vbk5leHQiLCJkeVJ0LkRvT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuRG9PYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlciIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuTWVyZ2VBbGxPYnNlcnZlci5jcmVhdGUiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIuY3VycmVudE9ic2VydmVyIiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLmRvbmUiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5NZXJnZUFsbE9ic2VydmVyLm9uRXJyb3IiLCJkeVJ0Lk1lcmdlQWxsT2JzZXJ2ZXIub25Db21wbGV0ZWQiLCJkeVJ0LklubmVyT2JzZXJ2ZXIiLCJkeVJ0LklubmVyT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LklubmVyT2JzZXJ2ZXIuY3JlYXRlIiwiZHlSdC5Jbm5lck9ic2VydmVyLm9uTmV4dCIsImR5UnQuSW5uZXJPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5Jbm5lck9ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5Jbm5lck9ic2VydmVyLl9pc0FzeW5jIiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlciIsImR5UnQuVGFrZVVudGlsT2JzZXJ2ZXIuY29uc3RydWN0b3IiLCJkeVJ0LlRha2VVbnRpbE9ic2VydmVyLmNyZWF0ZSIsImR5UnQuVGFrZVVudGlsT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlci5vbkVycm9yIiwiZHlSdC5UYWtlVW50aWxPYnNlcnZlci5vbkNvbXBsZXRlZCIsImR5UnQuQmFzZVN0cmVhbSIsImR5UnQuQmFzZVN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuQmFzZVN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5CYXNlU3RyZWFtLnN1YnNjcmliZSIsImR5UnQuQmFzZVN0cmVhbS5idWlsZFN0cmVhbSIsImR5UnQuRG9TdHJlYW0iLCJkeVJ0LkRvU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Eb1N0cmVhbS5jcmVhdGUiLCJkeVJ0LkRvU3RyZWFtLmJ1aWxkU3RyZWFtIiwiZHlSdC5NYXBTdHJlYW0iLCJkeVJ0Lk1hcFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuTWFwU3RyZWFtLmNyZWF0ZSIsImR5UnQuTWFwU3RyZWFtLmJ1aWxkU3RyZWFtIiwiZHlSdC5Gcm9tQXJyYXlTdHJlYW0iLCJkeVJ0LkZyb21BcnJheVN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuRnJvbUFycmF5U3RyZWFtLmNyZWF0ZSIsImR5UnQuRnJvbUFycmF5U3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0LkZyb21BcnJheVN0cmVhbS5zdWJzY3JpYmVDb3JlLmxvb3BSZWN1cnNpdmUiLCJkeVJ0LkZyb21Qcm9taXNlU3RyZWFtIiwiZHlSdC5Gcm9tUHJvbWlzZVN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuRnJvbVByb21pc2VTdHJlYW0uY3JlYXRlIiwiZHlSdC5Gcm9tUHJvbWlzZVN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLmNyZWF0ZSIsImR5UnQuRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLnN1YnNjcmliZUNvcmUuaW5uZXJIYW5kbGVyIiwiZHlSdC5Bbm9ueW1vdXNTdHJlYW0iLCJkeVJ0LkFub255bW91c1N0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuQW5vbnltb3VzU3RyZWFtLmNyZWF0ZSIsImR5UnQuQW5vbnltb3VzU3RyZWFtLnN1YnNjcmliZSIsImR5UnQuSW50ZXJ2YWxTdHJlYW0iLCJkeVJ0LkludGVydmFsU3RyZWFtLmNvbnN0cnVjdG9yIiwiZHlSdC5JbnRlcnZhbFN0cmVhbS5jcmVhdGUiLCJkeVJ0LkludGVydmFsU3RyZWFtLmluaXRXaGVuQ3JlYXRlIiwiZHlSdC5JbnRlcnZhbFN0cmVhbS5zdWJzY3JpYmVDb3JlIiwiZHlSdC5JbnRlcnZhbFJlcXVlc3RTdHJlYW0iLCJkeVJ0LkludGVydmFsUmVxdWVzdFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLmNyZWF0ZSIsImR5UnQuSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0Lk1lcmdlQWxsU3RyZWFtIiwiZHlSdC5NZXJnZUFsbFN0cmVhbS5jb25zdHJ1Y3RvciIsImR5UnQuTWVyZ2VBbGxTdHJlYW0uY3JlYXRlIiwiZHlSdC5NZXJnZUFsbFN0cmVhbS5idWlsZFN0cmVhbSIsImR5UnQuVGFrZVVudGlsU3RyZWFtIiwiZHlSdC5UYWtlVW50aWxTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LlRha2VVbnRpbFN0cmVhbS5jcmVhdGUiLCJkeVJ0LlRha2VVbnRpbFN0cmVhbS5idWlsZFN0cmVhbSIsImR5UnQuUmVjb3JkIiwiZHlSdC5SZWNvcmQuY29uc3RydWN0b3IiLCJkeVJ0LlJlY29yZC5jcmVhdGUiLCJkeVJ0LlJlY29yZC50aW1lIiwiZHlSdC5SZWNvcmQudmFsdWUiLCJkeVJ0LlJlY29yZC5hY3Rpb25UeXBlIiwiZHlSdC5SZWNvcmQuZXF1YWxzIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIiLCJkeVJ0Lk1vY2tPYnNlcnZlci5jb25zdHJ1Y3RvciIsImR5UnQuTW9ja09ic2VydmVyLmNyZWF0ZSIsImR5UnQuTW9ja09ic2VydmVyLm1lc3NhZ2VzIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIub25OZXh0IiwiZHlSdC5Nb2NrT2JzZXJ2ZXIub25FcnJvciIsImR5UnQuTW9ja09ic2VydmVyLm9uQ29tcGxldGVkIiwiZHlSdC5Nb2NrT2JzZXJ2ZXIuZGlzcG9zZSIsImR5UnQuTW9ja1Byb21pc2UiLCJkeVJ0Lk1vY2tQcm9taXNlLmNvbnN0cnVjdG9yIiwiZHlSdC5Nb2NrUHJvbWlzZS5jcmVhdGUiLCJkeVJ0Lk1vY2tQcm9taXNlLnRoZW4iLCJkeVJ0LlRlc3RTY2hlZHVsZXIiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY29uc3RydWN0b3IiLCJkeVJ0LlRlc3RTY2hlZHVsZXIubmV4dCIsImR5UnQuVGVzdFNjaGVkdWxlci5lcnJvciIsImR5UnQuVGVzdFNjaGVkdWxlci5jb21wbGV0ZWQiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNsb2NrIiwiZHlSdC5UZXN0U2NoZWR1bGVyLnNldFN0cmVhbU1hcCIsImR5UnQuVGVzdFNjaGVkdWxlci5yZW1vdmUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZSIsImR5UnQuVGVzdFNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWwiLCJkeVJ0LlRlc3RTY2hlZHVsZXIucHVibGlzaEludGVydmFsUmVxdWVzdCIsImR5UnQuVGVzdFNjaGVkdWxlci5fc2V0Q2xvY2siLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc3RhcnRXaXRoVGltZSIsImR5UnQuVGVzdFNjaGVkdWxlci5zdGFydFdpdGhTdWJzY3JpYmUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuc3RhcnRXaXRoRGlzcG9zZSIsImR5UnQuVGVzdFNjaGVkdWxlci5wdWJsaWNBYnNvbHV0ZSIsImR5UnQuVGVzdFNjaGVkdWxlci5zdGFydCIsImR5UnQuVGVzdFNjaGVkdWxlci5jcmVhdGVTdHJlYW0iLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlT2JzZXJ2ZXIiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuY3JlYXRlUmVzb2x2ZWRQcm9taXNlIiwiZHlSdC5UZXN0U2NoZWR1bGVyLmNyZWF0ZVJlamVjdFByb21pc2UiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX2dldE1pbkFuZE1heFRpbWUiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX2V4ZWMiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX3J1blN0cmVhbSIsImR5UnQuVGVzdFNjaGVkdWxlci5fcnVuQXQiLCJkeVJ0LlRlc3RTY2hlZHVsZXIuX3RpY2siLCJkeVJ0LkFjdGlvblR5cGUiLCJkeVJ0LlRlc3RTdHJlYW0iLCJkeVJ0LlRlc3RTdHJlYW0uY29uc3RydWN0b3IiLCJkeVJ0LlRlc3RTdHJlYW0uY3JlYXRlIiwiZHlSdC5UZXN0U3RyZWFtLnN1YnNjcmliZUNvcmUiLCJkeVJ0Lkp1ZGdlVXRpbHMiLCJkeVJ0Lkp1ZGdlVXRpbHMuY29uc3RydWN0b3IiLCJkeVJ0Lkp1ZGdlVXRpbHMuaXNQcm9taXNlIiwiZHlSdC5KdWRnZVV0aWxzLmlzRXF1YWwiXSwibWFwcGluZ3MiOiJBQUlDOztBQ0pELEFBQ0EsMkNBRDJDO0FBTzFDO0FDUEQsSUFBTyxJQUFJLENBRVY7QUFGRCxXQUFPLElBQUksRUFBQSxDQUFDO0lBQ0dBLFNBQUlBLEdBQU9BLE1BQU1BLENBQUNBO0FBQ2pDQSxDQUFDQSxFQUZNLElBQUksS0FBSixJQUFJLFFBRVY7O0FDRkQsSUFBTyxJQUFJLENBS1Y7QUFMRCxXQUFPLElBQUksRUFBQSxDQUFDO0lBQ0dBLG9CQUFlQSxHQUFZQTtRQUM5QixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUN0RCxDQUFDLEVBQ0RBLHVCQUFrQkEsR0FBT0EsSUFBSUEsQ0FBQ0E7QUFDdENBLENBQUNBLEVBTE0sSUFBSSxLQUFKLElBQUksUUFLVjs7QUNMRCwyQ0FBMkM7QUFFM0MsSUFBTyxJQUFJLENBV1Y7QUFYRCxXQUFPLElBQUksRUFBQSxDQUFDO0lBSVJBLHVCQUF1QkE7SUFDdkJBLEVBQUVBLENBQUFBLENBQUNBLElBQUlBLENBQUNBLENBQUFBLENBQUNBO1FBQ0xBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLFVBQVNBLENBQUNB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QUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUMxREEsQ0FBQ0E7UUFDTEgsaUJBQUNBO0lBQURBLENBdEJBaE0sQUFzQkNnTSxFQXRCK0JoTSxlQUFVQSxFQXNCekNBO0lBdEJZQSxlQUFVQSxhQXNCdEJBLENBQUFBO0FBQ0xBLENBQUNBLEVBeEJNLElBQUksS0FBSixJQUFJLFFBd0JWOzs7Ozs7OztBQ3pCRCx3Q0FBd0M7QUFDeEMsSUFBTyxJQUFJLENBWVY7QUFaRCxXQUFPLElBQUksRUFBQyxDQUFDO0lBQ1RBO1FBQWdDb00sOEJBQWVBO1FBQS9DQTtZQUFnQ0MsOEJBQWVBO1FBVS9DQSxDQUFDQTtRQVRpQkQsb0JBQVNBLEdBQXZCQSxVQUF3QkEsR0FBR0E7WUFDdkJFLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBO21CQUNMQSxDQUFDQSxNQUFLQSxDQUFDQSxVQUFVQSxZQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQTttQkFDaENBLE1BQUtBLENBQUNBLFVBQVVBLFlBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3RDQSxDQUFDQTtRQUVhRixrQkFBT0EsR0FBckJBLFVBQXNCQSxHQUFVQSxFQUFFQSxHQUFVQTtZQUN4Q0csTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsS0FBS0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7UUFDL0JBLENBQUNBO1FBQ0xILGlCQUFDQTtJQUFEQSxDQVZBcE0sQUFVQ29NLEVBVitCcE0sSUFBSUEsQ0FBQ0EsVUFBVUEsRUFVOUNBO0lBVllBLGVBQVVBLGFBVXRCQSxDQUFBQTtBQUNMQSxDQUFDQSxFQVpNLElBQUksS0FBSixJQUFJLFFBWVYiLCJmaWxlIjoiZHlSdC5kZWJ1Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgSURpc3Bvc2FibGV7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICB9XG59XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJT2JzZXJ2ZXIgZXh0ZW5kcyBJRGlzcG9zYWJsZXtcbiAgICAgICAgbmV4dCh2YWx1ZTphbnkpO1xuICAgICAgICBlcnJvcihlcnJvcjphbnkpO1xuICAgICAgICBjb21wbGV0ZWQoKTtcbiAgICB9XG59XG4iLCJtb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgdmFyIHJvb3Q6YW55ID0gd2luZG93O1xufVxuIiwibW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IHZhciBBQlNUUkFDVF9NRVRIT0Q6RnVuY3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihcImFic3RyYWN0IG1ldGhvZCBuZWVkIG92ZXJyaWRlXCIpO1xuICAgICAgICB9LFxuICAgICAgICBBQlNUUkFDVF9BVFRSSUJVVEU6YW55ID0gbnVsbDtcbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5cbm1vZHVsZSBkeVJ0e1xuICAgIC8vcnN2cC5qc1xuICAgIGRlY2xhcmUgdmFyIFJTVlA6YW55O1xuXG4gICAgLy9ub3Qgc3dhbGxvdyB0aGUgZXJyb3JcbiAgICBpZihSU1ZQKXtcbiAgICAgICAgUlNWUC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfTtcbiAgICAgICAgUlNWUC5vbignZXJyb3InLCBSU1ZQLm9uZXJyb3IpO1xuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uIGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG5cdFx0cHVibGljIHN0YXRpYyBjcmVhdGUoc3ViamVjdDpTdWJqZWN0LCBvYnNlcnZlcjpPYnNlcnZlcikge1xuXHRcdFx0dmFyIG9iaiA9IG5ldyB0aGlzKHN1YmplY3QsIG9ic2VydmVyKTtcblxuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9XG5cblx0XHRwcml2YXRlIF9zdWJqZWN0OlN1YmplY3QgPSBudWxsO1xuXHRcdHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuXHRcdGNvbnN0cnVjdG9yKHN1YmplY3Q6U3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuXHRcdFx0dGhpcy5fc3ViamVjdCA9IHN1YmplY3Q7XG5cdFx0XHR0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9zdWJqZWN0LnJlbW92ZSh0aGlzLl9vYnNlcnZlcik7XG5cblx0XHRcdHRoaXMuX29ic2VydmVyLmRpc3Bvc2UoKTtcblx0XHR9XG5cdH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEVudGl0eXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBVSUQ6bnVtYmVyID0gMTtcblxuICAgICAgICBwcml2YXRlIF91aWQ6c3RyaW5nID0gbnVsbDtcbiAgICAgICAgZ2V0IHVpZCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3VpZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdWlkKHVpZDpzdHJpbmcpe1xuICAgICAgICAgICAgdGhpcy5fdWlkID0gdWlkO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IodWlkUHJlOnN0cmluZyl7XG4gICAgICAgICAgICB0aGlzLl91aWQgPSB1aWRQcmUgKyBTdHJpbmcoRW50aXR5LlVJRCsrKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIFN0cmVhbSBleHRlbmRzIEVudGl0eXtcbiAgICAgICAgcHVibGljIHNjaGVkdWxlcjpTY2hlZHVsZXIgPSBBQlNUUkFDVF9BVFRSSUJVVEU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9kaXNwb3NlSGFuZGxlcjpkeUNiLkNvbGxlY3Rpb248RnVuY3Rpb24+ID0gZHlDYi5Db2xsZWN0aW9uLmNyZWF0ZTxGdW5jdGlvbj4oKTtcbiAgICAgICAgZ2V0IGRpc3Bvc2VIYW5kbGVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGlzcG9zZUhhbmRsZXI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGRpc3Bvc2VIYW5kbGVyKGRpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbjxGdW5jdGlvbj4pe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIgPSBkaXNwb3NlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHN1YnNjcmliZUZ1bmMpe1xuICAgICAgICAgICAgc3VwZXIoXCJTdHJlYW1cIik7XG5cbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlRnVuYyA9IHN1YnNjcmliZUZ1bmMgfHwgZnVuY3Rpb24oKXsgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMTpGdW5jdGlvbnxPYnNlcnZlcnxTdWJqZWN0LCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKTpJRGlzcG9zYWJsZSB7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVGdW5jKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhZGREaXNwb3NlSGFuZGxlcihmdW5jOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyLmFkZENoaWxkKGZ1bmMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGhhbmRsZVN1YmplY3QoYXJnKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzU3ViamVjdChhcmcpKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRTdWJqZWN0KGFyZyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkbyhvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gRG9TdHJlYW0uY3JlYXRlKHRoaXMsIG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1hcChzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIE1hcFN0cmVhbS5jcmVhdGUodGhpcywgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGZsYXRNYXAoc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgLy9yZXR1cm4gRmxhdE1hcFN0cmVhbS5jcmVhdGUodGhpcywgc2VsZWN0b3IpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFwKHNlbGVjdG9yKS5tZXJnZUFsbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlQWxsKCl7XG4gICAgICAgICAgICByZXR1cm4gTWVyZ2VBbGxTdHJlYW0uY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRha2VVbnRpbChvdGhlclN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgcmV0dXJuIFRha2VVbnRpbFN0cmVhbS5jcmVhdGUodGhpcywgb3RoZXJTdHJlYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdWJqZWN0KHN1YmplY3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHN1YmplY3QgaW5zdGFuY2VvZiBTdWJqZWN0O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0U3ViamVjdChzdWJqZWN0KXtcbiAgICAgICAgICAgIHN1YmplY3Quc291cmNlID0gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIFN1YmplY3QgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgZ2V0IHNvdXJjZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgc291cmNlKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXJzOmR5Q2IuQ29sbGVjdGlvbjxJT2JzZXJ2ZXI+ID0gZHlDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJT2JzZXJ2ZXI+KCk7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxPzpGdW5jdGlvbnxPYnNlcnZlciwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IDxBdXRvRGV0YWNoT2JzZXJ2ZXI+YXJnMVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLl9zb3VyY2UuZGlzcG9zZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gSW5uZXJTdWJzY3JpcHRpb24uY3JlYXRlKHRoaXMsIG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbihvYjpPYnNlcnZlcil7XG4gICAgICAgICAgICAgICAgb2IubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24ob2I6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgICAgIG9iLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24ob2I6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgICAgIG9iLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKXtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXJzLnJlbW92ZUNoaWxkKGZ1bmN0aW9uKG9iOk9ic2VydmVyKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKG9iLCBvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbihvYjpPYnNlcnZlcil7XG4gICAgICAgICAgICAgICAgb2IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVycy5yZW1vdmVBbGxDaGlsZHJlbigpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdCB7XG4gICAgcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgd3JhcHBlciA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gbnVsbCxcbiAgICAgICAgICAgIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcblxuICAgICAgICB3cmFwcGVyID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgICAgICAgICAgIHRpbWUgPSArbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHNlbGYuY2FsbGJhY2sodGltZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyohXG4gICAgICAgICBidWchXG4gICAgICAgICBiZWxvdyBjb2RlOlxuICAgICAgICAgd2hlbiBpbnZva2UgYiBhZnRlciAxcywgd2lsbCBvbmx5IGludm9rZSBiLCBub3QgaW52b2tlIGEhXG5cbiAgICAgICAgIGZ1bmN0aW9uIGEodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImFcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGZ1bmN0aW9uIGIodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImJcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYik7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGEoKTtcblxuICAgICAgICAgc2V0VGltZW91dChiLCAxMDAwKTtcblxuXG5cbiAgICAgICAgIHNvIHVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcHJpb3JpdHkhXG4gICAgICAgICAqL1xuICAgICAgICBpZihyb290LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgQ2hyb21lIDEwIGJ1ZyB3aGVyZSBDaHJvbWVcbiAgICAgICAgLy8gZG9lcyBub3QgcGFzcyB0aGUgdGltZSB0byB0aGUgYW5pbWF0aW9uIGZ1bmN0aW9uXG5cbiAgICAgICAgaWYgKHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBEZWZpbmUgdGhlIHdyYXBwZXJcblxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgc3dpdGNoXG5cbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgLy8gQnJvd3NlciBjYWxscyB0aGUgd3JhcHBlciBhbmQgd3JhcHBlciBjYWxscyB0aGUgY2FsbGJhY2tcblxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSh3cmFwcGVyLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v5L+u5pS5dGltZeWPguaVsFxuICAgICAgICBpZiAocm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgR2Vja28gMi4wLCB3aGljaCBoYXMgYSBidWcgaW5cbiAgICAgICAgLy8gbW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKCkgdGhhdCByZXN0cmljdHMgYW5pbWF0aW9uc1xuICAgICAgICAvLyB0byAzMC00MCBmcHMuXG5cbiAgICAgICAgaWYgKHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBDaGVjayB0aGUgR2Vja28gdmVyc2lvbi4gR2Vja28gaXMgdXNlZCBieSBicm93c2Vyc1xuICAgICAgICAgICAgLy8gb3RoZXIgdGhhbiBGaXJlZm94LiBHZWNrbyAyLjAgY29ycmVzcG9uZHMgdG9cbiAgICAgICAgICAgIC8vIEZpcmVmb3ggNC4wLlxuXG4gICAgICAgICAgICBpbmRleCA9IHVzZXJBZ2VudC5pbmRleE9mKCdydjonKTtcblxuICAgICAgICAgICAgaWYgKHVzZXJBZ2VudC5pbmRleE9mKCdHZWNrbycpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gdXNlckFnZW50LnN1YnN0cihpbmRleCArIDMsIDMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGdlY2tvVmVyc2lvbiA9PT0gJzIuMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yY2VzIHRoZSByZXR1cm4gc3RhdGVtZW50IHRvIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgc2V0VGltZW91dCgpIGZ1bmN0aW9uLlxuXG4gICAgICAgICAgICAgICAgICAgIHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4vLyAgICAgICAgICAgIHJldHVybiAgcm9vdC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIC8v5Lyg6YCS57uZY2FsbGJhY2vnmoR0aW1l5LiN5piv5LuOMTk3MOW5tDHmnIgx5pel5Yiw5b2T5YmN5omA57uP6L+H55qE5q+r56eS5pWw77yBXG4gICAgICAgIHJldHVybiByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHJvb3Qub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXG4gICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaDtcblxuICAgICAgICAgICAgICAgIHJvb3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gK25ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoID0gK25ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi50aW1lb3V0ID0gMTAwMCAvIDYwIC0gKGZpbmlzaCAtIHN0YXJ0KTtcblxuICAgICAgICAgICAgICAgIH0sIHNlbGYudGltZW91dCk7XG4gICAgICAgICAgICB9O1xuICAgIH0oKSk7XG5cbiAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290LmNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qud2Via2l0Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3QubW96Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qub0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm1zQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IGNsZWFyVGltZW91dDtcblxuICAgIGV4cG9ydCBjbGFzcyBTY2hlZHVsZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9yZXF1ZXN0TG9vcElkOmFueSA9IG51bGw7XG4gICAgICAgIGdldCByZXF1ZXN0TG9vcElkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgcmVxdWVzdExvb3BJZChyZXF1ZXN0TG9vcElkOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0TG9vcElkID0gcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vb2JzZXJ2ZXIgaXMgZm9yIFRlc3RTY2hlZHVsZXIgdG8gaW5qZWN0XG4gICAgICAgIC8vdG9kbyByZW1vdmUgb2JzZXJ2ZXJcblxuICAgICAgICBwdWJsaWMgcHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCBhY3Rpb246RnVuY3Rpb24pe1xuICAgICAgICAgICAgYWN0aW9uKGluaXRpYWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCBpbnRlcnZhbDpudW1iZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgcmV0dXJuIHJvb3Quc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGluaXRpYWwgPSBhY3Rpb24oaW5pdGlhbCk7XG4gICAgICAgICAgICB9LCBpbnRlcnZhbClcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0KG9ic2VydmVyOklPYnNlcnZlciwgYWN0aW9uOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBsb29wID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICBhY3Rpb24odGltZSk7XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9yZXF1ZXN0TG9vcElkID0gcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdExvb3BJZCA9IHJvb3QucmVxdWVzdE5leHRBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnQge1xuICAgIGV4cG9ydCBjbGFzcyBPYnNlcnZlciBleHRlbmRzIEVudGl0eSBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHJpdmF0ZSBfaXNEaXNwb3NlZDpib29sZWFuID0gbnVsbDtcbiAgICAgICAgZ2V0IGlzRGlzcG9zZWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc0Rpc3Bvc2VkO1xuICAgICAgICB9XG4gICAgICAgIHNldCBpc0Rpc3Bvc2VkKGlzRGlzcG9zZWQ6Ym9vbGVhbil7XG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gaXNEaXNwb3NlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJOZXh0OkZ1bmN0aW9uID0gbnVsbDtcbiAgICAgICAgcHJvdGVjdGVkIG9uVXNlckVycm9yOkZ1bmN0aW9uID0gbnVsbDtcbiAgICAgICAgcHJvdGVjdGVkIG9uVXNlckNvbXBsZXRlZDpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdG9wOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHJpdmF0ZSBfZGlzcG9zZUhhbmRsZXI6ZHlDYi5Db2xsZWN0aW9uPEZ1bmN0aW9uPiA9IGR5Q2IuQ29sbGVjdGlvbi5jcmVhdGU8RnVuY3Rpb24+KCk7XG5cbiAgICAgICAgY29uc3RydWN0b3Iob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIoXCJPYnNlcnZlclwiKTtcblxuICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0ID0gb25OZXh0IHx8IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IgPSBvbkVycm9yIHx8IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkID0gb25Db21wbGV0ZWQgfHwgZnVuY3Rpb24oKXt9O1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25OZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlci5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wdWJsaWMgZmFpbChlKSB7XG4gICAgICAgIC8vICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgIC8vICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAvLyAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgLy8gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2VIYW5kbGVyKGRpc3Bvc2VIYW5kbGVyOmR5Q2IuQ29sbGVjdGlvbjxGdW5jdGlvbj4pe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIgPSBkaXNwb3NlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhyb3cgQUJTVFJBQ1RfTUVUSE9EKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aHJvdyBBQlNUUkFDVF9NRVRIT0QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhyb3cgQUJTVFJBQ1RfTUVUSE9EKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBBbm9ueW1vdXNPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShvbk5leHQ6RnVuY3Rpb24sIG9uRXJyb3I6RnVuY3Rpb24sIG9uQ29tcGxldGVkOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEF1dG9EZXRhY2hPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShvbk5leHQ6RnVuY3Rpb24sIG9uRXJyb3I6RnVuY3Rpb24sIG9uQ29tcGxldGVkOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgaWYodGhpcy5pc0Rpc3Bvc2VkKXtcbiAgICAgICAgICAgICAgICBkeUNiLkxvZy5sb2coXCJvbmx5IGNhbiBkaXNwb3NlIG9uY2VcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJFcnJvcihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgTWFwT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzZWxlY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc2VsZWN0b3I6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBudWxsO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NlbGVjdG9yKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLm5leHQocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgRG9PYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBwcmV2T2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3ByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlciA9IHByZXZPYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlQWxsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHN0cmVhbUdyb3VwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBnZXQgY3VycmVudE9ic2VydmVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG4gICAgICAgIHNldCBjdXJyZW50T2JzZXJ2ZXIoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2RvbmU6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBnZXQgZG9uZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RvbmU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGRvbmUoZG9uZTpib29sZWFuKXtcbiAgICAgICAgICAgIHRoaXMuX2RvbmUgPSBkb25lO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBkeUNiLkxvZy5lcnJvcighKGlubmVyU291cmNlIGluc3RhbmNlb2YgU3RyZWFtIHx8IEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSksIGR5Q2IuTG9nLmluZm8uRlVOQ19NVVNUX0JFKFwiaW5uZXJTb3VyY2VcIiwgXCJTdHJlYW0gb3IgUHJvbWlzZVwiKSk7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSl7XG4gICAgICAgICAgICAgICAgaW5uZXJTb3VyY2UgPSBmcm9tUHJvbWlzZShpbm5lclNvdXJjZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLmFkZENoaWxkKGlubmVyU291cmNlKTtcblxuICAgICAgICAgICAgaW5uZXJTb3VyY2UuYnVpbGRTdHJlYW0oSW5uZXJPYnNlcnZlci5jcmVhdGUodGhpcywgdGhpcy5fc3RyZWFtR3JvdXAsIGlubmVyU291cmNlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGFzcyBJbm5lck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHBhcmVudDpNZXJnZUFsbE9ic2VydmVyLCBzdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb248U3RyZWFtPiwgY3VycmVudFN0cmVhbTpTdHJlYW0pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDpkeUNiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciwgc3RyZWFtR3JvdXA6ZHlDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0cmVhbSA9IGN1cnJlbnRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdHJlYW0gPSB0aGlzLl9jdXJyZW50U3RyZWFtLFxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHRoaXMuX3BhcmVudDtcblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAucmVtb3ZlQ2hpbGQoZnVuY3Rpb24oc3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEp1ZGdlVXRpbHMuaXNFcXVhbChzdHJlYW0sIGN1cnJlbnRTdHJlYW0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vaWYgdGhpcyBpbm5lclNvdXJjZSBpcyBhc3luYyBzdHJlYW0oYXMgcHJvbWlzZSBzdHJlYW0pLFxuICAgICAgICAgICAgLy9pdCB3aWxsIGZpcnN0IGV4ZWMgYWxsIHBhcmVudC5uZXh0IGFuZCBvbmUgcGFyZW50LmNvbXBsZXRlZCxcbiAgICAgICAgICAgIC8vdGhlbiBleGVjIGFsbCB0aGlzLm5leHQgYW5kIGFsbCB0aGlzLmNvbXBsZXRlZFxuICAgICAgICAgICAgLy9zbyBpbiB0aGlzIGNhc2UsIGl0IHNob3VsZCBpbnZva2UgcGFyZW50LmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQgYWZ0ZXIgdGhlIGxhc3QgaW52b2tjYXRpb24gb2YgdGhpcy5jb21wbGV0ZWQoaGF2ZSBpbnZva2VkIGFsbCB0aGUgaW5uZXJTb3VyY2UpXG4gICAgICAgICAgICBpZih0aGlzLl9pc0FzeW5jKCkgJiYgdGhpcy5fc3RyZWFtR3JvdXAuZ2V0Q291bnQoKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgcGFyZW50LmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzQXN5bmMoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQuZG9uZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIFRha2VVbnRpbE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhwcmV2T2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcHJldk9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJldk9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyID0gcHJldk9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBCYXNlU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhyb3cgQUJTVFJBQ1RfTUVUSE9EKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE6RnVuY3Rpb258T2JzZXJ2ZXJ8U3ViamVjdCwgb25FcnJvcj8sIG9uQ29tcGxldGVkPyk6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICAgICAgaWYodGhpcy5oYW5kbGVTdWJqZWN0KGFyZzEpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyBhcmcxXG4gICAgICAgICAgICAgICAgOiBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxGdW5jdGlvbj5hcmcxLCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKHRoaXMuZGlzcG9zZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICAvL3RvZG8gZW5jYXBzdWxhdGUgaXQgdG8gc2NoZWR1bGVJdGVtXG4gICAgICAgICAgICAvL3RvZG8gZGVsZXRlIHRhcmdldD9cbiAgICAgICAgICAgIC8vdGhpcy5zY2hlZHVsZXIudGFyZ2V0ID0gb2JzZXJ2ZXI7XG5cbiAgICAgICAgICAgIC8vZHlDYi5Mb2cuZXJyb3IodGhpcy5faGFzTXVsdGlPYnNlcnZlcnMoKSwgXCJzaG91bGQgdXNlIFN1YmplY3QgdG8gaGFuZGxlIG11bHRpIG9ic2VydmVyc1wiKTtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyLmJ1aWxkU3RyZWFtKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVDb3JlKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHJpdmF0ZSBfaGFzTXVsdGlPYnNlcnZlcnMoKXtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVyLmdldE9ic2VydmVycygpID4gMTtcbiAgICAgICAgLy99XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBEb1N0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIG9uTmV4dD86RnVuY3Rpb24sIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBvbk5leHQ6RnVuY3Rpb24sIG9uRXJyb3I6RnVuY3Rpb24sIG9uQ29tcGxldGVkOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlciA9IEFub255bW91c09ic2VydmVyLmNyZWF0ZShvbk5leHQsIG9uRXJyb3Isb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShEb09ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fb2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgTWFwU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIHNlbGVjdG9yKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zZWxlY3RvcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICAgICAgLy90aGlzLnNjaGVkdWxlci5hZGRXcmFwVGFyZ2V0KE1hcE9ic2VydmVyLmNyZWF0ZShzZWxlY3RvcikpO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1hcE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fc2VsZWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICAvL3B1YmxpYyBzdWJzY3JpYmUoYXJnMTpGdW5jdGlvbnxPYnNlcnZlcnxTdWJqZWN0LCBvbkVycm9yPywgb25Db21wbGV0ZWQ/KTpJRGlzcG9zYWJsZSB7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLl9zb3VyY2Uuc3Vic2NyaWJlLmFwcGx5KHRoaXMuX3NvdXJjZSwgYXJndW1lbnRzKTtcbiAgICAgICAgLy99XG4gICAgICAgIC8vXG4gICAgICAgIC8vcHVibGljIHN1YnNjcmliZUNvcmUoKXtcbiAgICAgICAgLy8gICAgaWYodGhpcy5fc291cmNlIGluc3RhbmNlb2YgQmFzZVN0cmVhbSl7XG4gICAgICAgIC8vICAgICAgICBsZXQgYmFzZVN0cmVhbSA9IDxCYXNlU3RyZWFtPnRoaXMuX3NvdXJjZTtcbiAgICAgICAgLy8gICAgICAgIGJhc2VTdHJlYW0uc3Vic2NyaWJlQ29yZSgpO1xuICAgICAgICAvLyAgICB9XG4gICAgICAgIC8vfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21BcnJheVN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhhcnJheSwgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FycmF5OkFycmF5PGFueT4gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyYXk7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgYXJyYXkgPSB0aGlzLl9hcnJheSxcbiAgICAgICAgICAgICAgICBsZW4gPSBhcnJheS5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vbmV4dCxjb21wbGV0ZWQgaXMgZm9yIFRlc3RTY2hlZHVsZXIgdG8gaW5qZWN0XG4gICAgICAgICAgICAvL3RvZG8gcmVtb3ZlIGluamVjdCBuZXh0LGNvbXBsZXRlZD9cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvb3BSZWN1cnNpdmUoaSwgbmV4dCwgY29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobmV4dCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0KGFycmF5W2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChhcnJheVtpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzLmNhbGxlZShpICsgMSwgbmV4dCwgY29tcGxldGVkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZihjb21wbGV0ZWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyLCAwLCBsb29wUmVjdXJzaXZlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21Qcm9taXNlU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJvbWlzZTphbnksIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocHJvbWlzZSwgc2NoZWR1bGVyKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcm9taXNlOmFueSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJvbWlzZTphbnksIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuXG4gICAgICAgICAgICAvL3RvZG8gcmVtb3ZlIHRlc3QgbG9naWMgZnJvbSBwcm9kdWN0IGxvZ2ljKGFzIFNjaGVkdWxlci0+cHVibGljeHh4LCBGcm9tUHJvbWlzZS0+dGhlbi4uLilcbiAgICAgICAgICAgIHRoaXMuX3Byb21pc2UudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0sIG9ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21FdmVudFBhdHRlcm5TdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hZGRIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYWRkSGFuZGxlcjpGdW5jdGlvbiwgcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlciA9IGFkZEhhbmRsZXI7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVIYW5kbGVyID0gcmVtb3ZlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlubmVySGFuZGxlcihldmVudCl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaW5uZXJIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5hZGREaXNwb3NlSGFuZGxlcihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHNlbGYuX3JlbW92ZUhhbmRsZXIoaW5uZXJIYW5kbGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBBbm9ueW1vdXNTdHJlYW0gZXh0ZW5kcyBTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHN1YnNjcmliZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzdWJzY3JpYmVGdW5jKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHN1YnNjcmliZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKHN1YnNjcmliZUZ1bmMpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICAgICAgaWYodGhpcy5oYW5kbGVTdWJqZWN0KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgLy90b2RvIGVuY2Fwc3VsYXRlIGl0IHRvIHNjaGVkdWxlSXRlbVxuICAgICAgICAgICAgLy90aGlzLnNjaGVkdWxlci50YXJnZXQgPSBvYnNlcnZlcjtcblxuICAgICAgICAgICAgdGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIEludGVydmFsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaW50ZXJ2YWw6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoaW50ZXJ2YWwsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIG9iai5pbml0V2hlbkNyZWF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaW50ZXJ2YWw6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihpbnRlcnZhbDpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gaW50ZXJ2YWw7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbml0V2hlbkNyZWF0ZSgpe1xuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSB0aGlzLl9pbnRlcnZhbCA8PSAwID8gMSA6IHRoaXMuX2ludGVydmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlkID0gdGhpcy5zY2hlZHVsZXIucHVibGlzaEludGVydmFsKG9ic2VydmVyLCAwLCB0aGlzLl9pbnRlcnZhbCwgZnVuY3Rpb24oY291bnQpIHtcbiAgICAgICAgICAgICAgICAvL3NlbGYuc2NoZWR1bGVyLm5leHQoY291bnQpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoY291bnQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50ICsgMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmFkZERpc3Bvc2VIYW5kbGVyKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcm9vdC5jbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zLmQudHNcIi8+XG5tb2R1bGUgZHlSdHtcbiAgICBleHBvcnQgY2xhc3MgSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXIsIGZ1bmN0aW9uKHRpbWUpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHRpbWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkRGlzcG9zZUhhbmRsZXIoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2VsZi5zY2hlZHVsZXIucmVxdWVzdExvb3BJZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlQWxsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIC8vdGhpcy5fb2JzZXJ2ZXIgPSBBbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc3RyZWFtR3JvdXAgPSBkeUNiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1lcmdlQWxsT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCBzdHJlYW1Hcm91cCkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBUYWtlVW50aWxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBvdGhlclN0ZWFtOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgb3RoZXJTdGVhbSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb3RoZXJTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBvdGhlclN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX290aGVyU3RyZWFtID0gSnVkZ2VVdGlscy5pc1Byb21pc2Uob3RoZXJTdHJlYW0pID8gZnJvbVByb21pc2Uob3RoZXJTdHJlYW0pIDogb3RoZXJTdHJlYW07XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKG9ic2VydmVyKTtcbiAgICAgICAgICAgIHRoaXMuX290aGVyU3RyZWFtLmJ1aWxkU3RyZWFtKFRha2VVbnRpbE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCB2YXIgY3JlYXRlU3RyZWFtID0gZnVuY3Rpb24oc3Vic2NyaWJlRnVuYykge1xuICAgICAgICByZXR1cm4gQW5vbnltb3VzU3RyZWFtLmNyZWF0ZShzdWJzY3JpYmVGdW5jKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tQXJyYXkgPSBmdW5jdGlvbihhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpe1xuICAgICAgICByZXR1cm4gRnJvbUFycmF5U3RyZWFtLmNyZWF0ZShhcnJheSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tUHJvbWlzZSA9IGZ1bmN0aW9uKHByb21pc2U6YW55LCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpe1xuICAgICAgICByZXR1cm4gRnJvbVByb21pc2VTdHJlYW0uY3JlYXRlKHByb21pc2UsIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbUV2ZW50UGF0dGVybiA9IGZ1bmN0aW9uKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICByZXR1cm4gRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5jcmVhdGUoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgaW50ZXJ2YWwgPSBmdW5jdGlvbiAoaW50ZXJ2YWwsIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkge1xuICAgICAgICByZXR1cm4gSW50ZXJ2YWxTdHJlYW0uY3JlYXRlKGludGVydmFsLCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGludGVydmFsUmVxdWVzdCA9IGZ1bmN0aW9uIChzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpIHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsUmVxdWVzdFN0cmVhbS5jcmVhdGUoc2NoZWR1bGVyKTtcbiAgICB9O1xufVxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICB2YXIgZGVmYXVsdElzRXF1YWwgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICB9O1xuXG4gICAgZXhwb3J0IGNsYXNzIFJlY29yZCB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHRpbWU6bnVtYmVyLCB2YWx1ZTphbnksIGFjdGlvblR5cGU/OkFjdGlvblR5cGUsIGNvbXBhcmVyPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHRpbWUsIHZhbHVlLCBhY3Rpb25UeXBlLCBjb21wYXJlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB0aW1lKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdGltZSh0aW1lOm51bWJlcil7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3ZhbHVlOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB2YWx1ZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHNldCB2YWx1ZSh2YWx1ZTpudW1iZXIpe1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FjdGlvblR5cGU6QWN0aW9uVHlwZSA9IG51bGw7XG4gICAgICAgIGdldCBhY3Rpb25UeXBlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aW9uVHlwZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgYWN0aW9uVHlwZShhY3Rpb25UeXBlOkFjdGlvblR5cGUpe1xuICAgICAgICAgICAgdGhpcy5fYWN0aW9uVHlwZSA9IGFjdGlvblR5cGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jb21wYXJlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IodGltZSwgdmFsdWUsIGFjdGlvblR5cGU6QWN0aW9uVHlwZSwgY29tcGFyZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX2FjdGlvblR5cGUgPSBhY3Rpb25UeXBlO1xuICAgICAgICAgICAgdGhpcy5fY29tcGFyZXIgPSBjb21wYXJlciB8fCBkZWZhdWx0SXNFcXVhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWUgPT09IG90aGVyLnRpbWUgJiYgdGhpcy5fY29tcGFyZXIodGhpcy5fdmFsdWUsIG90aGVyLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy5kLnRzXCIvPlxubW9kdWxlIGR5UnR7XG4gICAgZXhwb3J0IGNsYXNzIE1vY2tPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IDxbUmVjb3JkXT5bXTtcbiAgICAgICAgZ2V0IG1lc3NhZ2VzKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXM7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IG1lc3NhZ2VzKG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgdmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIGVycm9yKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIG51bGwpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0e1xuICAgIGV4cG9ydCBjbGFzcyBNb2NrUHJvbWlzZXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIsIG1lc3NhZ2VzOltSZWNvcmRdKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyLCBtZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IDxbUmVjb3JkXT5bXTtcbiAgICAgICAgLy9nZXQgbWVzc2FnZXMoKXtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICAgICAgICAvL31cbiAgICAgICAgLy9zZXQgbWVzc2FnZXMobWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAvLyAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICAvL31cblxuICAgICAgICBwcml2YXRlIF9zY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIsIG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdGhlbihzdWNjZXNzQ2I6RnVuY3Rpb24sIGVycm9yQ2I6RnVuY3Rpb24sIG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICAvL3ZhciBzY2hlZHVsZXIgPSA8VGVzdFNjaGVkdWxlcj4odGhpcy5zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCB0aGlzLl9tZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBjb25zdCBTVUJTQ1JJQkVfVElNRSA9IDIwMDtcbiAgICBjb25zdCBESVNQT1NFX1RJTUUgPSAxMDAwO1xuXG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIG5leHQodGljaywgdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBlcnJvcih0aWNrLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgZXJyb3IsIEFjdGlvblR5cGUuRVJST1IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjb21wbGV0ZWQodGljaykge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgbnVsbCwgQWN0aW9uVHlwZS5DT01QTEVURUQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2Nsb2NrOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCBjbG9jaygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBjbG9jayhjbG9jazpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pbml0aWFsQ2xvY2s6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfaXNEaXNwb3NlZDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX3RpbWVyTWFwOmR5Q2IuSGFzaDxGdW5jdGlvbj4gPSBkeUNiLkhhc2guY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1NYXA6ZHlDYi5IYXNoPEZ1bmN0aW9uPiA9IGR5Q2IuSGFzaC5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX3N1YnNjcmliZWRUaW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VkVGltZTpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzZXRTdHJlYW1NYXAob2JzZXJ2ZXI6SU9ic2VydmVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24ocmVjb3JkOlJlY29yZCl7XG4gICAgICAgICAgICAgICAgdmFyIGZ1bmMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZWNvcmQuYWN0aW9uVHlwZSl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5ORVhUOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuRVJST1I6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBkeUNiLkxvZy5lcnJvcih0cnVlLCBkeUNiLkxvZy5pbmZvLkZVTkNfVU5LTk9XKFwiYWN0aW9uVHlwZVwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9zdHJlYW1NYXAuYWRkQ2hpbGQoU3RyaW5nKHJlY29yZC50aW1lKSwgZnVuYyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgcmVjdXJzaXZlRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHJlY3Vyc2l2ZUZ1bmMoaW5pdGlhbCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fdGljaygxKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dChzZWxmLl9jbG9jaywgdmFsdWUpKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5jb21wbGV0ZWQoc2VsZi5fY2xvY2spKTtcbiAgICAgICAgICAgICAgICBzZWxmLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCBpbnRlcnZhbDpudW1iZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgd2hpbGUgKENPVU5UID4gMCAmJiAhdGhpcy5faXNEaXNwb3NlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RpY2soaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5uZXh0KHRoaXMuX2Nsb2NrLCBpbml0aWFsKSk7XG5cbiAgICAgICAgICAgICAgICAvL25vIG5lZWQgdG8gaW52b2tlIGFjdGlvblxuICAgICAgICAgICAgICAgIC8vYWN0aW9uKGluaXRpYWwpO1xuXG4gICAgICAgICAgICAgICAgaW5pdGlhbCsrO1xuICAgICAgICAgICAgICAgIENPVU5ULS07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXI6SU9ic2VydmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIC8vcHJvZHVjZSAxMCB2YWwgZm9yIHRlc3RcbiAgICAgICAgICAgIHZhciBDT1VOVCA9IDEwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzID0gW10sXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSAxMDA7XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHdoaWxlIChDT1VOVCA+IDAgJiYgIXRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aWNrKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dCh0aGlzLl9jbG9jaywgaW50ZXJ2YWwpKTtcblxuICAgICAgICAgICAgICAgIENPVU5ULS07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0Q2xvY2soKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2luaXRpYWxDbG9jayl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSAgTWF0aC5taW4odGhpcy5fY2xvY2ssIHRoaXMuX2luaXRpYWxDbG9jayk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2luaXRpYWxDbG9jayA9IHRoaXMuX2Nsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aFRpbWUoY3JlYXRlOkZ1bmN0aW9uLCBzdWJzY3JpYmVkVGltZTpudW1iZXIsIGRpc3Bvc2VkVGltZTpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IHRoaXMuY3JlYXRlT2JzZXJ2ZXIoKSxcbiAgICAgICAgICAgICAgICBzb3VyY2UsIHN1YnNjcmlwdGlvbjtcblxuICAgICAgICAgICAgdGhpcy5fc3Vic2NyaWJlZFRpbWUgPSBzdWJzY3JpYmVkVGltZTtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VkVGltZSA9IGRpc3Bvc2VkVGltZTtcblxuICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSBzdWJzY3JpYmVkVGltZTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl9ydW5BdChzdWJzY3JpYmVkVGltZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNvdXJjZSA9IGNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KGRpc3Bvc2VkVGltZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoU3Vic2NyaWJlKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUgPSBTVUJTQ1JJQkVfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIHN1YnNjcmliZWRUaW1lLCBESVNQT1NFX1RJTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aERpc3Bvc2UoY3JlYXRlLCBkaXNwb3NlZFRpbWUgPSBESVNQT1NFX1RJTUUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0V2l0aFRpbWUoY3JlYXRlLCBTVUJTQ1JJQkVfVElNRSwgZGlzcG9zZWRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaWNBYnNvbHV0ZSh0aW1lLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9ydW5BdCh0aW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgICAgICB2YXIgZXh0cmVtZU51bUFyciA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKSxcbiAgICAgICAgICAgICAgICBtaW4gPSBleHRyZW1lTnVtQXJyWzBdLFxuICAgICAgICAgICAgICAgIG1heCA9IGV4dHJlbWVOdW1BcnJbMV0sXG4gICAgICAgICAgICAgICAgdGltZSA9IG1pbjtcblxuICAgICAgICAgICAgLy90b2RvIHJlZHVjZSBsb29wIHRpbWVcbiAgICAgICAgICAgIHdoaWxlICh0aW1lIDw9IG1heCkge1xuICAgICAgICAgICAgICAgIC8vYmVjYXVzZSBcIl9leGVjLF9ydW5TdHJlYW1cIiBtYXkgY2hhbmdlIFwiX2Nsb2NrXCIsXG4gICAgICAgICAgICAgICAgLy9zbyBpdCBzaG91bGQgcmVzZXQgdGhlIF9jbG9ja1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aW1lO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fZXhlYyh0aW1lLCB0aGlzLl90aW1lck1hcCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9jayA9IHRpbWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ydW5TdHJlYW0odGltZSk7XG5cbiAgICAgICAgICAgICAgICB0aW1lKys7XG5cbiAgICAgICAgICAgICAgICAvL3RvZG8gZ2V0IG1heCB0aW1lIG9ubHkgZnJvbSBzdHJlYW1NYXA/XG4gICAgICAgICAgICAgICAgLy9uZWVkIHJlZnJlc2ggbWF4IHRpbWUuXG4gICAgICAgICAgICAgICAgLy9iZWNhdXNlIGlmIHRpbWVyTWFwIGhhcyBjYWxsYmFjayB0aGF0IGNyZWF0ZSBpbmZpbml0ZSBzdHJlYW0oYXMgaW50ZXJ2YWwpLFxuICAgICAgICAgICAgICAgIC8vaXQgd2lsbCBzZXQgc3RyZWFtTWFwIHNvIHRoYXQgdGhlIG1heCB0aW1lIHdpbGwgY2hhbmdlXG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5fZ2V0TWluQW5kTWF4VGltZSgpWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVN0cmVhbShhcmdzKXtcbiAgICAgICAgICAgIHJldHVybiBUZXN0U3RyZWFtLmNyZWF0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVPYnNlcnZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBNb2NrT2JzZXJ2ZXIuY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVJlc29sdmVkUHJvbWlzZSh0aW1lOm51bWJlciwgdmFsdWU6YW55KXtcbiAgICAgICAgICAgIHJldHVybiBNb2NrUHJvbWlzZS5jcmVhdGUodGhpcywgW1Rlc3RTY2hlZHVsZXIubmV4dCh0aW1lLCB2YWx1ZSksIFRlc3RTY2hlZHVsZXIuY29tcGxldGVkKHRpbWUrMSldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVSZWplY3RQcm9taXNlKHRpbWU6bnVtYmVyLCBlcnJvcjphbnkpe1xuICAgICAgICAgICAgcmV0dXJuIE1vY2tQcm9taXNlLmNyZWF0ZSh0aGlzLCBbVGVzdFNjaGVkdWxlci5lcnJvcih0aW1lLCBlcnJvcildKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2dldE1pbkFuZE1heFRpbWUoKXtcbiAgICAgICAgICAgIHZhciB0aW1lQXJyID0gdGhpcy5fdGltZXJNYXAuZ2V0S2V5cygpLmFkZENoaWxkcmVuKHRoaXMuX3N0cmVhbU1hcC5nZXRLZXlzKCkpXG4gICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihrZXkpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKGtleSk7XG4gICAgICAgICAgICAgICAgfSkudG9BcnJheSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gW01hdGgubWluLmFwcGx5KE1hdGgsIHRpbWVBcnIpLCBNYXRoLm1heC5hcHBseShNYXRoLCB0aW1lQXJyKV07XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9leGVjKHRpbWUsIG1hcCl7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IG1hcC5nZXRDaGlsZChTdHJpbmcodGltZSkpO1xuXG4gICAgICAgICAgICBpZihoYW5kbGVyKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9ydW5TdHJlYW0odGltZSl7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXMuX3N0cmVhbU1hcC5nZXRDaGlsZChTdHJpbmcodGltZSkpO1xuXG4gICAgICAgICAgICAvL2lmKGhhbmRsZXIgJiYgdGhpcy5faGFzT2JzZXJ2ZXIoKSl7XG4gICAgICAgICAgICBpZihoYW5kbGVyKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgX2hhc09ic2VydmVyKCl7XG4gICAgICAgIC8vICAgIGlmKHRoaXMudGFyZ2V0IGluc3RhbmNlb2YgU3ViamVjdCl7XG4gICAgICAgIC8vICAgICAgICBsZXQgc3ViamVjdCA9IDxTdWJqZWN0PnRoaXMudGFyZ2V0O1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIHJldHVybiBzdWJqZWN0LmdldE9ic2VydmVycygpID4gMFxuICAgICAgICAvLyAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgIHJldHVybiAhIXRoaXMudGFyZ2V0O1xuICAgICAgICAvL31cblxuICAgICAgICBwcml2YXRlIF9ydW5BdCh0aW1lOm51bWJlciwgY2FsbGJhY2s6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVyTWFwLmFkZENoaWxkKFN0cmluZyh0aW1lKSwgY2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdGljayh0aW1lOm51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5fY2xvY2sgKz0gdGltZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4iLCJtb2R1bGUgZHlSdCB7XG4gICAgZXhwb3J0IGVudW0gQWN0aW9uVHlwZXtcbiAgICAgICAgTkVYVCxcbiAgICAgICAgRVJST1IsXG4gICAgICAgIENPTVBMRVRFRFxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9uc1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgVGVzdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW0ge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShtZXNzYWdlczpbUmVjb3JkXSwgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhtZXNzYWdlcywgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihtZXNzYWdlczpbUmVjb3JkXSwgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgc2NoZWR1bGVyID0gPFRlc3RTY2hlZHVsZXI+KHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCB0aGlzLl9tZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZGVmaW5pdGlvbnMuZC50c1wiLz5cbm1vZHVsZSBkeVJ0IHtcbiAgICBleHBvcnQgY2xhc3MgSnVkZ2VVdGlscyBleHRlbmRzIGR5Q2IuSnVkZ2VVdGlscyB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNQcm9taXNlKG9iail7XG4gICAgICAgICAgICByZXR1cm4gISFvYmpcbiAgICAgICAgICAgICAgICAmJiAhc3VwZXIuaXNGdW5jdGlvbihvYmouc3Vic2NyaWJlKVxuICAgICAgICAgICAgICAgICYmIHN1cGVyLmlzRnVuY3Rpb24ob2JqLnRoZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBpc0VxdWFsKG9iMTpFbnRpdHksIG9iMjpFbnRpdHkpe1xuICAgICAgICAgICAgcmV0dXJuIG9iMS51aWQgPT09IG9iMi51aWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=