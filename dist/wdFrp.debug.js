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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9KdWRnZVV0aWxzLnRzIiwic3JjL2JpbmRpbmcvbm9kZWpzL05vZGVPcGVyYXRvci50cyIsInNyYy9jb3JlL0VudGl0eS50cyIsInNyYy9jb3JlL01haW4udHMiLCJzcmMvZGVmaW5pdGlvbi90eXBlc2NyaXB0L2RlY29yYXRvci9jb250cmFjdC50cyIsInNyYy9kaXNwb3NhYmxlL1NpbmdsZURpc3Bvc2FibGUudHMiLCJzcmMvZGlzcG9zYWJsZS9Hcm91cERpc3Bvc2FibGUudHMiLCJzcmMvZGlzcG9zYWJsZS9Jbm5lclN1YnNjcmlwdGlvbi50cyIsInNyYy9kaXNwb3NhYmxlL0lubmVyU3Vic2NyaXB0aW9uR3JvdXAudHMiLCJzcmMvZ2xvYmFsL1ZhcmlhYmxlLnRzIiwic3JjL2dsb2JhbC9pbml0LnRzIiwic3JjL2V4dGVuZC9yb290LnRzIiwic3JjL2NvcmUvU3RyZWFtLnRzIiwic3JjL2NvcmUvU2NoZWR1bGVyLnRzIiwic3JjL2NvcmUvT2JzZXJ2ZXIudHMiLCJzcmMvc3ViamVjdC9TdWJqZWN0LnRzIiwic3JjL3N1YmplY3QvR2VuZXJhdG9yU3ViamVjdC50cyIsInNyYy9vYnNlcnZlci9Bbm9ueW1vdXNPYnNlcnZlci50cyIsInNyYy9vYnNlcnZlci9BdXRvRGV0YWNoT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvTWFwT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvRG9PYnNlcnZlci50cyIsInNyYy9vYnNlcnZlci9NZXJnZUFsbE9ic2VydmVyLnRzIiwic3JjL29ic2VydmVyL01lcmdlT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvVGFrZVVudGlsT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvQ29uY2F0T2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvU3ViamVjdE9ic2VydmVyLnRzIiwic3JjL29ic2VydmVyL0lnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvRmlsdGVyT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvRmlsdGVyV2l0aFN0YXRlT2JzZXJ2ZXIudHMiLCJzcmMvc3RyZWFtL0Jhc2VTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0RvU3RyZWFtLnRzIiwic3JjL3N0cmVhbS9NYXBTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0Zyb21BcnJheVN0cmVhbS50cyIsInNyYy9zdHJlYW0vRnJvbVByb21pc2VTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0Zyb21FdmVudFBhdHRlcm5TdHJlYW0udHMiLCJzcmMvc3RyZWFtL0Fub255bW91c1N0cmVhbS50cyIsInNyYy9zdHJlYW0vSW50ZXJ2YWxTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0ludGVydmFsUmVxdWVzdFN0cmVhbS50cyIsInNyYy9zdHJlYW0vVGltZW91dFN0cmVhbS50cyIsInNyYy9zdHJlYW0vTWVyZ2VBbGxTdHJlYW0udHMiLCJzcmMvc3RyZWFtL01lcmdlU3RyZWFtLnRzIiwic3JjL3N0cmVhbS9UYWtlVW50aWxTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0NvbmNhdFN0cmVhbS50cyIsInNyYy9zdHJlYW0vUmVwZWF0U3RyZWFtLnRzIiwic3JjL3N0cmVhbS9JZ25vcmVFbGVtZW50c1N0cmVhbS50cyIsInNyYy9zdHJlYW0vRGVmZXJTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0ZpbHRlclN0cmVhbS50cyIsInNyYy9zdHJlYW0vRmlsdGVyV2l0aFN0YXRlU3RyZWFtLnRzIiwic3JjL2dsb2JhbC9PcGVyYXRvci50cyIsInNyYy9lbnVtL0ZpbHRlclN0YXRlLnRzIiwic3JjL3Rlc3RpbmcvUmVjb3JkLnRzIiwic3JjL3Rlc3RpbmcvTW9ja09ic2VydmVyLnRzIiwic3JjL3Rlc3RpbmcvTW9ja1Byb21pc2UudHMiLCJzcmMvdGVzdGluZy9UZXN0U2NoZWR1bGVyLnRzIiwic3JjL3Rlc3RpbmcvQWN0aW9uVHlwZS50cyIsInNyYy90ZXN0aW5nL1Rlc3RTdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxJQUFPLEtB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QUFTLEdBQWlCLElBQUksQ0FBQztZQUM5QixjQUFTLEdBQVksSUFBSSxDQUFDO1lBSzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQy9CLENBQUM7UUFkYSxpQkFBTSxHQUFwQixVQUFxQixRQUFpQixFQUFFLFNBQXVCO1lBQzNELElBQUksR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV4QyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQVlNLGtDQUFhLEdBQXBCLFVBQXFCLFFBQWtCO1lBR25DLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdEQsTUFBTSxDQUFDLHNCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFDTCxpQkFBQztJQUFELENBeEJBLEFBd0JDLENBeEIrQixnQkFBVSxHQXdCekM7SUF4QlksZ0JBQVUsYUF3QnRCLENBQUE7QUFDTCxDQUFDLEVBMUJNLEtBQUssS0FBTCxLQUFLLFFBMEJYIiwiZmlsZSI6IndkRnJwLmRlYnVnLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgSnVkZ2VVdGlscyBleHRlbmRzIHdkQ2IuSnVkZ2VVdGlscyB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNQcm9taXNlKG9iail7XG4gICAgICAgICAgICByZXR1cm4gISFvYmpcbiAgICAgICAgICAgICAgICAmJiAhc3VwZXIuaXNGdW5jdGlvbihvYmouc3Vic2NyaWJlKVxuICAgICAgICAgICAgICAgICYmIHN1cGVyLmlzRnVuY3Rpb24ob2JqLnRoZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBpc0VxdWFsKG9iMTpFbnRpdHksIG9iMjpFbnRpdHkpe1xuICAgICAgICAgICAgcmV0dXJuIG9iMS51aWQgPT09IG9iMi51aWQ7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGlzSU9ic2VydmVyKGk6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiBpLm5leHQgJiYgaS5lcnJvciAmJiBpLmNvbXBsZXRlZDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IHZhciBmcm9tTm9kZUNhbGxiYWNrID0gKGZ1bmM6RnVuY3Rpb24sIGNvbnRleHQ/OmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gKC4uLmZ1bmNBcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgaGFuZGVyID0gKGVyciwgLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQuYXBwbHkob2JzZXJ2ZXIsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBmdW5jQXJncy5wdXNoKGhhbmRlcik7XG4gICAgICAgICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBmdW5jQXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21TdHJlYW0gPSAoc3RyZWFtOmFueSwgZmluaXNoRXZlbnROYW1lOnN0cmluZyA9IFwiZW5kXCIpID0+IHtcbiAgICAgICAgaWYoc3RyZWFtLnBhdXNlKXtcbiAgICAgICAgICAgIHN0cmVhbS5wYXVzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdkRnJwLmNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIHZhciBkYXRhSGFuZGxlciA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvckhhbmRsZXIgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbmRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdHJlYW0uYWRkTGlzdGVuZXIoXCJkYXRhXCIsIGRhdGFIYW5kbGVyKTtcbiAgICAgICAgICAgIHN0cmVhbS5hZGRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICBzdHJlYW0uYWRkTGlzdGVuZXIoZmluaXNoRXZlbnROYW1lLCBlbmRIYW5kbGVyKTtcblxuICAgICAgICAgICAgaWYoc3RyZWFtLnJlc3VtZSl7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlc3VtZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcihcImRhdGFcIiwgZGF0YUhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcihcImVycm9yXCIsIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlbW92ZUxpc3RlbmVyKGZpbmlzaEV2ZW50TmFtZSwgZW5kSGFuZGxlcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tUmVhZGFibGVTdHJlYW0gPSAoc3RyZWFtOmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gZnJvbVN0cmVhbShzdHJlYW0sIFwiZW5kXCIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21Xcml0YWJsZVN0cmVhbSA9IChzdHJlYW06YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyZWFtKHN0cmVhbSwgXCJmaW5pc2hcIik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVRyYW5zZm9ybVN0cmVhbSA9IChzdHJlYW06YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyZWFtKHN0cmVhbSwgXCJmaW5pc2hcIik7XG4gICAgfTtcbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbnRpdHl7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVUlEOm51bWJlciA9IDE7XG5cbiAgICAgICAgcHJpdmF0ZSBfdWlkOnN0cmluZyA9IG51bGw7XG4gICAgICAgIGdldCB1aWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl91aWQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHVpZCh1aWQ6c3RyaW5nKXtcbiAgICAgICAgICAgIHRoaXMuX3VpZCA9IHVpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHVpZFByZTpzdHJpbmcpe1xuICAgICAgICAgICAgdGhpcy5fdWlkID0gdWlkUHJlICsgU3RyaW5nKEVudGl0eS5VSUQrKyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1haW57XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNUZXN0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBpbXBvcnQgTG9nID0gd2RDYi5Mb2c7XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gYXNzZXJ0KGNvbmQ6Ym9vbGVhbiwgbWVzc2FnZTpzdHJpbmc9XCJjb250cmFjdCBlcnJvclwiKXtcbiAgICAgICAgTG9nLmVycm9yKCFjb25kLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcmVxdWlyZShJbkZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRlc2NyaXB0b3IudmFsdWU7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIEluRnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlbnN1cmUoT3V0RnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3MpLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBbcmVzdWx0XS5jb25jYXQoYXJncyk7XG5cbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCkge1xuICAgICAgICAgICAgICAgICAgICBPdXRGdW5jLmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVHZXR0ZXIoSW5GdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICB2YXIgZ2V0dGVyID0gZGVzY3JpcHRvci5nZXQ7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IuZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBJbkZ1bmMuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiByZXF1aXJlU2V0dGVyKEluRnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHNldHRlciA9IGRlc2NyaXB0b3Iuc2V0O1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLnNldCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KXtcbiAgICAgICAgICAgICAgICAgICAgSW5GdW5jLmNhbGwodGhpcywgdmFsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZXR0ZXIuY2FsbCh0aGlzLCB2YWwpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZW5zdXJlR2V0dGVyKE91dEZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciBnZXR0ZXIgPSBkZXNjcmlwdG9yLmdldDtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci5nZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZ2V0dGVyLmNhbGwodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIE91dEZ1bmMuY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlbnN1cmVTZXR0ZXIoT3V0RnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHNldHRlciA9IGRlc2NyaXB0b3Iuc2V0O1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLnNldCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBzZXR0ZXIuY2FsbCh0aGlzLCB2YWwpLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBbcmVzdWx0LCB2YWxdO1xuXG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBPdXRGdW5jLmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gaW52YXJpYW50KGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KSB7XG4gICAgICAgICAgICAgICAgZnVuYyh0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBTaW5nbGVEaXNwb3NhYmxlIGV4dGVuZHMgRW50aXR5IGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGRpc3Bvc2VIYW5kbGVyOkZ1bmN0aW9uID0gZnVuY3Rpb24oKXt9KSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKGRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9kaXNwb3NlSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoZGlzcG9zZUhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIoXCJTaW5nbGVEaXNwb3NhYmxlXCIpO1xuXG4gICAgICAgIFx0dGhpcy5fZGlzcG9zZUhhbmRsZXIgPSBkaXNwb3NlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NlSGFuZGxlcihoYW5kbGVyOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyID0gaGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBHcm91cERpc3Bvc2FibGUgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoZGlzcG9zYWJsZT86SURpc3Bvc2FibGUpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhkaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2dyb3VwOndkQ2IuQ29sbGVjdGlvbjxJRGlzcG9zYWJsZT4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPElEaXNwb3NhYmxlPigpO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGRpc3Bvc2FibGU/OklEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHN1cGVyKFwiR3JvdXBEaXNwb3NhYmxlXCIpO1xuXG4gICAgICAgICAgICBpZihkaXNwb3NhYmxlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9ncm91cC5hZGRDaGlsZChkaXNwb3NhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhZGQoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLl9ncm91cC5hZGRDaGlsZChkaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXAucmVtb3ZlQ2hpbGQoZGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMuX2dyb3VwLmZvckVhY2goKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpID0+IHtcbiAgICAgICAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uIGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG5cdFx0cHVibGljIHN0YXRpYyBjcmVhdGUoc3ViamVjdDpTdWJqZWN0fEdlbmVyYXRvclN1YmplY3QsIG9ic2VydmVyOk9ic2VydmVyKSB7XG5cdFx0XHR2YXIgb2JqID0gbmV3IHRoaXMoc3ViamVjdCwgb2JzZXJ2ZXIpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX3N1YmplY3Q6U3ViamVjdHxHZW5lcmF0b3JTdWJqZWN0ID0gbnVsbDtcblx0XHRwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cblx0XHRjb25zdHJ1Y3RvcihzdWJqZWN0OlN1YmplY3R8R2VuZXJhdG9yU3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuXHRcdFx0dGhpcy5fc3ViamVjdCA9IHN1YmplY3Q7XG5cdFx0XHR0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9zdWJqZWN0LnJlbW92ZSh0aGlzLl9vYnNlcnZlcik7XG5cblx0XHRcdHRoaXMuX29ic2VydmVyLmRpc3Bvc2UoKTtcblx0XHR9XG5cdH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uR3JvdXAgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX2NvbnRhaW5lcjp3ZENiLkNvbGxlY3Rpb248SURpc3Bvc2FibGU+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJRGlzcG9zYWJsZT4oKTtcblxuXHRcdHB1YmxpYyBhZGRDaGlsZChjaGlsZDpJRGlzcG9zYWJsZSl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuYWRkQ2hpbGQoY2hpbGQpO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuZm9yRWFjaCgoY2hpbGQ6SURpc3Bvc2FibGUpID0+IHtcblx0XHRcdFx0Y2hpbGQuZGlzcG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG4iLCJkZWNsYXJlIHZhciBnbG9iYWw6YW55LHdpbmRvdzpXaW5kb3c7XG5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgdmFyIHJvb3Q6YW55O1xuXG4gICAgaWYoSnVkZ2VVdGlscy5pc05vZGVKcygpKXtcbiAgICAgICAgcm9vdCA9IGdsb2JhbDtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgICAgcm9vdCA9IHdpbmRvdztcbiAgICB9XG59XG5cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIC8vcnN2cC5qc1xuICAgIC8vZGVjbGFyZSB2YXIgUlNWUDphbnk7XG5cbiAgICAvL25vdCBzd2FsbG93IHRoZSBlcnJvclxuICAgIGlmKHJvb3QuUlNWUCl7XG4gICAgICAgIHJvb3QuUlNWUC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfTtcbiAgICAgICAgcm9vdC5SU1ZQLm9uKCdlcnJvcicsIHJvb3QuUlNWUC5vbmVycm9yKTtcbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgd3JhcHBlciA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gbnVsbCxcbiAgICAgICAgICAgIHVzZXJBZ2VudCA9IHJvb3QubmF2aWdhdG9yICYmIHJvb3QubmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHdyYXBwZXIgPSBmdW5jdGlvbiAodGltZSkge1xuICAgICAgICAgICAgdGltZSA9IHJvb3QucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICBzZWxmLmNhbGxiYWNrKHRpbWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qIVxuICAgICAgICAgYnVnIVxuICAgICAgICAgYmVsb3cgY29kZTpcbiAgICAgICAgIHdoZW4gaW52b2tlIGIgYWZ0ZXIgMXMsIHdpbGwgb25seSBpbnZva2UgYiwgbm90IGludm9rZSBhIVxuXG4gICAgICAgICBmdW5jdGlvbiBhKHRpbWUpe1xuICAgICAgICAgY29uc29sZS5sb2coXCJhXCIsIHRpbWUpO1xuICAgICAgICAgd2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKGEpO1xuICAgICAgICAgfVxuXG4gICAgICAgICBmdW5jdGlvbiBiKHRpbWUpe1xuICAgICAgICAgY29uc29sZS5sb2coXCJiXCIsIHRpbWUpO1xuICAgICAgICAgd2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKGIpO1xuICAgICAgICAgfVxuXG4gICAgICAgICBhKCk7XG5cbiAgICAgICAgIHNldFRpbWVvdXQoYiwgMTAwMCk7XG5cblxuXG4gICAgICAgICBzbyB1c2UgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHByaW9yaXR5IVxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHJvb3QucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBDaHJvbWUgMTAgYnVnIHdoZXJlIENocm9tZVxuICAgICAgICAvLyBkb2VzIG5vdCBwYXNzIHRoZSB0aW1lIHRvIHRoZSBhbmltYXRpb24gZnVuY3Rpb25cblxuICAgICAgICBpZiAocm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIC8vIERlZmluZSB0aGUgd3JhcHBlclxuXG4gICAgICAgICAgICAvLyBNYWtlIHRoZSBzd2l0Y2hcblxuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuICAgICAgICAgICAgcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgICAgICAgICAvLyBCcm93c2VyIGNhbGxzIHRoZSB3cmFwcGVyIGFuZCB3cmFwcGVyIGNhbGxzIHRoZSBjYWxsYmFja1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIsIGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/kv67mlLl0aW1l5Y+C5pWwXG4gICAgICAgIGlmIChyb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJvb3QubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3QubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUod3JhcHBlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBHZWNrbyAyLjAsIHdoaWNoIGhhcyBhIGJ1ZyBpblxuICAgICAgICAvLyBtb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKSB0aGF0IHJlc3RyaWN0cyBhbmltYXRpb25zXG4gICAgICAgIC8vIHRvIDMwLTQwIGZwcy5cblxuICAgICAgICBpZiAocm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIHRoZSBHZWNrbyB2ZXJzaW9uLiBHZWNrbyBpcyB1c2VkIGJ5IGJyb3dzZXJzXG4gICAgICAgICAgICAvLyBvdGhlciB0aGFuIEZpcmVmb3guIEdlY2tvIDIuMCBjb3JyZXNwb25kcyB0b1xuICAgICAgICAgICAgLy8gRmlyZWZveCA0LjAuXG5cbiAgICAgICAgICAgIGluZGV4ID0gdXNlckFnZW50LmluZGV4T2YoJ3J2OicpO1xuXG4gICAgICAgICAgICBpZiAodXNlckFnZW50LmluZGV4T2YoJ0dlY2tvJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICBnZWNrb1ZlcnNpb24gPSB1c2VyQWdlbnQuc3Vic3RyKGluZGV4ICsgMywgMyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZ2Vja29WZXJzaW9uID09PSAnMi4wJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBGb3JjZXMgdGhlIHJldHVybiBzdGF0ZW1lbnQgdG8gZmFsbCB0aHJvdWdoXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIHRoZSBzZXRUaW1lb3V0KCkgZnVuY3Rpb24uXG5cbiAgICAgICAgICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICByb290Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoO1xuXG4gICAgICAgICAgICAgICAgcm9vdC5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSByb290LnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhzdGFydCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaCA9IHJvb3QucGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi50aW1lb3V0ID0gMTAwMCAvIDYwIC0gKGZpbmlzaCAtIHN0YXJ0KTtcblxuICAgICAgICAgICAgICAgIH0sIHNlbGYudGltZW91dCk7XG4gICAgICAgICAgICB9O1xuICAgIH0oKSk7XG5cbiAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290LmNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qud2Via2l0Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3QubW96Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qub0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm1zQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IGNsZWFyVGltZW91dDtcbn07XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgaW1wb3J0IExvZyA9IHdkQ2IuTG9nO1xuXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0cmVhbSBleHRlbmRzIEVudGl0eXtcbiAgICAgICAgcHVibGljIHNjaGVkdWxlcjpTY2hlZHVsZXIgPSBudWxsO1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlRnVuYzoob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiBGdW5jdGlvbnx2b2lkID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jKXtcbiAgICAgICAgICAgIHN1cGVyKFwiU3RyZWFtXCIpO1xuXG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZUZ1bmMgPSBzdWJzY3JpYmVGdW5jIHx8IGZ1bmN0aW9uKCl7IH07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYWJzdHJhY3Qgc3Vic2NyaWJlKGFyZzE6RnVuY3Rpb258T2JzZXJ2ZXJ8U3ViamVjdCwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGU7XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoPEZ1bmN0aW9uPih0aGlzLnN1YnNjcmliZUZ1bmMob2JzZXJ2ZXIpIHx8IGZ1bmN0aW9uKCl7fSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRvKG9uTmV4dD86RnVuY3Rpb24sIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBEb1N0cmVhbS5jcmVhdGUodGhpcywgb25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbWFwKHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gTWFwU3RyZWFtLmNyZWF0ZSh0aGlzLCBzZWxlY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmxhdE1hcChzZWxlY3RvcjpGdW5jdGlvbil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXAoc2VsZWN0b3IpLm1lcmdlQWxsKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29uY2F0TWFwKHNlbGVjdG9yOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcChzZWxlY3RvcikuY29uY2F0QWxsKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbWVyZ2VBbGwoKXtcbiAgICAgICAgICAgIHJldHVybiBNZXJnZUFsbFN0cmVhbS5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29uY2F0QWxsKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tZXJnZSgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0YWtlVW50aWwob3RoZXJTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHJldHVybiBUYWtlVW50aWxTdHJlYW0uY3JlYXRlKHRoaXMsIG90aGVyU3RyZWFtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKGNvdW50Om51bWJlciA9IDEpe1xuICAgICAgICAgICAgYXNzZXJ0KGNvdW50ID49IDAsIExvZy5pbmZvLkZVTkNfU0hPVUxEKFwiY291bnRcIiwgXCI+PSAwXCIpKTtcbiAgICAgICAgfSlcbiAgICAgICAgcHVibGljIHRha2UoY291bnQ6bnVtYmVyID0gMSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmKGNvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW1wdHkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUoKHZhbHVlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihjb3VudCA+IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb3VudC0tO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKGNvdW50IDw9IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgQHJlcXVpcmUoZnVuY3Rpb24oY291bnQ6bnVtYmVyID0gMSl7XG4gICAgICAgICAgICBhc3NlcnQoY291bnQgPj0gMCwgTG9nLmluZm8uRlVOQ19TSE9VTEQoXCJjb3VudFwiLCBcIj49IDBcIikpO1xuICAgICAgICB9KVxuICAgICAgICBwdWJsaWMgdGFrZUxhc3QoY291bnQ6bnVtYmVyID0gMSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmKGNvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW1wdHkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICAgICAgICAgICAgICBzZWxmLnN1YnNjcmliZSgodmFsdWU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2godmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHF1ZXVlLmxlbmd0aCA+IGNvdW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB3aGlsZShxdWV1ZS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQocXVldWUuc2hpZnQoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRha2VXaGlsZShwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg6bnVtYmVyLCBzb3VyY2U6U3RyZWFtKT0+Ym9vbGVhbiwgdGhpc0FyZyA9IHRoaXMpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGJpbmRQcmVkaWNhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICBiaW5kUHJlZGljYXRlID0gd2RDYi5GdW5jdGlvblV0aWxzLmJpbmQodGhpc0FyZywgcHJlZGljYXRlKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgICAgICBpc1N0YXJ0ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBzZWxmLnN1YnNjcmliZSgodmFsdWU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGJpbmRQcmVkaWNhdGUodmFsdWUsIGkrKywgc2VsZikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3RhcnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpc1N0YXJ0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIChlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbGFzdE9yRGVmYXVsdChkZWZhdWx0VmFsdWU6YW55ID0gbnVsbCl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUoKHZhbHVlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKHZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihxdWV1ZS5sZW5ndGggPiAxKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihxdWV1ZS5sZW5ndGggPT09IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChkZWZhdWx0VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZShxdWV1ZS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHF1ZXVlLnNoaWZ0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBmaWx0ZXIocHJlZGljYXRlOih2YWx1ZTphbnkpPT5ib29sZWFuLCB0aGlzQXJnID0gdGhpcyl7XG4gICAgICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgRmlsdGVyU3RyZWFtKXtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZjphbnkgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWxGaWx0ZXIocHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIEZpbHRlclN0cmVhbS5jcmVhdGUodGhpcywgcHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBmaWx0ZXJXaXRoU3RhdGUocHJlZGljYXRlOih2YWx1ZTphbnkpPT5ib29sZWFuLCB0aGlzQXJnID0gdGhpcyl7XG4gICAgICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgRmlsdGVyU3RyZWFtKXtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZjphbnkgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJuYWxGaWx0ZXIocHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIEZpbHRlcldpdGhTdGF0ZVN0cmVhbS5jcmVhdGUodGhpcywgcHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb25jYXQoc3RyZWFtQXJyOkFycmF5PFN0cmVhbT4pO1xuICAgICAgICBwdWJsaWMgY29uY2F0KC4uLm90aGVyU3RyZWFtKTtcblxuICAgICAgICBwdWJsaWMgY29uY2F0KCl7XG4gICAgICAgICAgICB2YXIgYXJnczpBcnJheTxTdHJlYW0+ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0FycmF5KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBDb25jYXRTdHJlYW0uY3JlYXRlKGFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlKG1heENvbmN1cnJlbnQ6bnVtYmVyKTtcbiAgICAgICAgcHVibGljIG1lcmdlKHN0cmVhbUFycjpBcnJheTxTdHJlYW0+KTtcbiAgICAgICAgcHVibGljIG1lcmdlKC4uLm90aGVyU3RyZWFtcyk7XG5cbiAgICAgICAgcHVibGljIG1lcmdlKC4uLmFyZ3Mpe1xuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc051bWJlcihhcmdzWzBdKSl7XG4gICAgICAgICAgICAgICAgdmFyIG1heENvbmN1cnJlbnQ6bnVtYmVyID0gYXJnc1swXTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBNZXJnZVN0cmVhbS5jcmVhdGUodGhpcywgbWF4Q29uY3VycmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNBcnJheShhcmdzWzBdKSl7XG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICAgICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuXG4gICAgICAgICAgICBzdHJlYW0gPSBmcm9tQXJyYXkoYXJncykubWVyZ2VBbGwoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZXBlYXQoY291bnQ6bnVtYmVyID0gLTEpe1xuICAgICAgICAgICAgcmV0dXJuIFJlcGVhdFN0cmVhbS5jcmVhdGUodGhpcywgY291bnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGlnbm9yZUVsZW1lbnRzKCl7XG4gICAgICAgICAgICByZXR1cm4gSWdub3JlRWxlbWVudHNTdHJlYW0uY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGhhbmRsZVN1YmplY3Qoc3ViamVjdDphbnkpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNTdWJqZWN0KHN1YmplY3QpKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRTdWJqZWN0KHN1YmplY3QpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1N1YmplY3Qoc3ViamVjdDpTdWJqZWN0KXtcbiAgICAgICAgICAgIHJldHVybiBzdWJqZWN0IGluc3RhbmNlb2YgU3ViamVjdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NldFN1YmplY3Qoc3ViamVjdDpTdWJqZWN0KXtcbiAgICAgICAgICAgIHN1YmplY3Quc291cmNlID0gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIFNjaGVkdWxlcntcbiAgICAgICAgLy90b2RvIHJlbW92ZSBcIi4uLmFyZ3NcIlxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3JlcXVlc3RMb29wSWQ6YW55ID0gbnVsbDtcbiAgICAgICAgZ2V0IHJlcXVlc3RMb29wSWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG4gICAgICAgIHNldCByZXF1ZXN0TG9vcElkKHJlcXVlc3RMb29wSWQ6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByZXF1ZXN0TG9vcElkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wYXJhbSBvYnNlcnZlciBpcyB1c2VkIGJ5IFRlc3RTY2hlZHVsZXIgdG8gcmV3cml0ZVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICBhY3Rpb24oaW5pdGlhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGludGVydmFsOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbCA9IGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgICAgIH0sIGludGVydmFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0KG9ic2VydmVyOklPYnNlcnZlciwgYWN0aW9uOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBsb29wID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzRW5kID0gYWN0aW9uKHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKGlzRW5kKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3JlcXVlc3RMb29wSWQgPSByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdExvb3BJZCA9IHJvb3QucmVxdWVzdE5leHRBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoVGltZW91dChvYnNlcnZlcjpJT2JzZXJ2ZXIsIHRpbWU6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIHJldHVybiByb290LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGlvbih0aW1lKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0sIHRpbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgT2JzZXJ2ZXIgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IG51bGw7XG4gICAgICAgIGdldCBpc0Rpc3Bvc2VkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNEaXNwb3NlZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNEaXNwb3NlZChpc0Rpc3Bvc2VkOmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IGlzRGlzcG9zZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyTmV4dDpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJFcnJvcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJDb21wbGV0ZWQ6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2lzU3RvcDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIC8vcHJpdmF0ZSBfZGlzcG9zZUhhbmRsZXI6d2RDYi5Db2xsZWN0aW9uPEZ1bmN0aW9uPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2FibGU6SURpc3Bvc2FibGUgPSBudWxsO1xuXG5cbiAgICAgICAgY29uc3RydWN0b3Iob2JzZXJ2ZXI6SU9ic2VydmVyKTtcbiAgICAgICAgY29uc3RydWN0b3Iob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbik7XG5cbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgICAgICAgc3VwZXIoXCJPYnNlcnZlclwiKTtcblxuICAgICAgICAgICAgaWYoYXJncy5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgIGxldCBvYnNlcnZlcjpJT2JzZXJ2ZXIgPSBhcmdzWzBdO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0ID0gZnVuY3Rpb24odil7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodik7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgb25OZXh0ID0gYXJnc1swXSxcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvciA9IGFyZ3NbMV0sXG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGVkID0gYXJnc1syXTtcblxuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCA9IG9uTmV4dCB8fCBmdW5jdGlvbih2KXt9O1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IgPSBvbkVycm9yIHx8IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCA9IG9uQ29tcGxldGVkIHx8IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vbk5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9kaXNwb3NhYmxlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy90aGlzLl9kaXNwb3NlSGFuZGxlci5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAvLyAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICAvL30pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wdWJsaWMgZmFpbChlKSB7XG4gICAgICAgIC8vICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgIC8vICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAvLyAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgLy8gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2FibGUoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlID0gZGlzcG9zYWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbk5leHQodmFsdWU6YW55KTtcblxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25FcnJvcihlcnJvcjphbnkpO1xuXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbkNvbXBsZXRlZCgpO1xuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdCBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBnZXQgc291cmNlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBzb3VyY2Uoc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjphbnkgPSBuZXcgU3ViamVjdE9ic2VydmVyKCk7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxPzpGdW5jdGlvbnxPYnNlcnZlciwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IDxBdXRvRGV0YWNoT2JzZXJ2ZXI+YXJnMVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICAvL3RoaXMuX3NvdXJjZSAmJiBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLl9zb3VyY2UuZGlzcG9zZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBJbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUodGhpcywgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX3NvdXJjZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbSh0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLnJlbW92ZUNoaWxkKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEdlbmVyYXRvclN1YmplY3QgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdGFydDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGdldCBpc1N0YXJ0KCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNTdGFydDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNTdGFydChpc1N0YXJ0OmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IGlzU3RhcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICAgICAgc3VwZXIoXCJHZW5lcmF0b3JTdWJqZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9ic2VydmVyOmFueSA9IG5ldyBTdWJqZWN0T2JzZXJ2ZXIoKTtcblxuICAgICAgICAvKiFcbiAgICAgICAgb3V0ZXIgaG9vayBtZXRob2RcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZU5leHQodmFsdWU6YW55KXtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkFmdGVyTmV4dCh2YWx1ZTphbnkpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbklzQ29tcGxldGVkKHZhbHVlOmFueSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQmVmb3JlRXJyb3IoZXJyb3I6YW55KSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25BZnRlckVycm9yKGVycm9yOmFueSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQmVmb3JlQ29tcGxldGVkKCkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQWZ0ZXJDb21wbGV0ZWQoKSB7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vdG9kb1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE/OkZ1bmN0aW9ufE9ic2VydmVyLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gPEF1dG9EZXRhY2hPYnNlcnZlcj5hcmcxXG4gICAgICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmFkZENoaWxkKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIElubmVyU3Vic2NyaXB0aW9uLmNyZWF0ZSh0aGlzLCBvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzU3RhcnQgfHwgdGhpcy5vYnNlcnZlci5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMub25CZWZvcmVOZXh0KHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9uQWZ0ZXJOZXh0KHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIGlmKHRoaXMub25Jc0NvbXBsZXRlZCh2YWx1ZSkpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1N0YXJ0IHx8IHRoaXMub2JzZXJ2ZXIuaXNFbXB0eSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub25CZWZvcmVFcnJvcihlcnJvcik7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuXG4gICAgICAgICAgICB0aGlzLm9uQWZ0ZXJFcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNTdGFydCB8fCB0aGlzLm9ic2VydmVyLmlzRW1wdHkoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlQ29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuY29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgIHRoaXMub25BZnRlckNvbXBsZXRlZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRvU3RyZWFtKCl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3RyZWFtID0gbnVsbDtcblxuICAgICAgICAgICAgc3RyZWFtID0gQW5vbnltb3VzU3RyZWFtLmNyZWF0ZSgob2JzZXJ2ZXI6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLnN1YnNjcmliZShvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl9pc1N0YXJ0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5zZXREaXNwb3NhYmxlKFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdG9wKCl7XG4gICAgICAgICAgICB0aGlzLl9pc1N0YXJ0ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIucmVtb3ZlQ2hpbGQob2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBBbm9ueW1vdXNPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShvbk5leHQ6RnVuY3Rpb24sIG9uRXJyb3I6RnVuY3Rpb24sIG9uQ29tcGxldGVkOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlck5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBBdXRvRGV0YWNoT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob2JzZXJ2ZXI6SU9ic2VydmVyKTtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbik7XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYoYXJncy5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhhcmdzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgd2RDYi5Mb2cubG9nKFwib25seSBjYW4gZGlzcG9zZSBvbmNlXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZTphbnkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3I6YW55KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIE1hcE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZWxlY3Rvcih2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRG9PYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBwcmV2T2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3ByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlciA9IHByZXZPYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgLy90aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGltcG9ydCBMb2cgPSB3ZENiLkxvZztcblxuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzdHJlYW1Hcm91cCwgZ3JvdXBEaXNwb3NhYmxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgICAgICB0aGlzLl9ncm91cERpc3Bvc2FibGUgPSBncm91cERpc3Bvc2FibGU7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZG9uZTpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHB1YmxpYyBjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2dyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUgPSBudWxsO1xuXG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBhc3NlcnQoaW5uZXJTb3VyY2UgaW5zdGFuY2VvZiBTdHJlYW0gfHwgSnVkZ2VVdGlscy5pc1Byb21pc2UoaW5uZXJTb3VyY2UpLCBMb2cuaW5mby5GVU5DX01VU1RfQkUoXCJpbm5lclNvdXJjZVwiLCBcIlN0cmVhbSBvciBQcm9taXNlXCIpKTtcblxuICAgICAgICB9KVxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzUHJvbWlzZShpbm5lclNvdXJjZSkpe1xuICAgICAgICAgICAgICAgIGlubmVyU291cmNlID0gZnJvbVByb21pc2UoaW5uZXJTb3VyY2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cC5hZGRDaGlsZChpbm5lclNvdXJjZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dyb3VwRGlzcG9zYWJsZS5hZGQoaW5uZXJTb3VyY2UuYnVpbGRTdHJlYW0oSW5uZXJPYnNlcnZlci5jcmVhdGUodGhpcywgdGhpcy5fc3RyZWFtR3JvdXAsIGlubmVyU291cmNlKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsYXNzIElubmVyT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBjdXJyZW50U3RyZWFtOlN0cmVhbSkge1xuICAgICAgICBcdHZhciBvYmogPSBuZXcgdGhpcyhwYXJlbnQsIHN0cmVhbUdyb3VwLCBjdXJyZW50U3RyZWFtKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0cmVhbSA9IGN1cnJlbnRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3N0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudFN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB2YXIgY3VycmVudFN0cmVhbSA9IHRoaXMuX2N1cnJlbnRTdHJlYW0sXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5fcGFyZW50O1xuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cC5yZW1vdmVDaGlsZCgoc3RyZWFtOlN0cmVhbSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBKdWRnZVV0aWxzLmlzRXF1YWwoc3RyZWFtLCBjdXJyZW50U3RyZWFtKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAvL3RoaXMuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICAvKiFcbiAgICAgICAgICAgIGlmIHRoaXMgaW5uZXJTb3VyY2UgaXMgYXN5bmMgc3RyZWFtKGFzIHByb21pc2Ugc3RyZWFtKSxcbiAgICAgICAgICAgIGl0IHdpbGwgZmlyc3QgZXhlYyBhbGwgcGFyZW50Lm5leHQgYW5kIG9uZSBwYXJlbnQuY29tcGxldGVkLFxuICAgICAgICAgICAgdGhlbiBleGVjIGFsbCB0aGlzLm5leHQgYW5kIGFsbCB0aGlzLmNvbXBsZXRlZFxuICAgICAgICAgICAgc28gaW4gdGhpcyBjYXNlLCBpdCBzaG91bGQgaW52b2tlIHBhcmVudC5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkIGFmdGVyIHRoZSBsYXN0IGludm9rY2F0aW9uIG9mIHRoaXMuY29tcGxldGVkKGhhdmUgaW52b2tlZCBhbGwgdGhlIGlubmVyU291cmNlKVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmKHRoaXMuX2lzQXN5bmMoKSAmJiB0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNBc3luYygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudC5kb25lO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGltcG9ydCBMb2cgPSB3ZENiLkxvZztcblxuICAgIGV4cG9ydCBjbGFzcyBNZXJnZU9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIG1heENvbmN1cnJlbnQ6bnVtYmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgbWF4Q29uY3VycmVudCwgc3RyZWFtR3JvdXAsIGdyb3VwRGlzcG9zYWJsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBtYXhDb25jdXJyZW50Om51bWJlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGdyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fbWF4Q29uY3VycmVudCA9IG1heENvbmN1cnJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXBEaXNwb3NhYmxlID0gZ3JvdXBEaXNwb3NhYmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRvbmU6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwdWJsaWMgY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHB1YmxpYyBhY3RpdmVDb3VudDpudW1iZXIgPSAwO1xuICAgICAgICBwdWJsaWMgcTpBcnJheTxTdHJlYW0+ID0gW107XG5cbiAgICAgICAgcHJpdmF0ZSBfbWF4Q29uY3VycmVudDpudW1iZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9ncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBoYW5kbGVTdWJzY3JpYmUoaW5uZXJTb3VyY2U6YW55KXtcbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSl7XG4gICAgICAgICAgICAgICAgaW5uZXJTb3VyY2UgPSBmcm9tUHJvbWlzZShpbm5lclNvdXJjZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLmFkZENoaWxkKGlubmVyU291cmNlKTtcblxuICAgICAgICAgICAgdGhpcy5fZ3JvdXBEaXNwb3NhYmxlLmFkZChpbm5lclNvdXJjZS5idWlsZFN0cmVhbShJbm5lck9ic2VydmVyLmNyZWF0ZSh0aGlzLCB0aGlzLl9zdHJlYW1Hcm91cCwgaW5uZXJTb3VyY2UpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBAcmVxdWlyZShmdW5jdGlvbihpbm5lclNvdXJjZTphbnkpe1xuICAgICAgICAgICAgYXNzZXJ0KGlubmVyU291cmNlIGluc3RhbmNlb2YgU3RyZWFtIHx8IEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSwgTG9nLmluZm8uRlVOQ19NVVNUX0JFKFwiaW5uZXJTb3VyY2VcIiwgXCJTdHJlYW0gb3IgUHJvbWlzZVwiKSk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dChpbm5lclNvdXJjZTphbnkpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNSZWFjaE1heENvbmN1cnJlbnQoKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVDb3VudCArKztcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVN1YnNjcmliZShpbm5lclNvdXJjZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucS5wdXNoKGlubmVyU291cmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYodGhpcy5fc3RyZWFtR3JvdXAuZ2V0Q291bnQoKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1JlYWNoTWF4Q29uY3VycmVudCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlQ291bnQgPCB0aGlzLl9tYXhDb25jdXJyZW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xhc3MgSW5uZXJPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwYXJlbnQ6TWVyZ2VPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6TWVyZ2VPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0cmVhbSA9IGN1cnJlbnRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wYXJlbnQ6TWVyZ2VPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3N0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudFN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5fcGFyZW50O1xuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cC5yZW1vdmVDaGlsZCh0aGlzLl9jdXJyZW50U3RyZWFtKTtcblxuICAgICAgICAgICAgaWYgKHBhcmVudC5xLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQuYWN0aXZlQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIHBhcmVudC5oYW5kbGVTdWJzY3JpYmUocGFyZW50LnEuc2hpZnQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLl9pc0FzeW5jKCkgJiYgdGhpcy5fc3RyZWFtR3JvdXAuZ2V0Q291bnQoKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNBc3luYygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudC5kb25lO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBUYWtlVW50aWxPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMocHJldk9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3ByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlciA9IHByZXZPYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgQ29uY2F0T2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0YXJ0TmV4dFN0cmVhbTpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHJpdmF0ZSBjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJvdGVjdGVkIGN1cnJlbnRPYnNlcnZlcjphbnkgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdGFydE5leHRTdHJlYW06RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0YXJ0TmV4dFN0cmVhbTpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnROZXh0U3RyZWFtID0gc3RhcnROZXh0U3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICAvKiFcbiAgICAgICAgICAgIGlmIFwidGhpcy5jdXJyZW50T2JzZXJ2ZXIubmV4dFwiIGVycm9yLCBpdCB3aWxsIHBhc2UgdG8gdGhpcy5jdXJyZW50T2JzZXJ2ZXItPm9uRXJyb3IuXG4gICAgICAgICAgICBzbyBpdCBzaG91bGRuJ3QgaW52b2tlIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yIGhlcmUgYWdhaW4hXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIC8vdHJ5e1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgICAgIC8vY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIC8vfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIC8vdGhpcy5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydE5leHRTdHJlYW0oKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdE9ic2VydmVyIGltcGxlbWVudHMgSU9ic2VydmVye1xuICAgICAgICBwdWJsaWMgb2JzZXJ2ZXJzOndkQ2IuQ29sbGVjdGlvbjxJT2JzZXJ2ZXI+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJT2JzZXJ2ZXI+KCk7XG5cbiAgICAgICAgcHJpdmF0ZSBfZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIGlzRW1wdHkoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9ic2VydmVycy5nZXRDb3VudCgpID09PSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhZGRDaGlsZChvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUodGhpcy5fZGlzcG9zYWJsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMucmVtb3ZlQ2hpbGQoKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEp1ZGdlVXRpbHMuaXNFcXVhbChvYiwgb2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NhYmxlKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2JzZXJ2ZXI6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKGRpc3Bvc2FibGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2FibGUgPSBkaXNwb3NhYmxlO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBJZ25vcmVFbGVtZW50c09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4sIHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhwcmV2T2JzZXJ2ZXIsIHByZWRpY2F0ZSwgc291cmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZWRpY2F0ZToodmFsdWU6YW55KT0+Ym9vbGVhbiwgc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyID0gcHJldk9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5wcmVkaWNhdGUgPSBwcmVkaWNhdGU7XG4gICAgICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJvdGVjdGVkIHNvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgaTpudW1iZXIgPSAwO1xuICAgICAgICBwcm90ZWN0ZWQgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiA9IG51bGw7XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcmVkaWNhdGUodmFsdWUsIHRoaXMuaSsrLCB0aGlzLnNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyV2l0aFN0YXRlT2JzZXJ2ZXIgZXh0ZW5kcyBGaWx0ZXJPYnNlcnZlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4sIHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhwcmV2T2JzZXJ2ZXIsIHByZWRpY2F0ZSwgc291cmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzVHJpZ2dlcjpib29sZWFuID0gZmFsc2U7XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGRhdGE6e3ZhbHVlOmFueSwgc3RhdGU6RmlsdGVyU3RhdGV9ID0gbnVsbDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcmVkaWNhdGUodmFsdWUsIHRoaXMuaSsrLCB0aGlzLnNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIXRoaXMuX2lzVHJpZ2dlcil7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOkZpbHRlclN0YXRlLkVOVEVSXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOkZpbHRlclN0YXRlLlRSSUdHRVJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlci5uZXh0KGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzVHJpZ2dlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuX2lzVHJpZ2dlcil7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOkZpbHRlclN0YXRlLkxFQVZFXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlci5uZXh0KGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNUcmlnZ2VyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZVN0cmVhbSBleHRlbmRzIFN0cmVhbXtcbiAgICAgICAgcHVibGljIGFic3RyYWN0IHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKTpJRGlzcG9zYWJsZTtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE6RnVuY3Rpb258T2JzZXJ2ZXJ8U3ViamVjdCwgb25FcnJvcj8sIG9uQ29tcGxldGVkPyk6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICAgICAgaWYodGhpcy5oYW5kbGVTdWJqZWN0KGFyZzEpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxJT2JzZXJ2ZXI+YXJnMSlcbiAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgLy9vYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLmRpc3Bvc2VIYW5kbGVyKTtcblxuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICBzdXBlci5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN1YnNjcmliZUNvcmUob2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIF9oYXNNdWx0aU9ic2VydmVycygpe1xuICAgICAgICAvLyAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXIuZ2V0T2JzZXJ2ZXJzKCkgPiAxO1xuICAgICAgICAvL31cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRG9TdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgb25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBBbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oRG9PYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX29ic2VydmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTWFwU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIHNlbGVjdG9yKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zZWxlY3RvcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1hcE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fc2VsZWN0b3IpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbUFycmF5U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGFycmF5LCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYXJyYXk6QXJyYXk8YW55PiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnJheTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBhcnJheSA9IHRoaXMuX2FycmF5LFxuICAgICAgICAgICAgICAgIGxlbiA9IGFycmF5Lmxlbmd0aDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChhcnJheVtpXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzLmNhbGxlZShpICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyLCAwLCBsb29wUmVjdXJzaXZlKTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21Qcm9taXNlU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJvbWlzZTphbnksIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocHJvbWlzZSwgc2NoZWR1bGVyKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcm9taXNlOmFueSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJvbWlzZTphbnksIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fcHJvbWlzZS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChkYXRhKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSwgb2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbUV2ZW50UGF0dGVyblN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhhZGRIYW5kbGVyLCByZW1vdmVIYW5kbGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FkZEhhbmRsZXI6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9yZW1vdmVIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyID0gYWRkSGFuZGxlcjtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUhhbmRsZXIgPSByZW1vdmVIYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgZnVuY3Rpb24gaW5uZXJIYW5kbGVyKGV2ZW50KXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcihpbm5lckhhbmRsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuX3JlbW92ZUhhbmRsZXIoaW5uZXJIYW5kbGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEFub255bW91c1N0cmVhbSBleHRlbmRzIFN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc3Vic2NyaWJlRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHN1YnNjcmliZUZ1bmMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc3Vic2NyaWJlRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIoc3Vic2NyaWJlRnVuYyk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShzdWJqZWN0OlN1YmplY3QpOklEaXNwb3NhYmxlO1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9ic2VydmVyOklPYnNlcnZlcik6SURpc3Bvc2FibGU7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShvbk5leHQ6KHZhbHVlOmFueSk9PnZvaWQpOklEaXNwb3NhYmxlO1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9uTmV4dDoodmFsdWU6YW55KT0+dm9pZCwgb25FcnJvcjooZTphbnkpPT52b2lkKTpJRGlzcG9zYWJsZTtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZShvbk5leHQ6KHZhbHVlOmFueSk9PnZvaWQsIG9uRXJyb3I6KGU6YW55KT0+dm9pZCwgb25Db21wbGV0ZTooKT0+dm9pZCk6SURpc3Bvc2FibGU7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZSguLi5hcmdzKTpJRGlzcG9zYWJsZSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6QXV0b0RldGFjaE9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoYXJnc1swXSBpbnN0YW5jZW9mIFN1YmplY3Qpe1xuICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0OlN1YmplY3QgPSA8U3ViamVjdD5hcmdzWzBdO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTdWJqZWN0KHN1YmplY3QpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihKdWRnZVV0aWxzLmlzSU9ic2VydmVyKDxJT2JzZXJ2ZXI+YXJnc1swXSkpe1xuICAgICAgICAgICAgICAgIG9ic2VydmVyID0gQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8SU9ic2VydmVyPmFyZ3NbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgb25OZXh0OkZ1bmN0aW9uID0gPEZ1bmN0aW9uPmFyZ3NbMF0sXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3I6RnVuY3Rpb24gPSA8RnVuY3Rpb24+YXJnc1sxXSB8fCBudWxsLFxuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlZDpGdW5jdGlvbiA9IDxGdW5jdGlvbj5hcmdzWzJdIHx8IG51bGw7XG5cbiAgICAgICAgICAgICAgICBvYnNlcnZlciA9IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUodGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcikpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEludGVydmFsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaW50ZXJ2YWw6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoaW50ZXJ2YWwsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIG9iai5pbml0V2hlbkNyZWF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaW50ZXJ2YWw6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihpbnRlcnZhbDpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gaW50ZXJ2YWw7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbml0V2hlbkNyZWF0ZSgpe1xuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSB0aGlzLl9pbnRlcnZhbCA8PSAwID8gMSA6IHRoaXMuX2ludGVydmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlkID0gdGhpcy5zY2hlZHVsZXIucHVibGlzaEludGVydmFsKG9ic2VydmVyLCAwLCB0aGlzLl9pbnRlcnZhbCwgKGNvdW50KSA9PiB7XG4gICAgICAgICAgICAgICAgLy9zZWxmLnNjaGVkdWxlci5uZXh0KGNvdW50KTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGNvdW50KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudCArIDE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9EaXNwb3Nlci5hZGREaXNwb3NlSGFuZGxlcigoKSA9PiB7XG4gICAgICAgICAgICAvL30pO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QuY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc0VuZDpib29sZWFuID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0KG9ic2VydmVyLCAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodGltZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5faXNFbmQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2VsZi5zY2hlZHVsZXIucmVxdWVzdExvb3BJZCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNFbmQgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgaW1wb3J0IExvZyA9IHdkQ2IuTG9nO1xuXG4gICAgZXhwb3J0IGNsYXNzIFRpbWVvdXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBAcmVxdWlyZShmdW5jdGlvbih0aW1lOm51bWJlciwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBhc3NlcnQodGltZSA+IDAsIExvZy5pbmZvLkZVTkNfU0hPVUxEKFwidGltZVwiLCBcIj4gMFwiKSk7XG4gICAgICAgIH0pXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHRpbWU6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXModGltZSwgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3RpbWU6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih0aW1lOm51bWJlciwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgaWQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZCA9IHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hUaW1lb3V0KG9ic2VydmVyLCB0aGlzLl90aW1lLCAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodGltZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LmNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTWVyZ2VBbGxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIC8vdGhpcy5fb2JzZXJ2ZXIgPSBBbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHN0cmVhbUdyb3VwID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxTdHJlYW0+KCksXG4gICAgICAgICAgICAgICAgZ3JvdXBEaXNwb3NhYmxlID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1lcmdlQWxsT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCBzdHJlYW1Hcm91cCwgZ3JvdXBEaXNwb3NhYmxlKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBncm91cERpc3Bvc2FibGU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbSB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIG1heENvbmN1cnJlbnQ6bnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBtYXhDb25jdXJyZW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIG1heENvbmN1cnJlbnQ6bnVtYmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9tYXhDb25jdXJyZW50ID0gbWF4Q29uY3VycmVudDtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX21heENvbmN1cnJlbnQ6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgZ3JvdXBEaXNwb3NhYmxlID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1lcmdlT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLl9tYXhDb25jdXJyZW50LCBncm91cERpc3Bvc2FibGUpKTtcbiAgICAgICAgICAgIHZhciBzdHJlYW1Hcm91cCA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8U3RyZWFtPigpLFxuICAgICAgICAgICAgICAgIGdyb3VwRGlzcG9zYWJsZSA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1lcmdlT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLl9tYXhDb25jdXJyZW50LCBzdHJlYW1Hcm91cCwgZ3JvdXBEaXNwb3NhYmxlKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBncm91cERpc3Bvc2FibGU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFRha2VVbnRpbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIG90aGVyU3RlYW06U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBvdGhlclN0ZWFtKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vdGhlclN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIG90aGVyU3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fb3RoZXJTdHJlYW0gPSBKdWRnZVV0aWxzLmlzUHJvbWlzZShvdGhlclN0cmVhbSkgPyBmcm9tUHJvbWlzZShvdGhlclN0cmVhbSkgOiBvdGhlclN0cmVhbTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBncm91cCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKSxcbiAgICAgICAgICAgICAgICBhdXRvRGV0YWNoT2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyKSxcbiAgICAgICAgICAgICAgICBzb3VyY2VEaXNwb3NhYmxlID0gbnVsbDtcblxuICAgICAgICAgICAgc291cmNlRGlzcG9zYWJsZSA9IHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIGdyb3VwLmFkZChzb3VyY2VEaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgYXV0b0RldGFjaE9ic2VydmVyLnNldERpc3Bvc2FibGUoc291cmNlRGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIGdyb3VwLmFkZCh0aGlzLl9vdGhlclN0cmVhbS5idWlsZFN0cmVhbShUYWtlVW50aWxPYnNlcnZlci5jcmVhdGUoYXV0b0RldGFjaE9ic2VydmVyKSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIENvbmNhdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZXM6QXJyYXk8U3RyZWFtPikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlczp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8U3RyZWFtPigpO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZXM6QXJyYXk8U3RyZWFtPil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAvL3RvZG8gZG9uJ3Qgc2V0IHNjaGVkdWxlciBoZXJlP1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzb3VyY2VzWzBdLnNjaGVkdWxlcjtcblxuICAgICAgICAgICAgc291cmNlcy5mb3JFYWNoKChzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzUHJvbWlzZShzb3VyY2UpKXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc291cmNlcy5hZGRDaGlsZChmcm9tUHJvbWlzZShzb3VyY2UpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc291cmNlcy5hZGRDaGlsZChzb3VyY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb3VudCA9IHRoaXMuX3NvdXJjZXMuZ2V0Q291bnQoKSxcbiAgICAgICAgICAgICAgICBkID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGkpIHtcbiAgICAgICAgICAgICAgICBpZihpID09PSBjb3VudCl7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkLmFkZChzZWxmLl9zb3VyY2VzLmdldENoaWxkKGkpLmJ1aWxkU3RyZWFtKENvbmNhdE9ic2VydmVyLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLCAoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BSZWN1cnNpdmUoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlciwgMCwgbG9vcFJlY3Vyc2l2ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBHcm91cERpc3Bvc2FibGUuY3JlYXRlKGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFJlcGVhdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIGNvdW50Om51bWJlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgY291bnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2NvdW50Om51bWJlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgY291bnQ6bnVtYmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9jb3VudCA9IGNvdW50O1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG5cbiAgICAgICAgICAgIC8vdGhpcy5zdWJqZWN0R3JvdXAgPSB0aGlzLl9zb3VyY2Uuc3ViamVjdEdyb3VwO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGQgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvb3BSZWN1cnNpdmUoY291bnQpIHtcbiAgICAgICAgICAgICAgICBpZihjb3VudCA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkLmFkZChcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc291cmNlLmJ1aWxkU3RyZWFtKENvbmNhdE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFJlY3Vyc2l2ZShjb3VudCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIHRoaXMuX2NvdW50LCBsb29wUmVjdXJzaXZlKTtcblxuICAgICAgICAgICAgcmV0dXJuIEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oSWdub3JlRWxlbWVudHNPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRGVmZXJTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShidWlsZFN0cmVhbUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhidWlsZFN0cmVhbUZ1bmMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihidWlsZFN0cmVhbUZ1bmM6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2J1aWxkU3RyZWFtRnVuYyA9IGJ1aWxkU3RyZWFtRnVuYztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgIGdyb3VwLmFkZCh0aGlzLl9idWlsZFN0cmVhbUZ1bmMoKS5idWlsZFN0cmVhbShvYnNlcnZlcikpO1xuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEZpbHRlclN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4sIHRoaXNBcmc6YW55KSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBwcmVkaWNhdGUsIHRoaXNBcmcpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiwgdGhpc0FyZzphbnkpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMucHJlZGljYXRlID0gd2RDYi5GdW5jdGlvblV0aWxzLmJpbmQodGhpc0FyZywgcHJlZGljYXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5zdWJzY3JpYmUodGhpcy5jcmVhdGVPYnNlcnZlcihvYnNlcnZlcikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGludGVybmFsRmlsdGVyKHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4sIHRoaXNBcmc6YW55KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVN0cmVhbUZvckludGVybmFsRmlsdGVyKHRoaXMuX3NvdXJjZSwgdGhpcy5faW5uZXJQcmVkaWNhdGUocHJlZGljYXRlLCB0aGlzKSwgdGhpc0FyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlT2JzZXJ2ZXIob2JzZXJ2ZXI6SU9ic2VydmVyKTpPYnNlcnZlcntcbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMucHJlZGljYXRlLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVTdHJlYW1Gb3JJbnRlcm5hbEZpbHRlcihzb3VyY2U6U3RyZWFtLCBpbm5lclByZWRpY2F0ZTphbnksIHRoaXNBcmc6YW55KTpTdHJlYW17XG4gICAgICAgICAgICByZXR1cm4gRmlsdGVyU3RyZWFtLmNyZWF0ZShzb3VyY2UsIGlubmVyUHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lubmVyUHJlZGljYXRlKHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4sIHNlbGY6YW55KXtcbiAgICAgICAgICAgIHJldHVybiAodmFsdWUsIGksIG8pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5wcmVkaWNhdGUodmFsdWUsIGksIG8pICYmIHByZWRpY2F0ZS5jYWxsKHRoaXMsIHZhbHVlLCBpLCBvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJXaXRoU3RhdGVTdHJlYW0gZXh0ZW5kcyBGaWx0ZXJTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4sIHRoaXNBcmc6YW55KSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBwcmVkaWNhdGUsIHRoaXNBcmcpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZU9ic2VydmVyKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gRmlsdGVyV2l0aFN0YXRlT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLnByZWRpY2F0ZSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlU3RyZWFtRm9ySW50ZXJuYWxGaWx0ZXIoc291cmNlOlN0cmVhbSwgaW5uZXJQcmVkaWNhdGU6YW55LCB0aGlzQXJnOmFueSk6U3RyZWFte1xuICAgICAgICAgICAgcmV0dXJuIEZpbHRlcldpdGhTdGF0ZVN0cmVhbS5jcmVhdGUoc291cmNlLCBpbm5lclByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgdmFyIGNyZWF0ZVN0cmVhbSA9IChzdWJzY3JpYmVGdW5jKSA9PiB7XG4gICAgICAgIHJldHVybiBBbm9ueW1vdXNTdHJlYW0uY3JlYXRlKHN1YnNjcmliZUZ1bmMpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21BcnJheSA9IChhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+e1xuICAgICAgICByZXR1cm4gRnJvbUFycmF5U3RyZWFtLmNyZWF0ZShhcnJheSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tUHJvbWlzZSA9IChwcm9taXNlOmFueSwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PntcbiAgICAgICAgcmV0dXJuIEZyb21Qcm9taXNlU3RyZWFtLmNyZWF0ZShwcm9taXNlLCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21FdmVudFBhdHRlcm4gPSAoYWRkSGFuZGxlcjpGdW5jdGlvbiwgcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbikgPT57XG4gICAgICAgIHJldHVybiBGcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLmNyZWF0ZShhZGRIYW5kbGVyLCByZW1vdmVIYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBpbnRlcnZhbCA9IChpbnRlcnZhbCwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PiB7XG4gICAgICAgIHJldHVybiBJbnRlcnZhbFN0cmVhbS5jcmVhdGUoaW50ZXJ2YWwsIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgaW50ZXJ2YWxSZXF1ZXN0ID0gKHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT4ge1xuICAgICAgICByZXR1cm4gSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLmNyZWF0ZShzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIHRpbWVvdXQgPSAodGltZSwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PiB7XG4gICAgICAgIHJldHVybiBUaW1lb3V0U3RyZWFtLmNyZWF0ZSh0aW1lLCBzY2hlZHVsZXIpO1xuICAgIH07XG4gICAgZXhwb3J0IHZhciBlbXB0eSA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PntcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBjYWxsRnVuYyA9IChmdW5jOkZ1bmN0aW9uLCBjb250ZXh0ID0gcm9vdCkgPT4ge1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGZ1bmMuY2FsbChjb250ZXh0LCBudWxsKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGp1ZGdlID0gKGNvbmRpdGlvbjpGdW5jdGlvbiwgdGhlblNvdXJjZTpGdW5jdGlvbiwgZWxzZVNvdXJjZTpGdW5jdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gY29uZGl0aW9uKCkgPyB0aGVuU291cmNlKCkgOiBlbHNlU291cmNlKCk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZGVmZXIgPSAoYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiBEZWZlclN0cmVhbS5jcmVhdGUoYnVpbGRTdHJlYW1GdW5jKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBqdXN0ID0gKHJldHVyblZhbHVlOmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQocmV0dXJuVmFsdWUpO1xuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBlbnVtIEZpbHRlclN0YXRle1xuICAgICAgICBUUklHR0VSLFxuICAgICAgICBFTlRFUixcbiAgICAgICAgTEVBVkVcbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIHZhciBkZWZhdWx0SXNFcXVhbCA9IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBhID09PSBiO1xuICAgIH07XG5cbiAgICBleHBvcnQgY2xhc3MgUmVjb3JkIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUodGltZTpudW1iZXIsIHZhbHVlOmFueSwgYWN0aW9uVHlwZT86QWN0aW9uVHlwZSwgY29tcGFyZXI/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXModGltZSwgdmFsdWUsIGFjdGlvblR5cGUsIGNvbXBhcmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3RpbWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgZ2V0IHRpbWUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90aW1lO1xuICAgICAgICB9XG4gICAgICAgIHNldCB0aW1lKHRpbWU6bnVtYmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdmFsdWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgZ2V0IHZhbHVlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHZhbHVlKHZhbHVlOm51bWJlcil7XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYWN0aW9uVHlwZTpBY3Rpb25UeXBlID0gbnVsbDtcbiAgICAgICAgZ2V0IGFjdGlvblR5cGUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY3Rpb25UeXBlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBhY3Rpb25UeXBlKGFjdGlvblR5cGU6QWN0aW9uVHlwZSl7XG4gICAgICAgICAgICB0aGlzLl9hY3Rpb25UeXBlID0gYWN0aW9uVHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2NvbXBhcmVyOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih0aW1lLCB2YWx1ZSwgYWN0aW9uVHlwZTpBY3Rpb25UeXBlLCBjb21wYXJlcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fYWN0aW9uVHlwZSA9IGFjdGlvblR5cGU7XG4gICAgICAgICAgICB0aGlzLl9jb21wYXJlciA9IGNvbXBhcmVyIHx8IGRlZmF1bHRJc0VxdWFsO1xuICAgICAgICB9XG5cbiAgICAgICAgZXF1YWxzKG90aGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZSA9PT0gb3RoZXIudGltZSAmJiB0aGlzLl9jb21wYXJlcih0aGlzLl92YWx1ZSwgb3RoZXIudmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNb2NrT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSA8W1JlY29yZF0+W107XG4gICAgICAgIGdldCBtZXNzYWdlcygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICAgICAgICB9XG4gICAgICAgIHNldCBtZXNzYWdlcyhtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHZhciByZWNvcmQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzRGlyZWN0T2JqZWN0KHZhbHVlKSl7XG4gICAgICAgICAgICAgICAgcmVjb3JkID0gUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQsIChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSBpbiBhKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGEuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFbaV0gIT09IGJbaV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcmVjb3JkID0gUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKHJlY29yZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCBlcnJvciwgQWN0aW9uVHlwZS5FUlJPUikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCBudWxsLCBBY3Rpb25UeXBlLkNPTVBMRVRFRCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjbG9uZSgpe1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IE1vY2tPYnNlcnZlci5jcmVhdGUodGhpcy5fc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmVzdWx0Lm1lc3NhZ2VzID0gdGhpcy5fbWVzc2FnZXM7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1vY2tQcm9taXNle1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciwgbWVzc2FnZXM6W1JlY29yZF0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIsIG1lc3NhZ2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gPFtSZWNvcmRdPltdO1xuICAgICAgICAvL2dldCBtZXNzYWdlcygpe1xuICAgICAgICAvLyAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXM7XG4gICAgICAgIC8vfVxuICAgICAgICAvL3NldCBtZXNzYWdlcyhtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgIC8vICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIHByaXZhdGUgX3NjaGVkdWxlcjpUZXN0U2NoZWR1bGVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciwgbWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0aGVuKHN1Y2Nlc3NDYjpGdW5jdGlvbiwgZXJyb3JDYjpGdW5jdGlvbiwgb2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdmFyIHNjaGVkdWxlciA9IDxUZXN0U2NoZWR1bGVyPih0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIHRoaXMuX21lc3NhZ2VzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgY29uc3QgU1VCU0NSSUJFX1RJTUUgPSAyMDA7XG4gICAgY29uc3QgRElTUE9TRV9USU1FID0gMTAwMDtcblxuICAgIGV4cG9ydCBjbGFzcyBUZXN0U2NoZWR1bGVyIGV4dGVuZHMgU2NoZWR1bGVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBuZXh0KHRpY2ssIHZhbHVlKSB7XG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzRGlyZWN0T2JqZWN0KHZhbHVlKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgdmFsdWUsIEFjdGlvblR5cGUuTkVYVCwgKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpIGluIGEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYS5oYXNPd25Qcm9wZXJ0eShpKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYVtpXSAhPT0gYltpXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCB2YWx1ZSwgQWN0aW9uVHlwZS5ORVhUKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZXJyb3IodGljaywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIGVycm9yLCBBY3Rpb25UeXBlLkVSUk9SKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY29tcGxldGVkKHRpY2spIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIG51bGwsIEFjdGlvblR5cGUuQ09NUExFVEVEKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGlzUmVzZXQ6Ym9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoaXNSZXNldCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcihpc1Jlc2V0OmJvb2xlYW4pe1xuICAgICAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5faXNSZXNldCA9IGlzUmVzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jbG9jazpudW1iZXIgPSBudWxsO1xuICAgICAgICBnZXQgY2xvY2soKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBzZXQgY2xvY2soY2xvY2s6bnVtYmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9jbG9jayA9IGNsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNSZXNldDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwcml2YXRlIF90aW1lck1hcDp3ZENiLkhhc2g8RnVuY3Rpb24+ID0gd2RDYi5IYXNoLmNyZWF0ZTxGdW5jdGlvbj4oKTtcbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtTWFwOndkQ2IuSGFzaDxGdW5jdGlvbj4gPSB3ZENiLkhhc2guY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIF9zdWJzY3JpYmVkVGltZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9kaXNwb3NlZFRpbWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6TW9ja09ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBwdWJsaWMgc2V0U3RyZWFtTWFwKG9ic2VydmVyOklPYnNlcnZlciwgbWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBtZXNzYWdlcy5mb3JFYWNoKChyZWNvcmQ6UmVjb3JkKSA9PntcbiAgICAgICAgICAgICAgICB2YXIgZnVuYyA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHJlY29yZC5hY3Rpb25UeXBlKXtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBBY3Rpb25UeXBlLk5FWFQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gKCkgPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuRVJST1I6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gKCkgPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IocmVjb3JkLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBBY3Rpb25UeXBlLkNPTVBMRVRFRDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHdkQ2IuTG9nLmVycm9yKHRydWUsIHdkQ2IuTG9nLmluZm8uRlVOQ19VTktOT1coXCJhY3Rpb25UeXBlXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYuX3N0cmVhbU1hcC5hZGRDaGlsZChTdHJpbmcocmVjb3JkLnRpbWUpLCBmdW5jKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZShvYnNlcnZlcjpPYnNlcnZlcikge1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlcjpNb2NrT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCByZWN1cnNpdmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgLy9tZXNzYWdlcyA9IFtdLFxuICAgICAgICAgICAgICAgIG5leHQgPSBudWxsLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlZCA9IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIG5leHQgPSBvYnNlcnZlci5uZXh0O1xuICAgICAgICAgICAgY29tcGxldGVkID0gb2JzZXJ2ZXIuY29tcGxldGVkO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5uZXh0ID0gKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgbmV4dC5jYWxsKG9ic2VydmVyLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5fdGljaygxKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWQuY2FsbChvYnNlcnZlcik7XG4gICAgICAgICAgICAgICAgc2VsZi5fdGljaygxKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJlY3Vyc2l2ZUZ1bmMoaW5pdGlhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGludGVydmFsOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICAvL3Byb2R1Y2UgMTAgdmFsIGZvciB0ZXN0XG4gICAgICAgICAgICB2YXIgQ09VTlQgPSAxMCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlcyA9IFtdO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB3aGlsZSAoQ09VTlQgPiAwICYmICF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGljayhpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIGluaXRpYWwpKTtcblxuICAgICAgICAgICAgICAgIC8vbm8gbmVlZCB0byBpbnZva2UgYWN0aW9uXG4gICAgICAgICAgICAgICAgLy9hY3Rpb24oaW5pdGlhbCk7XG5cbiAgICAgICAgICAgICAgICBpbml0aWFsKys7XG4gICAgICAgICAgICAgICAgQ09VTlQtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG4gICAgICAgICAgICAvL3RoaXMuc2V0U3RyZWFtTWFwKHRoaXMuX29ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXI6SU9ic2VydmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIC8vcHJvZHVjZSAxMCB2YWwgZm9yIHRlc3RcbiAgICAgICAgICAgIHZhciBDT1VOVCA9IDEwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzID0gW10sXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSAxMDAsXG4gICAgICAgICAgICAgICAgbnVtID0gMDtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgd2hpbGUgKENPVU5UID4gMCAmJiAhdGhpcy5faXNEaXNwb3NlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RpY2soaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5uZXh0KHRoaXMuX2Nsb2NrLCBudW0pKTtcblxuICAgICAgICAgICAgICAgIG51bSsrO1xuICAgICAgICAgICAgICAgIENPVU5ULS07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuICAgICAgICAgICAgLy90aGlzLnNldFN0cmVhbU1hcCh0aGlzLl9vYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoVGltZW91dChvYnNlcnZlcjpJT2JzZXJ2ZXIsIHRpbWU6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIHZhciBtZXNzYWdlcyA9IFtdO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB0aGlzLl90aWNrKHRpbWUpO1xuXG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dCh0aGlzLl9jbG9jaywgdGltZSksIFRlc3RTY2hlZHVsZXIuY29tcGxldGVkKHRoaXMuX2Nsb2NrICsgMSkpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NldENsb2NrKCl7XG4gICAgICAgICAgICBpZih0aGlzLl9pc1Jlc2V0KXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9jayA9IHRoaXMuX3N1YnNjcmliZWRUaW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aFRpbWUoY3JlYXRlOkZ1bmN0aW9uLCBzdWJzY3JpYmVkVGltZTpudW1iZXIsIGRpc3Bvc2VkVGltZTpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IHRoaXMuY3JlYXRlT2JzZXJ2ZXIoKSxcbiAgICAgICAgICAgICAgICBzb3VyY2UsIHN1YnNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5fc3Vic2NyaWJlZFRpbWUgPSBzdWJzY3JpYmVkVGltZTtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VkVGltZSA9IGRpc3Bvc2VkVGltZTtcblxuICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSBzdWJzY3JpYmVkVGltZTtcblxuICAgICAgICAgICAgdGhpcy5fcnVuQXQoc3Vic2NyaWJlZFRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBjcmVhdGUoKTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24gPSBzb3VyY2Uuc3Vic2NyaWJlKG9ic2VydmVyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9ydW5BdChkaXNwb3NlZFRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2lzRGlzcG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyID0gb2JzZXJ2ZXI7XG5cbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aFN1YnNjcmliZShjcmVhdGUsIHN1YnNjcmliZWRUaW1lID0gU1VCU0NSSUJFX1RJTUUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0V2l0aFRpbWUoY3JlYXRlLCBzdWJzY3JpYmVkVGltZSwgRElTUE9TRV9USU1FKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydFdpdGhEaXNwb3NlKGNyZWF0ZSwgZGlzcG9zZWRUaW1lID0gRElTUE9TRV9USU1FKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydFdpdGhUaW1lKGNyZWF0ZSwgU1VCU0NSSUJFX1RJTUUsIGRpc3Bvc2VkVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGljQWJzb2x1dGUodGltZSwgaGFuZGxlcikge1xuICAgICAgICAgICAgdGhpcy5fcnVuQXQodGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0KCkge1xuICAgICAgICAgICAgdmFyIGV4dHJlbWVOdW1BcnIgPSB0aGlzLl9nZXRNaW5BbmRNYXhUaW1lKCksXG4gICAgICAgICAgICAgICAgbWluID0gZXh0cmVtZU51bUFyclswXSxcbiAgICAgICAgICAgICAgICBtYXggPSBleHRyZW1lTnVtQXJyWzFdLFxuICAgICAgICAgICAgICAgIHRpbWUgPSBtaW47XG5cbiAgICAgICAgICAgIC8vdG9kbyByZWR1Y2UgbG9vcCB0aW1lXG4gICAgICAgICAgICB3aGlsZSAodGltZSA8PSBtYXgpIHtcbiAgICAgICAgICAgICAgICAvL2lmKHRoaXMuX2lzRGlzcG9zZWQpe1xuICAgICAgICAgICAgICAgIC8vICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vfVxuXG4gICAgICAgICAgICAgICAgLy9iZWNhdXNlIFwiX2V4ZWMsX3J1blN0cmVhbVwiIG1heSBjaGFuZ2UgXCJfY2xvY2tcIixcbiAgICAgICAgICAgICAgICAvL3NvIGl0IHNob3VsZCByZXNldCB0aGUgX2Nsb2NrXG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9jayA9IHRpbWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9leGVjKHRpbWUsIHRoaXMuX3RpbWVyTWFwKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGltZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3J1blN0cmVhbSh0aW1lKTtcblxuICAgICAgICAgICAgICAgIHRpbWUrKztcblxuICAgICAgICAgICAgICAgIC8vdG9kbyBnZXQgbWF4IHRpbWUgb25seSBmcm9tIHN0cmVhbU1hcD9cbiAgICAgICAgICAgICAgICAvL25lZWQgcmVmcmVzaCBtYXggdGltZS5cbiAgICAgICAgICAgICAgICAvL2JlY2F1c2UgaWYgdGltZXJNYXAgaGFzIGNhbGxiYWNrIHRoYXQgY3JlYXRlIGluZmluaXRlIHN0cmVhbShhcyBpbnRlcnZhbCksXG4gICAgICAgICAgICAgICAgLy9pdCB3aWxsIHNldCBzdHJlYW1NYXAgc28gdGhhdCB0aGUgbWF4IHRpbWUgd2lsbCBjaGFuZ2VcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLl9nZXRNaW5BbmRNYXhUaW1lKClbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlU3RyZWFtKGFyZ3Mpe1xuICAgICAgICAgICAgcmV0dXJuIFRlc3RTdHJlYW0uY3JlYXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZU9ic2VydmVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1vY2tPYnNlcnZlci5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlUmVzb2x2ZWRQcm9taXNlKHRpbWU6bnVtYmVyLCB2YWx1ZTphbnkpe1xuICAgICAgICAgICAgcmV0dXJuIE1vY2tQcm9taXNlLmNyZWF0ZSh0aGlzLCBbVGVzdFNjaGVkdWxlci5uZXh0KHRpbWUsIHZhbHVlKSwgVGVzdFNjaGVkdWxlci5jb21wbGV0ZWQodGltZSsxKV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVJlamVjdFByb21pc2UodGltZTpudW1iZXIsIGVycm9yOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gTW9ja1Byb21pc2UuY3JlYXRlKHRoaXMsIFtUZXN0U2NoZWR1bGVyLmVycm9yKHRpbWUsIGVycm9yKV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZ2V0TWluQW5kTWF4VGltZSgpe1xuICAgICAgICAgICAgdmFyIHRpbWVBcnI6YW55ID0gKHRoaXMuX3RpbWVyTWFwLmdldEtleXMoKS5hZGRDaGlsZHJlbih0aGlzLl9zdHJlYW1NYXAuZ2V0S2V5cygpKSk7XG5cbiAgICAgICAgICAgICAgICB0aW1lQXJyID0gdGltZUFyci5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKGtleSk7XG4gICAgICAgICAgICAgICAgfSkudG9BcnJheSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gW01hdGgubWluLmFwcGx5KE1hdGgsIHRpbWVBcnIpLCBNYXRoLm1heC5hcHBseShNYXRoLCB0aW1lQXJyKV07XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9leGVjKHRpbWUsIG1hcCl7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IG1hcC5nZXRDaGlsZChTdHJpbmcodGltZSkpO1xuXG4gICAgICAgICAgICBpZihoYW5kbGVyKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9ydW5TdHJlYW0odGltZSl7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXMuX3N0cmVhbU1hcC5nZXRDaGlsZChTdHJpbmcodGltZSkpO1xuXG4gICAgICAgICAgICBpZihoYW5kbGVyKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9ydW5BdCh0aW1lOm51bWJlciwgY2FsbGJhY2s6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVyTWFwLmFkZENoaWxkKFN0cmluZyh0aW1lKSwgY2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdGljayh0aW1lOm51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5fY2xvY2sgKz0gdGltZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBlbnVtIEFjdGlvblR5cGV7XG4gICAgICAgIE5FWFQsXG4gICAgICAgIEVSUk9SLFxuICAgICAgICBDT01QTEVURURcbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBUZXN0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbSB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG1lc3NhZ2VzOltSZWNvcmRdLCBzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKG1lc3NhZ2VzLCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2VzOltSZWNvcmRdLCBzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICAvL3ZhciBzY2hlZHVsZXIgPSA8VGVzdFNjaGVkdWxlcj4odGhpcy5zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIHRoaXMuX21lc3NhZ2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=