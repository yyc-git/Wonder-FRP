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
            return _super !== null && _super.apply(this, arguments) || this;
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
                funcArgs[_i] = arguments[_i];
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
        return Entity;
    }());
    Entity.UID = 1;
    wdFrp.Entity = Entity;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var Main = (function () {
        function Main() {
        }
        return Main;
    }());
    Main.isTest = false;
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
                    args[_i] = arguments[_i];
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
                    args[_i] = arguments[_i];
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
            var _this = _super.call(this, "SingleDisposable") || this;
            _this._disposeHandler = null;
            _this._isDisposed = false;
            _this._disposeHandler = disposeHandler;
            return _this;
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
            if (this._isDisposed) {
                return;
            }
            this._isDisposed = true;
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
            var _this = _super.call(this, "GroupDisposable") || this;
            _this._group = wdCb.Collection.create();
            _this._isDisposed = false;
            if (disposable) {
                _this._group.addChild(disposable);
            }
            return _this;
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
            if (this._isDisposed) {
                return;
            }
            this._isDisposed = true;
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
    if (wdFrp.JudgeUtils.isNodeJs() && typeof global != "undefined") {
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
            var _this = _super.call(this, "Stream") || this;
            _this.scheduler = null;
            _this.subscribeFunc = null;
            _this.subscribeFunc = subscribeFunc || function () { };
            return _this;
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
        Stream.prototype.skipUntil = function (otherStream) {
            return wdFrp.SkipUntilStream.create(this, otherStream);
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
                args[_i] = arguments[_i];
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
        return Stream;
    }(wdFrp.Entity));
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
                args[_i] = arguments[_i];
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
                args[_i] = arguments[_i];
            }
            var _this = _super.call(this, "Observer") || this;
            _this._isDisposed = null;
            _this.onUserNext = null;
            _this.onUserError = null;
            _this.onUserCompleted = null;
            _this._isStop = false;
            _this._disposable = null;
            if (args.length === 1) {
                var observer_1 = args[0];
                _this.onUserNext = function (v) {
                    observer_1.next(v);
                };
                _this.onUserError = function (e) {
                    observer_1.error(e);
                };
                _this.onUserCompleted = function () {
                    observer_1.completed();
                };
            }
            else {
                var onNext = args[0], onError = args[1], onCompleted = args[2];
                _this.onUserNext = onNext || function (v) { };
                _this.onUserError = onError || function (e) {
                    throw e;
                };
                _this.onUserCompleted = onCompleted || function () { };
            }
            return _this;
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
            var _this = _super.call(this, "GeneratorSubject") || this;
            _this._isStart = false;
            _this.observer = new wdFrp.SubjectObserver();
            return _this;
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
            return _super !== null && _super.apply(this, arguments) || this;
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
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AutoDetachObserver.create = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
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
        return AutoDetachObserver;
    }(wdFrp.Observer));
    __decorate([
        wdFrp.require(function () {
            if (this.isDisposed) {
                wdCb.Log.warn("only can dispose once");
            }
        })
    ], AutoDetachObserver.prototype, "dispose", null);
    wdFrp.AutoDetachObserver = AutoDetachObserver;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var MapObserver = (function (_super) {
        __extends(MapObserver, _super);
        function MapObserver(currentObserver, selector) {
            var _this = _super.call(this, null, null, null) || this;
            _this._currentObserver = null;
            _this._selector = null;
            _this._currentObserver = currentObserver;
            _this._selector = selector;
            return _this;
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
            var _this = _super.call(this, null, null, null) || this;
            _this._currentObserver = null;
            _this._prevObserver = null;
            _this._currentObserver = currentObserver;
            _this._prevObserver = prevObserver;
            return _this;
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
            var _this = _super.call(this, null, null, null) || this;
            _this.done = false;
            _this.currentObserver = null;
            _this._streamGroup = null;
            _this._groupDisposable = null;
            _this.currentObserver = currentObserver;
            _this._streamGroup = streamGroup;
            _this._groupDisposable = groupDisposable;
            return _this;
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
        return MergeAllObserver;
    }(wdFrp.Observer));
    __decorate([
        wdFrp.require(function (innerSource) {
            wdFrp.assert(innerSource instanceof wdFrp.Stream || wdFrp.JudgeUtils.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));
        })
    ], MergeAllObserver.prototype, "onNext", null);
    wdFrp.MergeAllObserver = MergeAllObserver;
    var InnerObserver = (function (_super) {
        __extends(InnerObserver, _super);
        function InnerObserver(parent, streamGroup, currentStream) {
            var _this = _super.call(this, null, null, null) || this;
            _this._parent = null;
            _this._streamGroup = null;
            _this._currentStream = null;
            _this._parent = parent;
            _this._streamGroup = streamGroup;
            _this._currentStream = currentStream;
            return _this;
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
            var _this = _super.call(this, null, null, null) || this;
            _this.done = false;
            _this.currentObserver = null;
            _this.activeCount = 0;
            _this.q = [];
            _this._maxConcurrent = null;
            _this._groupDisposable = null;
            _this._streamGroup = null;
            _this.currentObserver = currentObserver;
            _this._maxConcurrent = maxConcurrent;
            _this._streamGroup = streamGroup;
            _this._groupDisposable = groupDisposable;
            return _this;
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
        return MergeObserver;
    }(wdFrp.Observer));
    __decorate([
        wdFrp.require(function (innerSource) {
            wdFrp.assert(innerSource instanceof wdFrp.Stream || wdFrp.JudgeUtils.isPromise(innerSource), Log.info.FUNC_MUST_BE("innerSource", "Stream or Promise"));
        })
    ], MergeObserver.prototype, "onNext", null);
    wdFrp.MergeObserver = MergeObserver;
    var InnerObserver = (function (_super) {
        __extends(InnerObserver, _super);
        function InnerObserver(parent, streamGroup, currentStream) {
            var _this = _super.call(this, null, null, null) || this;
            _this._parent = null;
            _this._streamGroup = null;
            _this._currentStream = null;
            _this._parent = parent;
            _this._streamGroup = streamGroup;
            _this._currentStream = currentStream;
            return _this;
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
            var _this = _super.call(this, null, null, null) || this;
            _this._prevObserver = null;
            _this._prevObserver = prevObserver;
            return _this;
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
    var SkipUntilSourceObserver = (function (_super) {
        __extends(SkipUntilSourceObserver, _super);
        function SkipUntilSourceObserver(prevObserver, skipUntilStream) {
            var _this = _super.call(this, null, null, null) || this;
            _this._prevObserver = null;
            _this._skipUntilStream = null;
            _this._prevObserver = prevObserver;
            _this._skipUntilStream = skipUntilStream;
            return _this;
        }
        SkipUntilSourceObserver.create = function (prevObserver, skipUntilStream) {
            return new this(prevObserver, skipUntilStream);
        };
        SkipUntilSourceObserver.prototype.onNext = function (value) {
            if (this._skipUntilStream.isOpen) {
                this._prevObserver.next(value);
            }
        };
        SkipUntilSourceObserver.prototype.onError = function (error) {
            this._prevObserver.error(error);
        };
        SkipUntilSourceObserver.prototype.onCompleted = function () {
            if (this._skipUntilStream.isOpen) {
                this._prevObserver.completed();
            }
        };
        return SkipUntilSourceObserver;
    }(wdFrp.Observer));
    wdFrp.SkipUntilSourceObserver = SkipUntilSourceObserver;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var SkipUntilOtherObserver = (function (_super) {
        __extends(SkipUntilOtherObserver, _super);
        function SkipUntilOtherObserver(prevObserver, skipUntilStream) {
            var _this = _super.call(this, null, null, null) || this;
            _this.otherDisposable = null;
            _this._prevObserver = null;
            _this._skipUntilStream = null;
            _this._prevObserver = prevObserver;
            _this._skipUntilStream = skipUntilStream;
            return _this;
        }
        SkipUntilOtherObserver.create = function (prevObserver, skipUntilStream) {
            return new this(prevObserver, skipUntilStream);
        };
        SkipUntilOtherObserver.prototype.onNext = function (value) {
            this._skipUntilStream.isOpen = true;
            this.otherDisposable.dispose();
        };
        SkipUntilOtherObserver.prototype.onError = function (error) {
            this._prevObserver.error(error);
        };
        SkipUntilOtherObserver.prototype.onCompleted = function () {
            this.otherDisposable.dispose();
        };
        return SkipUntilOtherObserver;
    }(wdFrp.Observer));
    wdFrp.SkipUntilOtherObserver = SkipUntilOtherObserver;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var ConcatObserver = (function (_super) {
        __extends(ConcatObserver, _super);
        function ConcatObserver(currentObserver, startNextStream) {
            var _this = _super.call(this, null, null, null) || this;
            _this.currentObserver = null;
            _this._startNextStream = null;
            _this.currentObserver = currentObserver;
            _this._startNextStream = startNextStream;
            return _this;
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
            var _this = _super.call(this, null, null, null) || this;
            _this._currentObserver = null;
            _this._currentObserver = currentObserver;
            return _this;
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
            var _this = _super.call(this, null, null, null) || this;
            _this.prevObserver = null;
            _this.source = null;
            _this.i = 0;
            _this.predicate = null;
            _this.prevObserver = prevObserver;
            _this.predicate = predicate;
            _this.source = source;
            return _this;
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
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._isTrigger = false;
            return _this;
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
            return _super !== null && _super.apply(this, arguments) || this;
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
            var _this = _super.call(this, null) || this;
            _this._source = null;
            _this._observer = null;
            _this._source = source;
            _this._observer = wdFrp.AnonymousObserver.create(onNext, onError, onCompleted);
            _this.scheduler = _this._source.scheduler;
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this._source = null;
            _this._selector = null;
            _this._source = source;
            _this.scheduler = _this._source.scheduler;
            _this._selector = selector;
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this._array = null;
            _this._array = array;
            _this.scheduler = scheduler;
            return _this;
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
                    loopRecursive(i + 1);
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
            var _this = _super.call(this, null) || this;
            _this._promise = null;
            _this._promise = promise;
            _this.scheduler = scheduler;
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this._addHandler = null;
            _this._removeHandler = null;
            _this._addHandler = addHandler;
            _this._removeHandler = removeHandler;
            return _this;
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
            var _this = _super.call(this, subscribeFunc) || this;
            _this.scheduler = wdFrp.Scheduler.create();
            return _this;
        }
        AnonymousStream.create = function (subscribeFunc) {
            var obj = new this(subscribeFunc);
            return obj;
        };
        AnonymousStream.prototype.subscribe = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
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
            var _this = _super.call(this, null) || this;
            _this._interval = null;
            _this._interval = interval;
            _this.scheduler = scheduler;
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this._isEnd = false;
            _this.scheduler = scheduler;
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this._time = null;
            _this._time = time;
            _this.scheduler = scheduler;
            return _this;
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
        return TimeoutStream;
    }(wdFrp.BaseStream));
    __decorate([
        wdFrp.require(function (time, scheduler) {
            wdFrp.assert(time > 0, Log.info.FUNC_SHOULD("time", "> 0"));
        })
    ], TimeoutStream, "create", null);
    wdFrp.TimeoutStream = TimeoutStream;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var MergeAllStream = (function (_super) {
        __extends(MergeAllStream, _super);
        function MergeAllStream(source) {
            var _this = _super.call(this, null) || this;
            _this._source = null;
            _this._observer = null;
            _this._source = source;
            _this.scheduler = _this._source.scheduler;
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this._source = null;
            _this._maxConcurrent = null;
            _this._source = source;
            _this._maxConcurrent = maxConcurrent;
            _this.scheduler = _this._source.scheduler;
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this._source = null;
            _this._otherStream = null;
            _this._source = source;
            _this._otherStream = wdFrp.JudgeUtils.isPromise(otherStream) ? wdFrp.fromPromise(otherStream) : otherStream;
            _this.scheduler = _this._source.scheduler;
            return _this;
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
    var SkipUntilStream = (function (_super) {
        __extends(SkipUntilStream, _super);
        function SkipUntilStream(source, otherStream) {
            var _this = _super.call(this, null) || this;
            _this.isOpen = false;
            _this._source = null;
            _this._otherStream = null;
            _this._source = source;
            _this._otherStream = wdFrp.JudgeUtils.isPromise(otherStream) ? wdFrp.fromPromise(otherStream) : otherStream;
            _this.scheduler = _this._source.scheduler;
            return _this;
        }
        SkipUntilStream.create = function (source, otherSteam) {
            var obj = new this(source, otherSteam);
            return obj;
        };
        SkipUntilStream.prototype.subscribeCore = function (observer) {
            var group = wdFrp.GroupDisposable.create(), otherDisposable = null, skipUntilOtherObserver = null;
            group.add(this._source.buildStream(wdFrp.SkipUntilSourceObserver.create(observer, this)));
            skipUntilOtherObserver = wdFrp.SkipUntilOtherObserver.create(observer, this);
            otherDisposable = this._otherStream.buildStream(skipUntilOtherObserver);
            skipUntilOtherObserver.otherDisposable = otherDisposable;
            group.add(otherDisposable);
            return group;
        };
        return SkipUntilStream;
    }(wdFrp.BaseStream));
    wdFrp.SkipUntilStream = SkipUntilStream;
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var ConcatStream = (function (_super) {
        __extends(ConcatStream, _super);
        function ConcatStream(sources) {
            var _this = _super.call(this, null) || this;
            _this._sources = wdCb.Collection.create();
            var self = _this;
            _this.scheduler = sources[0].scheduler;
            sources.forEach(function (source) {
                if (wdFrp.JudgeUtils.isPromise(source)) {
                    self._sources.addChild(wdFrp.fromPromise(source));
                }
                else {
                    self._sources.addChild(source);
                }
            });
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this._source = null;
            _this._count = null;
            _this._source = source;
            _this._count = count;
            _this.scheduler = _this._source.scheduler;
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this._source = null;
            _this._source = source;
            _this.scheduler = _this._source.scheduler;
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this._buildStreamFunc = null;
            _this._buildStreamFunc = buildStreamFunc;
            return _this;
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
            var _this = _super.call(this, null) || this;
            _this.predicate = null;
            _this._source = null;
            _this._source = source;
            _this.predicate = wdCb.FunctionUtils.bind(thisArg, predicate);
            return _this;
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
            return _super !== null && _super.apply(this, arguments) || this;
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
    var FilterState;
    (function (FilterState) {
        FilterState[FilterState["TRIGGER"] = 0] = "TRIGGER";
        FilterState[FilterState["ENTER"] = 1] = "ENTER";
        FilterState[FilterState["LEAVE"] = 2] = "LEAVE";
    })(FilterState = wdFrp.FilterState || (wdFrp.FilterState = {}));
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
            var _this = _super.call(this, null, null, null) || this;
            _this._messages = [];
            _this._scheduler = null;
            _this._scheduler = scheduler;
            return _this;
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
            var _this = _super.call(this) || this;
            _this._clock = null;
            _this._isReset = false;
            _this._isDisposed = false;
            _this._timerMap = wdCb.Hash.create();
            _this._streamMap = wdCb.Hash.create();
            _this._subscribedTime = null;
            _this._disposedTime = null;
            _this._observer = null;
            _this._isReset = isReset;
            return _this;
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
    var ActionType;
    (function (ActionType) {
        ActionType[ActionType["NEXT"] = 0] = "NEXT";
        ActionType[ActionType["ERROR"] = 1] = "ERROR";
        ActionType[ActionType["COMPLETED"] = 2] = "COMPLETED";
    })(ActionType = wdFrp.ActionType || (wdFrp.ActionType = {}));
})(wdFrp || (wdFrp = {}));
var wdFrp;
(function (wdFrp) {
    var TestStream = (function (_super) {
        __extends(TestStream, _super);
        function TestStream(messages, scheduler) {
            var _this = _super.call(this, null) || this;
            _this.scheduler = null;
            _this._messages = null;
            _this._messages = messages;
            _this.scheduler = scheduler;
            return _this;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9KdWRnZVV0aWxzLnRzIiwic3JjL2JpbmRpbmcvbm9kZWpzL05vZGVPcGVyYXRvci50cyIsInNyYy9jb3JlL0VudGl0eS50cyIsInNyYy9jb3JlL01haW4udHMiLCJzcmMvZGVmaW5pdGlvbi90eXBlc2NyaXB0L2RlY29yYXRvci9jb250cmFjdC50cyIsInNyYy9kaXNwb3NhYmxlL1NpbmdsZURpc3Bvc2FibGUudHMiLCJzcmMvZGlzcG9zYWJsZS9Hcm91cERpc3Bvc2FibGUudHMiLCJzcmMvZGlzcG9zYWJsZS9Jbm5lclN1YnNjcmlwdGlvbi50cyIsInNyYy9kaXNwb3NhYmxlL0lubmVyU3Vic2NyaXB0aW9uR3JvdXAudHMiLCJzcmMvZ2xvYmFsL1ZhcmlhYmxlLnRzIiwic3JjL2dsb2JhbC9pbml0LnRzIiwic3JjL2V4dGVuZC9yb290LnRzIiwic3JjL2NvcmUvU3RyZWFtLnRzIiwic3JjL2NvcmUvU2NoZWR1bGVyLnRzIiwic3JjL2NvcmUvT2JzZXJ2ZXIudHMiLCJzcmMvc3ViamVjdC9TdWJqZWN0LnRzIiwic3JjL3N1YmplY3QvR2VuZXJhdG9yU3ViamVjdC50cyIsInNyYy9vYnNlcnZlci9Bbm9ueW1vdXNPYnNlcnZlci50cyIsInNyYy9vYnNlcnZlci9BdXRvRGV0YWNoT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvTWFwT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvRG9PYnNlcnZlci50cyIsInNyYy9vYnNlcnZlci9NZXJnZUFsbE9ic2VydmVyLnRzIiwic3JjL29ic2VydmVyL01lcmdlT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvVGFrZVVudGlsT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvU2tpcFVudGlsU291cmNlT2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvU2tpcFVudGlsT3RoZXJPYnNlcnZlci50cyIsInNyYy9vYnNlcnZlci9Db25jYXRPYnNlcnZlci50cyIsInNyYy9vYnNlcnZlci9TdWJqZWN0T2JzZXJ2ZXIudHMiLCJzcmMvb2JzZXJ2ZXIvSWdub3JlRWxlbWVudHNPYnNlcnZlci50cyIsInNyYy9vYnNlcnZlci9GaWx0ZXJPYnNlcnZlci50cyIsInNyYy9vYnNlcnZlci9GaWx0ZXJXaXRoU3RhdGVPYnNlcnZlci50cyIsInNyYy9zdHJlYW0vQmFzZVN0cmVhbS50cyIsInNyYy9zdHJlYW0vRG9TdHJlYW0udHMiLCJzcmMvc3RyZWFtL01hcFN0cmVhbS50cyIsInNyYy9zdHJlYW0vRnJvbUFycmF5U3RyZWFtLnRzIiwic3JjL3N0cmVhbS9Gcm9tUHJvbWlzZVN0cmVhbS50cyIsInNyYy9zdHJlYW0vRnJvbUV2ZW50UGF0dGVyblN0cmVhbS50cyIsInNyYy9zdHJlYW0vQW5vbnltb3VzU3RyZWFtLnRzIiwic3JjL3N0cmVhbS9JbnRlcnZhbFN0cmVhbS50cyIsInNyYy9zdHJlYW0vSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtLnRzIiwic3JjL3N0cmVhbS9UaW1lb3V0U3RyZWFtLnRzIiwic3JjL3N0cmVhbS9NZXJnZUFsbFN0cmVhbS50cyIsInNyYy9zdHJlYW0vTWVyZ2VTdHJlYW0udHMiLCJzcmMvc3RyZWFtL1Rha2VVbnRpbFN0cmVhbS50cyIsInNyYy9zdHJlYW0vU2tpcFVudGlsU3RyZWFtLnRzIiwic3JjL3N0cmVhbS9Db25jYXRTdHJlYW0udHMiLCJzcmMvc3RyZWFtL1JlcGVhdFN0cmVhbS50cyIsInNyYy9zdHJlYW0vSWdub3JlRWxlbWVudHNTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0RlZmVyU3RyZWFtLnRzIiwic3JjL3N0cmVhbS9GaWx0ZXJTdHJlYW0udHMiLCJzcmMvc3RyZWFtL0ZpbHRlcldpdGhTdGF0ZVN0cmVhbS50cyIsInNyYy9nbG9iYWwvT3BlcmF0b3IudHMiLCJzcmMvZW51bS9GaWx0ZXJTdGF0ZS50cyIsInNyYy90ZXN0aW5nL1JlY29yZC50cyIsInNyYy90ZXN0aW5nL01vY2tPYnNlcnZlci50cyIsInNyYy90ZXN0aW5nL01vY2tQcm9taXNlLnRzIiwic3JjL3Rlc3RpbmcvVGVzdFNjaGVkdWxlci50cyIsInNyYy90ZXN0aW5nL0FjdGlvblR5cGUudHMiLCJzcmMvdGVzdGluZy9UZXN0U3RyZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsSUFBTyxLQUFLLENBZ0JYO0FBaEJELFdBQU8sS0FBSztJQUNSO1FBQWdDLDhCQUFlO1FBQS9DOztRQWNBLENBQUM7UUFiaUIsb0JBQVMsR0FBdkIsVUFBd0IsR0FBRztZQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUc7bUJBQ0wsQ0FBQyxPQUFNLFVBQVUsWUFBQyxHQUFHLENBQUMsU0FBUyxDQUFDO21CQUNoQyxPQUFNLFVBQVUsWUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVhLGtCQUFPLEdBQXJCLFVBQXNCLEdBQVUsRUFBRSxHQUFVO1lBQ3hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDL0IsQ0FBQztRQUVhLHNCQUFXLEdBQXpCLFVBQTBCLENBQVc7WUFDakMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzVDLENBQUM7UUFDTCxpQkFBQztJQUFELENBZEEsQUFjQyxDQWQrQixJQUFJLENBQUMsVUFBVSxHQWM5QztJQWRZLGdCQUFVLGFBY3RCLENBQUE7QUFDTCxDQUFDLEVBaEJNLEtBQUssS0FBTCxLQUFLLFFBZ0JYO0FDaEJELElBQU8sS0FBSyxDQTBFWDtBQTFFRCxXQUFPLEtBQUs7SUFDRyxzQkFBZ0IsR0FBRyxVQUFDLElBQWEsRUFBRSxPQUFZO1FBQ3RELE1BQU0sQ0FBQztZQUFDLGtCQUFXO2lCQUFYLFVBQVcsRUFBWCxxQkFBVyxFQUFYLElBQVc7Z0JBQVgsNkJBQVc7O1lBQ2YsTUFBTSxDQUFDLE1BQUEsWUFBWSxDQUFDLFVBQUMsUUFBa0I7Z0JBQ25DLElBQUksTUFBTSxHQUFHLFVBQUMsR0FBRztvQkFBRSxjQUFP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eEJZLGdCQUFVLGFBd0J0QixDQUFBO0FBQ0wsQ0FBQyxFQTFCTSxLQUFLLEtBQUwsS0FBSyxRQTBCWCIsImZpbGUiOiJ3ZEZycC5kZWJ1Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIEp1ZGdlVXRpbHMgZXh0ZW5kcyB3ZENiLkp1ZGdlVXRpbHMge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGlzUHJvbWlzZShvYmope1xuICAgICAgICAgICAgcmV0dXJuICEhb2JqXG4gICAgICAgICAgICAgICAgJiYgIXN1cGVyLmlzRnVuY3Rpb24ob2JqLnN1YnNjcmliZSlcbiAgICAgICAgICAgICAgICAmJiBzdXBlci5pc0Z1bmN0aW9uKG9iai50aGVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNFcXVhbChvYjE6RW50aXR5LCBvYjI6RW50aXR5KXtcbiAgICAgICAgICAgIHJldHVybiBvYjEudWlkID09PSBvYjIudWlkO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBpc0lPYnNlcnZlcihpOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gaS5uZXh0ICYmIGkuZXJyb3IgJiYgaS5jb21wbGV0ZWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCB2YXIgZnJvbU5vZGVDYWxsYmFjayA9IChmdW5jOkZ1bmN0aW9uLCBjb250ZXh0PzphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuICguLi5mdW5jQXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGhhbmRlciA9IChlcnIsIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0LmFwcGx5KG9ic2VydmVyLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZnVuY0FyZ3MucHVzaChoYW5kZXIpO1xuICAgICAgICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgZnVuY0FyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyohXG4gICAgLy90b2RvIGhhcyBidWchIG5lZWQgZml4XG4gICAgcmVmZXIgdG8gcngtbm9kZToobmVlZCBhZGQgLnB1Ymxpc2goKSwgLnJlZkNvdW50KCkgbWV0aG9kcyEpXG4gICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9SZWFjdGl2ZS1FeHRlbnNpb25zL3J4LW5vZGUvYmxvYi9tYXN0ZXIvaW5kZXguanNcbiAgICAgKi9cbiAgICBleHBvcnQgdmFyIGZyb21TdHJlYW0gPSAoc3RyZWFtOmFueSwgZmluaXNoRXZlbnROYW1lOnN0cmluZyA9IFwiZW5kXCIpID0+IHtcbiAgICAgICAgaWYoc3RyZWFtLnBhdXNlKXtcbiAgICAgICAgICAgIHN0cmVhbS5wYXVzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdkRnJwLmNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIHZhciBkYXRhSGFuZGxlciA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvckhhbmRsZXIgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbmRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdHJlYW0uYWRkTGlzdGVuZXIoXCJkYXRhXCIsIGRhdGFIYW5kbGVyKTtcbiAgICAgICAgICAgIHN0cmVhbS5hZGRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICBzdHJlYW0uYWRkTGlzdGVuZXIoZmluaXNoRXZlbnROYW1lLCBlbmRIYW5kbGVyKTtcblxuICAgICAgICAgICAgaWYoc3RyZWFtLnJlc3VtZSl7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlc3VtZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcihcImRhdGFcIiwgZGF0YUhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcihcImVycm9yXCIsIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlbW92ZUxpc3RlbmVyKGZpbmlzaEV2ZW50TmFtZSwgZW5kSGFuZGxlcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tUmVhZGFibGVTdHJlYW0gPSAoc3RyZWFtOmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gZnJvbVN0cmVhbShzdHJlYW0sIFwiZW5kXCIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21Xcml0YWJsZVN0cmVhbSA9IChzdHJlYW06YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyZWFtKHN0cmVhbSwgXCJmaW5pc2hcIik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVRyYW5zZm9ybVN0cmVhbSA9IChzdHJlYW06YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyZWFtKHN0cmVhbSwgXCJmaW5pc2hcIik7XG4gICAgfTtcbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbnRpdHl7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVUlEOm51bWJlciA9IDE7XG5cbiAgICAgICAgcHJpdmF0ZSBfdWlkOnN0cmluZyA9IG51bGw7XG4gICAgICAgIGdldCB1aWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl91aWQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHVpZCh1aWQ6c3RyaW5nKXtcbiAgICAgICAgICAgIHRoaXMuX3VpZCA9IHVpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHVpZFByZTpzdHJpbmcpe1xuICAgICAgICAgICAgdGhpcy5fdWlkID0gdWlkUHJlICsgU3RyaW5nKEVudGl0eS5VSUQrKyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1haW57XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNUZXN0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBpbXBvcnQgTG9nID0gd2RDYi5Mb2c7XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gYXNzZXJ0KGNvbmQ6Ym9vbGVhbiwgbWVzc2FnZTpzdHJpbmc9XCJjb250cmFjdCBlcnJvclwiKXtcbiAgICAgICAgTG9nLmVycm9yKCFjb25kLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcmVxdWlyZShJbkZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRlc2NyaXB0b3IudmFsdWU7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIEluRnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlbnN1cmUoT3V0RnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3MpLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBbcmVzdWx0XS5jb25jYXQoYXJncyk7XG5cbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCkge1xuICAgICAgICAgICAgICAgICAgICBPdXRGdW5jLmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVHZXR0ZXIoSW5GdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICB2YXIgZ2V0dGVyID0gZGVzY3JpcHRvci5nZXQ7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IuZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBJbkZ1bmMuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiByZXF1aXJlU2V0dGVyKEluRnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHNldHRlciA9IGRlc2NyaXB0b3Iuc2V0O1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLnNldCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KXtcbiAgICAgICAgICAgICAgICAgICAgSW5GdW5jLmNhbGwodGhpcywgdmFsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZXR0ZXIuY2FsbCh0aGlzLCB2YWwpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZW5zdXJlR2V0dGVyKE91dEZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciBnZXR0ZXIgPSBkZXNjcmlwdG9yLmdldDtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci5nZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZ2V0dGVyLmNhbGwodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIE91dEZ1bmMuY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlbnN1cmVTZXR0ZXIoT3V0RnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHNldHRlciA9IGRlc2NyaXB0b3Iuc2V0O1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLnNldCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBzZXR0ZXIuY2FsbCh0aGlzLCB2YWwpLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBbcmVzdWx0LCB2YWxdO1xuXG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBPdXRGdW5jLmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gaW52YXJpYW50KGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KSB7XG4gICAgICAgICAgICAgICAgZnVuYyh0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBTaW5nbGVEaXNwb3NhYmxlIGV4dGVuZHMgRW50aXR5IGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGRpc3Bvc2VIYW5kbGVyOkZ1bmN0aW9uID0gZnVuY3Rpb24oKXt9KSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKGRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9kaXNwb3NlSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGRpc3Bvc2VIYW5kbGVyOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKFwiU2luZ2xlRGlzcG9zYWJsZVwiKTtcblxuICAgICAgICBcdHRoaXMuX2Rpc3Bvc2VIYW5kbGVyID0gZGlzcG9zZUhhbmRsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2V0RGlzcG9zZUhhbmRsZXIoaGFuZGxlcjpGdW5jdGlvbil7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlciA9IGhhbmRsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgR3JvdXBEaXNwb3NhYmxlIGV4dGVuZHMgRW50aXR5IGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGRpc3Bvc2FibGU/OklEaXNwb3NhYmxlKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoZGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9ncm91cDp3ZENiLkNvbGxlY3Rpb248SURpc3Bvc2FibGU+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJRGlzcG9zYWJsZT4oKTtcbiAgICAgICAgcHJpdmF0ZSBfaXNEaXNwb3NlZDpib29sZWFuID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3RydWN0b3IoZGlzcG9zYWJsZT86SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgc3VwZXIoXCJHcm91cERpc3Bvc2FibGVcIik7XG5cbiAgICAgICAgICAgIGlmKGRpc3Bvc2FibGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2dyb3VwLmFkZENoaWxkKGRpc3Bvc2FibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFkZChkaXNwb3NhYmxlOklEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHRoaXMuX2dyb3VwLmFkZENoaWxkKGRpc3Bvc2FibGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLl9ncm91cC5yZW1vdmVDaGlsZChkaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5fZ3JvdXAuZm9yRWFjaCgoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uIGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG5cdFx0cHVibGljIHN0YXRpYyBjcmVhdGUoc3ViamVjdDpTdWJqZWN0fEdlbmVyYXRvclN1YmplY3QsIG9ic2VydmVyOk9ic2VydmVyKSB7XG5cdFx0XHR2YXIgb2JqID0gbmV3IHRoaXMoc3ViamVjdCwgb2JzZXJ2ZXIpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX3N1YmplY3Q6U3ViamVjdHxHZW5lcmF0b3JTdWJqZWN0ID0gbnVsbDtcblx0XHRwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cblx0XHRjb25zdHJ1Y3RvcihzdWJqZWN0OlN1YmplY3R8R2VuZXJhdG9yU3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuXHRcdFx0dGhpcy5fc3ViamVjdCA9IHN1YmplY3Q7XG5cdFx0XHR0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9zdWJqZWN0LnJlbW92ZSh0aGlzLl9vYnNlcnZlcik7XG5cblx0XHRcdHRoaXMuX29ic2VydmVyLmRpc3Bvc2UoKTtcblx0XHR9XG5cdH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uR3JvdXAgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX2NvbnRhaW5lcjp3ZENiLkNvbGxlY3Rpb248SURpc3Bvc2FibGU+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJRGlzcG9zYWJsZT4oKTtcblxuXHRcdHB1YmxpYyBhZGRDaGlsZChjaGlsZDpJRGlzcG9zYWJsZSl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuYWRkQ2hpbGQoY2hpbGQpO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuZm9yRWFjaCgoY2hpbGQ6SURpc3Bvc2FibGUpID0+IHtcblx0XHRcdFx0Y2hpbGQuZGlzcG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG4iLCJkZWNsYXJlIHZhciBnbG9iYWw6YW55LHdpbmRvdzpXaW5kb3c7XG5cbm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgdmFyIHJvb3Q6YW55O1xuXG4gICAgaWYoSnVkZ2VVdGlscy5pc05vZGVKcygpICYmIHR5cGVvZiBnbG9iYWwgIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgIHJvb3QgPSBnbG9iYWw7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICAgIHJvb3QgPSB3aW5kb3c7XG4gICAgfVxufVxuXG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICAvL3JzdnAuanNcbiAgICAvL2RlY2xhcmUgdmFyIFJTVlA6YW55O1xuXG4gICAgLy9ub3Qgc3dhbGxvdyB0aGUgZXJyb3JcbiAgICBpZihyb290LlJTVlApe1xuICAgICAgICByb290LlJTVlAub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH07XG4gICAgICAgIHJvb3QuUlNWUC5vbignZXJyb3InLCByb290LlJTVlAub25lcnJvcik7XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIHJvb3QucmVxdWVzdE5leHRBbmltYXRpb25GcmFtZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHdyYXBwZXIgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBjYWxsYmFjayA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGdlY2tvVmVyc2lvbiA9IG51bGwsXG4gICAgICAgICAgICB1c2VyQWdlbnQgPSByb290Lm5hdmlnYXRvciAmJiByb290Lm5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcblxuICAgICAgICB3cmFwcGVyID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgICAgICAgICAgIHRpbWUgPSByb290LnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgICAgc2VsZi5jYWxsYmFjayh0aW1lKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKiFcbiAgICAgICAgIGJ1ZyFcbiAgICAgICAgIGJlbG93IGNvZGU6XG4gICAgICAgICB3aGVuIGludm9rZSBiIGFmdGVyIDFzLCB3aWxsIG9ubHkgaW52b2tlIGIsIG5vdCBpbnZva2UgYSFcblxuICAgICAgICAgZnVuY3Rpb24gYSh0aW1lKXtcbiAgICAgICAgIGNvbnNvbGUubG9nKFwiYVwiLCB0aW1lKTtcbiAgICAgICAgIHdlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZShhKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgZnVuY3Rpb24gYih0aW1lKXtcbiAgICAgICAgIGNvbnNvbGUubG9nKFwiYlwiLCB0aW1lKTtcbiAgICAgICAgIHdlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZShiKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgYSgpO1xuXG4gICAgICAgICBzZXRUaW1lb3V0KGIsIDEwMDApO1xuXG5cblxuICAgICAgICAgc28gdXNlIHJlcXVlc3RBbmltYXRpb25GcmFtZSBwcmlvcml0eSFcbiAgICAgICAgICovXG4gICAgICAgIGlmIChyb290LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgQ2hyb21lIDEwIGJ1ZyB3aGVyZSBDaHJvbWVcbiAgICAgICAgLy8gZG9lcyBub3QgcGFzcyB0aGUgdGltZSB0byB0aGUgYW5pbWF0aW9uIGZ1bmN0aW9uXG5cbiAgICAgICAgaWYgKHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBEZWZpbmUgdGhlIHdyYXBwZXJcblxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgc3dpdGNoXG5cbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgLy8gQnJvd3NlciBjYWxscyB0aGUgd3JhcHBlciBhbmQgd3JhcHBlciBjYWxscyB0aGUgY2FsbGJhY2tcblxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSh3cmFwcGVyLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v5L+u5pS5dGltZeWPguaVsFxuICAgICAgICBpZiAocm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgR2Vja28gMi4wLCB3aGljaCBoYXMgYSBidWcgaW5cbiAgICAgICAgLy8gbW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKCkgdGhhdCByZXN0cmljdHMgYW5pbWF0aW9uc1xuICAgICAgICAvLyB0byAzMC00MCBmcHMuXG5cbiAgICAgICAgaWYgKHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBDaGVjayB0aGUgR2Vja28gdmVyc2lvbi4gR2Vja28gaXMgdXNlZCBieSBicm93c2Vyc1xuICAgICAgICAgICAgLy8gb3RoZXIgdGhhbiBGaXJlZm94LiBHZWNrbyAyLjAgY29ycmVzcG9uZHMgdG9cbiAgICAgICAgICAgIC8vIEZpcmVmb3ggNC4wLlxuXG4gICAgICAgICAgICBpbmRleCA9IHVzZXJBZ2VudC5pbmRleE9mKCdydjonKTtcblxuICAgICAgICAgICAgaWYgKHVzZXJBZ2VudC5pbmRleE9mKCdHZWNrbycpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gdXNlckFnZW50LnN1YnN0cihpbmRleCArIDMsIDMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGdlY2tvVmVyc2lvbiA9PT0gJzIuMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yY2VzIHRoZSByZXR1cm4gc3RhdGVtZW50IHRvIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgc2V0VGltZW91dCgpIGZ1bmN0aW9uLlxuXG4gICAgICAgICAgICAgICAgICAgIHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHJvb3Qub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXG4gICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaDtcblxuICAgICAgICAgICAgICAgIHJvb3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gcm9vdC5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2ggPSByb290LnBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYudGltZW91dCA9IDEwMDAgLyA2MCAtIChmaW5pc2ggLSBzdGFydCk7XG5cbiAgICAgICAgICAgICAgICB9LCBzZWxmLnRpbWVvdXQpO1xuICAgICAgICAgICAgfTtcbiAgICB9KCkpO1xuXG4gICAgcm9vdC5jYW5jZWxOZXh0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC5jYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290LndlYmtpdENhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm1vekNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm9DYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC5tc0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCBjbGVhclRpbWVvdXQ7XG59O1xuIiwibW9kdWxlIHdkRnJwe1xuICAgIGltcG9ydCBMb2cgPSB3ZENiLkxvZztcblxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdHJlYW0gZXh0ZW5kcyBFbnRpdHl7XG4gICAgICAgIHB1YmxpYyBzY2hlZHVsZXI6U2NoZWR1bGVyID0gbnVsbDtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZUZ1bmM6KG9ic2VydmVyOklPYnNlcnZlcikgPT4gRnVuY3Rpb258dm9pZCA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc3Vic2NyaWJlRnVuYyl7XG4gICAgICAgICAgICBzdXBlcihcIlN0cmVhbVwiKTtcblxuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVGdW5jID0gc3Vic2NyaWJlRnVuYyB8fCBmdW5jdGlvbigpeyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFic3RyYWN0IHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKDxGdW5jdGlvbj4odGhpcy5zdWJzY3JpYmVGdW5jKG9ic2VydmVyKSB8fCBmdW5jdGlvbigpe30pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkbyhvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gRG9TdHJlYW0uY3JlYXRlKHRoaXMsIG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1hcChzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIE1hcFN0cmVhbS5jcmVhdGUodGhpcywgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGZsYXRNYXAoc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFwKHNlbGVjdG9yKS5tZXJnZUFsbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbmNhdE1hcChzZWxlY3RvcjpGdW5jdGlvbil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXAoc2VsZWN0b3IpLmNvbmNhdEFsbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlQWxsKCl7XG4gICAgICAgICAgICByZXR1cm4gTWVyZ2VBbGxTdHJlYW0uY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbmNhdEFsbCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWVyZ2UoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2tpcFVudGlsKG90aGVyU3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICByZXR1cm4gU2tpcFVudGlsU3RyZWFtLmNyZWF0ZSh0aGlzLCBvdGhlclN0cmVhbSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdGFrZVVudGlsKG90aGVyU3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICByZXR1cm4gVGFrZVVudGlsU3RyZWFtLmNyZWF0ZSh0aGlzLCBvdGhlclN0cmVhbSk7XG4gICAgICAgIH1cblxuICAgICAgICBAcmVxdWlyZShmdW5jdGlvbihjb3VudDpudW1iZXIgPSAxKXtcbiAgICAgICAgICAgIGFzc2VydChjb3VudCA+PSAwLCBMb2cuaW5mby5GVU5DX1NIT1VMRChcImNvdW50XCIsIFwiPj0gMFwiKSk7XG4gICAgICAgIH0pXG4gICAgICAgIHB1YmxpYyB0YWtlKGNvdW50Om51bWJlciA9IDEpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZihjb3VudCA9PT0gMCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVtcHR5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlKCh2YWx1ZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoY291bnQgPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY291bnQtLTtcblxuICAgICAgICAgICAgICAgICAgICBpZihjb3VudCA8PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgKGU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKGNvdW50Om51bWJlciA9IDEpe1xuICAgICAgICAgICAgYXNzZXJ0KGNvdW50ID49IDAsIExvZy5pbmZvLkZVTkNfU0hPVUxEKFwiY291bnRcIiwgXCI+PSAwXCIpKTtcbiAgICAgICAgfSlcbiAgICAgICAgcHVibGljIHRha2VMYXN0KGNvdW50Om51bWJlciA9IDEpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZihjb3VudCA9PT0gMCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVtcHR5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUoKHZhbHVlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKHZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihxdWV1ZS5sZW5ndGggPiBjb3VudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgKGU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUocXVldWUubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHF1ZXVlLnNoaWZ0KCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0YWtlV2hpbGUocHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4Om51bWJlciwgc291cmNlOlN0cmVhbSk9PmJvb2xlYW4sIHRoaXNBcmcgPSB0aGlzKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBiaW5kUHJlZGljYXRlID0gbnVsbDtcblxuICAgICAgICAgICAgYmluZFByZWRpY2F0ZSA9IHdkQ2IuRnVuY3Rpb25VdGlscy5iaW5kKHRoaXNBcmcsIHByZWRpY2F0ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgaXNTdGFydCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUoKHZhbHVlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihiaW5kUHJlZGljYXRlKHZhbHVlLCBpKyssIHNlbGYpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXNTdGFydCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGxhc3RPckRlZmF1bHQoZGVmYXVsdFZhbHVlOmFueSA9IG51bGwpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgICAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlKCh2YWx1ZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYocXVldWUubGVuZ3RoID4gMSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgKGU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYocXVldWUubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUocXVldWUubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChxdWV1ZS5zaGlmdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmlsdGVyKHByZWRpY2F0ZToodmFsdWU6YW55KT0+Ym9vbGVhbiwgdGhpc0FyZyA9IHRoaXMpe1xuICAgICAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIEZpbHRlclN0cmVhbSl7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGY6YW55ID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsRmlsdGVyKHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJTdHJlYW0uY3JlYXRlKHRoaXMsIHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmlsdGVyV2l0aFN0YXRlKHByZWRpY2F0ZToodmFsdWU6YW55KT0+Ym9vbGVhbiwgdGhpc0FyZyA9IHRoaXMpe1xuICAgICAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIEZpbHRlclN0cmVhbSl7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGY6YW55ID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsRmlsdGVyKHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJXaXRoU3RhdGVTdHJlYW0uY3JlYXRlKHRoaXMsIHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29uY2F0KHN0cmVhbUFycjpBcnJheTxTdHJlYW0+KTtcbiAgICAgICAgcHVibGljIGNvbmNhdCguLi5vdGhlclN0cmVhbSk7XG5cbiAgICAgICAgcHVibGljIGNvbmNhdCgpe1xuICAgICAgICAgICAgdmFyIGFyZ3M6QXJyYXk8U3RyZWFtPiA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNBcnJheShhcmd1bWVudHNbMF0pKXtcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gQ29uY2F0U3RyZWFtLmNyZWF0ZShhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBtZXJnZShtYXhDb25jdXJyZW50Om51bWJlcik7XG4gICAgICAgIHB1YmxpYyBtZXJnZShzdHJlYW1BcnI6QXJyYXk8U3RyZWFtPik7XG4gICAgICAgIHB1YmxpYyBtZXJnZSguLi5vdGhlclN0cmVhbXMpO1xuXG4gICAgICAgIHB1YmxpYyBtZXJnZSguLi5hcmdzKXtcbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNOdW1iZXIoYXJnc1swXSkpe1xuICAgICAgICAgICAgICAgIHZhciBtYXhDb25jdXJyZW50Om51bWJlciA9IGFyZ3NbMF07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gTWVyZ2VTdHJlYW0uY3JlYXRlKHRoaXMsIG1heENvbmN1cnJlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzQXJyYXkoYXJnc1swXSkpe1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgc3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcblxuICAgICAgICAgICAgc3RyZWFtID0gZnJvbUFycmF5KGFyZ3MpLm1lcmdlQWxsKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVwZWF0KGNvdW50Om51bWJlciA9IC0xKXtcbiAgICAgICAgICAgIHJldHVybiBSZXBlYXRTdHJlYW0uY3JlYXRlKHRoaXMsIGNvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpZ25vcmVFbGVtZW50cygpe1xuICAgICAgICAgICAgcmV0dXJuIElnbm9yZUVsZW1lbnRzU3RyZWFtLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBoYW5kbGVTdWJqZWN0KHN1YmplY3Q6YW55KXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzU3ViamVjdChzdWJqZWN0KSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0U3ViamVjdChzdWJqZWN0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdWJqZWN0KHN1YmplY3Q6U3ViamVjdCl7XG4gICAgICAgICAgICByZXR1cm4gc3ViamVjdCBpbnN0YW5jZW9mIFN1YmplY3Q7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXRTdWJqZWN0KHN1YmplY3Q6U3ViamVjdCl7XG4gICAgICAgICAgICBzdWJqZWN0LnNvdXJjZSA9IHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBTY2hlZHVsZXJ7XG4gICAgICAgIC8vdG9kbyByZW1vdmUgXCIuLi5hcmdzXCJcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9yZXF1ZXN0TG9vcElkOmFueSA9IG51bGw7XG4gICAgICAgIGdldCByZXF1ZXN0TG9vcElkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgcmVxdWVzdExvb3BJZChyZXF1ZXN0TG9vcElkOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0TG9vcElkID0gcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcGFyYW0gb2JzZXJ2ZXIgaXMgdXNlZCBieSBUZXN0U2NoZWR1bGVyIHRvIHJld3JpdGVcblxuICAgICAgICBwdWJsaWMgcHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCBhY3Rpb246RnVuY3Rpb24pe1xuICAgICAgICAgICAgYWN0aW9uKGluaXRpYWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCBpbnRlcnZhbDpudW1iZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgcmV0dXJuIHJvb3Quc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGluaXRpYWwgPSBhY3Rpb24oaW5pdGlhbCk7XG4gICAgICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbG9vcCA9ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpc0VuZCA9IGFjdGlvbih0aW1lKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihpc0VuZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZXF1ZXN0TG9vcElkID0gcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaFRpbWVvdXQob2JzZXJ2ZXI6SU9ic2VydmVyLCB0aW1lOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhY3Rpb24odGltZSk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9LCB0aW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIE9ic2VydmVyIGV4dGVuZHMgRW50aXR5IGltcGxlbWVudHMgSU9ic2VydmVye1xuICAgICAgICBwcml2YXRlIF9pc0Rpc3Bvc2VkOmJvb2xlYW4gPSBudWxsO1xuICAgICAgICBnZXQgaXNEaXNwb3NlZCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzRGlzcG9zZWQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGlzRGlzcG9zZWQoaXNEaXNwb3NlZDpib29sZWFuKXtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSBpc0Rpc3Bvc2VkO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uVXNlck5leHQ6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyRXJyb3I6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyQ29tcGxldGVkOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9pc1N0b3A6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAvL3ByaXZhdGUgX2Rpc3Bvc2VIYW5kbGVyOndkQ2IuQ29sbGVjdGlvbjxGdW5jdGlvbj4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIF9kaXNwb3NhYmxlOklEaXNwb3NhYmxlID0gbnVsbDtcblxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG9ic2VydmVyOklPYnNlcnZlcik7XG4gICAgICAgIGNvbnN0cnVjdG9yKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIHN1cGVyKFwiT2JzZXJ2ZXJcIik7XG5cbiAgICAgICAgICAgIGlmKGFyZ3MubGVuZ3RoID09PSAxKXtcbiAgICAgICAgICAgICAgICBsZXQgb2JzZXJ2ZXI6SU9ic2VydmVyID0gYXJnc1swXTtcblxuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCA9IGZ1bmN0aW9uKHYpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHYpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJFcnJvciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgbGV0IG9uTmV4dCA9IGFyZ3NbMF0sXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IgPSBhcmdzWzFdLFxuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlZCA9IGFyZ3NbMl07XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlck5leHQgPSBvbk5leHQgfHwgZnVuY3Rpb24odil7fTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yID0gb25FcnJvciB8fCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQgPSBvbkNvbXBsZXRlZCB8fCBmdW5jdGlvbigpe307XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZTphbnkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25OZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RvcCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYodGhpcy5fZGlzcG9zYWJsZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vdGhpcy5fZGlzcG9zZUhhbmRsZXIuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgLy8gICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgLy99KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHVibGljIGZhaWwoZSkge1xuICAgICAgICAvLyAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAvLyAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgLy8gICAgICAgIHRoaXMuZXJyb3IoZSk7XG4gICAgICAgIC8vICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NhYmxlKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zYWJsZSA9IGRpc3Bvc2FibGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25OZXh0KHZhbHVlOmFueSk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IG9uRXJyb3IoZXJyb3I6YW55KTtcblxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25Db21wbGV0ZWQoKTtcbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFN1YmplY3QgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgZ2V0IHNvdXJjZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgc291cmNlKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6YW55ID0gbmV3IFN1YmplY3RPYnNlcnZlcigpO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMT86RnVuY3Rpb258T2JzZXJ2ZXIsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyOk9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyA8QXV0b0RldGFjaE9ic2VydmVyPmFyZzFcbiAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgLy90aGlzLl9zb3VyY2UgJiYgb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIodGhpcy5fc291cmNlLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gSW5uZXJTdWJzY3JpcHRpb24uY3JlYXRlKHRoaXMsIG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9zb3VyY2Upe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSh0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0odGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZShvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5yZW1vdmVDaGlsZChvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBHZW5lcmF0b3JTdWJqZWN0IGV4dGVuZHMgRW50aXR5IGltcGxlbWVudHMgSU9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzU3RhcnQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBnZXQgaXNTdGFydCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzU3RhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGlzU3RhcnQoaXNTdGFydDpib29sZWFuKXtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RhcnQgPSBpc1N0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKFwiR2VuZXJhdG9yU3ViamVjdFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvYnNlcnZlcjphbnkgPSBuZXcgU3ViamVjdE9ic2VydmVyKCk7XG5cbiAgICAgICAgLyohXG4gICAgICAgIG91dGVyIGhvb2sgbWV0aG9kXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgb25CZWZvcmVOZXh0KHZhbHVlOmFueSl7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25BZnRlck5leHQodmFsdWU6YW55KSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25Jc0NvbXBsZXRlZCh2YWx1ZTphbnkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZUVycm9yKGVycm9yOmFueSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQWZ0ZXJFcnJvcihlcnJvcjphbnkpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZUNvbXBsZXRlZCgpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkFmdGVyQ29tcGxldGVkKCkge1xuICAgICAgICB9XG5cblxuICAgICAgICAvL3RvZG9cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxPzpGdW5jdGlvbnxPYnNlcnZlciwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IDxBdXRvRGV0YWNoT2JzZXJ2ZXI+YXJnMVxuICAgICAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBJbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUodGhpcywgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1N0YXJ0IHx8IHRoaXMub2JzZXJ2ZXIuaXNFbXB0eSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQmVmb3JlTmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9ic2VydmVyLm5leHQodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vbkFmdGVyTmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLm9uSXNDb21wbGV0ZWQodmFsdWUpKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNTdGFydCB8fCB0aGlzLm9ic2VydmVyLmlzRW1wdHkoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlRXJyb3IoZXJyb3IpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmVycm9yKGVycm9yKTtcblxuICAgICAgICAgICAgdGhpcy5vbkFmdGVyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzU3RhcnQgfHwgdGhpcy5vYnNlcnZlci5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZUNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLm9uQWZ0ZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0b1N0cmVhbSgpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgICAgIHN0cmVhbSA9IEFub255bW91c1N0cmVhbS5jcmVhdGUoKG9ic2VydmVyOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZShTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RvcCgpe1xuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZShvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLnJlbW92ZUNoaWxkKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQXV0b0RldGFjaE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9ic2VydmVyOklPYnNlcnZlcik7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pO1xuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmKGFyZ3MubGVuZ3RoID09PSAxKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoYXJnc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZih0aGlzLmlzRGlzcG9zZWQpe1xuICAgICAgICAgICAgICAgIHdkQ2IuTG9nLndhcm4oXCJvbmx5IGNhbiBkaXNwb3NlIG9uY2VcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBpZih0aGlzLmlzRGlzcG9zZWQpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZTphbnkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3I6YW55KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIE1hcE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZWxlY3Rvcih2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRG9PYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBwcmV2T2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3ByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlciA9IHByZXZPYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgLy90aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGltcG9ydCBMb2cgPSB3ZENiLkxvZztcblxuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzdHJlYW1Hcm91cCwgZ3JvdXBEaXNwb3NhYmxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgICAgICB0aGlzLl9ncm91cERpc3Bvc2FibGUgPSBncm91cERpc3Bvc2FibGU7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZG9uZTpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHB1YmxpYyBjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2dyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUgPSBudWxsO1xuXG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBhc3NlcnQoaW5uZXJTb3VyY2UgaW5zdGFuY2VvZiBTdHJlYW0gfHwgSnVkZ2VVdGlscy5pc1Byb21pc2UoaW5uZXJTb3VyY2UpLCBMb2cuaW5mby5GVU5DX01VU1RfQkUoXCJpbm5lclNvdXJjZVwiLCBcIlN0cmVhbSBvciBQcm9taXNlXCIpKTtcblxuICAgICAgICB9KVxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzUHJvbWlzZShpbm5lclNvdXJjZSkpe1xuICAgICAgICAgICAgICAgIGlubmVyU291cmNlID0gZnJvbVByb21pc2UoaW5uZXJTb3VyY2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cC5hZGRDaGlsZChpbm5lclNvdXJjZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dyb3VwRGlzcG9zYWJsZS5hZGQoaW5uZXJTb3VyY2UuYnVpbGRTdHJlYW0oSW5uZXJPYnNlcnZlci5jcmVhdGUodGhpcywgdGhpcy5fc3RyZWFtR3JvdXAsIGlubmVyU291cmNlKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsYXNzIElubmVyT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBjdXJyZW50U3RyZWFtOlN0cmVhbSkge1xuICAgICAgICBcdHZhciBvYmogPSBuZXcgdGhpcyhwYXJlbnQsIHN0cmVhbUdyb3VwLCBjdXJyZW50U3RyZWFtKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0cmVhbSA9IGN1cnJlbnRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3N0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudFN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB2YXIgY3VycmVudFN0cmVhbSA9IHRoaXMuX2N1cnJlbnRTdHJlYW0sXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5fcGFyZW50O1xuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cC5yZW1vdmVDaGlsZCgoc3RyZWFtOlN0cmVhbSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBKdWRnZVV0aWxzLmlzRXF1YWwoc3RyZWFtLCBjdXJyZW50U3RyZWFtKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAvL3RoaXMuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICAvKiFcbiAgICAgICAgICAgIGlmIHRoaXMgaW5uZXJTb3VyY2UgaXMgYXN5bmMgc3RyZWFtKGFzIHByb21pc2Ugc3RyZWFtKSxcbiAgICAgICAgICAgIGl0IHdpbGwgZmlyc3QgZXhlYyBhbGwgcGFyZW50Lm5leHQgYW5kIG9uZSBwYXJlbnQuY29tcGxldGVkLFxuICAgICAgICAgICAgdGhlbiBleGVjIGFsbCB0aGlzLm5leHQgYW5kIGFsbCB0aGlzLmNvbXBsZXRlZFxuICAgICAgICAgICAgc28gaW4gdGhpcyBjYXNlLCBpdCBzaG91bGQgaW52b2tlIHBhcmVudC5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkIGFmdGVyIHRoZSBsYXN0IGludm9rY2F0aW9uIG9mIHRoaXMuY29tcGxldGVkKGhhdmUgaW52b2tlZCBhbGwgdGhlIGlubmVyU291cmNlKVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmKHRoaXMuX2lzQXN5bmMoKSAmJiB0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNBc3luYygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudC5kb25lO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGltcG9ydCBMb2cgPSB3ZENiLkxvZztcblxuICAgIGV4cG9ydCBjbGFzcyBNZXJnZU9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIG1heENvbmN1cnJlbnQ6bnVtYmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgbWF4Q29uY3VycmVudCwgc3RyZWFtR3JvdXAsIGdyb3VwRGlzcG9zYWJsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBtYXhDb25jdXJyZW50Om51bWJlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGdyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fbWF4Q29uY3VycmVudCA9IG1heENvbmN1cnJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXBEaXNwb3NhYmxlID0gZ3JvdXBEaXNwb3NhYmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRvbmU6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwdWJsaWMgY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHB1YmxpYyBhY3RpdmVDb3VudDpudW1iZXIgPSAwO1xuICAgICAgICBwdWJsaWMgcTpBcnJheTxTdHJlYW0+ID0gW107XG5cbiAgICAgICAgcHJpdmF0ZSBfbWF4Q29uY3VycmVudDpudW1iZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9ncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBoYW5kbGVTdWJzY3JpYmUoaW5uZXJTb3VyY2U6YW55KXtcbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSl7XG4gICAgICAgICAgICAgICAgaW5uZXJTb3VyY2UgPSBmcm9tUHJvbWlzZShpbm5lclNvdXJjZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLmFkZENoaWxkKGlubmVyU291cmNlKTtcblxuICAgICAgICAgICAgdGhpcy5fZ3JvdXBEaXNwb3NhYmxlLmFkZChpbm5lclNvdXJjZS5idWlsZFN0cmVhbShJbm5lck9ic2VydmVyLmNyZWF0ZSh0aGlzLCB0aGlzLl9zdHJlYW1Hcm91cCwgaW5uZXJTb3VyY2UpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBAcmVxdWlyZShmdW5jdGlvbihpbm5lclNvdXJjZTphbnkpe1xuICAgICAgICAgICAgYXNzZXJ0KGlubmVyU291cmNlIGluc3RhbmNlb2YgU3RyZWFtIHx8IEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSwgTG9nLmluZm8uRlVOQ19NVVNUX0JFKFwiaW5uZXJTb3VyY2VcIiwgXCJTdHJlYW0gb3IgUHJvbWlzZVwiKSk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dChpbm5lclNvdXJjZTphbnkpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNSZWFjaE1heENvbmN1cnJlbnQoKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVDb3VudCArKztcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVN1YnNjcmliZShpbm5lclNvdXJjZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucS5wdXNoKGlubmVyU291cmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYodGhpcy5fc3RyZWFtR3JvdXAuZ2V0Q291bnQoKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1JlYWNoTWF4Q29uY3VycmVudCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlQ291bnQgPCB0aGlzLl9tYXhDb25jdXJyZW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xhc3MgSW5uZXJPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwYXJlbnQ6TWVyZ2VPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6TWVyZ2VPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0cmVhbSA9IGN1cnJlbnRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wYXJlbnQ6TWVyZ2VPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3N0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudFN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5fcGFyZW50O1xuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cC5yZW1vdmVDaGlsZCh0aGlzLl9jdXJyZW50U3RyZWFtKTtcblxuICAgICAgICAgICAgaWYgKHBhcmVudC5xLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQuYWN0aXZlQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIHBhcmVudC5oYW5kbGVTdWJzY3JpYmUocGFyZW50LnEuc2hpZnQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLl9pc0FzeW5jKCkgJiYgdGhpcy5fc3RyZWFtR3JvdXAuZ2V0Q291bnQoKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNBc3luYygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudC5kb25lO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBUYWtlVW50aWxPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMocHJldk9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3ByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlciA9IHByZXZPYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBTa2lwVW50aWxTb3VyY2VPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyLCBza2lwVW50aWxTdHJlYW06U2tpcFVudGlsU3RyZWFtKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMocHJldk9ic2VydmVyLCBza2lwVW50aWxTdHJlYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcHJldk9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NraXBVbnRpbFN0cmVhbTpTa2lwVW50aWxTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIsIHNraXBVbnRpbFN0cmVhbTpTa2lwVW50aWxTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlciA9IHByZXZPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3NraXBVbnRpbFN0cmVhbSA9IHNraXBVbnRpbFN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgaWYodGhpcy5fc2tpcFVudGlsU3RyZWFtLmlzT3Blbil7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgaWYodGhpcy5fc2tpcFVudGlsU3RyZWFtLmlzT3Blbil7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBTa2lwVW50aWxPdGhlck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIsIHNraXBVbnRpbFN0cmVhbTpTa2lwVW50aWxTdHJlYW0pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhwcmV2T2JzZXJ2ZXIsIHNraXBVbnRpbFN0cmVhbSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb3RoZXJEaXNwb3NhYmxlOklEaXNwb3NhYmxlID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc2tpcFVudGlsU3RyZWFtOlNraXBVbnRpbFN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJldk9ic2VydmVyOklPYnNlcnZlciwgc2tpcFVudGlsU3RyZWFtOlNraXBVbnRpbFN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyID0gcHJldk9ic2VydmVyO1xuICAgICAgICAgICAgdGhpcy5fc2tpcFVudGlsU3RyZWFtID0gc2tpcFVudGlsU3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLl9za2lwVW50aWxTdHJlYW0uaXNPcGVuID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gaWYodGhpcy5vdGhlckRpc3Bvc2FibGUuZGlzcG9zZSgpKVxuICAgICAgICAgICAgdGhpcy5vdGhlckRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5vdGhlckRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBDb25jYXRPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzdGFydE5leHRTdHJlYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgY3VycmVudE9ic2VydmVyOmFueSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3N0YXJ0TmV4dFN0cmVhbTpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zdGFydE5leHRTdHJlYW0gPSBzdGFydE5leHRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIC8qIVxuICAgICAgICAgICAgaWYgXCJ0aGlzLmN1cnJlbnRPYnNlcnZlci5uZXh0XCIgZXJyb3IsIGl0IHdpbGwgcGFzZSB0byB0aGlzLmN1cnJlbnRPYnNlcnZlci0+b25FcnJvci5cbiAgICAgICAgICAgIHNvIGl0IHNob3VsZG4ndCBpbnZva2UgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IgaGVyZSBhZ2FpbiFcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgLy90cnl7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIC8vfVxuICAgICAgICAgICAgLy9jYXRjaChlKXtcbiAgICAgICAgICAgIC8vICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgLy99XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgLy90aGlzLmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0TmV4dFN0cmVhbSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBTdWJqZWN0T2JzZXJ2ZXIgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBvYnNlcnZlcnM6d2RDYi5Db2xsZWN0aW9uPElPYnNlcnZlcj4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPElPYnNlcnZlcj4oKTtcblxuICAgICAgICBwcml2YXRlIF9kaXNwb3NhYmxlOklEaXNwb3NhYmxlID0gbnVsbDtcblxuICAgICAgICBwdWJsaWMgaXNFbXB0eSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2JzZXJ2ZXJzLmdldENvdW50KCkgPT09IDA7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBvYi5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFkZENoaWxkKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmFkZENoaWxkKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSh0aGlzLl9kaXNwb3NhYmxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmVDaGlsZChvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5yZW1vdmVDaGlsZCgob2I6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKG9iLCBvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5yZW1vdmVBbGxDaGlsZHJlbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2FibGUoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYnNlcnZlcjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUoZGlzcG9zYWJsZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fZGlzcG9zYWJsZSA9IGRpc3Bvc2FibGU7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIElnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlciwgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiwgc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlciwgcHJlZGljYXRlLCBzb3VyY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJldk9ic2VydmVyOklPYnNlcnZlciwgcHJlZGljYXRlOih2YWx1ZTphbnkpPT5ib29sZWFuLCBzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLnByZWRpY2F0ZSA9IHByZWRpY2F0ZTtcbiAgICAgICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBpOm51bWJlciA9IDA7XG4gICAgICAgIHByb3RlY3RlZCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuID0gbnVsbDtcblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByZWRpY2F0ZSh2YWx1ZSwgdGhpcy5pKyssIHRoaXMuc291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCkge1xuICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJXaXRoU3RhdGVPYnNlcnZlciBleHRlbmRzIEZpbHRlck9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlciwgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiwgc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlciwgcHJlZGljYXRlLCBzb3VyY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNUcmlnZ2VyOmJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YTp7dmFsdWU6YW55LCBzdGF0ZTpGaWx0ZXJTdGF0ZX0gPSBudWxsO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByZWRpY2F0ZSh2YWx1ZSwgdGhpcy5pKyssIHRoaXMuc291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICBpZighdGhpcy5faXNUcmlnZ2VyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6dmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6RmlsdGVyU3RhdGUuRU5URVJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6dmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6RmlsdGVyU3RhdGUuVFJJR0dFUlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLm5leHQoZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNUcmlnZ2VyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5faXNUcmlnZ2VyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6dmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6RmlsdGVyU3RhdGUuTEVBVkVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc1RyaWdnZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgYWJzdHJhY3Qgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMTpGdW5jdGlvbnxPYnNlcnZlcnxTdWJqZWN0LCBvbkVycm9yPywgb25Db21wbGV0ZWQ/KTpJRGlzcG9zYWJsZSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBpZih0aGlzLmhhbmRsZVN1YmplY3QoYXJnMSkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPElPYnNlcnZlcj5hcmcxKVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICAvL29ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKHRoaXMuZGlzcG9zZUhhbmRsZXIpO1xuXG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUodGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcikpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHN1cGVyLmJ1aWxkU3RyZWFtKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlQ29yZShvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgX2hhc011bHRpT2JzZXJ2ZXJzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLnNjaGVkdWxlci5nZXRPYnNlcnZlcnMoKSA+IDE7XG4gICAgICAgIC8vfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBEb1N0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIG9uTmV4dD86RnVuY3Rpb24sIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBvbk5leHQ6RnVuY3Rpb24sIG9uRXJyb3I6RnVuY3Rpb24sIG9uQ29tcGxldGVkOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlciA9IEFub255bW91c09ic2VydmVyLmNyZWF0ZShvbk5leHQsIG9uRXJyb3Isb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShEb09ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fb2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNYXBTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgc2VsZWN0b3IpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBzZWxlY3RvcjpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWFwT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLl9zZWxlY3RvcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tQXJyYXlTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYXJyYXksIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hcnJheTpBcnJheTxhbnk+ID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihhcnJheTpBcnJheTxhbnk+LCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9hcnJheSA9IGFycmF5O1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGFycmF5ID0gdGhpcy5fYXJyYXksXG4gICAgICAgICAgICAgICAgbGVuID0gYXJyYXkubGVuZ3RoO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGFycmF5W2ldKTtcblxuICAgICAgICAgICAgICAgICAgICBsb29wUmVjdXJzaXZlKGkgKyAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIDAsIGxvb3BSZWN1cnNpdmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbVByb21pc2VTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwcm9taXNlOmFueSwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICBcdHZhciBvYmogPSBuZXcgdGhpcyhwcm9taXNlLCBzY2hlZHVsZXIpO1xuXG4gICAgICAgIFx0cmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3Byb21pc2U6YW55ID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm9taXNlOmFueSwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fcHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9wcm9taXNlLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGRhdGEpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICB9LCBvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tRXZlbnRQYXR0ZXJuU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoYWRkSGFuZGxlcjpGdW5jdGlvbiwgcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGFkZEhhbmRsZXIsIHJlbW92ZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYWRkSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3JlbW92ZUhhbmRsZXI6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIgPSBhZGRIYW5kbGVyO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlSGFuZGxlciA9IHJlbW92ZUhhbmRsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBpbm5lckhhbmRsZXIoZXZlbnQpe1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyKGlubmVySGFuZGxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5fcmVtb3ZlSGFuZGxlcihpbm5lckhhbmRsZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzU3RyZWFtIGV4dGVuZHMgU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc3Vic2NyaWJlRnVuYyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVGdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBzdXBlcihzdWJzY3JpYmVGdW5jKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKHN1YmplY3Q6U3ViamVjdCk6SURpc3Bvc2FibGU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob2JzZXJ2ZXI6SU9ic2VydmVyKTpJRGlzcG9zYWJsZTtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9uTmV4dDoodmFsdWU6YW55KT0+dm9pZCk6SURpc3Bvc2FibGU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob25OZXh0Oih2YWx1ZTphbnkpPT52b2lkLCBvbkVycm9yOihlOmFueSk9PnZvaWQpOklEaXNwb3NhYmxlO1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9uTmV4dDoodmFsdWU6YW55KT0+dm9pZCwgb25FcnJvcjooZTphbnkpPT52b2lkLCBvbkNvbXBsZXRlOigpPT52b2lkKTpJRGlzcG9zYWJsZTtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKC4uLmFyZ3MpOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjpBdXRvRGV0YWNoT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBpZihhcmdzWzBdIGluc3RhbmNlb2YgU3ViamVjdCl7XG4gICAgICAgICAgICAgICAgbGV0IHN1YmplY3Q6U3ViamVjdCA9IDxTdWJqZWN0PmFyZ3NbMF07XG5cbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVN1YmplY3Qoc3ViamVjdCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKEp1ZGdlVXRpbHMuaXNJT2JzZXJ2ZXIoPElPYnNlcnZlcj5hcmdzWzBdKSl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxJT2JzZXJ2ZXI+YXJnc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGxldCBvbk5leHQ6RnVuY3Rpb24gPSA8RnVuY3Rpb24+YXJnc1swXSxcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcjpGdW5jdGlvbiA9IDxGdW5jdGlvbj5hcmdzWzFdIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGVkOkZ1bmN0aW9uID0gPEZ1bmN0aW9uPmFyZ3NbMl0gfHwgbnVsbDtcblxuICAgICAgICAgICAgICAgIG9ic2VydmVyID0gQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZShvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSh0aGlzLmJ1aWxkU3RyZWFtKG9ic2VydmVyKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgSW50ZXJ2YWxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShpbnRlcnZhbDpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhpbnRlcnZhbCwgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgb2JqLmluaXRXaGVuQ3JlYXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pbnRlcnZhbDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGludGVydmFsOm51bWJlciwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSBpbnRlcnZhbDtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGluaXRXaGVuQ3JlYXRlKCl7XG4gICAgICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IHRoaXMuX2ludGVydmFsIDw9IDAgPyAxIDogdGhpcy5faW50ZXJ2YWw7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGlkID0gbnVsbDtcblxuICAgICAgICAgICAgaWQgPSB0aGlzLnNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXIsIDAsIHRoaXMuX2ludGVydmFsLCAoY291bnQpID0+IHtcbiAgICAgICAgICAgICAgICAvL3NlbGYuc2NoZWR1bGVyLm5leHQoY291bnQpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoY291bnQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50ICsgMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL0Rpc3Bvc2VyLmFkZERpc3Bvc2VIYW5kbGVyKCgpID0+IHtcbiAgICAgICAgICAgIC8vfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5jbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBJbnRlcnZhbFJlcXVlc3RTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzRW5kOmJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXIsICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0aW1lKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9pc0VuZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QuY2FuY2VsTmV4dFJlcXVlc3RBbmltYXRpb25GcmFtZShzZWxmLnNjaGVkdWxlci5yZXF1ZXN0TG9vcElkKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pc0VuZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBpbXBvcnQgTG9nID0gd2RDYi5Mb2c7XG5cbiAgICBleHBvcnQgY2xhc3MgVGltZW91dFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKHRpbWU6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIGFzc2VydCh0aW1lID4gMCwgTG9nLmluZm8uRlVOQ19TSE9VTEQoXCJ0aW1lXCIsIFwiPiAwXCIpKTtcbiAgICAgICAgfSlcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUodGltZTpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyh0aW1lLCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdGltZTpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHRpbWU6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBpZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlkID0gdGhpcy5zY2hlZHVsZXIucHVibGlzaFRpbWVvdXQob2JzZXJ2ZXIsIHRoaXMuX3RpbWUsICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0aW1lKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QuY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgLy90aGlzLl9vYnNlcnZlciA9IEFub255bW91c09ic2VydmVyLmNyZWF0ZShvbk5leHQsIG9uRXJyb3Isb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc3RyZWFtR3JvdXAgPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKSxcbiAgICAgICAgICAgICAgICBncm91cERpc3Bvc2FibGUgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWVyZ2VBbGxPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHN0cmVhbUdyb3VwLCBncm91cERpc3Bvc2FibGUpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwRGlzcG9zYWJsZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgTWVyZ2VTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFtIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgbWF4Q29uY3VycmVudDpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIG1heENvbmN1cnJlbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgbWF4Q29uY3VycmVudDpudW1iZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX21heENvbmN1cnJlbnQgPSBtYXhDb25jdXJyZW50O1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfbWF4Q29uY3VycmVudDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICAvL3ZhciBncm91cERpc3Bvc2FibGUgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy90aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWVyZ2VPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX21heENvbmN1cnJlbnQsIGdyb3VwRGlzcG9zYWJsZSkpO1xuICAgICAgICAgICAgdmFyIHN0cmVhbUdyb3VwID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxTdHJlYW0+KCksXG4gICAgICAgICAgICAgICAgZ3JvdXBEaXNwb3NhYmxlID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWVyZ2VPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX21heENvbmN1cnJlbnQsIHN0cmVhbUdyb3VwLCBncm91cERpc3Bvc2FibGUpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwRGlzcG9zYWJsZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgb3RoZXJTdGVhbTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIG90aGVyU3RlYW0pO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX290aGVyU3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgb3RoZXJTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9vdGhlclN0cmVhbSA9IEp1ZGdlVXRpbHMuaXNQcm9taXNlKG90aGVyU3RyZWFtKSA/IGZyb21Qcm9taXNlKG90aGVyU3RyZWFtKSA6IG90aGVyU3RyZWFtO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGdyb3VwID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpLFxuICAgICAgICAgICAgICAgIGF1dG9EZXRhY2hPYnNlcnZlciA9IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIpLFxuICAgICAgICAgICAgICAgIHNvdXJjZURpc3Bvc2FibGUgPSBudWxsO1xuXG4gICAgICAgICAgICBzb3VyY2VEaXNwb3NhYmxlID0gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgZ3JvdXAuYWRkKHNvdXJjZURpc3Bvc2FibGUpO1xuXG4gICAgICAgICAgICBhdXRvRGV0YWNoT2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZShzb3VyY2VEaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgZ3JvdXAuYWRkKHRoaXMuX290aGVyU3RyZWFtLmJ1aWxkU3RyZWFtKFRha2VVbnRpbE9ic2VydmVyLmNyZWF0ZShhdXRvRGV0YWNoT2JzZXJ2ZXIpKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBncm91cDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgU2tpcFVudGlsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgb3RoZXJTdGVhbTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIG90aGVyU3RlYW0pO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGlzT3Blbjpib29sZWFuID0gZmFsc2U7XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX290aGVyU3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgb3RoZXJTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9vdGhlclN0cmVhbSA9IEp1ZGdlVXRpbHMuaXNQcm9taXNlKG90aGVyU3RyZWFtKSA/IGZyb21Qcm9taXNlKG90aGVyU3RyZWFtKSA6IG90aGVyU3RyZWFtO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGdyb3VwID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpLFxuICAgICAgICAgICAgICAgIG90aGVyRGlzcG9zYWJsZTpJRGlzcG9zYWJsZSA9IG51bGwsXG4gICAgICAgICAgICAgICAgc2tpcFVudGlsT3RoZXJPYnNlcnZlcjpTa2lwVW50aWxPdGhlck9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAvLyBhdXRvRGV0YWNoT2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyKSxcbiAgICAgICAgICAgICAgICAvLyBzb3VyY2VEaXNwb3NhYmxlID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gc291cmNlRGlzcG9zYWJsZSA9IHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIGdyb3VwLmFkZCh0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oU2tpcFVudGlsU291cmNlT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzKSkpO1xuXG4gICAgICAgICAgICAvLyBhdXRvRGV0YWNoT2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZShzb3VyY2VEaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgc2tpcFVudGlsT3RoZXJPYnNlcnZlciA9IFNraXBVbnRpbE90aGVyT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzKTtcblxuICAgICAgICAgICAgb3RoZXJEaXNwb3NhYmxlID0gdGhpcy5fb3RoZXJTdHJlYW0uYnVpbGRTdHJlYW0oc2tpcFVudGlsT3RoZXJPYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHNraXBVbnRpbE90aGVyT2JzZXJ2ZXIub3RoZXJEaXNwb3NhYmxlID0gb3RoZXJEaXNwb3NhYmxlO1xuXG4gICAgICAgICAgICBncm91cC5hZGQob3RoZXJEaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBDb25jYXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2VzOkFycmF5PFN0cmVhbT4pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZXM6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKTtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2VzOkFycmF5PFN0cmVhbT4pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgLy90b2RvIGRvbid0IHNldCBzY2hlZHVsZXIgaGVyZT9cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc291cmNlc1swXS5zY2hlZHVsZXI7XG5cbiAgICAgICAgICAgIHNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc1Byb21pc2Uoc291cmNlKSl7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuYWRkQ2hpbGQoZnJvbVByb21pc2Uoc291cmNlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuYWRkQ2hpbGQoc291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY291bnQgPSB0aGlzLl9zb3VyY2VzLmdldENvdW50KCksXG4gICAgICAgICAgICAgICAgZCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShpKSB7XG4gICAgICAgICAgICAgICAgaWYoaSA9PT0gY291bnQpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZC5hZGQoc2VsZi5fc291cmNlcy5nZXRDaGlsZChpKS5idWlsZFN0cmVhbShDb25jYXRPYnNlcnZlci5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlciwgKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wUmVjdXJzaXZlKGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIDAsIGxvb3BSZWN1cnNpdmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZShkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBSZXBlYXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBjb3VudDpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIGNvdW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9jb3VudDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIGNvdW50Om51bWJlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fY291bnQgPSBjb3VudDtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuXG4gICAgICAgICAgICAvL3RoaXMuc3ViamVjdEdyb3VwID0gdGhpcy5fc291cmNlLnN1YmplY3RHcm91cDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBkID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGNvdW50KSB7XG4gICAgICAgICAgICAgICAgaWYoY291bnQgPT09IDApe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZC5hZGQoXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZS5idWlsZFN0cmVhbShDb25jYXRPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BSZWN1cnNpdmUoY291bnQgLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyLCB0aGlzLl9jb3VudCwgbG9vcFJlY3Vyc2l2ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBHcm91cERpc3Bvc2FibGUuY3JlYXRlKGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIElnbm9yZUVsZW1lbnRzU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKElnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIERlZmVyU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYnVpbGRTdHJlYW1GdW5jKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2J1aWxkU3RyZWFtRnVuYzpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9idWlsZFN0cmVhbUZ1bmMgPSBidWlsZFN0cmVhbUZ1bmM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGdyb3VwID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICBncm91cC5hZGQodGhpcy5fYnVpbGRTdHJlYW1GdW5jKCkuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCB0aGlzQXJnOmFueSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgcHJlZGljYXRlLCB0aGlzQXJnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4sIHRoaXNBcmc6YW55KXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLnByZWRpY2F0ZSA9IHdkQ2IuRnVuY3Rpb25VdGlscy5iaW5kKHRoaXNBcmcsIHByZWRpY2F0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiA9IG51bGw7XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2Uuc3Vic2NyaWJlKHRoaXMuY3JlYXRlT2JzZXJ2ZXIob2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbnRlcm5hbEZpbHRlcihwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCB0aGlzQXJnOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVTdHJlYW1Gb3JJbnRlcm5hbEZpbHRlcih0aGlzLl9zb3VyY2UsIHRoaXMuX2lubmVyUHJlZGljYXRlKHByZWRpY2F0ZSwgdGhpcyksIHRoaXNBcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZU9ic2VydmVyKG9ic2VydmVyOklPYnNlcnZlcik6T2JzZXJ2ZXJ7XG4gICAgICAgICAgICByZXR1cm4gRmlsdGVyT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLnByZWRpY2F0ZSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlU3RyZWFtRm9ySW50ZXJuYWxGaWx0ZXIoc291cmNlOlN0cmVhbSwgaW5uZXJQcmVkaWNhdGU6YW55LCB0aGlzQXJnOmFueSk6U3RyZWFte1xuICAgICAgICAgICAgcmV0dXJuIEZpbHRlclN0cmVhbS5jcmVhdGUoc291cmNlLCBpbm5lclByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pbm5lclByZWRpY2F0ZShwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCBzZWxmOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gKHZhbHVlLCBpLCBvKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYucHJlZGljYXRlKHZhbHVlLCBpLCBvKSAmJiBwcmVkaWNhdGUuY2FsbCh0aGlzLCB2YWx1ZSwgaSwgbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyV2l0aFN0YXRlU3RyZWFtIGV4dGVuZHMgRmlsdGVyU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCB0aGlzQXJnOmFueSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgcHJlZGljYXRlLCB0aGlzQXJnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVPYnNlcnZlcihvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIEZpbHRlcldpdGhTdGF0ZU9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5wcmVkaWNhdGUsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVN0cmVhbUZvckludGVybmFsRmlsdGVyKHNvdXJjZTpTdHJlYW0sIGlubmVyUHJlZGljYXRlOmFueSwgdGhpc0FyZzphbnkpOlN0cmVhbXtcbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJXaXRoU3RhdGVTdHJlYW0uY3JlYXRlKHNvdXJjZSwgaW5uZXJQcmVkaWNhdGUsIHRoaXNBcmcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IHZhciBjcmVhdGVTdHJlYW0gPSAoc3Vic2NyaWJlRnVuYykgPT4ge1xuICAgICAgICByZXR1cm4gQW5vbnltb3VzU3RyZWFtLmNyZWF0ZShzdWJzY3JpYmVGdW5jKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tQXJyYXkgPSAoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PntcbiAgICAgICAgcmV0dXJuIEZyb21BcnJheVN0cmVhbS5jcmVhdGUoYXJyYXksIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVByb21pc2UgPSAocHJvbWlzZTphbnksIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT57XG4gICAgICAgIHJldHVybiBGcm9tUHJvbWlzZVN0cmVhbS5jcmVhdGUocHJvbWlzZSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tRXZlbnRQYXR0ZXJuID0gKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pID0+e1xuICAgICAgICByZXR1cm4gRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5jcmVhdGUoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgaW50ZXJ2YWwgPSAoaW50ZXJ2YWwsIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT4ge1xuICAgICAgICByZXR1cm4gSW50ZXJ2YWxTdHJlYW0uY3JlYXRlKGludGVydmFsLCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGludGVydmFsUmVxdWVzdCA9IChzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsUmVxdWVzdFN0cmVhbS5jcmVhdGUoc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciB0aW1lb3V0ID0gKHRpbWUsIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT4ge1xuICAgICAgICByZXR1cm4gVGltZW91dFN0cmVhbS5jcmVhdGUodGltZSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuICAgIGV4cG9ydCB2YXIgZW1wdHkgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT57XG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgY2FsbEZ1bmMgPSAoZnVuYzpGdW5jdGlvbiwgY29udGV4dCA9IHJvb3QpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChmdW5jLmNhbGwoY29udGV4dCwgbnVsbCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBqdWRnZSA9IChjb25kaXRpb246RnVuY3Rpb24sIHRoZW5Tb3VyY2U6RnVuY3Rpb24sIGVsc2VTb3VyY2U6RnVuY3Rpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbmRpdGlvbigpID8gdGhlblNvdXJjZSgpIDogZWxzZVNvdXJjZSgpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGRlZmVyID0gKGJ1aWxkU3RyZWFtRnVuYzpGdW5jdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gRGVmZXJTdHJlYW0uY3JlYXRlKGJ1aWxkU3RyZWFtRnVuYyk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIganVzdCA9IChyZXR1cm5WYWx1ZTphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5uZXh0KHJldHVyblZhbHVlKTtcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgZW51bSBGaWx0ZXJTdGF0ZXtcbiAgICAgICAgVFJJR0dFUixcbiAgICAgICAgRU5URVIsXG4gICAgICAgIExFQVZFXG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICB2YXIgZGVmYXVsdElzRXF1YWwgPSAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICB9O1xuXG4gICAgZXhwb3J0IGNsYXNzIFJlY29yZCB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHRpbWU6bnVtYmVyLCB2YWx1ZTphbnksIGFjdGlvblR5cGU/OkFjdGlvblR5cGUsIGNvbXBhcmVyPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHRpbWUsIHZhbHVlLCBhY3Rpb25UeXBlLCBjb21wYXJlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB0aW1lKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdGltZSh0aW1lOm51bWJlcil7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3ZhbHVlOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB2YWx1ZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHNldCB2YWx1ZSh2YWx1ZTpudW1iZXIpe1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FjdGlvblR5cGU6QWN0aW9uVHlwZSA9IG51bGw7XG4gICAgICAgIGdldCBhY3Rpb25UeXBlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aW9uVHlwZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgYWN0aW9uVHlwZShhY3Rpb25UeXBlOkFjdGlvblR5cGUpe1xuICAgICAgICAgICAgdGhpcy5fYWN0aW9uVHlwZSA9IGFjdGlvblR5cGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jb21wYXJlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IodGltZSwgdmFsdWUsIGFjdGlvblR5cGU6QWN0aW9uVHlwZSwgY29tcGFyZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX2FjdGlvblR5cGUgPSBhY3Rpb25UeXBlO1xuICAgICAgICAgICAgdGhpcy5fY29tcGFyZXIgPSBjb21wYXJlciB8fCBkZWZhdWx0SXNFcXVhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWUgPT09IG90aGVyLnRpbWUgJiYgdGhpcy5fY29tcGFyZXIodGhpcy5fdmFsdWUsIG90aGVyLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTW9ja09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gPFtSZWNvcmRdPltdO1xuICAgICAgICBnZXQgbWVzc2FnZXMoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgICAgICAgfVxuICAgICAgICBzZXQgbWVzc2FnZXMobWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NjaGVkdWxlcjpUZXN0U2NoZWR1bGVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB2YXIgcmVjb3JkID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0RpcmVjdE9iamVjdCh2YWx1ZSkpe1xuICAgICAgICAgICAgICAgIHJlY29yZCA9IFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCB2YWx1ZSwgQWN0aW9uVHlwZS5ORVhULCAoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGkgaW4gYSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhLmhhc093blByb3BlcnR5KGkpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhW2ldICE9PSBiW2ldKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHJlY29yZCA9IFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCB2YWx1ZSwgQWN0aW9uVHlwZS5ORVhUKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChyZWNvcmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgZXJyb3IsIEFjdGlvblR5cGUuRVJST1IpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgbnVsbCwgQWN0aW9uVHlwZS5DT01QTEVURUQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY2xvbmUoKXtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBNb2NrT2JzZXJ2ZXIuY3JlYXRlKHRoaXMuX3NjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlcyA9IHRoaXMuX21lc3NhZ2VzO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNb2NrUHJvbWlzZXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIsIG1lc3NhZ2VzOltSZWNvcmRdKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyLCBtZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IDxbUmVjb3JkXT5bXTtcbiAgICAgICAgLy9nZXQgbWVzc2FnZXMoKXtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICAgICAgICAvL31cbiAgICAgICAgLy9zZXQgbWVzc2FnZXMobWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAvLyAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICAvL31cblxuICAgICAgICBwcml2YXRlIF9zY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIsIG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdGhlbihzdWNjZXNzQ2I6RnVuY3Rpb24sIGVycm9yQ2I6RnVuY3Rpb24sIG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICAvL3ZhciBzY2hlZHVsZXIgPSA8VGVzdFNjaGVkdWxlcj4odGhpcy5zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCB0aGlzLl9tZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGNvbnN0IFNVQlNDUklCRV9USU1FID0gMjAwO1xuICAgIGNvbnN0IERJU1BPU0VfVElNRSA9IDEwMDA7XG5cbiAgICBleHBvcnQgY2xhc3MgVGVzdFNjaGVkdWxlciBleHRlbmRzIFNjaGVkdWxlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgbmV4dCh0aWNrLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0RpcmVjdE9iamVjdCh2YWx1ZSkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQsIChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSBpbiBhKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGEuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFbaV0gIT09IGJbaV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgdmFsdWUsIEFjdGlvblR5cGUuTkVYVCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGVycm9yKHRpY2ssIGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCBlcnJvciwgQWN0aW9uVHlwZS5FUlJPUik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGNvbXBsZXRlZCh0aWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCBudWxsLCBBY3Rpb25UeXBlLkNPTVBMRVRFRCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShpc1Jlc2V0OmJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGlzUmVzZXQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoaXNSZXNldDpib29sZWFuKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVzZXQgPSBpc1Jlc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY2xvY2s6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgZ2V0IGNsb2NrKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Nsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0IGNsb2NrKGNsb2NrOm51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSBjbG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzUmVzZXQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwcml2YXRlIF9pc0Rpc3Bvc2VkOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHJpdmF0ZSBfdGltZXJNYXA6d2RDYi5IYXNoPEZ1bmN0aW9uPiA9IHdkQ2IuSGFzaC5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX3N0cmVhbU1hcDp3ZENiLkhhc2g8RnVuY3Rpb24+ID0gd2RDYi5IYXNoLmNyZWF0ZTxGdW5jdGlvbj4oKTtcbiAgICAgICAgcHJpdmF0ZSBfc3Vic2NyaWJlZFRpbWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfZGlzcG9zZWRUaW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOk1vY2tPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIHNldFN0cmVhbU1hcChvYnNlcnZlcjpJT2JzZXJ2ZXIsIG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgbWVzc2FnZXMuZm9yRWFjaCgocmVjb3JkOlJlY29yZCkgPT57XG4gICAgICAgICAgICAgICAgdmFyIGZ1bmMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZWNvcmQuYWN0aW9uVHlwZSl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5ORVhUOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQocmVjb3JkLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBBY3Rpb25UeXBlLkVSUk9SOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKHJlY29yZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT01QTEVURUQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gKCkgPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB3ZENiLkxvZy5lcnJvcih0cnVlLCB3ZENiLkxvZy5pbmZvLkZVTkNfVU5LTk9XKFwiYWN0aW9uVHlwZVwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9zdHJlYW1NYXAuYWRkQ2hpbGQoU3RyaW5nKHJlY29yZC50aW1lKSwgZnVuYyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXI6TW9ja09ic2VydmVyLCBpbml0aWFsOmFueSwgcmVjdXJzaXZlRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIC8vbWVzc2FnZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBuZXh0ID0gbnVsbCxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWQgPSBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICBuZXh0ID0gb2JzZXJ2ZXIubmV4dDtcbiAgICAgICAgICAgIGNvbXBsZXRlZCA9IG9ic2VydmVyLmNvbXBsZXRlZDtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIG5leHQuY2FsbChvYnNlcnZlciwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3RpY2soMSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVkLmNhbGwob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3RpY2soMSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZWN1cnNpdmVGdW5jKGluaXRpYWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCBpbnRlcnZhbDpudW1iZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgd2hpbGUgKENPVU5UID4gMCAmJiAhdGhpcy5faXNEaXNwb3NlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RpY2soaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5uZXh0KHRoaXMuX2Nsb2NrLCBpbml0aWFsKSk7XG5cbiAgICAgICAgICAgICAgICAvL25vIG5lZWQgdG8gaW52b2tlIGFjdGlvblxuICAgICAgICAgICAgICAgIC8vYWN0aW9uKGluaXRpYWwpO1xuXG4gICAgICAgICAgICAgICAgaW5pdGlhbCsrO1xuICAgICAgICAgICAgICAgIENPVU5ULS07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuICAgICAgICAgICAgLy90aGlzLnNldFN0cmVhbU1hcCh0aGlzLl9vYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0KG9ic2VydmVyOklPYnNlcnZlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICAvL3Byb2R1Y2UgMTAgdmFsIGZvciB0ZXN0XG4gICAgICAgICAgICB2YXIgQ09VTlQgPSAxMCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGludGVydmFsID0gMTAwLFxuICAgICAgICAgICAgICAgIG51bSA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHdoaWxlIChDT1VOVCA+IDAgJiYgIXRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aWNrKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dCh0aGlzLl9jbG9jaywgbnVtKSk7XG5cbiAgICAgICAgICAgICAgICBudW0rKztcbiAgICAgICAgICAgICAgICBDT1VOVC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcbiAgICAgICAgICAgIC8vdGhpcy5zZXRTdHJlYW1NYXAodGhpcy5fb2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaFRpbWVvdXQob2JzZXJ2ZXI6SU9ic2VydmVyLCB0aW1lOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgdGhpcy5fdGljayh0aW1lKTtcblxuICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIHRpbWUpLCBUZXN0U2NoZWR1bGVyLmNvbXBsZXRlZCh0aGlzLl9jbG9jayArIDEpKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXRDbG9jaygpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNSZXNldCl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aGlzLl9zdWJzY3JpYmVkVGltZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydFdpdGhUaW1lKGNyZWF0ZTpGdW5jdGlvbiwgc3Vic2NyaWJlZFRpbWU6bnVtYmVyLCBkaXNwb3NlZFRpbWU6bnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXIgPSB0aGlzLmNyZWF0ZU9ic2VydmVyKCksXG4gICAgICAgICAgICAgICAgc291cmNlLCBzdWJzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuX3N1YnNjcmliZWRUaW1lID0gc3Vic2NyaWJlZFRpbWU7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlZFRpbWUgPSBkaXNwb3NlZFRpbWU7XG5cbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gc3Vic2NyaWJlZFRpbWU7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KHN1YnNjcmliZWRUaW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc291cmNlID0gY3JlYXRlKCk7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uID0gc291cmNlLnN1YnNjcmliZShvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fcnVuQXQoZGlzcG9zZWRUaW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydFdpdGhTdWJzY3JpYmUoY3JlYXRlLCBzdWJzY3JpYmVkVGltZSA9IFNVQlNDUklCRV9USU1FKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydFdpdGhUaW1lKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUsIERJU1BPU0VfVElNRSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoRGlzcG9zZShjcmVhdGUsIGRpc3Bvc2VkVGltZSA9IERJU1BPU0VfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIFNVQlNDUklCRV9USU1FLCBkaXNwb3NlZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1YmxpY0Fic29sdXRlKHRpbWUsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KHRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpIHtcbiAgICAgICAgICAgIHZhciBleHRyZW1lTnVtQXJyID0gdGhpcy5fZ2V0TWluQW5kTWF4VGltZSgpLFxuICAgICAgICAgICAgICAgIG1pbiA9IGV4dHJlbWVOdW1BcnJbMF0sXG4gICAgICAgICAgICAgICAgbWF4ID0gZXh0cmVtZU51bUFyclsxXSxcbiAgICAgICAgICAgICAgICB0aW1lID0gbWluO1xuXG4gICAgICAgICAgICAvL3RvZG8gcmVkdWNlIGxvb3AgdGltZVxuICAgICAgICAgICAgd2hpbGUgKHRpbWUgPD0gbWF4KSB7XG4gICAgICAgICAgICAgICAgLy9pZih0aGlzLl9pc0Rpc3Bvc2VkKXtcbiAgICAgICAgICAgICAgICAvLyAgICBicmVhaztcbiAgICAgICAgICAgICAgICAvL31cblxuICAgICAgICAgICAgICAgIC8vYmVjYXVzZSBcIl9leGVjLF9ydW5TdHJlYW1cIiBtYXkgY2hhbmdlIFwiX2Nsb2NrXCIsXG4gICAgICAgICAgICAgICAgLy9zbyBpdCBzaG91bGQgcmVzZXQgdGhlIF9jbG9ja1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aW1lO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fZXhlYyh0aW1lLCB0aGlzLl90aW1lck1hcCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9jayA9IHRpbWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ydW5TdHJlYW0odGltZSk7XG5cbiAgICAgICAgICAgICAgICB0aW1lKys7XG5cbiAgICAgICAgICAgICAgICAvL3RvZG8gZ2V0IG1heCB0aW1lIG9ubHkgZnJvbSBzdHJlYW1NYXA/XG4gICAgICAgICAgICAgICAgLy9uZWVkIHJlZnJlc2ggbWF4IHRpbWUuXG4gICAgICAgICAgICAgICAgLy9iZWNhdXNlIGlmIHRpbWVyTWFwIGhhcyBjYWxsYmFjayB0aGF0IGNyZWF0ZSBpbmZpbml0ZSBzdHJlYW0oYXMgaW50ZXJ2YWwpLFxuICAgICAgICAgICAgICAgIC8vaXQgd2lsbCBzZXQgc3RyZWFtTWFwIHNvIHRoYXQgdGhlIG1heCB0aW1lIHdpbGwgY2hhbmdlXG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5fZ2V0TWluQW5kTWF4VGltZSgpWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVN0cmVhbShhcmdzKXtcbiAgICAgICAgICAgIHJldHVybiBUZXN0U3RyZWFtLmNyZWF0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVPYnNlcnZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBNb2NrT2JzZXJ2ZXIuY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVJlc29sdmVkUHJvbWlzZSh0aW1lOm51bWJlciwgdmFsdWU6YW55KXtcbiAgICAgICAgICAgIHJldHVybiBNb2NrUHJvbWlzZS5jcmVhdGUodGhpcywgW1Rlc3RTY2hlZHVsZXIubmV4dCh0aW1lLCB2YWx1ZSksIFRlc3RTY2hlZHVsZXIuY29tcGxldGVkKHRpbWUrMSldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVSZWplY3RQcm9taXNlKHRpbWU6bnVtYmVyLCBlcnJvcjphbnkpe1xuICAgICAgICAgICAgcmV0dXJuIE1vY2tQcm9taXNlLmNyZWF0ZSh0aGlzLCBbVGVzdFNjaGVkdWxlci5lcnJvcih0aW1lLCBlcnJvcildKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2dldE1pbkFuZE1heFRpbWUoKXtcbiAgICAgICAgICAgIHZhciB0aW1lQXJyOmFueSA9ICh0aGlzLl90aW1lck1hcC5nZXRLZXlzKCkuYWRkQ2hpbGRyZW4odGhpcy5fc3RyZWFtTWFwLmdldEtleXMoKSkpO1xuXG4gICAgICAgICAgICAgICAgdGltZUFyciA9IHRpbWVBcnIubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlcihrZXkpO1xuICAgICAgICAgICAgICAgIH0pLnRvQXJyYXkoKTtcblxuICAgICAgICAgICAgcmV0dXJuIFtNYXRoLm1pbi5hcHBseShNYXRoLCB0aW1lQXJyKSwgTWF0aC5tYXguYXBwbHkoTWF0aCwgdGltZUFycildO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZXhlYyh0aW1lLCBtYXApe1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBtYXAuZ2V0Q2hpbGQoU3RyaW5nKHRpbWUpKTtcblxuICAgICAgICAgICAgaWYoaGFuZGxlcil7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcnVuU3RyZWFtKHRpbWUpe1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9zdHJlYW1NYXAuZ2V0Q2hpbGQoU3RyaW5nKHRpbWUpKTtcblxuICAgICAgICAgICAgaWYoaGFuZGxlcil7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcnVuQXQodGltZTpudW1iZXIsIGNhbGxiYWNrOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lck1hcC5hZGRDaGlsZChTdHJpbmcodGltZSksIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3RpY2sodGltZTpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrICs9IHRpbWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgZW51bSBBY3Rpb25UeXBle1xuICAgICAgICBORVhULFxuICAgICAgICBFUlJPUixcbiAgICAgICAgQ09NUExFVEVEXG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgVGVzdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW0ge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShtZXNzYWdlczpbUmVjb3JkXSwgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhtZXNzYWdlcywgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihtZXNzYWdlczpbUmVjb3JkXSwgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgc2NoZWR1bGVyID0gPFRlc3RTY2hlZHVsZXI+KHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCB0aGlzLl9tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19
