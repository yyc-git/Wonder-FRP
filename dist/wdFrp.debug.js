var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
        JudgeUtils.isIObserver = function (i) {
            return i.next && i.error && i.completed;
        };
        return JudgeUtils;
    }(wdCb.JudgeUtils));
    wdFrp.JudgeUtils = JudgeUtils;
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
        if (stream.pause) {
            stream.pause();
        }
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
    }());
    wdFrp.Entity = Entity;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var Main = (function () {
        function Main() {
        }
        Main.isTest = false;
        return Main;
    }());
    wdFrp.Main = Main;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var Log = wdCb.Log;
    function assert(cond, message) {
        if (message === void 0) { message = "contract error"; }
        Log.error(!cond, message);
    }
    wdFrp.assert = assert;
    function require(InFunc) {
        return function (target, name, descriptor) {
            var value = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (wdFrp.Main.isTest) {
                    InFunc.apply(this, args);
                }
                return value.apply(this, args);
            };
            return descriptor;
        };
    }
    wdFrp.require = require;
    function ensure(OutFunc) {
        return function (target, name, descriptor) {
            var value = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                var result = value.apply(this, args), params = [result].concat(args);
                if (wdFrp.Main.isTest) {
                    OutFunc.apply(this, params);
                }
                return result;
            };
            return descriptor;
        };
    }
    wdFrp.ensure = ensure;
    function requireGetter(InFunc) {
        return function (target, name, descriptor) {
            var getter = descriptor.get;
            descriptor.get = function () {
                if (wdFrp.Main.isTest) {
                    InFunc.call(this);
                }
                return getter.call(this);
            };
            return descriptor;
        };
    }
    wdFrp.requireGetter = requireGetter;
    function requireSetter(InFunc) {
        return function (target, name, descriptor) {
            var setter = descriptor.set;
            descriptor.set = function (val) {
                if (wdFrp.Main.isTest) {
                    InFunc.call(this, val);
                }
                setter.call(this, val);
            };
            return descriptor;
        };
    }
    wdFrp.requireSetter = requireSetter;
    function ensureGetter(OutFunc) {
        return function (target, name, descriptor) {
            var getter = descriptor.get;
            descriptor.get = function () {
                var result = getter.call(this);
                if (wdFrp.Main.isTest) {
                    OutFunc.call(this, result);
                }
                return result;
            };
            return descriptor;
        };
    }
    wdFrp.ensureGetter = ensureGetter;
    function ensureSetter(OutFunc) {
        return function (target, name, descriptor) {
            var setter = descriptor.set;
            descriptor.set = function (val) {
                var result = setter.call(this, val), params = [result, val];
                if (wdFrp.Main.isTest) {
                    OutFunc.apply(this, params);
                }
            };
            return descriptor;
        };
    }
    wdFrp.ensureSetter = ensureSetter;
    function invariant(func) {
        return function (target) {
            if (wdFrp.Main.isTest) {
                func(target);
            }
        };
    }
    wdFrp.invariant = invariant;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var SingleDisposable = (function (_super) {
        __extends(SingleDisposable, _super);
        function SingleDisposable(disposeHandler) {
            _super.call(this, "SingleDisposable");
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
    }(wdFrp.Entity));
    wdFrp.SingleDisposable = SingleDisposable;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var GroupDisposable = (function (_super) {
        __extends(GroupDisposable, _super);
        function GroupDisposable(disposable) {
            _super.call(this, "GroupDisposable");
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
        GroupDisposable.prototype.remove = function (disposable) {
            this._group.removeChild(disposable);
            return this;
        };
        GroupDisposable.prototype.dispose = function () {
            this._group.forEach(function (disposable) {
                disposable.dispose();
            });
        };
        return GroupDisposable;
    }(wdFrp.Entity));
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
    }());
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
    }());
    wdFrp.InnerSubscriptionGroup = InnerSubscriptionGroup;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    if (wdFrp.JudgeUtils.isNodeJs()) {
        wdFrp.root = global;
    }
    else {
        wdFrp.root = window;
    }
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
var wdFrp;
(function (wdFrp) {
    wdFrp.root.requestNextAnimationFrame = (function () {
        var originalRequestAnimationFrame = undefined, wrapper = undefined, callback = undefined, geckoVersion = null, userAgent = wdFrp.root.navigator && wdFrp.root.navigator.userAgent, index = 0, self = this;
        wrapper = function (time) {
            time = wdFrp.root.performance.now();
            self.callback(time);
        };
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
})(wdFrp || (wdFrp = {}));
;
var wdFrp;
(function (wdFrp) {
    var Log = wdCb.Log;
    var Stream = (function (_super) {
        __extends(Stream, _super);
        function Stream(subscribeFunc) {
            _super.call(this, "Stream");
            this.scheduler = null;
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
        Stream.prototype.concatMap = function (selector) {
            return this.map(selector).concatAll();
        };
        Stream.prototype.mergeAll = function () {
            return wdFrp.MergeAllStream.create(this);
        };
        Stream.prototype.concatAll = function () {
            return this.merge(1);
        };
        Stream.prototype.takeUntil = function (otherStream) {
            return wdFrp.TakeUntilStream.create(this, otherStream);
        };
        Stream.prototype.take = function (count) {
            if (count === void 0) { count = 1; }
            var self = this;
            if (count === 0) {
                return wdFrp.empty();
            }
            return wdFrp.createStream(function (observer) {
                self.subscribe(function (value) {
                    if (count > 0) {
                        observer.next(value);
                    }
                    count--;
                    if (count <= 0) {
                        observer.completed();
                    }
                }, function (e) {
                    observer.error(e);
                }, function () {
                    observer.completed();
                });
            });
        };
        Stream.prototype.takeLast = function (count) {
            if (count === void 0) { count = 1; }
            var self = this;
            if (count === 0) {
                return wdFrp.empty();
            }
            return wdFrp.createStream(function (observer) {
                var queue = [];
                self.subscribe(function (value) {
                    queue.push(value);
                    if (queue.length > count) {
                        queue.shift();
                    }
                }, function (e) {
                    observer.error(e);
                }, function () {
                    while (queue.length > 0) {
                        observer.next(queue.shift());
                    }
                    observer.completed();
                });
            });
        };
        Stream.prototype.takeWhile = function (predicate, thisArg) {
            if (thisArg === void 0) { thisArg = this; }
            var self = this, bindPredicate = null;
            bindPredicate = wdCb.FunctionUtils.bind(thisArg, predicate);
            return wdFrp.createStream(function (observer) {
                var i = 0, isStart = false;
                self.subscribe(function (value) {
                    if (bindPredicate(value, i++, self)) {
                        try {
                            observer.next(value);
                            isStart = true;
                        }
                        catch (e) {
                            observer.error(e);
                            return;
                        }
                    }
                    else {
                        if (isStart) {
                            observer.completed();
                        }
                    }
                }, function (e) {
                    observer.error(e);
                }, function () {
                    observer.completed();
                });
            });
        };
        Stream.prototype.lastOrDefault = function (defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            var self = this;
            return wdFrp.createStream(function (observer) {
                var queue = [];
                self.subscribe(function (value) {
                    queue.push(value);
                    if (queue.length > 1) {
                        queue.shift();
                    }
                }, function (e) {
                    observer.error(e);
                }, function () {
                    if (queue.length === 0) {
                        observer.next(defaultValue);
                    }
                    else {
                        while (queue.length > 0) {
                            observer.next(queue.shift());
                        }
                    }
                    observer.completed();
                });
            });
        };
        Stream.prototype.filter = function (predicate, thisArg) {
            if (thisArg === void 0) { thisArg = this; }
            if (this instanceof wdFrp.FilterStream) {
                var self_1 = this;
                return self_1.internalFilter(predicate, thisArg);
            }
            return wdFrp.FilterStream.create(this, predicate, thisArg);
        };
        Stream.prototype.filterWithState = function (predicate, thisArg) {
            if (thisArg === void 0) { thisArg = this; }
            if (this instanceof wdFrp.FilterStream) {
                var self_2 = this;
                return self_2.internalFilter(predicate, thisArg);
            }
            return wdFrp.FilterWithStateStream.create(this, predicate, thisArg);
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
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (wdFrp.JudgeUtils.isNumber(args[0])) {
                var maxConcurrent = args[0];
                return wdFrp.MergeStream.create(this, maxConcurrent);
            }
            if (wdFrp.JudgeUtils.isArray(args[0])) {
                args = arguments[0];
            }
            else {
            }
            var stream = null;
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
        Stream.prototype.handleSubject = function (subject) {
            if (this._isSubject(subject)) {
                this._setSubject(subject);
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
        __decorate([
            wdFrp.require(function (count) {
                if (count === void 0) { count = 1; }
                wdFrp.assert(count >= 0, Log.info.FUNC_SHOULD("count", ">= 0"));
            })
        ], Stream.prototype, "take", null);
        __decorate([
            wdFrp.require(function (count) {
                if (count === void 0) { count = 1; }
                wdFrp.assert(count >= 0, Log.info.FUNC_SHOULD("count", ">= 0"));
            })
        ], Stream.prototype, "takeLast", null);
        return Stream;
    }(wdFrp.Entity));
    wdFrp.Stream = Stream;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
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
        Scheduler.prototype.publishTimeout = function (observer, time, action) {
            return wdFrp.root.setTimeout(function () {
                action(time);
                observer.completed();
            }, time);
        };
        return Scheduler;
    }());
    wdFrp.Scheduler = Scheduler;
})(wdFrp || (wdFrp = {}));
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
                var observer_1 = args[0];
                this.onUserNext = function (v) {
                    observer_1.next(v);
                };
                this.onUserError = function (e) {
                    observer_1.error(e);
                };
                this.onUserCompleted = function () {
                    observer_1.completed();
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
    }(wdFrp.Entity));
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
    }());
    wdFrp.Subject = Subject;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.Entity));
    wdFrp.GeneratorSubject = GeneratorSubject;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.Observer));
    wdFrp.AnonymousObserver = AnonymousObserver;
})(wdFrp || (wdFrp = {}));
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
        AutoDetachObserver.prototype.onError = function (error) {
            try {
                this.onUserError(error);
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
        __decorate([
            wdFrp.require(function () {
                if (this.isDisposed) {
                    wdCb.Log.warn("only can dispose once");
                }
            })
        ], AutoDetachObserver.prototype, "dispose", null);
        return AutoDetachObserver;
    }(wdFrp.Observer));
    wdFrp.AutoDetachObserver = AutoDetachObserver;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.Observer));
    wdFrp.MapObserver = MapObserver;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.Observer));
    wdFrp.DoObserver = DoObserver;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var Log = wdCb.Log;
    var MergeAllObserver = (function (_super) {
        __extends(MergeAllObserver, _super);
        function MergeAllObserver(currentObserver, streamGroup, groupDisposable) {
            _super.call(this, null, null, null);
            this.done = false;
            this.currentObserver = null;
            this._streamGroup = null;
            this._groupDisposable = null;
            this.currentObserver = currentObserver;
            this._streamGroup = streamGroup;
            this._groupDisposable = groupDisposable;
        }
        MergeAllObserver.create = function (currentObserver, streamGroup, groupDisposable) {
            return new this(currentObserver, streamGroup, groupDisposable);
        };
        MergeAllObserver.prototype.onNext = function (innerSource) {
            if (wdFrp.JudgeUtils.isPromise(innerSource)) {
                innerSource = wdFrp.fromPromise(innerSource);
            }
            this._streamGroup.addChild(innerSource);
            this._groupDisposable.add(innerSource.buildStream(InnerObserver.create(this, this._streamGroup, innerSource)));
        };
        MergeAllObserver.prototype.onError = function (error) {
            this.currentObserver.error(error);
        };
        MergeAllObserver.prototype.onCompleted = function () {
            this.done = true;
            if (this._streamGroup.getCount() === 0) {
                this.currentObserver.completed();
            }
        };
        __decorate([
            wdFrp.require(function (innerSource) {
                wdFrp.assert(innerSource instanceof wdFrp.Stream || wdFrp.JudgeUtils.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));
            })
        ], MergeAllObserver.prototype, "onNext", null);
        return MergeAllObserver;
    }(wdFrp.Observer));
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
            if (this._isAsync() && this._streamGroup.getCount() === 0) {
                parent.currentObserver.completed();
            }
        };
        InnerObserver.prototype._isAsync = function () {
            return this._parent.done;
        };
        return InnerObserver;
    }(wdFrp.Observer));
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var Log = wdCb.Log;
    var MergeObserver = (function (_super) {
        __extends(MergeObserver, _super);
        function MergeObserver(currentObserver, maxConcurrent, streamGroup, groupDisposable) {
            _super.call(this, null, null, null);
            this.done = false;
            this.currentObserver = null;
            this.activeCount = 0;
            this.q = [];
            this._maxConcurrent = null;
            this._groupDisposable = null;
            this._streamGroup = null;
            this.currentObserver = currentObserver;
            this._maxConcurrent = maxConcurrent;
            this._streamGroup = streamGroup;
            this._groupDisposable = groupDisposable;
        }
        MergeObserver.create = function (currentObserver, maxConcurrent, streamGroup, groupDisposable) {
            return new this(currentObserver, maxConcurrent, streamGroup, groupDisposable);
        };
        MergeObserver.prototype.handleSubscribe = function (innerSource) {
            if (wdFrp.JudgeUtils.isPromise(innerSource)) {
                innerSource = wdFrp.fromPromise(innerSource);
            }
            this._streamGroup.addChild(innerSource);
            this._groupDisposable.add(innerSource.buildStream(InnerObserver.create(this, this._streamGroup, innerSource)));
        };
        MergeObserver.prototype.onNext = function (innerSource) {
            if (this._isReachMaxConcurrent()) {
                this.activeCount++;
                this.handleSubscribe(innerSource);
                return;
            }
            this.q.push(innerSource);
        };
        MergeObserver.prototype.onError = function (error) {
            this.currentObserver.error(error);
        };
        MergeObserver.prototype.onCompleted = function () {
            this.done = true;
            if (this._streamGroup.getCount() === 0) {
                this.currentObserver.completed();
            }
        };
        MergeObserver.prototype._isReachMaxConcurrent = function () {
            return this.activeCount < this._maxConcurrent;
        };
        __decorate([
            wdFrp.require(function (innerSource) {
                wdFrp.assert(innerSource instanceof wdFrp.Stream || wdFrp.JudgeUtils.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));
            })
        ], MergeObserver.prototype, "onNext", null);
        return MergeObserver;
    }(wdFrp.Observer));
    wdFrp.MergeObserver = MergeObserver;
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
            var parent = this._parent;
            this._streamGroup.removeChild(this._currentStream);
            if (parent.q.length > 0) {
                parent.activeCount = 0;
                parent.handleSubscribe(parent.q.shift());
            }
            else {
                if (this._isAsync() && this._streamGroup.getCount() === 0) {
                    parent.currentObserver.completed();
                }
            }
        };
        InnerObserver.prototype._isAsync = function () {
            return this._parent.done;
        };
        return InnerObserver;
    }(wdFrp.Observer));
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.Observer));
    wdFrp.TakeUntilObserver = TakeUntilObserver;
})(wdFrp || (wdFrp = {}));
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
            this.currentObserver.next(value);
        };
        ConcatObserver.prototype.onError = function (error) {
            this.currentObserver.error(error);
        };
        ConcatObserver.prototype.onCompleted = function () {
            this._startNextStream();
        };
        return ConcatObserver;
    }(wdFrp.Observer));
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
    }());
    wdFrp.SubjectObserver = SubjectObserver;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.Observer));
    wdFrp.IgnoreElementsObserver = IgnoreElementsObserver;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var FilterObserver = (function (_super) {
        __extends(FilterObserver, _super);
        function FilterObserver(prevObserver, predicate, source) {
            _super.call(this, null, null, null);
            this.prevObserver = null;
            this.source = null;
            this.i = 0;
            this.predicate = null;
            this.prevObserver = prevObserver;
            this.predicate = predicate;
            this.source = source;
        }
        FilterObserver.create = function (prevObserver, predicate, source) {
            return new this(prevObserver, predicate, source);
        };
        FilterObserver.prototype.onNext = function (value) {
            try {
                if (this.predicate(value, this.i++, this.source)) {
                    this.prevObserver.next(value);
                }
            }
            catch (e) {
                this.prevObserver.error(e);
            }
        };
        FilterObserver.prototype.onError = function (error) {
            this.prevObserver.error(error);
        };
        FilterObserver.prototype.onCompleted = function () {
            this.prevObserver.completed();
        };
        return FilterObserver;
    }(wdFrp.Observer));
    wdFrp.FilterObserver = FilterObserver;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var FilterWithStateObserver = (function (_super) {
        __extends(FilterWithStateObserver, _super);
        function FilterWithStateObserver() {
            _super.apply(this, arguments);
            this._isTrigger = false;
        }
        FilterWithStateObserver.create = function (prevObserver, predicate, source) {
            return new this(prevObserver, predicate, source);
        };
        FilterWithStateObserver.prototype.onNext = function (value) {
            var data = null;
            try {
                if (this.predicate(value, this.i++, this.source)) {
                    if (!this._isTrigger) {
                        data = {
                            value: value,
                            state: wdFrp.FilterState.ENTER
                        };
                    }
                    else {
                        data = {
                            value: value,
                            state: wdFrp.FilterState.TRIGGER
                        };
                    }
                    this.prevObserver.next(data);
                    this._isTrigger = true;
                }
                else {
                    if (this._isTrigger) {
                        data = {
                            value: value,
                            state: wdFrp.FilterState.LEAVE
                        };
                        this.prevObserver.next(data);
                    }
                    this._isTrigger = false;
                }
            }
            catch (e) {
                this.prevObserver.error(e);
            }
        };
        return FilterWithStateObserver;
    }(wdFrp.FilterObserver));
    wdFrp.FilterWithStateObserver = FilterWithStateObserver;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.Stream));
    wdFrp.BaseStream = BaseStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.DoStream = DoStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.MapStream = MapStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.FromArrayStream = FromArrayStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.FromPromiseStream = FromPromiseStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.FromEventPatternStream = FromEventPatternStream;
})(wdFrp || (wdFrp = {}));
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
        AnonymousStream.prototype.subscribe = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var observer = null;
            if (args[0] instanceof wdFrp.Subject) {
                var subject = args[0];
                this.handleSubject(subject);
                return;
            }
            else if (wdFrp.JudgeUtils.isIObserver(args[0])) {
                observer = wdFrp.AutoDetachObserver.create(args[0]);
            }
            else {
                var onNext = args[0], onError = args[1] || null, onCompleted = args[2] || null;
                observer = wdFrp.AutoDetachObserver.create(onNext, onError, onCompleted);
            }
            observer.setDisposable(this.buildStream(observer));
            return observer;
        };
        return AnonymousStream;
    }(wdFrp.Stream));
    wdFrp.AnonymousStream = AnonymousStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.IntervalStream = IntervalStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.IntervalRequestStream = IntervalRequestStream;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var Log = wdCb.Log;
    var TimeoutStream = (function (_super) {
        __extends(TimeoutStream, _super);
        function TimeoutStream(time, scheduler) {
            _super.call(this, null);
            this._time = null;
            this._time = time;
            this.scheduler = scheduler;
        }
        TimeoutStream.create = function (time, scheduler) {
            var obj = new this(time, scheduler);
            return obj;
        };
        TimeoutStream.prototype.subscribeCore = function (observer) {
            var id = null;
            id = this.scheduler.publishTimeout(observer, this._time, function (time) {
                observer.next(time);
            });
            return wdFrp.SingleDisposable.create(function () {
                wdFrp.root.clearTimeout(id);
            });
        };
        __decorate([
            wdFrp.require(function (time, scheduler) {
                wdFrp.assert(time > 0, Log.info.FUNC_SHOULD("time", "> 0"));
            })
        ], TimeoutStream, "create", null);
        return TimeoutStream;
    }(wdFrp.BaseStream));
    wdFrp.TimeoutStream = TimeoutStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.MergeAllStream = MergeAllStream;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var MergeStream = (function (_super) {
        __extends(MergeStream, _super);
        function MergeStream(source, maxConcurrent) {
            _super.call(this, null);
            this._source = null;
            this._maxConcurrent = null;
            this._source = source;
            this._maxConcurrent = maxConcurrent;
            this.scheduler = this._source.scheduler;
        }
        MergeStream.create = function (source, maxConcurrent) {
            var obj = new this(source, maxConcurrent);
            return obj;
        };
        MergeStream.prototype.subscribeCore = function (observer) {
            var streamGroup = wdCb.Collection.create(), groupDisposable = wdFrp.GroupDisposable.create();
            this._source.buildStream(wdFrp.MergeObserver.create(observer, this._maxConcurrent, streamGroup, groupDisposable));
            return groupDisposable;
        };
        return MergeStream;
    }(wdFrp.BaseStream));
    wdFrp.MergeStream = MergeStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.TakeUntilStream = TakeUntilStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.ConcatStream = ConcatStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.RepeatStream = RepeatStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.IgnoreElementsStream = IgnoreElementsStream;
})(wdFrp || (wdFrp = {}));
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
    }(wdFrp.BaseStream));
    wdFrp.DeferStream = DeferStream;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var FilterStream = (function (_super) {
        __extends(FilterStream, _super);
        function FilterStream(source, predicate, thisArg) {
            _super.call(this, null);
            this.predicate = null;
            this._source = null;
            this._source = source;
            this.predicate = wdCb.FunctionUtils.bind(thisArg, predicate);
        }
        FilterStream.create = function (source, predicate, thisArg) {
            var obj = new this(source, predicate, thisArg);
            return obj;
        };
        FilterStream.prototype.subscribeCore = function (observer) {
            return this._source.subscribe(this.createObserver(observer));
        };
        FilterStream.prototype.internalFilter = function (predicate, thisArg) {
            return this.createStreamForInternalFilter(this._source, this._innerPredicate(predicate, this), thisArg);
        };
        FilterStream.prototype.createObserver = function (observer) {
            return wdFrp.FilterObserver.create(observer, this.predicate, this);
        };
        FilterStream.prototype.createStreamForInternalFilter = function (source, innerPredicate, thisArg) {
            return FilterStream.create(source, innerPredicate, thisArg);
        };
        FilterStream.prototype._innerPredicate = function (predicate, self) {
            var _this = this;
            return function (value, i, o) {
                return self.predicate(value, i, o) && predicate.call(_this, value, i, o);
            };
        };
        return FilterStream;
    }(wdFrp.BaseStream));
    wdFrp.FilterStream = FilterStream;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var FilterWithStateStream = (function (_super) {
        __extends(FilterWithStateStream, _super);
        function FilterWithStateStream() {
            _super.apply(this, arguments);
        }
        FilterWithStateStream.create = function (source, predicate, thisArg) {
            var obj = new this(source, predicate, thisArg);
            return obj;
        };
        FilterWithStateStream.prototype.createObserver = function (observer) {
            return wdFrp.FilterWithStateObserver.create(observer, this.predicate, this);
        };
        FilterWithStateStream.prototype.createStreamForInternalFilter = function (source, innerPredicate, thisArg) {
            return FilterWithStateStream.create(source, innerPredicate, thisArg);
        };
        return FilterWithStateStream;
    }(wdFrp.FilterStream));
    wdFrp.FilterWithStateStream = FilterWithStateStream;
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
    wdFrp.timeout = function (time, scheduler) {
        if (scheduler === void 0) { scheduler = wdFrp.Scheduler.create(); }
        return wdFrp.TimeoutStream.create(time, scheduler);
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
    (function (FilterState) {
        FilterState[FilterState["TRIGGER"] = 0] = "TRIGGER";
        FilterState[FilterState["ENTER"] = 1] = "ENTER";
        FilterState[FilterState["LEAVE"] = 2] = "LEAVE";
    })(wdFrp.FilterState || (wdFrp.FilterState = {}));
    var FilterState = wdFrp.FilterState;
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
    }());
    wdFrp.Record = Record;
})(wdFrp || (wdFrp = {}));
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
            var record = null;
            if (wdFrp.JudgeUtils.isDirectObject(value)) {
                record = wdFrp.Record.create(this._scheduler.clock, value, wdFrp.ActionType.NEXT, function (a, b) {
                    var result = true;
                    for (var i in a) {
                        if (a.hasOwnProperty(i)) {
                            if (a[i] !== b[i]) {
                                result = false;
                                break;
                            }
                        }
                    }
                    return result;
                });
            }
            else {
                record = wdFrp.Record.create(this._scheduler.clock, value, wdFrp.ActionType.NEXT);
            }
            this._messages.push(record);
        };
        MockObserver.prototype.onError = function (error) {
            this._messages.push(wdFrp.Record.create(this._scheduler.clock, error, wdFrp.ActionType.ERROR));
        };
        MockObserver.prototype.onCompleted = function () {
            this._messages.push(wdFrp.Record.create(this._scheduler.clock, null, wdFrp.ActionType.COMPLETED));
        };
        MockObserver.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this._scheduler.remove(this);
        };
        MockObserver.prototype.clone = function () {
            var result = MockObserver.create(this._scheduler);
            result.messages = this._messages;
            return result;
        };
        return MockObserver;
    }(wdFrp.Observer));
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
            this._scheduler.setStreamMap(observer, this._messages);
        };
        return MockPromise;
    }());
    wdFrp.MockPromise = MockPromise;
})(wdFrp || (wdFrp = {}));
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
            if (wdFrp.JudgeUtils.isDirectObject(value)) {
                return wdFrp.Record.create(tick, value, wdFrp.ActionType.NEXT, function (a, b) {
                    var result = true;
                    for (var i in a) {
                        if (a.hasOwnProperty(i)) {
                            if (a[i] !== b[i]) {
                                result = false;
                                break;
                            }
                        }
                    }
                    return result;
                });
            }
            else {
                return wdFrp.Record.create(tick, value, wdFrp.ActionType.NEXT);
            }
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
        TestScheduler.prototype.publishTimeout = function (observer, time, action) {
            var messages = [];
            this._setClock();
            this._tick(time);
            messages.push(TestScheduler.next(this._clock, time), TestScheduler.completed(this._clock + 1));
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
    }(wdFrp.Scheduler));
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
            this.scheduler.setStreamMap(observer, this._messages);
            return wdFrp.SingleDisposable.create();
        };
        return TestStream;
    }(wdFrp.BaseStream));
    wdFrp.TestStream = TestStream;
})(wdFrp || (wdFrp = {}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9KdWRnZVV0aWxzLnRzIiwic3JjL2JpbmRpbmcvbm9kZWpzL05vZGVPcGVyYXRvci50cyIsInNyYy9jb3JlL0VudGl0eS50cyIsInNyYy9jb3JlL01haW4udHMiLCJzcmMvZGVmaW5pdGlvbi90eXBlc2NyaXB0L2RlY29yYXRvci9jb250cmFjdC50cyIsInNyYy9kaXNwb3NhYmxlL1NpbmdsZURpc3Bvc2FibGUudHMiLCJzcmMvZGlzcG9zYWJsZS9Hcm91cERpc3Bvc2FibGUudHMiLCJzcmMvZGlzcG9zYWJsZS9Jbm5lclN1YnNjcmlwdGlvbi50cyIsInNyYy9kaXNwb3NhYmxlL0lubmVyU3Vic2NyaXB0aW9uR3JvdXAudHMiLCJzcmMvZ2xvYmFsL1ZhcmlhYmxlLnRzIiwic3JjL2dsb2JhbC9pbml0LnRzIiwic3JjL2V4dGVuZC9yb290LnRzIiwic3JjL2NvcmUvU3RyZWFtLnRzIiwic3JjL2NvcmUvU2NoZWR1bGVyLnRzIiwic3JjL2NvcmUvT2JzZXJ2ZXIudHMiLCJzcmMvc3ViamVjdC9TdWJqZWN0LnRzIiwic3JjL3N1YmplY3QvR2VuZXJhdG9yU3ViamVjdC50cyIsInNyYy9vYnNlcnZlci9Bbm9ueW1vdXNPYnNlcnZlci50cyIsInNyYy9vYnNlcnZlci9BdXRvRGV0YWNoT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvTWFwT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvRG9PYnNlcnZlci50cyIsInNyYy9vYnNlcnZlci9NZXJnZUFsbE9ic2VydmVyLnRzIiwic3JjL29ic2VydmVyL01lcmdlT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvVGFrZVVudGlsT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvQ29uY2F0T2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvU3ViamVjdE9ic2VydmVyLnRzIiwic3JjL29ic2VydmVyL0lnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvRmlsdGVyT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvRmlsdGVyV2l0aFN0YXRlT2JzZXJ2ZXIudHMiLCJzcmMvc3RyZWFtL0Jhc2VTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0RvU3RyZWFtLnRzIiwic3JjL3N0cmVhbS9NYXBTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0Zyb21BcnJheVN0cmVhbS50cyIsInNyYy9zdHJlYW0vRnJvbVByb21pc2VTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0Zyb21FdmVudFBhdHRlcm5TdHJlYW0udHMiLCJzcmMvc3RyZWFtL0Fub255bW91c1N0cmVhbS50cyIsInNyYy9zdHJlYW0vSW50ZXJ2YWxTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0ludGVydmFsUmVxdWVzdFN0cmVhbS50cyIsInNyYy9zdHJlYW0vVGltZW91dFN0cmVhbS50cyIsInNyYy9zdHJlYW0vTWVyZ2VBbGxTdHJlYW0udHMiLCJzcmMvc3RyZWFtL01lcmdlU3RyZWFtLnRzIiwic3JjL3N0cmVhbS9UYWtlVW50aWxTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0NvbmNhdFN0cmVhbS50cyIsInNyYy9zdHJlYW0vUmVwZWF0U3RyZWFtLnRzIiwic3JjL3N0cmVhbS9JZ25vcmVFbGVtZW50c1N0cmVhbS50cyIsInNyYy9zdHJlYW0vRGVmZXJTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0ZpbHRlclN0cmVhbS50cyIsInNyYy9zdHJlYW0vRmlsdGVyV2l0aFN0YXRlU3RyZWFtLnRzIiwic3JjL2dsb2JhbC9PcGVyYXRvci50cyIsInNyYy9lbnVtL0ZpbHRlclN0YXRlLnRzIiwic3JjL3Rlc3RpbmcvUmVjb3JkLnRzIiwic3JjL3Rlc3RpbmcvTW9ja09ic2VydmVyLnRzIiwic3JjL3Rlc3RpbmcvTW9ja1Byb21pc2UudHMiLCJzcmMvdGVzdGluZy9UZXN0U2NoZWR1bGVyLnRzIiwic3JjL3Rlc3RpbmcvQWN0aW9uVHlwZS50cyIsInNyYy90ZXN0aW5nL1Rlc3RTdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxJQUFPLEtB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O0FBMUJELFdBQU8sS0FBSyxFQUFDLENBQUM7SUFDVjtRQUFnQyw4QkFBVTtRQVV0QyxvQkFBWSxRQUFpQixFQUFFLFNBQXVCO1lBQ2xELGtCQUFNLElBQUksQ0FBQyxDQUFDO1lBSlQsY0FBUyxHQUFpQixJQUFJLENBQUM7WUFDOUIsY0FBUyxHQUFZLElBQUksQ0FBQztZQUs5QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMvQixDQUFDO1FBZGEsaUJBQU0sR0FBcEIsVUFBcUIsUUFBaUIsRUFBRSxTQUF1QjtZQUMzRCxJQUFJLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFeEMsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNmLENBQUM7UUFZTSxrQ0FBYSxHQUFwQixVQUFxQixRQUFrQjtZQUduQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXRELE1BQU0sQ0FBQyxzQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNyQyxDQUFDO1FBQ0wsaUJBQUM7SUFBRCxDQXhCQSxBQXdCQyxDQXhCK0IsZ0JBQVUsR0F3QnpDO0lBeEJZLGdCQUFVLGFBd0J0QixDQUFBO0FBQ0wsQ0FBQyxFQTFCTSxLQUFLLEtBQUwsS0FBSyxRQTBCWCIsImZpbGUiOiJ3ZEZycC5kZWJ1Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIEp1ZGdlVXRpbHMgZXh0ZW5kcyB3ZENiLkp1ZGdlVXRpbHMge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGlzUHJvbWlzZShvYmope1xuICAgICAgICAgICAgcmV0dXJuICEhb2JqXG4gICAgICAgICAgICAgICAgJiYgIXN1cGVyLmlzRnVuY3Rpb24ob2JqLnN1YnNjcmliZSlcbiAgICAgICAgICAgICAgICAmJiBzdXBlci5pc0Z1bmN0aW9uKG9iai50aGVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNFcXVhbChvYjE6RW50aXR5LCBvYjI6RW50aXR5KXtcbiAgICAgICAgICAgIHJldHVybiBvYjEudWlkID09PSBvYjIudWlkO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBpc0lPYnNlcnZlcihpOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gaS5uZXh0ICYmIGkuZXJyb3IgJiYgaS5jb21wbGV0ZWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCB2YXIgZnJvbU5vZGVDYWxsYmFjayA9IChmdW5jOkZ1bmN0aW9uLCBjb250ZXh0PzphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuICguLi5mdW5jQXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGhhbmRlciA9IChlcnIsIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0LmFwcGx5KG9ic2VydmVyLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZnVuY0FyZ3MucHVzaChoYW5kZXIpO1xuICAgICAgICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgZnVuY0FyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyohXG4gICAgLy90b2RvIGhhcyBidWchIG5lZWQgZml4XG4gICAgcmVmZXIgdG8gcngtbm9kZToobmVlZCBhZGQgLnB1Ymxpc2goKSwgLnJlZkNvdW50KCkgbWV0aG9kcyEpXG4gICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9SZWFjdGl2ZS1FeHRlbnNpb25zL3J4LW5vZGUvYmxvYi9tYXN0ZXIvaW5kZXguanNcbiAgICAgKi9cbiAgICBleHBvcnQgdmFyIGZyb21TdHJlYW0gPSAoc3RyZWFtOmFueSwgZmluaXNoRXZlbnROYW1lOnN0cmluZyA9IFwiZW5kXCIpID0+IHtcbiAgICAgICAgaWYoc3RyZWFtLnBhdXNlKXtcbiAgICAgICAgICAgIHN0cmVhbS5wYXVzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdkRnJwLmNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIHZhciBkYXRhSGFuZGxlciA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvckhhbmRsZXIgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbmRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdHJlYW0uYWRkTGlzdGVuZXIoXCJkYXRhXCIsIGRhdGFIYW5kbGVyKTtcbiAgICAgICAgICAgIHN0cmVhbS5hZGRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICBzdHJlYW0uYWRkTGlzdGVuZXIoZmluaXNoRXZlbnROYW1lLCBlbmRIYW5kbGVyKTtcblxuICAgICAgICAgICAgaWYoc3RyZWFtLnJlc3VtZSl7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlc3VtZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcihcImRhdGFcIiwgZGF0YUhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcihcImVycm9yXCIsIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlbW92ZUxpc3RlbmVyKGZpbmlzaEV2ZW50TmFtZSwgZW5kSGFuZGxlcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tUmVhZGFibGVTdHJlYW0gPSAoc3RyZWFtOmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gZnJvbVN0cmVhbShzdHJlYW0sIFwiZW5kXCIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21Xcml0YWJsZVN0cmVhbSA9IChzdHJlYW06YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyZWFtKHN0cmVhbSwgXCJmaW5pc2hcIik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVRyYW5zZm9ybVN0cmVhbSA9IChzdHJlYW06YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyZWFtKHN0cmVhbSwgXCJmaW5pc2hcIik7XG4gICAgfTtcbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbnRpdHl7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVUlEOm51bWJlciA9IDE7XG5cbiAgICAgICAgcHJpdmF0ZSBfdWlkOnN0cmluZyA9IG51bGw7XG4gICAgICAgIGdldCB1aWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl91aWQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHVpZCh1aWQ6c3RyaW5nKXtcbiAgICAgICAgICAgIHRoaXMuX3VpZCA9IHVpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHVpZFByZTpzdHJpbmcpe1xuICAgICAgICAgICAgdGhpcy5fdWlkID0gdWlkUHJlICsgU3RyaW5nKEVudGl0eS5VSUQrKyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1haW57XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNUZXN0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBpbXBvcnQgTG9nID0gd2RDYi5Mb2c7XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gYXNzZXJ0KGNvbmQ6Ym9vbGVhbiwgbWVzc2FnZTpzdHJpbmc9XCJjb250cmFjdCBlcnJvclwiKXtcbiAgICAgICAgTG9nLmVycm9yKCFjb25kLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcmVxdWlyZShJbkZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRlc2NyaXB0b3IudmFsdWU7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIEluRnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlbnN1cmUoT3V0RnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3MpLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBbcmVzdWx0XS5jb25jYXQoYXJncyk7XG5cbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCkge1xuICAgICAgICAgICAgICAgICAgICBPdXRGdW5jLmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVHZXR0ZXIoSW5GdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICB2YXIgZ2V0dGVyID0gZGVzY3JpcHRvci5nZXQ7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IuZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBJbkZ1bmMuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiByZXF1aXJlU2V0dGVyKEluRnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHNldHRlciA9IGRlc2NyaXB0b3Iuc2V0O1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLnNldCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KXtcbiAgICAgICAgICAgICAgICAgICAgSW5GdW5jLmNhbGwodGhpcywgdmFsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZXR0ZXIuY2FsbCh0aGlzLCB2YWwpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZW5zdXJlR2V0dGVyKE91dEZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciBnZXR0ZXIgPSBkZXNjcmlwdG9yLmdldDtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci5nZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZ2V0dGVyLmNhbGwodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIE91dEZ1bmMuY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlbnN1cmVTZXR0ZXIoT3V0RnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHNldHRlciA9IGRlc2NyaXB0b3Iuc2V0O1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLnNldCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBzZXR0ZXIuY2FsbCh0aGlzLCB2YWwpLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBbcmVzdWx0LCB2YWxdO1xuXG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBPdXRGdW5jLmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gaW52YXJpYW50KGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KSB7XG4gICAgICAgICAgICAgICAgZnVuYyh0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBTaW5nbGVEaXNwb3NhYmxlIGV4dGVuZHMgRW50aXR5IGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGRpc3Bvc2VIYW5kbGVyOkZ1bmN0aW9uID0gZnVuY3Rpb24oKXt9KSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKGRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9kaXNwb3NlSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoZGlzcG9zZUhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIoXCJTaW5nbGVEaXNwb3NhYmxlXCIpO1xuXG4gICAgICAgIFx0dGhpcy5fZGlzcG9zZUhhbmRsZXIgPSBkaXNwb3NlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NlSGFuZGxlcihoYW5kbGVyOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyID0gaGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBHcm91cERpc3Bvc2FibGUgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoZGlzcG9zYWJsZT86SURpc3Bvc2FibGUpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhkaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2dyb3VwOndkQ2IuQ29sbGVjdGlvbjxJRGlzcG9zYWJsZT4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPElEaXNwb3NhYmxlPigpO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGRpc3Bvc2FibGU/OklEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHN1cGVyKFwiR3JvdXBEaXNwb3NhYmxlXCIpO1xuXG4gICAgICAgICAgICBpZihkaXNwb3NhYmxlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9ncm91cC5hZGRDaGlsZChkaXNwb3NhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhZGQoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLl9ncm91cC5hZGRDaGlsZChkaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXAucmVtb3ZlQ2hpbGQoZGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMuX2dyb3VwLmZvckVhY2goKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpID0+IHtcbiAgICAgICAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uIGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG5cdFx0cHVibGljIHN0YXRpYyBjcmVhdGUoc3ViamVjdDpTdWJqZWN0fEdlbmVyYXRvclN1YmplY3QsIG9ic2VydmVyOk9ic2VydmVyKSB7XG5cdFx0XHR2YXIgb2JqID0gbmV3IHRoaXMoc3ViamVjdCwgb2JzZXJ2ZXIpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX3N1YmplY3Q6U3ViamVjdHxHZW5lcmF0b3JTdWJqZWN0ID0gbnVsbDtcblx0XHRwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cblx0XHRjb25zdHJ1Y3RvcihzdWJqZWN0OlN1YmplY3R8R2VuZXJhdG9yU3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuXHRcdFx0dGhpcy5fc3ViamVjdCA9IHN1YmplY3Q7XG5cdFx0XHR0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9zdWJqZWN0LnJlbW92ZSh0aGlzLl9vYnNlcnZlcik7XG5cblx0XHRcdHRoaXMuX29ic2VydmVyLmRpc3Bvc2UoKTtcblx0XHR9XG5cdH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uR3JvdXAgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX2NvbnRhaW5lcjp3ZENiLkNvbGxlY3Rpb248SURpc3Bvc2FibGU+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJRGlzcG9zYWJsZT4oKTtcblxuXHRcdHB1YmxpYyBhZGRDaGlsZChjaGlsZDpJRGlzcG9zYWJsZSl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuYWRkQ2hpbGQoY2hpbGQpO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuZm9yRWFjaCgoY2hpbGQ6SURpc3Bvc2FibGUpID0+IHtcblx0XHRcdFx0Y2hpbGQuZGlzcG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG4iLCJkZWNsYXJlIHZhciBnbG9iYWw6YW55LHdpbmRvdzpXaW5kb3c7XG5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgdmFyIHJvb3Q6YW55O1xuXG4gICAgaWYoSnVkZ2VVdGlscy5pc05vZGVKcygpKXtcbiAgICAgICAgcm9vdCA9IGdsb2JhbDtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgICAgcm9vdCA9IHdpbmRvdztcbiAgICB9XG59XG5cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIC8vcnN2cC5qc1xuICAgIC8vZGVjbGFyZSB2YXIgUlNWUDphbnk7XG5cbiAgICAvL25vdCBzd2FsbG93IHRoZSBlcnJvclxuICAgIGlmKHJvb3QuUlNWUCl7XG4gICAgICAgIHJvb3QuUlNWUC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfTtcbiAgICAgICAgcm9vdC5SU1ZQLm9uKCdlcnJvcicsIHJvb3QuUlNWUC5vbmVycm9yKTtcbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgd3JhcHBlciA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gbnVsbCxcbiAgICAgICAgICAgIHVzZXJBZ2VudCA9IHJvb3QubmF2aWdhdG9yICYmIHJvb3QubmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHdyYXBwZXIgPSBmdW5jdGlvbiAodGltZSkge1xuICAgICAgICAgICAgdGltZSA9IHJvb3QucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICBzZWxmLmNhbGxiYWNrKHRpbWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qIVxuICAgICAgICAgYnVnIVxuICAgICAgICAgYmVsb3cgY29kZTpcbiAgICAgICAgIHdoZW4gaW52b2tlIGIgYWZ0ZXIgMXMsIHdpbGwgb25seSBpbnZva2UgYiwgbm90IGludm9rZSBhIVxuXG4gICAgICAgICBmdW5jdGlvbiBhKHRpbWUpe1xuICAgICAgICAgY29uc29sZS5sb2coXCJhXCIsIHRpbWUpO1xuICAgICAgICAgd2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKGEpO1xuICAgICAgICAgfVxuXG4gICAgICAgICBmdW5jdGlvbiBiKHRpbWUpe1xuICAgICAgICAgY29uc29sZS5sb2coXCJiXCIsIHRpbWUpO1xuICAgICAgICAgd2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKGIpO1xuICAgICAgICAgfVxuXG4gICAgICAgICBhKCk7XG5cbiAgICAgICAgIHNldFRpbWVvdXQoYiwgMTAwMCk7XG5cblxuXG4gICAgICAgICBzbyB1c2UgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHByaW9yaXR5IVxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHJvb3QucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBDaHJvbWUgMTAgYnVnIHdoZXJlIENocm9tZVxuICAgICAgICAvLyBkb2VzIG5vdCBwYXNzIHRoZSB0aW1lIHRvIHRoZSBhbmltYXRpb24gZnVuY3Rpb25cblxuICAgICAgICBpZiAocm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIC8vIERlZmluZSB0aGUgd3JhcHBlclxuXG4gICAgICAgICAgICAvLyBNYWtlIHRoZSBzd2l0Y2hcblxuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuICAgICAgICAgICAgcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgICAgICAgICAvLyBCcm93c2VyIGNhbGxzIHRoZSB3cmFwcGVyIGFuZCB3cmFwcGVyIGNhbGxzIHRoZSBjYWxsYmFja1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIsIGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/kv67mlLl0aW1l5Y+C5pWwXG4gICAgICAgIGlmIChyb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJvb3QubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3QubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUod3JhcHBlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBHZWNrbyAyLjAsIHdoaWNoIGhhcyBhIGJ1ZyBpblxuICAgICAgICAvLyBtb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKSB0aGF0IHJlc3RyaWN0cyBhbmltYXRpb25zXG4gICAgICAgIC8vIHRvIDMwLTQwIGZwcy5cblxuICAgICAgICBpZiAocm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIHRoZSBHZWNrbyB2ZXJzaW9uLiBHZWNrbyBpcyB1c2VkIGJ5IGJyb3dzZXJzXG4gICAgICAgICAgICAvLyBvdGhlciB0aGFuIEZpcmVmb3guIEdlY2tvIDIuMCBjb3JyZXNwb25kcyB0b1xuICAgICAgICAgICAgLy8gRmlyZWZveCA0LjAuXG5cbiAgICAgICAgICAgIGluZGV4ID0gdXNlckFnZW50LmluZGV4T2YoJ3J2OicpO1xuXG4gICAgICAgICAgICBpZiAodXNlckFnZW50LmluZGV4T2YoJ0dlY2tvJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICBnZWNrb1ZlcnNpb24gPSB1c2VyQWdlbnQuc3Vic3RyKGluZGV4ICsgMywgMyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZ2Vja29WZXJzaW9uID09PSAnMi4wJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBGb3JjZXMgdGhlIHJldHVybiBzdGF0ZW1lbnQgdG8gZmFsbCB0aHJvdWdoXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIHRoZSBzZXRUaW1lb3V0KCkgZnVuY3Rpb24uXG5cbiAgICAgICAgICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICByb290Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoO1xuXG4gICAgICAgICAgICAgICAgcm9vdC5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSByb290LnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhzdGFydCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaCA9IHJvb3QucGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi50aW1lb3V0ID0gMTAwMCAvIDYwIC0gKGZpbmlzaCAtIHN0YXJ0KTtcblxuICAgICAgICAgICAgICAgIH0sIHNlbGYudGltZW91dCk7XG4gICAgICAgICAgICB9O1xuICAgIH0oKSk7XG5cbiAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290LmNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qud2Via2l0Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3QubW96Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qub0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm1zQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IGNsZWFyVGltZW91dDtcbn07XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgaW1wb3J0IExvZyA9IHdkQ2IuTG9nO1xuXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0cmVhbSBleHRlbmRzIEVudGl0eXtcbiAgICAgICAgcHVibGljIHNjaGVkdWxlcjpTY2hlZHVsZXIgPSBudWxsO1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlRnVuYzoob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiBGdW5jdGlvbnx2b2lkID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jKXtcbiAgICAgICAgICAgIHN1cGVyKFwiU3RyZWFtXCIpO1xuXG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZUZ1bmMgPSBzdWJzY3JpYmVGdW5jIHx8IGZ1bmN0aW9uKCl7IH07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYWJzdHJhY3Qgc3Vic2NyaWJlKGFyZzE6RnVuY3Rpb258T2JzZXJ2ZXJ8U3ViamVjdCwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGU7XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoPEZ1bmN0aW9uPih0aGlzLnN1YnNjcmliZUZ1bmMob2JzZXJ2ZXIpIHx8IGZ1bmN0aW9uKCl7fSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRvKG9uTmV4dD86RnVuY3Rpb24sIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBEb1N0cmVhbS5jcmVhdGUodGhpcywgb25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbWFwKHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gTWFwU3RyZWFtLmNyZWF0ZSh0aGlzLCBzZWxlY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmxhdE1hcChzZWxlY3RvcjpGdW5jdGlvbil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXAoc2VsZWN0b3IpLm1lcmdlQWxsKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29uY2F0TWFwKHNlbGVjdG9yOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcChzZWxlY3RvcikuY29uY2F0QWxsKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbWVyZ2VBbGwoKXtcbiAgICAgICAgICAgIHJldHVybiBNZXJnZUFsbFN0cmVhbS5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29uY2F0QWxsKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tZXJnZSgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0YWtlVW50aWwob3RoZXJTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHJldHVybiBUYWtlVW50aWxTdHJlYW0uY3JlYXRlKHRoaXMsIG90aGVyU3RyZWFtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKGNvdW50Om51bWJlciA9IDEpe1xuICAgICAgICAgICAgYXNzZXJ0KGNvdW50ID49IDAsIExvZy5pbmZvLkZVTkNfU0hPVUxEKFwiY291bnRcIiwgXCI+PSAwXCIpKTtcbiAgICAgICAgfSlcbiAgICAgICAgcHVibGljIHRha2UoY291bnQ6bnVtYmVyID0gMSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmKGNvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW1wdHkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUoKHZhbHVlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihjb3VudCA+IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb3VudC0tO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKGNvdW50IDw9IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgQHJlcXVpcmUoZnVuY3Rpb24oY291bnQ6bnVtYmVyID0gMSl7XG4gICAgICAgICAgICBhc3NlcnQoY291bnQgPj0gMCwgTG9nLmluZm8uRlVOQ19TSE9VTEQoXCJjb3VudFwiLCBcIj49IDBcIikpO1xuICAgICAgICB9KVxuICAgICAgICBwdWJsaWMgdGFrZUxhc3QoY291bnQ6bnVtYmVyID0gMSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmKGNvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW1wdHkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICAgICAgICAgICAgICBzZWxmLnN1YnNjcmliZSgodmFsdWU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2godmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHF1ZXVlLmxlbmd0aCA+IGNvdW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB3aGlsZShxdWV1ZS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQocXVldWUuc2hpZnQoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRha2VXaGlsZShwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg6bnVtYmVyLCBzb3VyY2U6U3RyZWFtKT0+Ym9vbGVhbiwgdGhpc0FyZyA9IHRoaXMpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGJpbmRQcmVkaWNhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICBiaW5kUHJlZGljYXRlID0gd2RDYi5GdW5jdGlvblV0aWxzLmJpbmQodGhpc0FyZywgcHJlZGljYXRlKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgICAgICBpc1N0YXJ0ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBzZWxmLnN1YnNjcmliZSgodmFsdWU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGJpbmRQcmVkaWNhdGUodmFsdWUsIGkrKywgc2VsZikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3RhcnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpc1N0YXJ0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIChlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbGFzdE9yRGVmYXVsdChkZWZhdWx0VmFsdWU6YW55ID0gbnVsbCl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUoKHZhbHVlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKHZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihxdWV1ZS5sZW5ndGggPiAxKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihxdWV1ZS5sZW5ndGggPT09IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChkZWZhdWx0VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZShxdWV1ZS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHF1ZXVlLnNoaWZ0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBmaWx0ZXIocHJlZGljYXRlOih2YWx1ZTphbnkpPT5ib29sZWFuLCB0aGlzQXJnID0gdGhpcyl7XG4gICAgICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgRmlsdGVyU3RyZWFtKXtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZjphbnkgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWxGaWx0ZXIocHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIEZpbHRlclN0cmVhbS5jcmVhdGUodGhpcywgcHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBmaWx0ZXJXaXRoU3RhdGUocHJlZGljYXRlOih2YWx1ZTphbnkpPT5ib29sZWFuLCB0aGlzQXJnID0gdGhpcyl7XG4gICAgICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgRmlsdGVyU3RyZWFtKXtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZjphbnkgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWxGaWx0ZXIocHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIEZpbHRlcldpdGhTdGF0ZVN0cmVhbS5jcmVhdGUodGhpcywgcHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb25jYXQoc3RyZWFtQXJyOkFycmF5PFN0cmVhbT4pO1xuICAgICAgICBwdWJsaWMgY29uY2F0KC4uLm90aGVyU3RyZWFtKTtcblxuICAgICAgICBwdWJsaWMgY29uY2F0KCl7XG4gICAgICAgICAgICB2YXIgYXJnczpBcnJheTxTdHJlYW0+ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0FycmF5KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBDb25jYXRTdHJlYW0uY3JlYXRlKGFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlKG1heENvbmN1cnJlbnQ6bnVtYmVyKTtcbiAgICAgICAgcHVibGljIG1lcmdlKHN0cmVhbUFycjpBcnJheTxTdHJlYW0+KTtcbiAgICAgICAgcHVibGljIG1lcmdlKC4uLm90aGVyU3RyZWFtcyk7XG5cbiAgICAgICAgcHVibGljIG1lcmdlKC4uLmFyZ3Mpe1xuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc051bWJlcihhcmdzWzBdKSl7XG4gICAgICAgICAgICAgICAgdmFyIG1heENvbmN1cnJlbnQ6bnVtYmVyID0gYXJnc1swXTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBNZXJnZVN0cmVhbS5jcmVhdGUodGhpcywgbWF4Q29uY3VycmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNBcnJheShhcmdzWzBdKSl7XG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICAgICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuXG4gICAgICAgICAgICBzdHJlYW0gPSBmcm9tQXJyYXkoYXJncykubWVyZ2VBbGwoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZXBlYXQoY291bnQ6bnVtYmVyID0gLTEpe1xuICAgICAgICAgICAgcmV0dXJuIFJlcGVhdFN0cmVhbS5jcmVhdGUodGhpcywgY291bnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGlnbm9yZUVsZW1lbnRzKCl7XG4gICAgICAgICAgICByZXR1cm4gSWdub3JlRWxlbWVudHNTdHJlYW0uY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGhhbmRsZVN1YmplY3Qoc3ViamVjdDphbnkpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNTdWJqZWN0KHN1YmplY3QpKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRTdWJqZWN0KHN1YmplY3QpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1N1YmplY3Qoc3ViamVjdDpTdWJqZWN0KXtcbiAgICAgICAgICAgIHJldHVybiBzdWJqZWN0IGluc3RhbmNlb2YgU3ViamVjdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NldFN1YmplY3Qoc3ViamVjdDpTdWJqZWN0KXtcbiAgICAgICAgICAgIHN1YmplY3Quc291cmNlID0gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIFNjaGVkdWxlcntcbiAgICAgICAgLy90b2RvIHJlbW92ZSBcIi4uLmFyZ3NcIlxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3JlcXVlc3RMb29wSWQ6YW55ID0gbnVsbDtcbiAgICAgICAgZ2V0IHJlcXVlc3RMb29wSWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG4gICAgICAgIHNldCByZXF1ZXN0TG9vcElkKHJlcXVlc3RMb29wSWQ6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wYXJhbSBvYnNlcnZlciBpcyB1c2VkIGJ5IFRlc3RTY2hlZHVsZXIgdG8gcmV3cml0ZVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICBhY3Rpb24oaW5pdGlhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGludGVydmFsOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbCA9IGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgICAgIH0sIGludGVydmFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0KG9ic2VydmVyOklPYnNlcnZlciwgYWN0aW9uOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBsb29wID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzRW5kID0gYWN0aW9uKHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKGlzRW5kKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3JlcXVlc3RMb29wSWQgPSByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdExvb3BJZCA9IHJvb3QucmVxdWVzdE5leHRBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoVGltZW91dChvYnNlcnZlcjpJT2JzZXJ2ZXIsIHRpbWU6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIHJldHVybiByb290LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGlvbih0aW1lKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0sIHRpbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgT2JzZXJ2ZXIgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IG51bGw7XG4gICAgICAgIGdldCBpc0Rpc3Bvc2VkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNEaXNwb3NlZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNEaXNwb3NlZChpc0Rpc3Bvc2VkOmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IGlzRGlzcG9zZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyTmV4dDpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJFcnJvcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJDb21wbGV0ZWQ6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2lzU3RvcDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIC8vcHJpdmF0ZSBfZGlzcG9zZUhhbmRsZXI6d2RDYi5Db2xsZWN0aW9uPEZ1bmN0aW9uPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2FibGU6SURpc3Bvc2FibGUgPSBudWxsO1xuXG5cbiAgICAgICAgY29uc3RydWN0b3Iob2JzZXJ2ZXI6SU9ic2VydmVyKTtcbiAgICAgICAgY29uc3RydWN0b3Iob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbik7XG5cbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgICAgICAgc3VwZXIoXCJPYnNlcnZlclwiKTtcblxuICAgICAgICAgICAgaWYoYXJncy5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgIGxldCBvYnNlcnZlcjpJT2JzZXJ2ZXIgPSBhcmdzWzBdO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0ID0gZnVuY3Rpb24odil7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodik7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgb25OZXh0ID0gYXJnc1swXSxcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvciA9IGFyZ3NbMV0sXG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGVkID0gYXJnc1syXTtcblxuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCA9IG9uTmV4dCB8fCBmdW5jdGlvbih2KXt9O1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IgPSBvbkVycm9yIHx8IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCA9IG9uQ29tcGxldGVkIHx8IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vbk5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9kaXNwb3NhYmxlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy90aGlzLl9kaXNwb3NlSGFuZGxlci5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAvLyAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICAvL30pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wdWJsaWMgZmFpbChlKSB7XG4gICAgICAgIC8vICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgIC8vICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAvLyAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgLy8gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2FibGUoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlID0gZGlzcG9zYWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbk5leHQodmFsdWU6YW55KTtcblxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25FcnJvcihlcnJvcjphbnkpO1xuXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbkNvbXBsZXRlZCgpO1xuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdCBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBnZXQgc291cmNlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBzb3VyY2Uoc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjphbnkgPSBuZXcgU3ViamVjdE9ic2VydmVyKCk7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxPzpGdW5jdGlvbnxPYnNlcnZlciwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IDxBdXRvRGV0YWNoT2JzZXJ2ZXI+YXJnMVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICAvL3RoaXMuX3NvdXJjZSAmJiBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLl9zb3VyY2UuZGlzcG9zZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBJbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUodGhpcywgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX3NvdXJjZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbSh0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLnJlbW92ZUNoaWxkKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEdlbmVyYXRvclN1YmplY3QgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdGFydDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGdldCBpc1N0YXJ0KCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNTdGFydDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNTdGFydChpc1N0YXJ0OmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IGlzU3RhcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICAgICAgc3VwZXIoXCJHZW5lcmF0b3JTdWJqZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9ic2VydmVyOmFueSA9IG5ldyBTdWJqZWN0T2JzZXJ2ZXIoKTtcblxuICAgICAgICAvKiFcbiAgICAgICAgb3V0ZXIgaG9vayBtZXRob2RcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZU5leHQodmFsdWU6YW55KXtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkFmdGVyTmV4dCh2YWx1ZTphbnkpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbklzQ29tcGxldGVkKHZhbHVlOmFueSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQmVmb3JlRXJyb3IoZXJyb3I6YW55KSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25BZnRlckVycm9yKGVycm9yOmFueSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQmVmb3JlQ29tcGxldGVkKCkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQWZ0ZXJDb21wbGV0ZWQoKSB7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vdG9kb1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE/OkZ1bmN0aW9ufE9ic2VydmVyLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gPEF1dG9EZXRhY2hPYnNlcnZlcj5hcmcxXG4gICAgICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmFkZENoaWxkKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIElubmVyU3Vic2NyaXB0aW9uLmNyZWF0ZSh0aGlzLCBvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzU3RhcnQgfHwgdGhpcy5vYnNlcnZlci5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMub25CZWZvcmVOZXh0KHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9uQWZ0ZXJOZXh0KHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIGlmKHRoaXMub25Jc0NvbXBsZXRlZCh2YWx1ZSkpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1N0YXJ0IHx8IHRoaXMub2JzZXJ2ZXIuaXNFbXB0eSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub25CZWZvcmVFcnJvcihlcnJvcik7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuXG4gICAgICAgICAgICB0aGlzLm9uQWZ0ZXJFcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNTdGFydCB8fCB0aGlzLm9ic2VydmVyLmlzRW1wdHkoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlQ29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuY29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgIHRoaXMub25BZnRlckNvbXBsZXRlZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRvU3RyZWFtKCl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3RyZWFtID0gbnVsbDtcblxuICAgICAgICAgICAgc3RyZWFtID0gQW5vbnltb3VzU3RyZWFtLmNyZWF0ZSgob2JzZXJ2ZXI6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLnN1YnNjcmliZShvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl9pc1N0YXJ0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5zZXREaXNwb3NhYmxlKFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdG9wKCl7XG4gICAgICAgICAgICB0aGlzLl9pc1N0YXJ0ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIucmVtb3ZlQ2hpbGQob2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBBbm9ueW1vdXNPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShvbk5leHQ6RnVuY3Rpb24sIG9uRXJyb3I6RnVuY3Rpb24sIG9uQ29tcGxldGVkOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlck5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBBdXRvRGV0YWNoT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob2JzZXJ2ZXI6SU9ic2VydmVyKTtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbik7XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYoYXJncy5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhhcmdzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgQHJlcXVpcmUoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgd2RDYi5Mb2cud2FybihcIm9ubHkgY2FuIGRpc3Bvc2Ugb25jZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlOmFueSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlck5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcjphbnkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJFcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgTWFwT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzZWxlY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc2VsZWN0b3I6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBudWxsO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NlbGVjdG9yKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLm5leHQocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBEb09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfcHJldk9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgcHJldk9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyID0gcHJldk9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICAvL3RoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgaW1wb3J0IExvZyA9IHdkQ2IuTG9nO1xuXG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlQWxsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGdyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHN0cmVhbUdyb3VwLCBncm91cERpc3Bvc2FibGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGdyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAgPSBzdHJlYW1Hcm91cDtcbiAgICAgICAgICAgIHRoaXMuX2dyb3VwRGlzcG9zYWJsZSA9IGdyb3VwRGlzcG9zYWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkb25lOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHVibGljIGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX3N0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSA9IG51bGw7XG5cbiAgICAgICAgQHJlcXVpcmUoZnVuY3Rpb24oaW5uZXJTb3VyY2U6YW55KXtcbiAgICAgICAgICAgIGFzc2VydChpbm5lclNvdXJjZSBpbnN0YW5jZW9mIFN0cmVhbSB8fCBKdWRnZVV0aWxzLmlzUHJvbWlzZShpbm5lclNvdXJjZSksIExvZy5pbmZvLkZVTkNfTVVTVF9CRShcImlubmVyU291cmNlXCIsIFwiU3RyZWFtIG9yIFByb21pc2VcIikpO1xuXG4gICAgICAgIH0pXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQoaW5uZXJTb3VyY2U6YW55KXtcbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSl7XG4gICAgICAgICAgICAgICAgaW5uZXJTb3VyY2UgPSBmcm9tUHJvbWlzZShpbm5lclNvdXJjZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLmFkZENoaWxkKGlubmVyU291cmNlKTtcblxuICAgICAgICAgICAgdGhpcy5fZ3JvdXBEaXNwb3NhYmxlLmFkZChpbm5lclNvdXJjZS5idWlsZFN0cmVhbShJbm5lck9ic2VydmVyLmNyZWF0ZSh0aGlzLCB0aGlzLl9zdHJlYW1Hcm91cCwgaW5uZXJTb3VyY2UpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuX3N0cmVhbUdyb3VwLmdldENvdW50KCkgPT09IDApe1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xhc3MgSW5uZXJPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKHBhcmVudCwgc3RyZWFtR3JvdXAsIGN1cnJlbnRTdHJlYW0pO1xuXG4gICAgICAgIFx0cmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHBhcmVudDpNZXJnZUFsbE9ic2VydmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgY3VycmVudFN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RyZWFtID0gY3VycmVudFN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3BhcmVudDpNZXJnZUFsbE9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9jdXJyZW50U3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LmN1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHZhciBjdXJyZW50U3RyZWFtID0gdGhpcy5fY3VycmVudFN0cmVhbSxcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSB0aGlzLl9wYXJlbnQ7XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLnJlbW92ZUNoaWxkKChzdHJlYW06U3RyZWFtKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEp1ZGdlVXRpbHMuaXNFcXVhbChzdHJlYW0sIGN1cnJlbnRTdHJlYW0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vcGFyZW50LmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIC8vdGhpcy5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgIC8qIVxuICAgICAgICAgICAgaWYgdGhpcyBpbm5lclNvdXJjZSBpcyBhc3luYyBzdHJlYW0oYXMgcHJvbWlzZSBzdHJlYW0pLFxuICAgICAgICAgICAgaXQgd2lsbCBmaXJzdCBleGVjIGFsbCBwYXJlbnQubmV4dCBhbmQgb25lIHBhcmVudC5jb21wbGV0ZWQsXG4gICAgICAgICAgICB0aGVuIGV4ZWMgYWxsIHRoaXMubmV4dCBhbmQgYWxsIHRoaXMuY29tcGxldGVkXG4gICAgICAgICAgICBzbyBpbiB0aGlzIGNhc2UsIGl0IHNob3VsZCBpbnZva2UgcGFyZW50LmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQgYWZ0ZXIgdGhlIGxhc3QgaW52b2tjYXRpb24gb2YgdGhpcy5jb21wbGV0ZWQoaGF2ZSBpbnZva2VkIGFsbCB0aGUgaW5uZXJTb3VyY2UpXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYodGhpcy5faXNBc3luYygpICYmIHRoaXMuX3N0cmVhbUdyb3VwLmdldENvdW50KCkgPT09IDApe1xuICAgICAgICAgICAgICAgIHBhcmVudC5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc0FzeW5jKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50LmRvbmU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgaW1wb3J0IExvZyA9IHdkQ2IuTG9nO1xuXG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgbWF4Q29uY3VycmVudDpudW1iZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBtYXhDb25jdXJyZW50LCBzdHJlYW1Hcm91cCwgZ3JvdXBEaXNwb3NhYmxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIG1heENvbmN1cnJlbnQ6bnVtYmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9tYXhDb25jdXJyZW50ID0gbWF4Q29uY3VycmVudDtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgICAgICB0aGlzLl9ncm91cERpc3Bvc2FibGUgPSBncm91cERpc3Bvc2FibGU7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZG9uZTpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHB1YmxpYyBjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHVibGljIGFjdGl2ZUNvdW50Om51bWJlciA9IDA7XG4gICAgICAgIHB1YmxpYyBxOkFycmF5PFN0cmVhbT4gPSBbXTtcblxuICAgICAgICBwcml2YXRlIF9tYXhDb25jdXJyZW50Om51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2dyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIGhhbmRsZVN1YnNjcmliZShpbm5lclNvdXJjZTphbnkpe1xuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc1Byb21pc2UoaW5uZXJTb3VyY2UpKXtcbiAgICAgICAgICAgICAgICBpbm5lclNvdXJjZSA9IGZyb21Qcm9taXNlKGlubmVyU291cmNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAuYWRkQ2hpbGQoaW5uZXJTb3VyY2UpO1xuXG4gICAgICAgICAgICB0aGlzLl9ncm91cERpc3Bvc2FibGUuYWRkKGlubmVyU291cmNlLmJ1aWxkU3RyZWFtKElubmVyT2JzZXJ2ZXIuY3JlYXRlKHRoaXMsIHRoaXMuX3N0cmVhbUdyb3VwLCBpbm5lclNvdXJjZSkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBhc3NlcnQoaW5uZXJTb3VyY2UgaW5zdGFuY2VvZiBTdHJlYW0gfHwgSnVkZ2VVdGlscy5pc1Byb21pc2UoaW5uZXJTb3VyY2UpLCBMb2cuaW5mby5GVU5DX01VU1RfQkUoXCJpbm5lclNvdXJjZVwiLCBcIlN0cmVhbSBvciBQcm9taXNlXCIpKTtcblxuICAgICAgICB9KVxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBpZih0aGlzLl9pc1JlYWNoTWF4Q29uY3VycmVudCgpKXtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUNvdW50ICsrO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU3Vic2NyaWJlKGlubmVyU291cmNlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5xLnB1c2goaW5uZXJTb3VyY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzUmVhY2hNYXhDb25jdXJyZW50KCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVDb3VudCA8IHRoaXMuX21heENvbmN1cnJlbnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGFzcyBJbm5lck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHBhcmVudDpNZXJnZU9ic2VydmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgY3VycmVudFN0cmVhbTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhwYXJlbnQsIHN0cmVhbUdyb3VwLCBjdXJyZW50U3RyZWFtKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHBhcmVudDpNZXJnZU9ic2VydmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgY3VycmVudFN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RyZWFtID0gY3VycmVudFN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3BhcmVudDpNZXJnZU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9jdXJyZW50U3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LmN1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLl9wYXJlbnQ7XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLnJlbW92ZUNoaWxkKHRoaXMuX2N1cnJlbnRTdHJlYW0pO1xuXG4gICAgICAgICAgICBpZiAocGFyZW50LnEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHBhcmVudC5hY3RpdmVDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgcGFyZW50LmhhbmRsZVN1YnNjcmliZShwYXJlbnQucS5zaGlmdCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuX2lzQXN5bmMoKSAmJiB0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc0FzeW5jKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50LmRvbmU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFRha2VVbnRpbE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhwcmV2T2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcHJldk9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJldk9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyID0gcHJldk9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBDb25jYXRPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzdGFydE5leHRTdHJlYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgY3VycmVudE9ic2VydmVyOmFueSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3N0YXJ0TmV4dFN0cmVhbTpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zdGFydE5leHRTdHJlYW0gPSBzdGFydE5leHRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIC8qIVxuICAgICAgICAgICAgaWYgXCJ0aGlzLmN1cnJlbnRPYnNlcnZlci5uZXh0XCIgZXJyb3IsIGl0IHdpbGwgcGFzZSB0byB0aGlzLmN1cnJlbnRPYnNlcnZlci0+b25FcnJvci5cbiAgICAgICAgICAgIHNvIGl0IHNob3VsZG4ndCBpbnZva2UgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IgaGVyZSBhZ2FpbiFcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgLy90cnl7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIC8vfVxuICAgICAgICAgICAgLy9jYXRjaChlKXtcbiAgICAgICAgICAgIC8vICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgLy99XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgLy90aGlzLmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0TmV4dFN0cmVhbSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBTdWJqZWN0T2JzZXJ2ZXIgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBvYnNlcnZlcnM6d2RDYi5Db2xsZWN0aW9uPElPYnNlcnZlcj4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPElPYnNlcnZlcj4oKTtcblxuICAgICAgICBwcml2YXRlIF9kaXNwb3NhYmxlOklEaXNwb3NhYmxlID0gbnVsbDtcblxuICAgICAgICBwdWJsaWMgaXNFbXB0eSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2JzZXJ2ZXJzLmdldENvdW50KCkgPT09IDA7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFkZENoaWxkKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmFkZENoaWxkKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSh0aGlzLl9kaXNwb3NhYmxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmVDaGlsZChvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5yZW1vdmVDaGlsZCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKG9iLCBvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5yZW1vdmVBbGxDaGlsZHJlbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2FibGUoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYnNlcnZlcjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUoZGlzcG9zYWJsZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fZGlzcG9zYWJsZSA9IGRpc3Bvc2FibGU7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIElnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlciwgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiwgc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlciwgcHJlZGljYXRlLCBzb3VyY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJldk9ic2VydmVyOklPYnNlcnZlciwgcHJlZGljYXRlOih2YWx1ZTphbnkpPT5ib29sZWFuLCBzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLnByZWRpY2F0ZSA9IHByZWRpY2F0ZTtcbiAgICAgICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBpOm51bWJlciA9IDA7XG4gICAgICAgIHByb3RlY3RlZCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuID0gbnVsbDtcblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByZWRpY2F0ZSh2YWx1ZSwgdGhpcy5pKyssIHRoaXMuc291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJXaXRoU3RhdGVPYnNlcnZlciBleHRlbmRzIEZpbHRlck9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlciwgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiwgc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlciwgcHJlZGljYXRlLCBzb3VyY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNUcmlnZ2VyOmJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YTp7dmFsdWU6YW55LCBzdGF0ZTpGaWx0ZXJTdGF0ZX0gPSBudWxsO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByZWRpY2F0ZSh2YWx1ZSwgdGhpcy5pKyssIHRoaXMuc291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICBpZighdGhpcy5faXNUcmlnZ2VyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6dmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6RmlsdGVyU3RhdGUuRU5URVJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6dmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6RmlsdGVyU3RhdGUuVFJJR0dFUlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLm5leHQoZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNUcmlnZ2VyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5faXNUcmlnZ2VyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6dmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6RmlsdGVyU3RhdGUuTEVBVkVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc1RyaWdnZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgYWJzdHJhY3Qgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMTpGdW5jdGlvbnxPYnNlcnZlcnxTdWJqZWN0LCBvbkVycm9yPywgb25Db21wbGV0ZWQ/KTpJRGlzcG9zYWJsZSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBpZih0aGlzLmhhbmRsZVN1YmplY3QoYXJnMSkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPElPYnNlcnZlcj5hcmcxKVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICAvL29ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKHRoaXMuZGlzcG9zZUhhbmRsZXIpO1xuXG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUodGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcikpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHN1cGVyLmJ1aWxkU3RyZWFtKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlQ29yZShvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgX2hhc011bHRpT2JzZXJ2ZXJzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLnNjaGVkdWxlci5nZXRPYnNlcnZlcnMoKSA+IDE7XG4gICAgICAgIC8vfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBEb1N0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIG9uTmV4dD86RnVuY3Rpb24sIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBvbk5leHQ6RnVuY3Rpb24sIG9uRXJyb3I6RnVuY3Rpb24sIG9uQ29tcGxldGVkOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlciA9IEFub255bW91c09ic2VydmVyLmNyZWF0ZShvbk5leHQsIG9uRXJyb3Isb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShEb09ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fb2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNYXBTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgc2VsZWN0b3IpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBzZWxlY3RvcjpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWFwT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLl9zZWxlY3RvcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tQXJyYXlTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYXJyYXksIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hcnJheTpBcnJheTxhbnk+ID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9hcnJheSA9IGFycmF5O1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGFycmF5ID0gdGhpcy5fYXJyYXksXG4gICAgICAgICAgICAgICAgbGVuID0gYXJyYXkubGVuZ3RoO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGFycmF5W2ldKTtcblxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHMuY2FsbGVlKGkgKyAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIDAsIGxvb3BSZWN1cnNpdmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbVByb21pc2VTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwcm9taXNlOmFueSwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICBcdHZhciBvYmogPSBuZXcgdGhpcyhwcm9taXNlLCBzY2hlZHVsZXIpO1xuXG4gICAgICAgIFx0cmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3Byb21pc2U6YW55ID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm9taXNlOmFueSwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fcHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9wcm9taXNlLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGRhdGEpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICB9LCBvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tRXZlbnRQYXR0ZXJuU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoYWRkSGFuZGxlcjpGdW5jdGlvbiwgcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGFkZEhhbmRsZXIsIHJlbW92ZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYWRkSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3JlbW92ZUhhbmRsZXI6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIgPSBhZGRIYW5kbGVyO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlSGFuZGxlciA9IHJlbW92ZUhhbmRsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBpbm5lckhhbmRsZXIoZXZlbnQpe1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGlubmVySGFuZGxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5fcmVtb3ZlSGFuZGxlcihpbm5lckhhbmRsZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc3Vic2NyaWJlRnVuYyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihzdWJzY3JpYmVGdW5jKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKHN1YmplY3Q6U3ViamVjdCk6SURpc3Bvc2FibGU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob2JzZXJ2ZXI6SU9ic2VydmVyKTpJRGlzcG9zYWJsZTtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9uTmV4dDoodmFsdWU6YW55KT0+dm9pZCk6SURpc3Bvc2FibGU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob25OZXh0Oih2YWx1ZTphbnkpPT52b2lkLCBvbkVycm9yOihlOmFueSk9PnZvaWQpOklEaXNwb3NhYmxlO1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9uTmV4dDoodmFsdWU6YW55KT0+dm9pZCwgb25FcnJvcjooZTphbnkpPT52b2lkLCBvbkNvbXBsZXRlOigpPT52b2lkKTpJRGlzcG9zYWJsZTtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKC4uLmFyZ3MpOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjpBdXRvRGV0YWNoT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBpZihhcmdzWzBdIGluc3RhbmNlb2YgU3ViamVjdCl7XG4gICAgICAgICAgICAgICAgbGV0IHN1YmplY3Q6U3ViamVjdCA9IDxTdWJqZWN0PmFyZ3NbMF07XG5cbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVN1YmplY3Qoc3ViamVjdCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKEp1ZGdlVXRpbHMuaXNJT2JzZXJ2ZXIoPElPYnNlcnZlcj5hcmdzWzBdKSl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxJT2JzZXJ2ZXI+YXJnc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGxldCBvbk5leHQ6RnVuY3Rpb24gPSA8RnVuY3Rpb24+YXJnc1swXSxcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcjpGdW5jdGlvbiA9IDxGdW5jdGlvbj5hcmdzWzFdIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGVkOkZ1bmN0aW9uID0gPEZ1bmN0aW9uPmFyZ3NbMl0gfHwgbnVsbDtcblxuICAgICAgICAgICAgICAgIG9ic2VydmVyID0gQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZShvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSh0aGlzLmJ1aWxkU3RyZWFtKG9ic2VydmVyKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgSW50ZXJ2YWxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShpbnRlcnZhbDpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhpbnRlcnZhbCwgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgb2JqLmluaXRXaGVuQ3JlYXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pbnRlcnZhbDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGludGVydmFsOm51bWJlciwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSBpbnRlcnZhbDtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGluaXRXaGVuQ3JlYXRlKCl7XG4gICAgICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IHRoaXMuX2ludGVydmFsIDw9IDAgPyAxIDogdGhpcy5faW50ZXJ2YWw7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGlkID0gbnVsbDtcblxuICAgICAgICAgICAgaWQgPSB0aGlzLnNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXIsIDAsIHRoaXMuX2ludGVydmFsLCAoY291bnQpID0+IHtcbiAgICAgICAgICAgICAgICAvL3NlbGYuc2NoZWR1bGVyLm5leHQoY291bnQpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoY291bnQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50ICsgMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL0Rpc3Bvc2VyLmFkZERpc3Bvc2VIYW5kbGVyKCgpID0+IHtcbiAgICAgICAgICAgIC8vfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5jbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBJbnRlcnZhbFJlcXVlc3RTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzRW5kOmJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXIsICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0aW1lKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9pc0VuZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QuY2FuY2VsTmV4dFJlcXVlc3RBbmltYXRpb25GcmFtZShzZWxmLnNjaGVkdWxlci5yZXF1ZXN0TG9vcElkKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pc0VuZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBpbXBvcnQgTG9nID0gd2RDYi5Mb2c7XG5cbiAgICBleHBvcnQgY2xhc3MgVGltZW91dFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKHRpbWU6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIGFzc2VydCh0aW1lID4gMCwgTG9nLmluZm8uRlVOQ19TSE9VTEQoXCJ0aW1lXCIsIFwiPiAwXCIpKTtcbiAgICAgICAgfSlcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUodGltZTpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyh0aW1lLCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdGltZTpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHRpbWU6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBpZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlkID0gdGhpcy5zY2hlZHVsZXIucHVibGlzaFRpbWVvdXQob2JzZXJ2ZXIsIHRoaXMuX3RpbWUsICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0aW1lKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QuY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgLy90aGlzLl9vYnNlcnZlciA9IEFub255bW91c09ic2VydmVyLmNyZWF0ZShvbk5leHQsIG9uRXJyb3Isb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc3RyZWFtR3JvdXAgPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKSxcbiAgICAgICAgICAgICAgICBncm91cERpc3Bvc2FibGUgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWVyZ2VBbGxPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHN0cmVhbUdyb3VwLCBncm91cERpc3Bvc2FibGUpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwRGlzcG9zYWJsZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgTWVyZ2VTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFtIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgbWF4Q29uY3VycmVudDpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIG1heENvbmN1cnJlbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgbWF4Q29uY3VycmVudDpudW1iZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX21heENvbmN1cnJlbnQgPSBtYXhDb25jdXJyZW50O1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfbWF4Q29uY3VycmVudDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICAvL3ZhciBncm91cERpc3Bvc2FibGUgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy90aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWVyZ2VPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX21heENvbmN1cnJlbnQsIGdyb3VwRGlzcG9zYWJsZSkpO1xuICAgICAgICAgICAgdmFyIHN0cmVhbUdyb3VwID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxTdHJlYW0+KCksXG4gICAgICAgICAgICAgICAgZ3JvdXBEaXNwb3NhYmxlID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWVyZ2VPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX21heENvbmN1cnJlbnQsIHN0cmVhbUdyb3VwLCBncm91cERpc3Bvc2FibGUpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwRGlzcG9zYWJsZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgb3RoZXJTdGVhbTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIG90aGVyU3RlYW0pO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX290aGVyU3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgb3RoZXJTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9vdGhlclN0cmVhbSA9IEp1ZGdlVXRpbHMuaXNQcm9taXNlKG90aGVyU3RyZWFtKSA/IGZyb21Qcm9taXNlKG90aGVyU3RyZWFtKSA6IG90aGVyU3RyZWFtO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGdyb3VwID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpLFxuICAgICAgICAgICAgICAgIGF1dG9EZXRhY2hPYnNlcnZlciA9IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIpLFxuICAgICAgICAgICAgICAgIHNvdXJjZURpc3Bvc2FibGUgPSBudWxsO1xuXG4gICAgICAgICAgICBzb3VyY2VEaXNwb3NhYmxlID0gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgZ3JvdXAuYWRkKHNvdXJjZURpc3Bvc2FibGUpO1xuXG4gICAgICAgICAgICBhdXRvRGV0YWNoT2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZShzb3VyY2VEaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgZ3JvdXAuYWRkKHRoaXMuX290aGVyU3RyZWFtLmJ1aWxkU3RyZWFtKFRha2VVbnRpbE9ic2VydmVyLmNyZWF0ZShhdXRvRGV0YWNoT2JzZXJ2ZXIpKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBncm91cDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQ29uY2F0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlczpBcnJheTxTdHJlYW0+KSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2VzOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxTdHJlYW0+KCk7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlczpBcnJheTxTdHJlYW0+KXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vdG9kbyBkb24ndCBzZXQgc2NoZWR1bGVyIGhlcmU/XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNvdXJjZXNbMF0uc2NoZWR1bGVyO1xuXG4gICAgICAgICAgICBzb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKHNvdXJjZSkpe1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zb3VyY2VzLmFkZENoaWxkKGZyb21Qcm9taXNlKHNvdXJjZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zb3VyY2VzLmFkZENoaWxkKHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvdW50ID0gdGhpcy5fc291cmNlcy5nZXRDb3VudCgpLFxuICAgICAgICAgICAgICAgIGQgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvb3BSZWN1cnNpdmUoaSkge1xuICAgICAgICAgICAgICAgIGlmKGkgPT09IGNvdW50KXtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGQuYWRkKHNlbGYuX3NvdXJjZXMuZ2V0Q2hpbGQoaSkuYnVpbGRTdHJlYW0oQ29uY2F0T2JzZXJ2ZXIuY3JlYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIsICgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFJlY3Vyc2l2ZShpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyLCAwLCBsb29wUmVjdXJzaXZlKTtcblxuICAgICAgICAgICAgcmV0dXJuIEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgUmVwZWF0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgY291bnQ6bnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBjb3VudCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfY291bnQ6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBjb3VudDpudW1iZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX2NvdW50ID0gY291bnQ7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcblxuICAgICAgICAgICAgLy90aGlzLnN1YmplY3RHcm91cCA9IHRoaXMuX3NvdXJjZS5zdWJqZWN0R3JvdXA7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgZCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShjb3VudCkge1xuICAgICAgICAgICAgICAgIGlmKGNvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGQuYWRkKFxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zb3VyY2UuYnVpbGRTdHJlYW0oQ29uY2F0T2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wUmVjdXJzaXZlKGNvdW50IC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlciwgdGhpcy5fY291bnQsIGxvb3BSZWN1cnNpdmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZShkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBJZ25vcmVFbGVtZW50c1N0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShJZ25vcmVFbGVtZW50c09ic2VydmVyLmNyZWF0ZShvYnNlcnZlcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBEZWZlclN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGJ1aWxkU3RyZWFtRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGJ1aWxkU3RyZWFtRnVuYyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9idWlsZFN0cmVhbUZ1bmM6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGJ1aWxkU3RyZWFtRnVuYzpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYnVpbGRTdHJlYW1GdW5jID0gYnVpbGRTdHJlYW1GdW5jO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBncm91cCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgZ3JvdXAuYWRkKHRoaXMuX2J1aWxkU3RyZWFtRnVuYygpLmJ1aWxkU3RyZWFtKG9ic2VydmVyKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBncm91cDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiwgdGhpc0FyZzphbnkpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIHByZWRpY2F0ZSwgdGhpc0FyZyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCB0aGlzQXJnOmFueSl7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5wcmVkaWNhdGUgPSB3ZENiLkZ1bmN0aW9uVXRpbHMuYmluZCh0aGlzQXJnLCBwcmVkaWNhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLnN1YnNjcmliZSh0aGlzLmNyZWF0ZU9ic2VydmVyKG9ic2VydmVyKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgaW50ZXJuYWxGaWx0ZXIocHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiwgdGhpc0FyZzphbnkpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlU3RyZWFtRm9ySW50ZXJuYWxGaWx0ZXIodGhpcy5fc291cmNlLCB0aGlzLl9pbm5lclByZWRpY2F0ZShwcmVkaWNhdGUsIHRoaXMpLCB0aGlzQXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVPYnNlcnZlcihvYnNlcnZlcjpJT2JzZXJ2ZXIpOk9ic2VydmVye1xuICAgICAgICAgICAgcmV0dXJuIEZpbHRlck9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5wcmVkaWNhdGUsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVN0cmVhbUZvckludGVybmFsRmlsdGVyKHNvdXJjZTpTdHJlYW0sIGlubmVyUHJlZGljYXRlOmFueSwgdGhpc0FyZzphbnkpOlN0cmVhbXtcbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJTdHJlYW0uY3JlYXRlKHNvdXJjZSwgaW5uZXJQcmVkaWNhdGUsIHRoaXNBcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaW5uZXJQcmVkaWNhdGUocHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiwgc2VsZjphbnkpe1xuICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSwgaSwgbykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnByZWRpY2F0ZSh2YWx1ZSwgaSwgbykgJiYgcHJlZGljYXRlLmNhbGwodGhpcywgdmFsdWUsIGksIG8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEZpbHRlcldpdGhTdGF0ZVN0cmVhbSBleHRlbmRzIEZpbHRlclN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiwgdGhpc0FyZzphbnkpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIHByZWRpY2F0ZSwgdGhpc0FyZyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlT2JzZXJ2ZXIob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJXaXRoU3RhdGVPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMucHJlZGljYXRlLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVTdHJlYW1Gb3JJbnRlcm5hbEZpbHRlcihzb3VyY2U6U3RyZWFtLCBpbm5lclByZWRpY2F0ZTphbnksIHRoaXNBcmc6YW55KTpTdHJlYW17XG4gICAgICAgICAgICByZXR1cm4gRmlsdGVyV2l0aFN0YXRlU3RyZWFtLmNyZWF0ZShzb3VyY2UsIGlubmVyUHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCB2YXIgY3JlYXRlU3RyZWFtID0gKHN1YnNjcmliZUZ1bmMpID0+IHtcbiAgICAgICAgcmV0dXJuIEFub255bW91c1N0cmVhbS5jcmVhdGUoc3Vic2NyaWJlRnVuYyk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbUFycmF5ID0gKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT57XG4gICAgICAgIHJldHVybiBGcm9tQXJyYXlTdHJlYW0uY3JlYXRlKGFycmF5LCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21Qcm9taXNlID0gKHByb21pc2U6YW55LCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+e1xuICAgICAgICByZXR1cm4gRnJvbVByb21pc2VTdHJlYW0uY3JlYXRlKHByb21pc2UsIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbUV2ZW50UGF0dGVybiA9IChhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKSA9PntcbiAgICAgICAgcmV0dXJuIEZyb21FdmVudFBhdHRlcm5TdHJlYW0uY3JlYXRlKGFkZEhhbmRsZXIsIHJlbW92ZUhhbmRsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGludGVydmFsID0gKGludGVydmFsLCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsU3RyZWFtLmNyZWF0ZShpbnRlcnZhbCwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBpbnRlcnZhbFJlcXVlc3QgPSAoc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PiB7XG4gICAgICAgIHJldHVybiBJbnRlcnZhbFJlcXVlc3RTdHJlYW0uY3JlYXRlKHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgdGltZW91dCA9ICh0aW1lLCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIFRpbWVvdXRTdHJlYW0uY3JlYXRlKHRpbWUsIHNjaGVkdWxlcik7XG4gICAgfTtcbiAgICBleHBvcnQgdmFyIGVtcHR5ID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+e1xuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGNhbGxGdW5jID0gKGZ1bmM6RnVuY3Rpb24sIGNvbnRleHQgPSByb290KSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZnVuYy5jYWxsKGNvbnRleHQsIG51bGwpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIganVkZ2UgPSAoY29uZGl0aW9uOkZ1bmN0aW9uLCB0aGVuU291cmNlOkZ1bmN0aW9uLCBlbHNlU291cmNlOkZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25kaXRpb24oKSA/IHRoZW5Tb3VyY2UoKSA6IGVsc2VTb3VyY2UoKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBkZWZlciA9IChidWlsZFN0cmVhbUZ1bmM6RnVuY3Rpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIERlZmVyU3RyZWFtLmNyZWF0ZShidWlsZFN0cmVhbUZ1bmMpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGp1c3QgPSAocmV0dXJuVmFsdWU6YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChyZXR1cm5WYWx1ZSk7XG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGVudW0gRmlsdGVyU3RhdGV7XG4gICAgICAgIFRSSUdHRVIsXG4gICAgICAgIEVOVEVSLFxuICAgICAgICBMRUFWRVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgdmFyIGRlZmF1bHRJc0VxdWFsID0gKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgfTtcblxuICAgIGV4cG9ydCBjbGFzcyBSZWNvcmQge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSh0aW1lOm51bWJlciwgdmFsdWU6YW55LCBhY3Rpb25UeXBlPzpBY3Rpb25UeXBlLCBjb21wYXJlcj86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyh0aW1lLCB2YWx1ZSwgYWN0aW9uVHlwZSwgY29tcGFyZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdGltZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBnZXQgdGltZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHRpbWUodGltZTpudW1iZXIpe1xuICAgICAgICAgICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF92YWx1ZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBnZXQgdmFsdWUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdmFsdWUodmFsdWU6bnVtYmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hY3Rpb25UeXBlOkFjdGlvblR5cGUgPSBudWxsO1xuICAgICAgICBnZXQgYWN0aW9uVHlwZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGlvblR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGFjdGlvblR5cGUoYWN0aW9uVHlwZTpBY3Rpb25UeXBlKXtcbiAgICAgICAgICAgIHRoaXMuX2FjdGlvblR5cGUgPSBhY3Rpb25UeXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY29tcGFyZXI6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHRpbWUsIHZhbHVlLCBhY3Rpb25UeXBlOkFjdGlvblR5cGUsIGNvbXBhcmVyOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9hY3Rpb25UeXBlID0gYWN0aW9uVHlwZTtcbiAgICAgICAgICAgIHRoaXMuX2NvbXBhcmVyID0gY29tcGFyZXIgfHwgZGVmYXVsdElzRXF1YWw7XG4gICAgICAgIH1cblxuICAgICAgICBlcXVhbHMob3RoZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90aW1lID09PSBvdGhlci50aW1lICYmIHRoaXMuX2NvbXBhcmVyKHRoaXMuX3ZhbHVlLCBvdGhlci52YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1vY2tPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IDxbUmVjb3JkXT5bXTtcbiAgICAgICAgZ2V0IG1lc3NhZ2VzKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXM7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IG1lc3NhZ2VzKG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdmFyIHJlY29yZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNEaXJlY3RPYmplY3QodmFsdWUpKXtcbiAgICAgICAgICAgICAgICByZWNvcmQgPSBSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgdmFsdWUsIEFjdGlvblR5cGUuTkVYVCwgKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpIGluIGEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYS5oYXNPd25Qcm9wZXJ0eShpKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYVtpXSAhPT0gYltpXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICByZWNvcmQgPSBSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgdmFsdWUsIEFjdGlvblR5cGUuTkVYVCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2gocmVjb3JkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIGVycm9yLCBBY3Rpb25UeXBlLkVSUk9SKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2goUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIG51bGwsIEFjdGlvblR5cGUuQ09NUExFVEVEKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNsb25lKCl7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gTW9ja09ic2VydmVyLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXN1bHQubWVzc2FnZXMgPSB0aGlzLl9tZXNzYWdlcztcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTW9ja1Byb21pc2V7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyLCBtZXNzYWdlczpbUmVjb3JkXSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlciwgbWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSA8W1JlY29yZF0+W107XG4gICAgICAgIC8vZ2V0IG1lc3NhZ2VzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgICAgICAgLy99XG4gICAgICAgIC8vc2V0IG1lc3NhZ2VzKG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgLy8gICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHJpdmF0ZSBfc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRoZW4oc3VjY2Vzc0NiOkZ1bmN0aW9uLCBlcnJvckNiOkZ1bmN0aW9uLCBvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgc2NoZWR1bGVyID0gPFRlc3RTY2hlZHVsZXI+KHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBjb25zdCBTVUJTQ1JJQkVfVElNRSA9IDIwMDtcbiAgICBjb25zdCBESVNQT1NFX1RJTUUgPSAxMDAwO1xuXG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIG5leHQodGljaywgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNEaXJlY3RPYmplY3QodmFsdWUpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCB2YWx1ZSwgQWN0aW9uVHlwZS5ORVhULCAoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGkgaW4gYSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhLmhhc093blByb3BlcnR5KGkpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhW2ldICE9PSBiW2ldKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBlcnJvcih0aWNrLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgZXJyb3IsIEFjdGlvblR5cGUuRVJST1IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjb21wbGV0ZWQodGljaykge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgbnVsbCwgQWN0aW9uVHlwZS5DT01QTEVURUQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaXNSZXNldDpib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhpc1Jlc2V0KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKGlzUmVzZXQ6Ym9vbGVhbil7XG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICB0aGlzLl9pc1Jlc2V0ID0gaXNSZXNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2Nsb2NrOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCBjbG9jaygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBjbG9jayhjbG9jazpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1Jlc2V0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHJpdmF0ZSBfaXNEaXNwb3NlZDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX3RpbWVyTWFwOndkQ2IuSGFzaDxGdW5jdGlvbj4gPSB3ZENiLkhhc2guY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1NYXA6d2RDYi5IYXNoPEZ1bmN0aW9uPiA9IHdkQ2IuSGFzaC5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX3N1YnNjcmliZWRUaW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VkVGltZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpNb2NrT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzZXRTdHJlYW1NYXAob2JzZXJ2ZXI6SU9ic2VydmVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIG1lc3NhZ2VzLmZvckVhY2goKHJlY29yZDpSZWNvcmQpID0+e1xuICAgICAgICAgICAgICAgIHZhciBmdW5jID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVjb3JkLmFjdGlvblR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuTkVYVDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHJlY29yZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5FUlJPUjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgd2RDYi5Mb2cuZXJyb3IodHJ1ZSwgd2RDYi5Mb2cuaW5mby5GVU5DX1VOS05PVyhcImFjdGlvblR5cGVcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5fc3RyZWFtTWFwLmFkZENoaWxkKFN0cmluZyhyZWNvcmQudGltZSksIGZ1bmMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOk1vY2tPYnNlcnZlciwgaW5pdGlhbDphbnksIHJlY3Vyc2l2ZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAvL21lc3NhZ2VzID0gW10sXG4gICAgICAgICAgICAgICAgbmV4dCA9IG51bGwsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkID0gbnVsbDtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgbmV4dCA9IG9ic2VydmVyLm5leHQ7XG4gICAgICAgICAgICBjb21wbGV0ZWQgPSBvYnNlcnZlci5jb21wbGV0ZWQ7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0LmNhbGwob2JzZXJ2ZXIsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZC5jYWxsKG9ic2VydmVyKTtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVjdXJzaXZlRnVuYyhpbml0aWFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgaW50ZXJ2YWw6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIC8vcHJvZHVjZSAxMCB2YWwgZm9yIHRlc3RcbiAgICAgICAgICAgIHZhciBDT1VOVCA9IDEwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHdoaWxlIChDT1VOVCA+IDAgJiYgIXRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aWNrKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dCh0aGlzLl9jbG9jaywgaW5pdGlhbCkpO1xuXG4gICAgICAgICAgICAgICAgLy9ubyBuZWVkIHRvIGludm9rZSBhY3Rpb25cbiAgICAgICAgICAgICAgICAvL2FjdGlvbihpbml0aWFsKTtcblxuICAgICAgICAgICAgICAgIGluaXRpYWwrKztcbiAgICAgICAgICAgICAgICBDT1VOVC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcbiAgICAgICAgICAgIC8vdGhpcy5zZXRTdHJlYW1NYXAodGhpcy5fb2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IDEwMCxcbiAgICAgICAgICAgICAgICBudW0gPSAwO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB3aGlsZSAoQ09VTlQgPiAwICYmICF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGljayhpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIG51bSkpO1xuXG4gICAgICAgICAgICAgICAgbnVtKys7XG4gICAgICAgICAgICAgICAgQ09VTlQtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG4gICAgICAgICAgICAvL3RoaXMuc2V0U3RyZWFtTWFwKHRoaXMuX29ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hUaW1lb3V0KG9ic2VydmVyOklPYnNlcnZlciwgdGltZTpudW1iZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3RpY2sodGltZSk7XG5cbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5uZXh0KHRoaXMuX2Nsb2NrLCB0aW1lKSwgVGVzdFNjaGVkdWxlci5jb21wbGV0ZWQodGhpcy5fY2xvY2sgKyAxKSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0Q2xvY2soKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzUmVzZXQpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGhpcy5fc3Vic2NyaWJlZFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoVGltZShjcmVhdGU6RnVuY3Rpb24sIHN1YnNjcmliZWRUaW1lOm51bWJlciwgZGlzcG9zZWRUaW1lOm51bWJlcikge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gdGhpcy5jcmVhdGVPYnNlcnZlcigpLFxuICAgICAgICAgICAgICAgIHNvdXJjZSwgc3Vic2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmVkVGltZSA9IHN1YnNjcmliZWRUaW1lO1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZWRUaW1lID0gZGlzcG9zZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9jbG9jayA9IHN1YnNjcmliZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9ydW5BdChzdWJzY3JpYmVkVGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNvdXJjZSA9IGNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KGRpc3Bvc2VkVGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBvYnNlcnZlcjtcblxuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoU3Vic2NyaWJlKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUgPSBTVUJTQ1JJQkVfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIHN1YnNjcmliZWRUaW1lLCBESVNQT1NFX1RJTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aERpc3Bvc2UoY3JlYXRlLCBkaXNwb3NlZFRpbWUgPSBESVNQT1NFX1RJTUUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0V2l0aFRpbWUoY3JlYXRlLCBTVUJTQ1JJQkVfVElNRSwgZGlzcG9zZWRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaWNBYnNvbHV0ZSh0aW1lLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9ydW5BdCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgICAgICB2YXIgZXh0cmVtZU51bUFyciA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKSxcbiAgICAgICAgICAgICAgICBtaW4gPSBleHRyZW1lTnVtQXJyWzBdLFxuICAgICAgICAgICAgICAgIG1heCA9IGV4dHJlbWVOdW1BcnJbMV0sXG4gICAgICAgICAgICAgICAgdGltZSA9IG1pbjtcblxuICAgICAgICAgICAgLy90b2RvIHJlZHVjZSBsb29wIHRpbWVcbiAgICAgICAgICAgIHdoaWxlICh0aW1lIDw9IG1heCkge1xuICAgICAgICAgICAgICAgIC8vaWYodGhpcy5faXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgLy8gICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy99XG5cbiAgICAgICAgICAgICAgICAvL2JlY2F1c2UgXCJfZXhlYyxfcnVuU3RyZWFtXCIgbWF5IGNoYW5nZSBcIl9jbG9ja1wiLFxuICAgICAgICAgICAgICAgIC8vc28gaXQgc2hvdWxkIHJlc2V0IHRoZSBfY2xvY2tcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGltZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2V4ZWModGltZSwgdGhpcy5fdGltZXJNYXApO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aW1lO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcnVuU3RyZWFtKHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgdGltZSsrO1xuXG4gICAgICAgICAgICAgICAgLy90b2RvIGdldCBtYXggdGltZSBvbmx5IGZyb20gc3RyZWFtTWFwP1xuICAgICAgICAgICAgICAgIC8vbmVlZCByZWZyZXNoIG1heCB0aW1lLlxuICAgICAgICAgICAgICAgIC8vYmVjYXVzZSBpZiB0aW1lck1hcCBoYXMgY2FsbGJhY2sgdGhhdCBjcmVhdGUgaW5maW5pdGUgc3RyZWFtKGFzIGludGVydmFsKSxcbiAgICAgICAgICAgICAgICAvL2l0IHdpbGwgc2V0IHN0cmVhbU1hcCBzbyB0aGF0IHRoZSBtYXggdGltZSB3aWxsIGNoYW5nZVxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVTdHJlYW0oYXJncyl7XG4gICAgICAgICAgICByZXR1cm4gVGVzdFN0cmVhbS5jcmVhdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlT2JzZXJ2ZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gTW9ja09ic2VydmVyLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVSZXNvbHZlZFByb21pc2UodGltZTpudW1iZXIsIHZhbHVlOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gTW9ja1Byb21pc2UuY3JlYXRlKHRoaXMsIFtUZXN0U2NoZWR1bGVyLm5leHQodGltZSwgdmFsdWUpLCBUZXN0U2NoZWR1bGVyLmNvbXBsZXRlZCh0aW1lKzEpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlUmVqZWN0UHJvbWlzZSh0aW1lOm51bWJlciwgZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHJldHVybiBNb2NrUHJvbWlzZS5jcmVhdGUodGhpcywgW1Rlc3RTY2hlZHVsZXIuZXJyb3IodGltZSwgZXJyb3IpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9nZXRNaW5BbmRNYXhUaW1lKCl7XG4gICAgICAgICAgICB2YXIgdGltZUFycjphbnkgPSAodGhpcy5fdGltZXJNYXAuZ2V0S2V5cygpLmFkZENoaWxkcmVuKHRoaXMuX3N0cmVhbU1hcC5nZXRLZXlzKCkpKTtcblxuICAgICAgICAgICAgICAgIHRpbWVBcnIgPSB0aW1lQXJyLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIoa2V5KTtcbiAgICAgICAgICAgICAgICB9KS50b0FycmF5KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBbTWF0aC5taW4uYXBwbHkoTWF0aCwgdGltZUFyciksIE1hdGgubWF4LmFwcGx5KE1hdGgsIHRpbWVBcnIpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2V4ZWModGltZSwgbWFwKXtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gbWFwLmdldENoaWxkKFN0cmluZyh0aW1lKSk7XG5cbiAgICAgICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3J1blN0cmVhbSh0aW1lKXtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fc3RyZWFtTWFwLmdldENoaWxkKFN0cmluZyh0aW1lKSk7XG5cbiAgICAgICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3J1bkF0KHRpbWU6bnVtYmVyLCBjYWxsYmFjazpGdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fdGltZXJNYXAuYWRkQ2hpbGQoU3RyaW5nKHRpbWUpLCBjYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aWNrKHRpbWU6bnVtYmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9jbG9jayArPSB0aW1lO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGVudW0gQWN0aW9uVHlwZXtcbiAgICAgICAgTkVYVCxcbiAgICAgICAgRVJST1IsXG4gICAgICAgIENPTVBMRVRFRFxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFtIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMobWVzc2FnZXMsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdmFyIHNjaGVkdWxlciA9IDxUZXN0U2NoZWR1bGVyPih0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
