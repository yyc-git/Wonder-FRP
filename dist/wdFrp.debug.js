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
        JudgeUtils.isIObserver = function (i) {
            return i.next && i.error && i.completed;
        };
        return JudgeUtils;
    })(wdCb.JudgeUtils);
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
    var Main = (function () {
        function Main() {
        }
        Main.isTest = false;
        return Main;
    })();
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
    })(wdFrp.Entity);
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
    })(wdFrp.Entity);
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
    if (wdFrp.JudgeUtils.isNodeJs()) {
        wdFrp.root = global;
    }
    else {
        wdFrp.root = window;
    }
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var wdFrp;
(function (wdFrp) {
    var Log = wdCb.Log;
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
    })(wdFrp.Entity);
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
    })();
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
    })(wdFrp.Entity);
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
    })(wdFrp.Observer);
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
    })(wdFrp.Observer);
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
    })(wdFrp.Observer);
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
    })(wdFrp.Observer);
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
    })(wdFrp.Observer);
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
    })(wdFrp.Observer);
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
    })(wdFrp.Observer);
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
    })(wdFrp.Observer);
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
    })(wdFrp.FilterObserver);
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
    })(wdFrp.Stream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.Stream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.BaseStream);
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
    })(wdFrp.FilterStream);
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
    })();
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
            this._scheduler.setStreamMap(observer, this._messages);
        };
        return MockPromise;
    })();
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
    })(wdFrp.BaseStream);
    wdFrp.TestStream = TestStream;
})(wdFrp || (wdFrp = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkp1ZGdlVXRpbHMudHMiLCJiaW5kaW5nL25vZGVqcy9Ob2RlT3BlcmF0b3IudHMiLCJjb3JlL0VudGl0eS50cyIsImNvcmUvTWFpbi50cyIsImRlZmluaXRpb24vdHlwZXNjcmlwdC9kZWNvcmF0b3IvY29udHJhY3QudHMiLCJkaXNwb3NhYmxlL1NpbmdsZURpc3Bvc2FibGUudHMiLCJkaXNwb3NhYmxlL0dyb3VwRGlzcG9zYWJsZS50cyIsImRpc3Bvc2FibGUvSW5uZXJTdWJzY3JpcHRpb24udHMiLCJkaXNwb3NhYmxlL0lubmVyU3Vic2NyaXB0aW9uR3JvdXAudHMiLCJnbG9iYWwvVmFyaWFibGUudHMiLCJnbG9iYWwvQ29uc3QudHMiLCJnbG9iYWwvaW5pdC50cyIsImV4dGVuZC9yb290LnRzIiwiY29yZS9TdHJlYW0udHMiLCJjb3JlL1NjaGVkdWxlci50cyIsImNvcmUvT2JzZXJ2ZXIudHMiLCJzdWJqZWN0L1N1YmplY3QudHMiLCJzdWJqZWN0L0dlbmVyYXRvclN1YmplY3QudHMiLCJvYnNlcnZlci9Bbm9ueW1vdXNPYnNlcnZlci50cyIsIm9ic2VydmVyL0F1dG9EZXRhY2hPYnNlcnZlci50cyIsIm9ic2VydmVyL01hcE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvRG9PYnNlcnZlci50cyIsIm9ic2VydmVyL01lcmdlQWxsT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9NZXJnZU9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvVGFrZVVudGlsT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9Db25jYXRPYnNlcnZlci50cyIsIm9ic2VydmVyL1N1YmplY3RPYnNlcnZlci50cyIsIm9ic2VydmVyL0lnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9GaWx0ZXJPYnNlcnZlci50cyIsIm9ic2VydmVyL0ZpbHRlcldpdGhTdGF0ZU9ic2VydmVyLnRzIiwic3RyZWFtL0Jhc2VTdHJlYW0udHMiLCJzdHJlYW0vRG9TdHJlYW0udHMiLCJzdHJlYW0vTWFwU3RyZWFtLnRzIiwic3RyZWFtL0Zyb21BcnJheVN0cmVhbS50cyIsInN0cmVhbS9Gcm9tUHJvbWlzZVN0cmVhbS50cyIsInN0cmVhbS9Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLnRzIiwic3RyZWFtL0Fub255bW91c1N0cmVhbS50cyIsInN0cmVhbS9JbnRlcnZhbFN0cmVhbS50cyIsInN0cmVhbS9JbnRlcnZhbFJlcXVlc3RTdHJlYW0udHMiLCJzdHJlYW0vVGltZW91dFN0cmVhbS50cyIsInN0cmVhbS9NZXJnZUFsbFN0cmVhbS50cyIsInN0cmVhbS9NZXJnZVN0cmVhbS50cyIsInN0cmVhbS9UYWtlVW50aWxTdHJlYW0udHMiLCJzdHJlYW0vQ29uY2F0U3RyZWFtLnRzIiwic3RyZWFtL1JlcGVhdFN0cmVhbS50cyIsInN0cmVhbS9JZ25vcmVFbGVtZW50c1N0cmVhbS50cyIsInN0cmVhbS9EZWZlclN0cmVhbS50cyIsInN0cmVhbS9GaWx0ZXJTdHJlYW0udHMiLCJzdHJlYW0vRmlsdGVyV2l0aFN0YXRlU3RyZWFtLnRzIiwiZ2xvYmFsL09wZXJhdG9yLnRzIiwiZW51bS9GaWx0ZXJTdGF0ZS50cyIsInRlc3RpbmcvUmVjb3JkLnRzIiwidGVzdGluZy9Nb2NrT2JzZXJ2ZXIudHMiLCJ0ZXN0aW5nL01vY2tQcm9taXNlLnRzIiwidGVzdGluZy9UZXN0U2NoZWR1bGVyLnRzIiwidGVzdGluZy9BY3Rpb25UeXBlLnRzIiwidGVzdGluZy9UZXN0U3RyZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsSUFBTyxLQUFLLENBZ0JYO0FBaEJELFdBQU8sS0FBSyxFQUFDLENBQUM7SUFDVjtRQUFnQyw4QkFBZTtRQUEvQztZQUFnQyw4QkFBZTtRQWMvQyxDQUFDO1FBYmlCLG9CQUFTLEdBQXZCLFVBQXdCLEdBQUc7WUFDdkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHO21CQUNMLENBQUMsTUFBSyxDQUFDLFVBQVUsWUFBQyxHQUFHLENBQUMsU0FBUyxDQUFDO21CQUNoQyxNQUFLLENBQUMsVUFB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USxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXhDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDZixDQUFDO1FBWU0sa0NBQWEsR0FBcEIsVUFBcUIsUUFBa0I7WUFHbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV0RCxNQUFNLENBQUMsc0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUNMLGlCQUFDO0lBQUQsQ0F4QkEsQUF3QkMsRUF4QitCLGdCQUFVLEVBd0J6QztJQXhCWSxnQkFBVSxhQXdCdEIsQ0FBQTtBQUNMLENBQUMsRUExQk0sS0FBSyxLQUFMLEtBQUssUUEwQlgiLCJmaWxlIjoid2RGcnAuZGVidWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBKdWRnZVV0aWxzIGV4dGVuZHMgd2RDYi5KdWRnZVV0aWxzIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBpc1Byb21pc2Uob2JqKXtcbiAgICAgICAgICAgIHJldHVybiAhIW9ialxuICAgICAgICAgICAgICAgICYmICFzdXBlci5pc0Z1bmN0aW9uKG9iai5zdWJzY3JpYmUpXG4gICAgICAgICAgICAgICAgJiYgc3VwZXIuaXNGdW5jdGlvbihvYmoudGhlbik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGlzRXF1YWwob2IxOkVudGl0eSwgb2IyOkVudGl0eSl7XG4gICAgICAgICAgICByZXR1cm4gb2IxLnVpZCA9PT0gb2IyLnVpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNJT2JzZXJ2ZXIoaTpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIGkubmV4dCAmJiBpLmVycm9yICYmIGkuY29tcGxldGVkO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgdmFyIGZyb21Ob2RlQ2FsbGJhY2sgPSAoZnVuYzpGdW5jdGlvbiwgY29udGV4dD86YW55KSA9PiB7XG4gICAgICAgIHJldHVybiAoLi4uZnVuY0FyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBoYW5kZXIgPSAoZXJyLCAuLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dC5hcHBseShvYnNlcnZlciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGZ1bmNBcmdzLnB1c2goaGFuZGVyKTtcbiAgICAgICAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGZ1bmNBcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVN0cmVhbSA9IChzdHJlYW06YW55LCBmaW5pc2hFdmVudE5hbWU6c3RyaW5nID0gXCJlbmRcIikgPT4ge1xuICAgICAgICBzdHJlYW0ucGF1c2UoKTtcblxuICAgICAgICByZXR1cm4gd2RGcnAuY3JlYXRlU3RyZWFtKChvYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgdmFyIGRhdGFIYW5kbGVyID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChkYXRhKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9ySGFuZGxlciA9IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVuZEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0cmVhbS5hZGRMaXN0ZW5lcihcImRhdGFcIiwgZGF0YUhhbmRsZXIpO1xuICAgICAgICAgICAgc3RyZWFtLmFkZExpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JIYW5kbGVyKTtcbiAgICAgICAgICAgIHN0cmVhbS5hZGRMaXN0ZW5lcihmaW5pc2hFdmVudE5hbWUsIGVuZEhhbmRsZXIpO1xuXG4gICAgICAgICAgICBzdHJlYW0ucmVzdW1lKCk7XG5cbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlbW92ZUxpc3RlbmVyKFwiZGF0YVwiLCBkYXRhSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlbW92ZUxpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICBzdHJlYW0ucmVtb3ZlTGlzdGVuZXIoZmluaXNoRXZlbnROYW1lLCBlbmRIYW5kbGVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21SZWFkYWJsZVN0cmVhbSA9IChzdHJlYW06YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyZWFtKHN0cmVhbSwgXCJlbmRcIik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVdyaXRhYmxlU3RyZWFtID0gKHN0cmVhbTphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGZyb21TdHJlYW0oc3RyZWFtLCBcImZpbmlzaFwiKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tVHJhbnNmb3JtU3RyZWFtID0gKHN0cmVhbTphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGZyb21TdHJlYW0oc3RyZWFtLCBcImZpbmlzaFwiKTtcbiAgICB9O1xufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVudGl0eXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBVSUQ6bnVtYmVyID0gMTtcblxuICAgICAgICBwcml2YXRlIF91aWQ6c3RyaW5nID0gbnVsbDtcbiAgICAgICAgZ2V0IHVpZCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3VpZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdWlkKHVpZDpzdHJpbmcpe1xuICAgICAgICAgICAgdGhpcy5fdWlkID0gdWlkO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IodWlkUHJlOnN0cmluZyl7XG4gICAgICAgICAgICB0aGlzLl91aWQgPSB1aWRQcmUgKyBTdHJpbmcoRW50aXR5LlVJRCsrKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTWFpbntcbiAgICAgICAgcHVibGljIHN0YXRpYyBpc1Rlc3Q6Ym9vbGVhbiA9IGZhbHNlO1xuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGltcG9ydCBMb2cgPSB3ZENiLkxvZztcblxuICAgIGV4cG9ydCBmdW5jdGlvbiBhc3NlcnQoY29uZDpib29sZWFuLCBtZXNzYWdlOnN0cmluZz1cImNvbnRyYWN0IGVycm9yXCIpe1xuICAgICAgICBMb2cuZXJyb3IoIWNvbmQsIG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiByZXF1aXJlKEluRnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uKC4uLmFyZ3Mpe1xuICAgICAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KXtcbiAgICAgICAgICAgICAgICAgICAgSW5GdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZShPdXRGdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBkZXNjcmlwdG9yLnZhbHVlO1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLnZhbHVlID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdmFsdWUuYXBwbHkodGhpcywgYXJncyksXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcyA9IFtyZXN1bHRdLmNvbmNhdChhcmdzKTtcblxuICAgICAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIE91dEZ1bmMuYXBwbHkodGhpcywgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcmVxdWlyZUdldHRlcihJbkZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciBnZXR0ZXIgPSBkZXNjcmlwdG9yLmdldDtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci5nZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIEluRnVuYy5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBnZXR0ZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVTZXR0ZXIoSW5GdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICB2YXIgc2V0dGVyID0gZGVzY3JpcHRvci5zZXQ7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3Iuc2V0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBJbkZ1bmMuY2FsbCh0aGlzLCB2YWwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNldHRlci5jYWxsKHRoaXMsIHZhbCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlbnN1cmVHZXR0ZXIoT3V0RnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIGdldHRlciA9IGRlc2NyaXB0b3IuZ2V0O1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLmdldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBnZXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KXtcbiAgICAgICAgICAgICAgICAgICAgT3V0RnVuYy5jYWxsKHRoaXMsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVNldHRlcihPdXRGdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICB2YXIgc2V0dGVyID0gZGVzY3JpcHRvci5zZXQ7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3Iuc2V0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHNldHRlci5jYWxsKHRoaXMsIHZhbCksXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcyA9IFtyZXN1bHQsIHZhbF07XG5cbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIE91dEZ1bmMuYXBwbHkodGhpcywgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBpbnZhcmlhbnQoZnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3QpIHtcbiAgICAgICAgICAgICAgICBmdW5jKHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFNpbmdsZURpc3Bvc2FibGUgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoZGlzcG9zZUhhbmRsZXI6RnVuY3Rpb24gPSBmdW5jdGlvbigpe30pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMoZGlzcG9zZUhhbmRsZXIpO1xuXG4gICAgICAgIFx0cmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihkaXNwb3NlSGFuZGxlcjpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihcIlNpbmdsZURpc3Bvc2FibGVcIik7XG5cbiAgICAgICAgXHR0aGlzLl9kaXNwb3NlSGFuZGxlciA9IGRpc3Bvc2VIYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2VIYW5kbGVyKGhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIgPSBoYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEdyb3VwRGlzcG9zYWJsZSBleHRlbmRzIEVudGl0eSBpbXBsZW1lbnRzIElEaXNwb3NhYmxle1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShkaXNwb3NhYmxlPzpJRGlzcG9zYWJsZSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGRpc3Bvc2FibGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZ3JvdXA6d2RDYi5Db2xsZWN0aW9uPElEaXNwb3NhYmxlPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8SURpc3Bvc2FibGU+KCk7XG5cbiAgICAgICAgY29uc3RydWN0b3IoZGlzcG9zYWJsZT86SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgc3VwZXIoXCJHcm91cERpc3Bvc2FibGVcIik7XG5cbiAgICAgICAgICAgIGlmKGRpc3Bvc2FibGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2dyb3VwLmFkZENoaWxkKGRpc3Bvc2FibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFkZChkaXNwb3NhYmxlOklEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHRoaXMuX2dyb3VwLmFkZENoaWxkKGRpc3Bvc2FibGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLl9ncm91cC5yZW1vdmVDaGlsZChkaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXAuZm9yRWFjaCgoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuXHRleHBvcnQgY2xhc3MgSW5uZXJTdWJzY3JpcHRpb24gaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJqZWN0OlN1YmplY3R8R2VuZXJhdG9yU3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcyhzdWJqZWN0LCBvYnNlcnZlcik7XG5cblx0XHRcdHJldHVybiBvYmo7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfc3ViamVjdDpTdWJqZWN0fEdlbmVyYXRvclN1YmplY3QgPSBudWxsO1xuXHRcdHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuXHRcdGNvbnN0cnVjdG9yKHN1YmplY3Q6U3ViamVjdHxHZW5lcmF0b3JTdWJqZWN0LCBvYnNlcnZlcjpPYnNlcnZlcil7XG5cdFx0XHR0aGlzLl9zdWJqZWN0ID0gc3ViamVjdDtcblx0XHRcdHRoaXMuX29ic2VydmVyID0gb2JzZXJ2ZXI7XG5cdFx0fVxuXG5cdFx0cHVibGljIGRpc3Bvc2UoKXtcblx0XHRcdHRoaXMuX3N1YmplY3QucmVtb3ZlKHRoaXMuX29ic2VydmVyKTtcblxuXHRcdFx0dGhpcy5fb2JzZXJ2ZXIuZGlzcG9zZSgpO1xuXHRcdH1cblx0fVxufVxuIiwibW9kdWxlIHdkRnJwe1xuXHRleHBvcnQgY2xhc3MgSW5uZXJTdWJzY3JpcHRpb25Hcm91cCBpbXBsZW1lbnRzIElEaXNwb3NhYmxle1xuXHRcdHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuXHRcdFx0dmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cblx0XHRcdHJldHVybiBvYmo7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfY29udGFpbmVyOndkQ2IuQ29sbGVjdGlvbjxJRGlzcG9zYWJsZT4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPElEaXNwb3NhYmxlPigpO1xuXG5cdFx0cHVibGljIGFkZENoaWxkKGNoaWxkOklEaXNwb3NhYmxlKXtcblx0XHRcdHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChjaGlsZCk7XG5cdFx0fVxuXG5cdFx0cHVibGljIGRpc3Bvc2UoKXtcblx0XHRcdHRoaXMuX2NvbnRhaW5lci5mb3JFYWNoKChjaGlsZDpJRGlzcG9zYWJsZSkgPT4ge1xuXHRcdFx0XHRjaGlsZC5kaXNwb3NlKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn1cbiIsImRlY2xhcmUgdmFyIGdsb2JhbDphbnksd2luZG93OldpbmRvdztcblxubW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCB2YXIgcm9vdDphbnk7XG5cbiAgICBpZihKdWRnZVV0aWxzLmlzTm9kZUpzKCkpe1xuICAgICAgICByb290ID0gZ2xvYmFsO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgICByb290ID0gd2luZG93O1xuICAgIH1cbn1cblxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNvbnN0IEFCU1RSQUNUX0FUVFJJQlVURTphbnkgPSBudWxsO1xufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgLy9yc3ZwLmpzXG4gICAgLy9kZWNsYXJlIHZhciBSU1ZQOmFueTtcblxuICAgIC8vbm90IHN3YWxsb3cgdGhlIGVycm9yXG4gICAgaWYocm9vdC5SU1ZQKXtcbiAgICAgICAgcm9vdC5SU1ZQLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9O1xuICAgICAgICByb290LlJTVlAub24oJ2Vycm9yJywgcm9vdC5SU1ZQLm9uZXJyb3IpO1xuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICB3cmFwcGVyID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgY2FsbGJhY2sgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBnZWNrb1ZlcnNpb24gPSBudWxsLFxuICAgICAgICAgICAgdXNlckFnZW50ID0gcm9vdC5uYXZpZ2F0b3IgJiYgcm9vdC5uYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgd3JhcHBlciA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gICAgICAgICAgICB0aW1lID0gcm9vdC5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIHNlbGYuY2FsbGJhY2sodGltZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyohXG4gICAgICAgICBidWchXG4gICAgICAgICBiZWxvdyBjb2RlOlxuICAgICAgICAgd2hlbiBpbnZva2UgYiBhZnRlciAxcywgd2lsbCBvbmx5IGludm9rZSBiLCBub3QgaW52b2tlIGEhXG5cbiAgICAgICAgIGZ1bmN0aW9uIGEodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImFcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGZ1bmN0aW9uIGIodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImJcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYik7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGEoKTtcblxuICAgICAgICAgc2V0VGltZW91dChiLCAxMDAwKTtcblxuXG5cbiAgICAgICAgIHNvIHVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcHJpb3JpdHkhXG4gICAgICAgICAqL1xuICAgICAgICBpZiAocm9vdC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIFdvcmthcm91bmQgZm9yIENocm9tZSAxMCBidWcgd2hlcmUgQ2hyb21lXG4gICAgICAgIC8vIGRvZXMgbm90IHBhc3MgdGhlIHRpbWUgdG8gdGhlIGFuaW1hdGlvbiBmdW5jdGlvblxuXG4gICAgICAgIGlmIChyb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgLy8gRGVmaW5lIHRoZSB3cmFwcGVyXG5cbiAgICAgICAgICAgIC8vIE1ha2UgdGhlIHN3aXRjaFxuXG4gICAgICAgICAgICBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgICAgICAgICByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHNlbGYuY2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgICAgICAgICAgIC8vIEJyb3dzZXIgY2FsbHMgdGhlIHdyYXBwZXIgYW5kIHdyYXBwZXIgY2FsbHMgdGhlIGNhbGxiYWNrXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUod3JhcHBlciwgZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+S/ruaUuXRpbWXlj4LmlbBcbiAgICAgICAgaWYgKHJvb3QubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuICAgICAgICAgICAgcm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHNlbGYuY2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSh3cmFwcGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdvcmthcm91bmQgZm9yIEdlY2tvIDIuMCwgd2hpY2ggaGFzIGEgYnVnIGluXG4gICAgICAgIC8vIG1velJlcXVlc3RBbmltYXRpb25GcmFtZSgpIHRoYXQgcmVzdHJpY3RzIGFuaW1hdGlvbnNcbiAgICAgICAgLy8gdG8gMzAtNDAgZnBzLlxuXG4gICAgICAgIGlmIChyb290Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIEdlY2tvIHZlcnNpb24uIEdlY2tvIGlzIHVzZWQgYnkgYnJvd3NlcnNcbiAgICAgICAgICAgIC8vIG90aGVyIHRoYW4gRmlyZWZveC4gR2Vja28gMi4wIGNvcnJlc3BvbmRzIHRvXG4gICAgICAgICAgICAvLyBGaXJlZm94IDQuMC5cblxuICAgICAgICAgICAgaW5kZXggPSB1c2VyQWdlbnQuaW5kZXhPZigncnY6Jyk7XG5cbiAgICAgICAgICAgIGlmICh1c2VyQWdlbnQuaW5kZXhPZignR2Vja28nKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgIGdlY2tvVmVyc2lvbiA9IHVzZXJBZ2VudC5zdWJzdHIoaW5kZXggKyAzLCAzKTtcblxuICAgICAgICAgICAgICAgIGlmIChnZWNrb1ZlcnNpb24gPT09ICcyLjAnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZvcmNlcyB0aGUgcmV0dXJuIHN0YXRlbWVudCB0byBmYWxsIHRocm91Z2hcbiAgICAgICAgICAgICAgICAgICAgLy8gdG8gdGhlIHNldFRpbWVvdXQoKSBmdW5jdGlvbi5cblxuICAgICAgICAgICAgICAgICAgICByb290Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICByb290Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHJvb3QubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcblxuICAgICAgICAgICAgZnVuY3Rpb24gKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBmaW5pc2g7XG5cbiAgICAgICAgICAgICAgICByb290LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IHJvb3QucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoID0gcm9vdC5wZXJmb3JtYW5jZS5ub3coKTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLnRpbWVvdXQgPSAxMDAwIC8gNjAgLSAoZmluaXNoIC0gc3RhcnQpO1xuXG4gICAgICAgICAgICAgICAgfSwgc2VsZi50aW1lb3V0KTtcbiAgICAgICAgICAgIH07XG4gICAgfSgpKTtcblxuICAgIHJvb3QuY2FuY2VsTmV4dFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJvb3QuY2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3Qud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC53ZWJraXRDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC5tb3pDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC5vQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHx8IHJvb3QubXNDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgY2xlYXJUaW1lb3V0O1xufTtcbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBpbXBvcnQgTG9nID0gd2RDYi5Mb2c7XG5cbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RyZWFtIGV4dGVuZHMgRW50aXR5e1xuICAgICAgICBwdWJsaWMgc2NoZWR1bGVyOlNjaGVkdWxlciA9IEFCU1RSQUNUX0FUVFJJQlVURTtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZUZ1bmM6KG9ic2VydmVyOklPYnNlcnZlcikgPT4gRnVuY3Rpb258dm9pZCA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc3Vic2NyaWJlRnVuYyl7XG4gICAgICAgICAgICBzdXBlcihcIlN0cmVhbVwiKTtcblxuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVGdW5jID0gc3Vic2NyaWJlRnVuYyB8fCBmdW5jdGlvbigpeyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFic3RyYWN0IHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKDxGdW5jdGlvbj4odGhpcy5zdWJzY3JpYmVGdW5jKG9ic2VydmVyKSB8fCBmdW5jdGlvbigpe30pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkbyhvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gRG9TdHJlYW0uY3JlYXRlKHRoaXMsIG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1hcChzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIE1hcFN0cmVhbS5jcmVhdGUodGhpcywgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGZsYXRNYXAoc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFwKHNlbGVjdG9yKS5tZXJnZUFsbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbmNhdE1hcChzZWxlY3RvcjpGdW5jdGlvbil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXAoc2VsZWN0b3IpLmNvbmNhdEFsbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlQWxsKCl7XG4gICAgICAgICAgICByZXR1cm4gTWVyZ2VBbGxTdHJlYW0uY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbmNhdEFsbCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWVyZ2UoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdGFrZVVudGlsKG90aGVyU3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICByZXR1cm4gVGFrZVVudGlsU3RyZWFtLmNyZWF0ZSh0aGlzLCBvdGhlclN0cmVhbSk7XG4gICAgICAgIH1cblxuICAgICAgICBAcmVxdWlyZShmdW5jdGlvbihjb3VudDpudW1iZXIgPSAxKXtcbiAgICAgICAgICAgIGFzc2VydChjb3VudCA+PSAwLCBMb2cuaW5mby5GVU5DX1NIT1VMRChcImNvdW50XCIsIFwiPj0gMFwiKSk7XG4gICAgICAgIH0pXG4gICAgICAgIHB1YmxpYyB0YWtlKGNvdW50Om51bWJlciA9IDEpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZihjb3VudCA9PT0gMCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVtcHR5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlKCh2YWx1ZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoY291bnQgPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY291bnQtLTtcblxuICAgICAgICAgICAgICAgICAgICBpZihjb3VudCA8PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgKGU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKGNvdW50Om51bWJlciA9IDEpe1xuICAgICAgICAgICAgYXNzZXJ0KGNvdW50ID49IDAsIExvZy5pbmZvLkZVTkNfU0hPVUxEKFwiY291bnRcIiwgXCI+PSAwXCIpKTtcbiAgICAgICAgfSlcbiAgICAgICAgcHVibGljIHRha2VMYXN0KGNvdW50Om51bWJlciA9IDEpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZihjb3VudCA9PT0gMCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVtcHR5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUoKHZhbHVlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKHZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihxdWV1ZS5sZW5ndGggPiBjb3VudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgKGU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUocXVldWUubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHF1ZXVlLnNoaWZ0KCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0YWtlV2hpbGUocHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4Om51bWJlciwgc291cmNlOlN0cmVhbSk9PmJvb2xlYW4sIHRoaXNBcmcgPSB0aGlzKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBiaW5kUHJlZGljYXRlID0gbnVsbDtcblxuICAgICAgICAgICAgYmluZFByZWRpY2F0ZSA9IHdkQ2IuRnVuY3Rpb25VdGlscy5iaW5kKHRoaXNBcmcsIHByZWRpY2F0ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgaXNTdGFydCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUoKHZhbHVlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihiaW5kUHJlZGljYXRlKHZhbHVlLCBpKyssIHNlbGYpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXNTdGFydCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGxhc3RPckRlZmF1bHQoZGVmYXVsdFZhbHVlOmFueSA9IG51bGwpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgICAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlKCh2YWx1ZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYocXVldWUubGVuZ3RoID4gMSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgKGU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYocXVldWUubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUocXVldWUubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChxdWV1ZS5zaGlmdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmlsdGVyKHByZWRpY2F0ZToodmFsdWU6YW55KT0+Ym9vbGVhbiwgdGhpc0FyZyA9IHRoaXMpe1xuICAgICAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIEZpbHRlclN0cmVhbSl7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGY6YW55ID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsRmlsdGVyKHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJTdHJlYW0uY3JlYXRlKHRoaXMsIHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmlsdGVyV2l0aFN0YXRlKHByZWRpY2F0ZToodmFsdWU6YW55KT0+Ym9vbGVhbiwgdGhpc0FyZyA9IHRoaXMpe1xuICAgICAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIEZpbHRlclN0cmVhbSl7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGY6YW55ID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsRmlsdGVyKHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJXaXRoU3RhdGVTdHJlYW0uY3JlYXRlKHRoaXMsIHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29uY2F0KHN0cmVhbUFycjpBcnJheTxTdHJlYW0+KTtcbiAgICAgICAgcHVibGljIGNvbmNhdCguLi5vdGhlclN0cmVhbSk7XG5cbiAgICAgICAgcHVibGljIGNvbmNhdCgpe1xuICAgICAgICAgICAgdmFyIGFyZ3M6QXJyYXk8U3RyZWFtPiA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNBcnJheShhcmd1bWVudHNbMF0pKXtcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gQ29uY2F0U3RyZWFtLmNyZWF0ZShhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBtZXJnZShtYXhDb25jdXJyZW50Om51bWJlcik7XG4gICAgICAgIHB1YmxpYyBtZXJnZShzdHJlYW1BcnI6QXJyYXk8U3RyZWFtPik7XG4gICAgICAgIHB1YmxpYyBtZXJnZSguLi5vdGhlclN0cmVhbXMpO1xuXG4gICAgICAgIHB1YmxpYyBtZXJnZSguLi5hcmdzKXtcbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNOdW1iZXIoYXJnc1swXSkpe1xuICAgICAgICAgICAgICAgIHZhciBtYXhDb25jdXJyZW50Om51bWJlciA9IGFyZ3NbMF07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gTWVyZ2VTdHJlYW0uY3JlYXRlKHRoaXMsIG1heENvbmN1cnJlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzQXJyYXkoYXJnc1swXSkpe1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgc3RyZWFtOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcblxuICAgICAgICAgICAgc3RyZWFtID0gZnJvbUFycmF5KGFyZ3MpLm1lcmdlQWxsKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVwZWF0KGNvdW50Om51bWJlciA9IC0xKXtcbiAgICAgICAgICAgIHJldHVybiBSZXBlYXRTdHJlYW0uY3JlYXRlKHRoaXMsIGNvdW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpZ25vcmVFbGVtZW50cygpe1xuICAgICAgICAgICAgcmV0dXJuIElnbm9yZUVsZW1lbnRzU3RyZWFtLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBoYW5kbGVTdWJqZWN0KHN1YmplY3Q6YW55KXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzU3ViamVjdChzdWJqZWN0KSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0U3ViamVjdChzdWJqZWN0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdWJqZWN0KHN1YmplY3Q6U3ViamVjdCl7XG4gICAgICAgICAgICByZXR1cm4gc3ViamVjdCBpbnN0YW5jZW9mIFN1YmplY3Q7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXRTdWJqZWN0KHN1YmplY3Q6U3ViamVjdCl7XG4gICAgICAgICAgICBzdWJqZWN0LnNvdXJjZSA9IHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBTY2hlZHVsZXJ7XG4gICAgICAgIC8vdG9kbyByZW1vdmUgXCIuLi5hcmdzXCJcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9yZXF1ZXN0TG9vcElkOmFueSA9IG51bGw7XG4gICAgICAgIGdldCByZXF1ZXN0TG9vcElkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgcmVxdWVzdExvb3BJZChyZXF1ZXN0TG9vcElkOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0TG9vcElkID0gcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcGFyYW0gb2JzZXJ2ZXIgaXMgdXNlZCBieSBUZXN0U2NoZWR1bGVyIHRvIHJld3JpdGVcblxuICAgICAgICBwdWJsaWMgcHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCBhY3Rpb246RnVuY3Rpb24pe1xuICAgICAgICAgICAgYWN0aW9uKGluaXRpYWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCBpbnRlcnZhbDpudW1iZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgcmV0dXJuIHJvb3Quc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGluaXRpYWwgPSBhY3Rpb24oaW5pdGlhbCk7XG4gICAgICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbG9vcCA9ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpc0VuZCA9IGFjdGlvbih0aW1lKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihpc0VuZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZXF1ZXN0TG9vcElkID0gcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RMb29wSWQgPSByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaFRpbWVvdXQob2JzZXJ2ZXI6SU9ic2VydmVyLCB0aW1lOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhY3Rpb24odGltZSk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9LCB0aW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIE9ic2VydmVyIGV4dGVuZHMgRW50aXR5IGltcGxlbWVudHMgSU9ic2VydmVye1xuICAgICAgICBwcml2YXRlIF9pc0Rpc3Bvc2VkOmJvb2xlYW4gPSBudWxsO1xuICAgICAgICBnZXQgaXNEaXNwb3NlZCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzRGlzcG9zZWQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGlzRGlzcG9zZWQoaXNEaXNwb3NlZDpib29sZWFuKXtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSBpc0Rpc3Bvc2VkO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uVXNlck5leHQ6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyRXJyb3I6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyQ29tcGxldGVkOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIF9pc1N0b3A6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAvL3ByaXZhdGUgX2Rpc3Bvc2VIYW5kbGVyOndkQ2IuQ29sbGVjdGlvbjxGdW5jdGlvbj4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIF9kaXNwb3NhYmxlOklEaXNwb3NhYmxlID0gbnVsbDtcblxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG9ic2VydmVyOklPYnNlcnZlcik7XG4gICAgICAgIGNvbnN0cnVjdG9yKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIHN1cGVyKFwiT2JzZXJ2ZXJcIik7XG5cbiAgICAgICAgICAgIGlmKGFyZ3MubGVuZ3RoID09PSAxKXtcbiAgICAgICAgICAgICAgICBsZXQgb2JzZXJ2ZXI6SU9ic2VydmVyID0gYXJnc1swXTtcblxuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCA9IGZ1bmN0aW9uKHYpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHYpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJFcnJvciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgbGV0IG9uTmV4dCA9IGFyZ3NbMF0sXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IgPSBhcmdzWzFdLFxuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlZCA9IGFyZ3NbMl07XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlck5leHQgPSBvbk5leHQgfHwgZnVuY3Rpb24odil7fTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yID0gb25FcnJvciB8fCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQgPSBvbkNvbXBsZXRlZCB8fCBmdW5jdGlvbigpe307XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZTphbnkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25OZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RvcCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYodGhpcy5fZGlzcG9zYWJsZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vdGhpcy5fZGlzcG9zZUhhbmRsZXIuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgLy8gICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgLy99KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHVibGljIGZhaWwoZSkge1xuICAgICAgICAvLyAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAvLyAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgLy8gICAgICAgIHRoaXMuZXJyb3IoZSk7XG4gICAgICAgIC8vICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NhYmxlKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zYWJsZSA9IGRpc3Bvc2FibGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25OZXh0KHZhbHVlOmFueSk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IG9uRXJyb3IoZXJyb3I6YW55KTtcblxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25Db21wbGV0ZWQoKTtcbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFN1YmplY3QgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgZ2V0IHNvdXJjZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgc291cmNlKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6YW55ID0gbmV3IFN1YmplY3RPYnNlcnZlcigpO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMT86RnVuY3Rpb258T2JzZXJ2ZXIsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyOk9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyA8QXV0b0RldGFjaE9ic2VydmVyPmFyZzFcbiAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgLy90aGlzLl9zb3VyY2UgJiYgb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIodGhpcy5fc291cmNlLmRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gSW5uZXJTdWJzY3JpcHRpb24uY3JlYXRlKHRoaXMsIG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9zb3VyY2Upe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSh0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0odGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZShvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5yZW1vdmVDaGlsZChvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBHZW5lcmF0b3JTdWJqZWN0IGV4dGVuZHMgRW50aXR5IGltcGxlbWVudHMgSU9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzU3RhcnQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBnZXQgaXNTdGFydCgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzU3RhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGlzU3RhcnQoaXNTdGFydDpib29sZWFuKXtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RhcnQgPSBpc1N0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgICAgIHN1cGVyKFwiR2VuZXJhdG9yU3ViamVjdFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvYnNlcnZlcjphbnkgPSBuZXcgU3ViamVjdE9ic2VydmVyKCk7XG5cbiAgICAgICAgLyohXG4gICAgICAgIG91dGVyIGhvb2sgbWV0aG9kXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgb25CZWZvcmVOZXh0KHZhbHVlOmFueSl7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25BZnRlck5leHQodmFsdWU6YW55KSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25Jc0NvbXBsZXRlZCh2YWx1ZTphbnkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZUVycm9yKGVycm9yOmFueSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQWZ0ZXJFcnJvcihlcnJvcjphbnkpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZUNvbXBsZXRlZCgpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkFmdGVyQ29tcGxldGVkKCkge1xuICAgICAgICB9XG5cblxuICAgICAgICAvL3RvZG9cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxPzpGdW5jdGlvbnxPYnNlcnZlciwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IDxBdXRvRGV0YWNoT2JzZXJ2ZXI+YXJnMVxuICAgICAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBJbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUodGhpcywgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1N0YXJ0IHx8IHRoaXMub2JzZXJ2ZXIuaXNFbXB0eSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQmVmb3JlTmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9ic2VydmVyLm5leHQodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vbkFmdGVyTmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLm9uSXNDb21wbGV0ZWQodmFsdWUpKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNTdGFydCB8fCB0aGlzLm9ic2VydmVyLmlzRW1wdHkoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlRXJyb3IoZXJyb3IpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmVycm9yKGVycm9yKTtcblxuICAgICAgICAgICAgdGhpcy5vbkFmdGVyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzU3RhcnQgfHwgdGhpcy5vYnNlcnZlci5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZUNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLm9uQWZ0ZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0b1N0cmVhbSgpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgICAgIHN0cmVhbSA9IEFub255bW91c1N0cmVhbS5jcmVhdGUoKG9ic2VydmVyOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZShTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RvcCgpe1xuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZShvYnNlcnZlcjpPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLnJlbW92ZUNoaWxkKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQW5vbnltb3VzT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgQXV0b0RldGFjaE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9ic2VydmVyOklPYnNlcnZlcik7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pO1xuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmKGFyZ3MubGVuZ3RoID09PSAxKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoYXJnc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBpZih0aGlzLmlzRGlzcG9zZWQpe1xuICAgICAgICAgICAgICAgIHdkQ2IuTG9nLmxvZyhcIm9ubHkgY2FuIGRpc3Bvc2Ugb25jZVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWU6YW55KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yOmFueSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBNYXBPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHNlbGVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zZWxlY3RvcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2VsZWN0b3IodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIubmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIERvT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgcHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgcHJldk9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIC8vdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBpbXBvcnQgTG9nID0gd2RDYi5Mb2c7XG5cbiAgICBleHBvcnQgY2xhc3MgTWVyZ2VBbGxPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc3RyZWFtR3JvdXAsIGdyb3VwRGlzcG9zYWJsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXBEaXNwb3NhYmxlID0gZ3JvdXBEaXNwb3NhYmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRvbmU6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwdWJsaWMgY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgcHJpdmF0ZSBfc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9ncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlID0gbnVsbDtcblxuICAgICAgICBAcmVxdWlyZShmdW5jdGlvbihpbm5lclNvdXJjZTphbnkpe1xuICAgICAgICAgICAgYXNzZXJ0KGlubmVyU291cmNlIGluc3RhbmNlb2YgU3RyZWFtIHx8IEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSwgTG9nLmluZm8uRlVOQ19NVVNUX0JFKFwiaW5uZXJTb3VyY2VcIiwgXCJTdHJlYW0gb3IgUHJvbWlzZVwiKSk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dChpbm5lclNvdXJjZTphbnkpe1xuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc1Byb21pc2UoaW5uZXJTb3VyY2UpKXtcbiAgICAgICAgICAgICAgICBpbm5lclNvdXJjZSA9IGZyb21Qcm9taXNlKGlubmVyU291cmNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAuYWRkQ2hpbGQoaW5uZXJTb3VyY2UpO1xuXG4gICAgICAgICAgICB0aGlzLl9ncm91cERpc3Bvc2FibGUuYWRkKGlubmVyU291cmNlLmJ1aWxkU3RyZWFtKElubmVyT2JzZXJ2ZXIuY3JlYXRlKHRoaXMsIHRoaXMuX3N0cmVhbUdyb3VwLCBpbm5lclNvdXJjZSkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYodGhpcy5fc3RyZWFtR3JvdXAuZ2V0Q291bnQoKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGFzcyBJbm5lck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHBhcmVudDpNZXJnZUFsbE9ic2VydmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgY3VycmVudFN0cmVhbTpTdHJlYW0pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IocGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBjdXJyZW50U3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAgPSBzdHJlYW1Hcm91cDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdHJlYW0gPSBjdXJyZW50U3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdHJlYW0gPSB0aGlzLl9jdXJyZW50U3RyZWFtLFxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHRoaXMuX3BhcmVudDtcblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAucmVtb3ZlQ2hpbGQoKHN0cmVhbTpTdHJlYW0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKHN0cmVhbSwgY3VycmVudFN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9wYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgLy90aGlzLmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgLyohXG4gICAgICAgICAgICBpZiB0aGlzIGlubmVyU291cmNlIGlzIGFzeW5jIHN0cmVhbShhcyBwcm9taXNlIHN0cmVhbSksXG4gICAgICAgICAgICBpdCB3aWxsIGZpcnN0IGV4ZWMgYWxsIHBhcmVudC5uZXh0IGFuZCBvbmUgcGFyZW50LmNvbXBsZXRlZCxcbiAgICAgICAgICAgIHRoZW4gZXhlYyBhbGwgdGhpcy5uZXh0IGFuZCBhbGwgdGhpcy5jb21wbGV0ZWRcbiAgICAgICAgICAgIHNvIGluIHRoaXMgY2FzZSwgaXQgc2hvdWxkIGludm9rZSBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCBhZnRlciB0aGUgbGFzdCBpbnZva2NhdGlvbiBvZiB0aGlzLmNvbXBsZXRlZChoYXZlIGludm9rZWQgYWxsIHRoZSBpbm5lclNvdXJjZSlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZih0aGlzLl9pc0FzeW5jKCkgJiYgdGhpcy5fc3RyZWFtR3JvdXAuZ2V0Q291bnQoKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgcGFyZW50LmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzQXN5bmMoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQuZG9uZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBpbXBvcnQgTG9nID0gd2RDYi5Mb2c7XG5cbiAgICBleHBvcnQgY2xhc3MgTWVyZ2VPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBtYXhDb25jdXJyZW50Om51bWJlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGdyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIG1heENvbmN1cnJlbnQsIHN0cmVhbUdyb3VwLCBncm91cERpc3Bvc2FibGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgbWF4Q29uY3VycmVudDpudW1iZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX21heENvbmN1cnJlbnQgPSBtYXhDb25jdXJyZW50O1xuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAgPSBzdHJlYW1Hcm91cDtcbiAgICAgICAgICAgIHRoaXMuX2dyb3VwRGlzcG9zYWJsZSA9IGdyb3VwRGlzcG9zYWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkb25lOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHVibGljIGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwdWJsaWMgYWN0aXZlQ291bnQ6bnVtYmVyID0gMDtcbiAgICAgICAgcHVibGljIHE6QXJyYXk8U3RyZWFtPiA9IFtdO1xuXG4gICAgICAgIHByaXZhdGUgX21heENvbmN1cnJlbnQ6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3N0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gbnVsbDtcblxuICAgICAgICBwdWJsaWMgaGFuZGxlU3Vic2NyaWJlKGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzUHJvbWlzZShpbm5lclNvdXJjZSkpe1xuICAgICAgICAgICAgICAgIGlubmVyU291cmNlID0gZnJvbVByb21pc2UoaW5uZXJTb3VyY2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cC5hZGRDaGlsZChpbm5lclNvdXJjZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dyb3VwRGlzcG9zYWJsZS5hZGQoaW5uZXJTb3VyY2UuYnVpbGRTdHJlYW0oSW5uZXJPYnNlcnZlci5jcmVhdGUodGhpcywgdGhpcy5fc3RyZWFtR3JvdXAsIGlubmVyU291cmNlKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgQHJlcXVpcmUoZnVuY3Rpb24oaW5uZXJTb3VyY2U6YW55KXtcbiAgICAgICAgICAgIGFzc2VydChpbm5lclNvdXJjZSBpbnN0YW5jZW9mIFN0cmVhbSB8fCBKdWRnZVV0aWxzLmlzUHJvbWlzZShpbm5lclNvdXJjZSksIExvZy5pbmZvLkZVTkNfTVVTVF9CRShcImlubmVyU291cmNlXCIsIFwiU3RyZWFtIG9yIFByb21pc2VcIikpO1xuXG4gICAgICAgIH0pXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQoaW5uZXJTb3VyY2U6YW55KXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzUmVhY2hNYXhDb25jdXJyZW50KCkpe1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlQ291bnQgKys7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTdWJzY3JpYmUoaW5uZXJTb3VyY2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnEucHVzaChpbm5lclNvdXJjZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuX3N0cmVhbUdyb3VwLmdldENvdW50KCkgPT09IDApe1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNSZWFjaE1heENvbmN1cnJlbnQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZUNvdW50IDwgdGhpcy5fbWF4Q29uY3VycmVudDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsYXNzIElubmVyT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocGFyZW50Ok1lcmdlT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBjdXJyZW50U3RyZWFtOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHBhcmVudCwgc3RyZWFtR3JvdXAsIGN1cnJlbnRTdHJlYW0pO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IocGFyZW50Ok1lcmdlT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBjdXJyZW50U3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAgPSBzdHJlYW1Hcm91cDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdHJlYW0gPSBjdXJyZW50U3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcGFyZW50Ok1lcmdlT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuX3BhcmVudDtcblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAucmVtb3ZlQ2hpbGQodGhpcy5fY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgICAgIGlmIChwYXJlbnQucS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50LmFjdGl2ZUNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBwYXJlbnQuaGFuZGxlU3Vic2NyaWJlKHBhcmVudC5xLnNoaWZ0KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5faXNBc3luYygpICYmIHRoaXMuX3N0cmVhbUdyb3VwLmdldENvdW50KCkgPT09IDApe1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzQXN5bmMoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQuZG9uZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIENvbmNhdE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdGFydE5leHRTdHJlYW06RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHN0YXJ0TmV4dFN0cmVhbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBjdXJyZW50T2JzZXJ2ZXI6YW55ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdGFydE5leHRTdHJlYW06RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0TmV4dFN0cmVhbSA9IHN0YXJ0TmV4dFN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgLyohXG4gICAgICAgICAgICBpZiBcInRoaXMuY3VycmVudE9ic2VydmVyLm5leHRcIiBlcnJvciwgaXQgd2lsbCBwYXNlIHRvIHRoaXMuY3VycmVudE9ic2VydmVyLT5vbkVycm9yLlxuICAgICAgICAgICAgc28gaXQgc2hvdWxkbid0IGludm9rZSB0aGlzLmN1cnJlbnRPYnNlcnZlci5lcnJvciBoZXJlIGFnYWluIVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAvL3RyeXtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgLy99XG4gICAgICAgICAgICAvL2NhdGNoKGUpe1xuICAgICAgICAgICAgLy8gICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICAvL3RoaXMuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnROZXh0U3RyZWFtKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFN1YmplY3RPYnNlcnZlciBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHVibGljIG9ic2VydmVyczp3ZENiLkNvbGxlY3Rpb248SU9ic2VydmVyPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8SU9ic2VydmVyPigpO1xuXG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2FibGU6SURpc3Bvc2FibGUgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBpc0VtcHR5KCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vYnNlcnZlcnMuZ2V0Q291bnQoKSA9PT0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYWRkQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuX2Rpc3Bvc2FibGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZUNoaWxkKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnJlbW92ZUNoaWxkKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBKdWRnZVV0aWxzLmlzRXF1YWwob2IsIG9ic2VydmVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2V0RGlzcG9zYWJsZShkaXNwb3NhYmxlOklEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9ic2VydmVyOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZShkaXNwb3NhYmxlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlID0gZGlzcG9zYWJsZTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIEZpbHRlck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCBzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMocHJldk9ic2VydmVyLCBwcmVkaWNhdGUsIHNvdXJjZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmVkaWNhdGU6KHZhbHVlOmFueSk9PmJvb2xlYW4sIHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlciA9IHByZXZPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMucHJlZGljYXRlID0gcHJlZGljYXRlO1xuICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgcHJldk9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBzb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJvdGVjdGVkIGk6bnVtYmVyID0gMDtcbiAgICAgICAgcHJvdGVjdGVkIHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4gPSBudWxsO1xuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJlZGljYXRlKHZhbHVlLCB0aGlzLmkrKywgdGhpcy5zb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIEZpbHRlcldpdGhTdGF0ZU9ic2VydmVyIGV4dGVuZHMgRmlsdGVyT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCBzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMocHJldk9ic2VydmVyLCBwcmVkaWNhdGUsIHNvdXJjZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1RyaWdnZXI6Ym9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBkYXRhOnt2YWx1ZTphbnksIHN0YXRlOkZpbHRlclN0YXRlfSA9IG51bGw7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJlZGljYXRlKHZhbHVlLCB0aGlzLmkrKywgdGhpcy5zb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKCF0aGlzLl9pc1RyaWdnZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTp2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTpGaWx0ZXJTdGF0ZS5FTlRFUlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTp2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTpGaWx0ZXJTdGF0ZS5UUklHR0VSXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIubmV4dChkYXRhKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc1RyaWdnZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLl9pc1RyaWdnZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTp2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTpGaWx0ZXJTdGF0ZS5MRUFWRVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIubmV4dChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzVHJpZ2dlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VTdHJlYW0gZXh0ZW5kcyBTdHJlYW17XG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcik6SURpc3Bvc2FibGU7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/LCBvbkNvbXBsZXRlZD8pOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuaGFuZGxlU3ViamVjdChhcmcxKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8SU9ic2VydmVyPmFyZzEpXG4gICAgICAgICAgICAgICAgOiBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxGdW5jdGlvbj5hcmcxLCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIC8vb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIodGhpcy5kaXNwb3NlSGFuZGxlcik7XG5cblxuICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSh0aGlzLmJ1aWxkU3RyZWFtKG9ic2VydmVyKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgc3VwZXIuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmVDb3JlKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHJpdmF0ZSBfaGFzTXVsdGlPYnNlcnZlcnMoKXtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVyLmdldE9ic2VydmVycygpID4gMTtcbiAgICAgICAgLy99XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIERvU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgb25OZXh0PzpGdW5jdGlvbiwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgb25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyID0gQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvcixvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKERvT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLl9vYnNlcnZlcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1hcFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc2VsZWN0b3I6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIHNlbGVjdG9yOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShNYXBPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX3NlbGVjdG9yKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21BcnJheVN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhhcnJheSwgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FycmF5OkFycmF5PGFueT4gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyYXk7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgYXJyYXkgPSB0aGlzLl9hcnJheSxcbiAgICAgICAgICAgICAgICBsZW4gPSBhcnJheS5sZW5ndGg7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvb3BSZWN1cnNpdmUoaSkge1xuICAgICAgICAgICAgICAgIGlmIChpIDwgbGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoYXJyYXlbaV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50cy5jYWxsZWUoaSArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlciwgMCwgbG9vcFJlY3Vyc2l2ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tUHJvbWlzZVN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHByb21pc2U6YW55LCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKHByb21pc2UsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcHJvbWlzZTphbnkgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByb21pc2U6YW55LCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3Byb21pc2UudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0sIG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21FdmVudFBhdHRlcm5TdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hZGRIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYWRkSGFuZGxlcjpGdW5jdGlvbiwgcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlciA9IGFkZEhhbmRsZXI7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVIYW5kbGVyID0gcmVtb3ZlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlubmVySGFuZGxlcihldmVudCl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaW5uZXJIYW5kbGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLl9yZW1vdmVIYW5kbGVyKGlubmVySGFuZGxlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBBbm9ueW1vdXNTdHJlYW0gZXh0ZW5kcyBTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHN1YnNjcmliZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzdWJzY3JpYmVGdW5jKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHN1YnNjcmliZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKHN1YnNjcmliZUZ1bmMpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoc3ViamVjdDpTdWJqZWN0KTpJRGlzcG9zYWJsZTtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob25OZXh0Oih2YWx1ZTphbnkpPT52b2lkKTpJRGlzcG9zYWJsZTtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZShvbk5leHQ6KHZhbHVlOmFueSk9PnZvaWQsIG9uRXJyb3I6KGU6YW55KT0+dm9pZCk6SURpc3Bvc2FibGU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob25OZXh0Oih2YWx1ZTphbnkpPT52b2lkLCBvbkVycm9yOihlOmFueSk9PnZvaWQsIG9uQ29tcGxldGU6KCk9PnZvaWQpOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoLi4uYXJncyk6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyOkF1dG9EZXRhY2hPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKGFyZ3NbMF0gaW5zdGFuY2VvZiBTdWJqZWN0KXtcbiAgICAgICAgICAgICAgICBsZXQgc3ViamVjdDpTdWJqZWN0ID0gPFN1YmplY3Q+YXJnc1swXTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU3ViamVjdChzdWJqZWN0KTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoSnVkZ2VVdGlscy5pc0lPYnNlcnZlcig8SU9ic2VydmVyPmFyZ3NbMF0pKXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlciA9IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPElPYnNlcnZlcj5hcmdzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgbGV0IG9uTmV4dDpGdW5jdGlvbiA9IDxGdW5jdGlvbj5hcmdzWzBdLFxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yOkZ1bmN0aW9uID0gPEZ1bmN0aW9uPmFyZ3NbMV0gfHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZWQ6RnVuY3Rpb24gPSA8RnVuY3Rpb24+YXJnc1syXSB8fCBudWxsO1xuXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBJbnRlcnZhbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGludGVydmFsOm51bWJlciwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGludGVydmFsLCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICBvYmouaW5pdFdoZW5DcmVhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2ludGVydmFsOm51bWJlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoaW50ZXJ2YWw6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgaW5pdFdoZW5DcmVhdGUoKXtcbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gdGhpcy5faW50ZXJ2YWwgPD0gMCA/IDEgOiB0aGlzLl9pbnRlcnZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaWQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZCA9IHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbChvYnNlcnZlciwgMCwgdGhpcy5faW50ZXJ2YWwsIChjb3VudCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vc2VsZi5zY2hlZHVsZXIubmV4dChjb3VudCk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChjb3VudCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY291bnQgKyAxO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vRGlzcG9zZXIuYWRkRGlzcG9zZUhhbmRsZXIoKCkgPT4ge1xuICAgICAgICAgICAgLy99KTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LmNsZWFySW50ZXJ2YWwoaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEludGVydmFsUmVxdWVzdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNFbmQ6Ym9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlciwgKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2lzRW5kO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5jYW5jZWxOZXh0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNlbGYuc2NoZWR1bGVyLnJlcXVlc3RMb29wSWQpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2lzRW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGltcG9ydCBMb2cgPSB3ZENiLkxvZztcblxuICAgIGV4cG9ydCBjbGFzcyBUaW1lb3V0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgQHJlcXVpcmUoZnVuY3Rpb24odGltZTpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgYXNzZXJ0KHRpbWUgPiAwLCBMb2cuaW5mby5GVU5DX1NIT1VMRChcInRpbWVcIiwgXCI+IDBcIikpO1xuICAgICAgICB9KVxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSh0aW1lOm51bWJlciwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHRpbWUsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aW1lOm51bWJlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IodGltZTpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGlkID0gbnVsbDtcblxuICAgICAgICAgICAgaWQgPSB0aGlzLnNjaGVkdWxlci5wdWJsaXNoVGltZW91dChvYnNlcnZlciwgdGhpcy5fdGltZSwgKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHRpbWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5jbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlQWxsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICAvL3RoaXMuX29ic2VydmVyID0gQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvcixvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzdHJlYW1Hcm91cCA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8U3RyZWFtPigpLFxuICAgICAgICAgICAgICAgIGdyb3VwRGlzcG9zYWJsZSA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShNZXJnZUFsbE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgc3RyZWFtR3JvdXAsIGdyb3VwRGlzcG9zYWJsZSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBEaXNwb3NhYmxlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCBjbGFzcyBNZXJnZVN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW0ge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBtYXhDb25jdXJyZW50Om51bWJlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgbWF4Q29uY3VycmVudCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBtYXhDb25jdXJyZW50Om51bWJlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fbWF4Q29uY3VycmVudCA9IG1heENvbmN1cnJlbnQ7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9tYXhDb25jdXJyZW50Om51bWJlciA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdmFyIGdyb3VwRGlzcG9zYWJsZSA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvL3RoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShNZXJnZU9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fbWF4Q29uY3VycmVudCwgZ3JvdXBEaXNwb3NhYmxlKSk7XG4gICAgICAgICAgICB2YXIgc3RyZWFtR3JvdXAgPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKSxcbiAgICAgICAgICAgICAgICBncm91cERpc3Bvc2FibGUgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShNZXJnZU9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fbWF4Q29uY3VycmVudCwgc3RyZWFtR3JvdXAsIGdyb3VwRGlzcG9zYWJsZSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBEaXNwb3NhYmxlO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBUYWtlVW50aWxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBvdGhlclN0ZWFtOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgb3RoZXJTdGVhbSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb3RoZXJTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBvdGhlclN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX290aGVyU3RyZWFtID0gSnVkZ2VVdGlscy5pc1Byb21pc2Uob3RoZXJTdHJlYW0pID8gZnJvbVByb21pc2Uob3RoZXJTdHJlYW0pIDogb3RoZXJTdHJlYW07XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCksXG4gICAgICAgICAgICAgICAgYXV0b0RldGFjaE9ic2VydmVyID0gQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciksXG4gICAgICAgICAgICAgICAgc291cmNlRGlzcG9zYWJsZSA9IG51bGw7XG5cbiAgICAgICAgICAgIHNvdXJjZURpc3Bvc2FibGUgPSB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICBncm91cC5hZGQoc291cmNlRGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIGF1dG9EZXRhY2hPYnNlcnZlci5zZXREaXNwb3NhYmxlKHNvdXJjZURpc3Bvc2FibGUpO1xuXG4gICAgICAgICAgICBncm91cC5hZGQodGhpcy5fb3RoZXJTdHJlYW0uYnVpbGRTdHJlYW0oVGFrZVVudGlsT2JzZXJ2ZXIuY3JlYXRlKGF1dG9EZXRhY2hPYnNlcnZlcikpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBDb25jYXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2VzOkFycmF5PFN0cmVhbT4pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZXM6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKTtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2VzOkFycmF5PFN0cmVhbT4pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgLy90b2RvIGRvbid0IHNldCBzY2hlZHVsZXIgaGVyZT9cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc291cmNlc1swXS5zY2hlZHVsZXI7XG5cbiAgICAgICAgICAgIHNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc1Byb21pc2Uoc291cmNlKSl7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuYWRkQ2hpbGQoZnJvbVByb21pc2Uoc291cmNlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuYWRkQ2hpbGQoc291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY291bnQgPSB0aGlzLl9zb3VyY2VzLmdldENvdW50KCksXG4gICAgICAgICAgICAgICAgZCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShpKSB7XG4gICAgICAgICAgICAgICAgaWYoaSA9PT0gY291bnQpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZC5hZGQoc2VsZi5fc291cmNlcy5nZXRDaGlsZChpKS5idWlsZFN0cmVhbShDb25jYXRPYnNlcnZlci5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlciwgKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wUmVjdXJzaXZlKGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIDAsIGxvb3BSZWN1cnNpdmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZShkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBSZXBlYXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBjb3VudDpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIGNvdW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9jb3VudDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIGNvdW50Om51bWJlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fY291bnQgPSBjb3VudDtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuXG4gICAgICAgICAgICAvL3RoaXMuc3ViamVjdEdyb3VwID0gdGhpcy5fc291cmNlLnN1YmplY3RHcm91cDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBkID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGNvdW50KSB7XG4gICAgICAgICAgICAgICAgaWYoY291bnQgPT09IDApe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZC5hZGQoXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZS5idWlsZFN0cmVhbShDb25jYXRPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BSZWN1cnNpdmUoY291bnQgLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyLCB0aGlzLl9jb3VudCwgbG9vcFJlY3Vyc2l2ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBHcm91cERpc3Bvc2FibGUuY3JlYXRlKGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIElnbm9yZUVsZW1lbnRzU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKElnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIERlZmVyU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYnVpbGRTdHJlYW1GdW5jKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2J1aWxkU3RyZWFtRnVuYzpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9idWlsZFN0cmVhbUZ1bmMgPSBidWlsZFN0cmVhbUZ1bmM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGdyb3VwID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICBncm91cC5hZGQodGhpcy5fYnVpbGRTdHJlYW1GdW5jKCkuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCB0aGlzQXJnOmFueSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgcHJlZGljYXRlLCB0aGlzQXJnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4sIHRoaXNBcmc6YW55KXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLnByZWRpY2F0ZSA9IHdkQ2IuRnVuY3Rpb25VdGlscy5iaW5kKHRoaXNBcmcsIHByZWRpY2F0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiA9IG51bGw7XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2Uuc3Vic2NyaWJlKHRoaXMuY3JlYXRlT2JzZXJ2ZXIob2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbnRlcm5hbEZpbHRlcihwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCB0aGlzQXJnOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVTdHJlYW1Gb3JJbnRlcm5hbEZpbHRlcih0aGlzLl9zb3VyY2UsIHRoaXMuX2lubmVyUHJlZGljYXRlKHByZWRpY2F0ZSwgdGhpcyksIHRoaXNBcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZU9ic2VydmVyKG9ic2VydmVyOklPYnNlcnZlcik6T2JzZXJ2ZXJ7XG4gICAgICAgICAgICByZXR1cm4gRmlsdGVyT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLnByZWRpY2F0ZSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlU3RyZWFtRm9ySW50ZXJuYWxGaWx0ZXIoc291cmNlOlN0cmVhbSwgaW5uZXJQcmVkaWNhdGU6YW55LCB0aGlzQXJnOmFueSk6U3RyZWFte1xuICAgICAgICAgICAgcmV0dXJuIEZpbHRlclN0cmVhbS5jcmVhdGUoc291cmNlLCBpbm5lclByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pbm5lclByZWRpY2F0ZShwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCBzZWxmOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gKHZhbHVlLCBpLCBvKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYucHJlZGljYXRlKHZhbHVlLCBpLCBvKSAmJiBwcmVkaWNhdGUuY2FsbCh0aGlzLCB2YWx1ZSwgaSwgbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyV2l0aFN0YXRlU3RyZWFtIGV4dGVuZHMgRmlsdGVyU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCB0aGlzQXJnOmFueSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgcHJlZGljYXRlLCB0aGlzQXJnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVPYnNlcnZlcihvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIEZpbHRlcldpdGhTdGF0ZU9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5wcmVkaWNhdGUsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVN0cmVhbUZvckludGVybmFsRmlsdGVyKHNvdXJjZTpTdHJlYW0sIGlubmVyUHJlZGljYXRlOmFueSwgdGhpc0FyZzphbnkpOlN0cmVhbXtcbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJXaXRoU3RhdGVTdHJlYW0uY3JlYXRlKHNvdXJjZSwgaW5uZXJQcmVkaWNhdGUsIHRoaXNBcmcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IHZhciBjcmVhdGVTdHJlYW0gPSAoc3Vic2NyaWJlRnVuYykgPT4ge1xuICAgICAgICByZXR1cm4gQW5vbnltb3VzU3RyZWFtLmNyZWF0ZShzdWJzY3JpYmVGdW5jKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tQXJyYXkgPSAoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PntcbiAgICAgICAgcmV0dXJuIEZyb21BcnJheVN0cmVhbS5jcmVhdGUoYXJyYXksIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVByb21pc2UgPSAocHJvbWlzZTphbnksIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT57XG4gICAgICAgIHJldHVybiBGcm9tUHJvbWlzZVN0cmVhbS5jcmVhdGUocHJvbWlzZSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tRXZlbnRQYXR0ZXJuID0gKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pID0+e1xuICAgICAgICByZXR1cm4gRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5jcmVhdGUoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgaW50ZXJ2YWwgPSAoaW50ZXJ2YWwsIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT4ge1xuICAgICAgICByZXR1cm4gSW50ZXJ2YWxTdHJlYW0uY3JlYXRlKGludGVydmFsLCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGludGVydmFsUmVxdWVzdCA9IChzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsUmVxdWVzdFN0cmVhbS5jcmVhdGUoc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciB0aW1lb3V0ID0gKHRpbWUsIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT4ge1xuICAgICAgICByZXR1cm4gVGltZW91dFN0cmVhbS5jcmVhdGUodGltZSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuICAgIGV4cG9ydCB2YXIgZW1wdHkgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVTdHJlYW0oKG9ic2VydmVyOklPYnNlcnZlcikgPT57XG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgY2FsbEZ1bmMgPSAoZnVuYzpGdW5jdGlvbiwgY29udGV4dCA9IHJvb3QpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChmdW5jLmNhbGwoY29udGV4dCwgbnVsbCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBqdWRnZSA9IChjb25kaXRpb246RnVuY3Rpb24sIHRoZW5Tb3VyY2U6RnVuY3Rpb24sIGVsc2VTb3VyY2U6RnVuY3Rpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbmRpdGlvbigpID8gdGhlblNvdXJjZSgpIDogZWxzZVNvdXJjZSgpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGRlZmVyID0gKGJ1aWxkU3RyZWFtRnVuYzpGdW5jdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gRGVmZXJTdHJlYW0uY3JlYXRlKGJ1aWxkU3RyZWFtRnVuYyk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIganVzdCA9IChyZXR1cm5WYWx1ZTphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5uZXh0KHJldHVyblZhbHVlKTtcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgZW51bSBGaWx0ZXJTdGF0ZXtcbiAgICAgICAgVFJJR0dFUixcbiAgICAgICAgRU5URVIsXG4gICAgICAgIExFQVZFXG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICB2YXIgZGVmYXVsdElzRXF1YWwgPSAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICB9O1xuXG4gICAgZXhwb3J0IGNsYXNzIFJlY29yZCB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHRpbWU6bnVtYmVyLCB2YWx1ZTphbnksIGFjdGlvblR5cGU/OkFjdGlvblR5cGUsIGNvbXBhcmVyPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHRpbWUsIHZhbHVlLCBhY3Rpb25UeXBlLCBjb21wYXJlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB0aW1lKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdGltZSh0aW1lOm51bWJlcil7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3ZhbHVlOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB2YWx1ZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHNldCB2YWx1ZSh2YWx1ZTpudW1iZXIpe1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FjdGlvblR5cGU6QWN0aW9uVHlwZSA9IG51bGw7XG4gICAgICAgIGdldCBhY3Rpb25UeXBlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aW9uVHlwZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgYWN0aW9uVHlwZShhY3Rpb25UeXBlOkFjdGlvblR5cGUpe1xuICAgICAgICAgICAgdGhpcy5fYWN0aW9uVHlwZSA9IGFjdGlvblR5cGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jb21wYXJlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IodGltZSwgdmFsdWUsIGFjdGlvblR5cGU6QWN0aW9uVHlwZSwgY29tcGFyZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX2FjdGlvblR5cGUgPSBhY3Rpb25UeXBlO1xuICAgICAgICAgICAgdGhpcy5fY29tcGFyZXIgPSBjb21wYXJlciB8fCBkZWZhdWx0SXNFcXVhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWUgPT09IG90aGVyLnRpbWUgJiYgdGhpcy5fY29tcGFyZXIodGhpcy5fdmFsdWUsIG90aGVyLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTW9ja09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gPFtSZWNvcmRdPltdO1xuICAgICAgICBnZXQgbWVzc2FnZXMoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgICAgICAgfVxuICAgICAgICBzZXQgbWVzc2FnZXMobWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NjaGVkdWxlcjpUZXN0U2NoZWR1bGVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB2YXIgcmVjb3JkID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0RpcmVjdE9iamVjdCh2YWx1ZSkpe1xuICAgICAgICAgICAgICAgIHJlY29yZCA9IFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCB2YWx1ZSwgQWN0aW9uVHlwZS5ORVhULCAoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGkgaW4gYSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhLmhhc093blByb3BlcnR5KGkpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhW2ldICE9PSBiW2ldKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHJlY29yZCA9IFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCB2YWx1ZSwgQWN0aW9uVHlwZS5ORVhUKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChyZWNvcmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgZXJyb3IsIEFjdGlvblR5cGUuRVJST1IpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgbnVsbCwgQWN0aW9uVHlwZS5DT01QTEVURUQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY2xvbmUoKXtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBNb2NrT2JzZXJ2ZXIuY3JlYXRlKHRoaXMuX3NjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlcyA9IHRoaXMuX21lc3NhZ2VzO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNb2NrUHJvbWlzZXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIsIG1lc3NhZ2VzOltSZWNvcmRdKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyLCBtZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IDxbUmVjb3JkXT5bXTtcbiAgICAgICAgLy9nZXQgbWVzc2FnZXMoKXtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICAgICAgICAvL31cbiAgICAgICAgLy9zZXQgbWVzc2FnZXMobWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAvLyAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICAvL31cblxuICAgICAgICBwcml2YXRlIF9zY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIsIG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdGhlbihzdWNjZXNzQ2I6RnVuY3Rpb24sIGVycm9yQ2I6RnVuY3Rpb24sIG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICAvL3ZhciBzY2hlZHVsZXIgPSA8VGVzdFNjaGVkdWxlcj4odGhpcy5zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCB0aGlzLl9tZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGNvbnN0IFNVQlNDUklCRV9USU1FID0gMjAwO1xuICAgIGNvbnN0IERJU1BPU0VfVElNRSA9IDEwMDA7XG5cbiAgICBleHBvcnQgY2xhc3MgVGVzdFNjaGVkdWxlciBleHRlbmRzIFNjaGVkdWxlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgbmV4dCh0aWNrLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0RpcmVjdE9iamVjdCh2YWx1ZSkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQsIChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSBpbiBhKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGEuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFbaV0gIT09IGJbaV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgdmFsdWUsIEFjdGlvblR5cGUuTkVYVCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGVycm9yKHRpY2ssIGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCBlcnJvciwgQWN0aW9uVHlwZS5FUlJPUik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGNvbXBsZXRlZCh0aWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCBudWxsLCBBY3Rpb25UeXBlLkNPTVBMRVRFRCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShpc1Jlc2V0OmJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGlzUmVzZXQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IoaXNSZXNldDpib29sZWFuKXtcbiAgICAgICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVzZXQgPSBpc1Jlc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY2xvY2s6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgZ2V0IGNsb2NrKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Nsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0IGNsb2NrKGNsb2NrOm51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSBjbG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzUmVzZXQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBwcml2YXRlIF9pc0Rpc3Bvc2VkOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHJpdmF0ZSBfdGltZXJNYXA6d2RDYi5IYXNoPEZ1bmN0aW9uPiA9IHdkQ2IuSGFzaC5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX3N0cmVhbU1hcDp3ZENiLkhhc2g8RnVuY3Rpb24+ID0gd2RDYi5IYXNoLmNyZWF0ZTxGdW5jdGlvbj4oKTtcbiAgICAgICAgcHJpdmF0ZSBfc3Vic2NyaWJlZFRpbWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfZGlzcG9zZWRUaW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOk1vY2tPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIHNldFN0cmVhbU1hcChvYnNlcnZlcjpJT2JzZXJ2ZXIsIG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgbWVzc2FnZXMuZm9yRWFjaCgocmVjb3JkOlJlY29yZCkgPT57XG4gICAgICAgICAgICAgICAgdmFyIGZ1bmMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZWNvcmQuYWN0aW9uVHlwZSl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5ORVhUOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQocmVjb3JkLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBBY3Rpb25UeXBlLkVSUk9SOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKHJlY29yZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT01QTEVURUQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jID0gKCkgPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB3ZENiLkxvZy5lcnJvcih0cnVlLCB3ZENiLkxvZy5pbmZvLkZVTkNfVU5LTk9XKFwiYWN0aW9uVHlwZVwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9zdHJlYW1NYXAuYWRkQ2hpbGQoU3RyaW5nKHJlY29yZC50aW1lKSwgZnVuYyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXI6TW9ja09ic2VydmVyLCBpbml0aWFsOmFueSwgcmVjdXJzaXZlRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIC8vbWVzc2FnZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBuZXh0ID0gbnVsbCxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWQgPSBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICBuZXh0ID0gb2JzZXJ2ZXIubmV4dDtcbiAgICAgICAgICAgIGNvbXBsZXRlZCA9IG9ic2VydmVyLmNvbXBsZXRlZDtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIG5leHQuY2FsbChvYnNlcnZlciwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3RpY2soMSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVkLmNhbGwob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3RpY2soMSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZWN1cnNpdmVGdW5jKGluaXRpYWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGluaXRpYWw6YW55LCBpbnRlcnZhbDpudW1iZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgd2hpbGUgKENPVU5UID4gMCAmJiAhdGhpcy5faXNEaXNwb3NlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RpY2soaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goVGVzdFNjaGVkdWxlci5uZXh0KHRoaXMuX2Nsb2NrLCBpbml0aWFsKSk7XG5cbiAgICAgICAgICAgICAgICAvL25vIG5lZWQgdG8gaW52b2tlIGFjdGlvblxuICAgICAgICAgICAgICAgIC8vYWN0aW9uKGluaXRpYWwpO1xuXG4gICAgICAgICAgICAgICAgaW5pdGlhbCsrO1xuICAgICAgICAgICAgICAgIENPVU5ULS07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuICAgICAgICAgICAgLy90aGlzLnNldFN0cmVhbU1hcCh0aGlzLl9vYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0KG9ic2VydmVyOklPYnNlcnZlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICAvL3Byb2R1Y2UgMTAgdmFsIGZvciB0ZXN0XG4gICAgICAgICAgICB2YXIgQ09VTlQgPSAxMCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGludGVydmFsID0gMTAwLFxuICAgICAgICAgICAgICAgIG51bSA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHdoaWxlIChDT1VOVCA+IDAgJiYgIXRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aWNrKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dCh0aGlzLl9jbG9jaywgbnVtKSk7XG5cbiAgICAgICAgICAgICAgICBudW0rKztcbiAgICAgICAgICAgICAgICBDT1VOVC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcbiAgICAgICAgICAgIC8vdGhpcy5zZXRTdHJlYW1NYXAodGhpcy5fb2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaFRpbWVvdXQob2JzZXJ2ZXI6SU9ic2VydmVyLCB0aW1lOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgdGhpcy5fdGljayh0aW1lKTtcblxuICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIHRpbWUpLCBUZXN0U2NoZWR1bGVyLmNvbXBsZXRlZCh0aGlzLl9jbG9jayArIDEpKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zZXRDbG9jaygpe1xuICAgICAgICAgICAgaWYodGhpcy5faXNSZXNldCl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aGlzLl9zdWJzY3JpYmVkVGltZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydFdpdGhUaW1lKGNyZWF0ZTpGdW5jdGlvbiwgc3Vic2NyaWJlZFRpbWU6bnVtYmVyLCBkaXNwb3NlZFRpbWU6bnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXIgPSB0aGlzLmNyZWF0ZU9ic2VydmVyKCksXG4gICAgICAgICAgICAgICAgc291cmNlLCBzdWJzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuX3N1YnNjcmliZWRUaW1lID0gc3Vic2NyaWJlZFRpbWU7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlZFRpbWUgPSBkaXNwb3NlZFRpbWU7XG5cbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gc3Vic2NyaWJlZFRpbWU7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KHN1YnNjcmliZWRUaW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc291cmNlID0gY3JlYXRlKCk7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uID0gc291cmNlLnN1YnNjcmliZShvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fcnVuQXQoZGlzcG9zZWRUaW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydFdpdGhTdWJzY3JpYmUoY3JlYXRlLCBzdWJzY3JpYmVkVGltZSA9IFNVQlNDUklCRV9USU1FKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydFdpdGhUaW1lKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUsIERJU1BPU0VfVElNRSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoRGlzcG9zZShjcmVhdGUsIGRpc3Bvc2VkVGltZSA9IERJU1BPU0VfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIFNVQlNDUklCRV9USU1FLCBkaXNwb3NlZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1YmxpY0Fic29sdXRlKHRpbWUsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KHRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpIHtcbiAgICAgICAgICAgIHZhciBleHRyZW1lTnVtQXJyID0gdGhpcy5fZ2V0TWluQW5kTWF4VGltZSgpLFxuICAgICAgICAgICAgICAgIG1pbiA9IGV4dHJlbWVOdW1BcnJbMF0sXG4gICAgICAgICAgICAgICAgbWF4ID0gZXh0cmVtZU51bUFyclsxXSxcbiAgICAgICAgICAgICAgICB0aW1lID0gbWluO1xuXG4gICAgICAgICAgICAvL3RvZG8gcmVkdWNlIGxvb3AgdGltZVxuICAgICAgICAgICAgd2hpbGUgKHRpbWUgPD0gbWF4KSB7XG4gICAgICAgICAgICAgICAgLy9pZih0aGlzLl9pc0Rpc3Bvc2VkKXtcbiAgICAgICAgICAgICAgICAvLyAgICBicmVhaztcbiAgICAgICAgICAgICAgICAvL31cblxuICAgICAgICAgICAgICAgIC8vYmVjYXVzZSBcIl9leGVjLF9ydW5TdHJlYW1cIiBtYXkgY2hhbmdlIFwiX2Nsb2NrXCIsXG4gICAgICAgICAgICAgICAgLy9zbyBpdCBzaG91bGQgcmVzZXQgdGhlIF9jbG9ja1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aW1lO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fZXhlYyh0aW1lLCB0aGlzLl90aW1lck1hcCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9jayA9IHRpbWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ydW5TdHJlYW0odGltZSk7XG5cbiAgICAgICAgICAgICAgICB0aW1lKys7XG5cbiAgICAgICAgICAgICAgICAvL3RvZG8gZ2V0IG1heCB0aW1lIG9ubHkgZnJvbSBzdHJlYW1NYXA/XG4gICAgICAgICAgICAgICAgLy9uZWVkIHJlZnJlc2ggbWF4IHRpbWUuXG4gICAgICAgICAgICAgICAgLy9iZWNhdXNlIGlmIHRpbWVyTWFwIGhhcyBjYWxsYmFjayB0aGF0IGNyZWF0ZSBpbmZpbml0ZSBzdHJlYW0oYXMgaW50ZXJ2YWwpLFxuICAgICAgICAgICAgICAgIC8vaXQgd2lsbCBzZXQgc3RyZWFtTWFwIHNvIHRoYXQgdGhlIG1heCB0aW1lIHdpbGwgY2hhbmdlXG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5fZ2V0TWluQW5kTWF4VGltZSgpWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVN0cmVhbShhcmdzKXtcbiAgICAgICAgICAgIHJldHVybiBUZXN0U3RyZWFtLmNyZWF0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVPYnNlcnZlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBNb2NrT2JzZXJ2ZXIuY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNyZWF0ZVJlc29sdmVkUHJvbWlzZSh0aW1lOm51bWJlciwgdmFsdWU6YW55KXtcbiAgICAgICAgICAgIHJldHVybiBNb2NrUHJvbWlzZS5jcmVhdGUodGhpcywgW1Rlc3RTY2hlZHVsZXIubmV4dCh0aW1lLCB2YWx1ZSksIFRlc3RTY2hlZHVsZXIuY29tcGxldGVkKHRpbWUrMSldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVSZWplY3RQcm9taXNlKHRpbWU6bnVtYmVyLCBlcnJvcjphbnkpe1xuICAgICAgICAgICAgcmV0dXJuIE1vY2tQcm9taXNlLmNyZWF0ZSh0aGlzLCBbVGVzdFNjaGVkdWxlci5lcnJvcih0aW1lLCBlcnJvcildKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2dldE1pbkFuZE1heFRpbWUoKXtcbiAgICAgICAgICAgIHZhciB0aW1lQXJyOmFueSA9ICh0aGlzLl90aW1lck1hcC5nZXRLZXlzKCkuYWRkQ2hpbGRyZW4odGhpcy5fc3RyZWFtTWFwLmdldEtleXMoKSkpO1xuXG4gICAgICAgICAgICAgICAgdGltZUFyciA9IHRpbWVBcnIubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlcihrZXkpO1xuICAgICAgICAgICAgICAgIH0pLnRvQXJyYXkoKTtcblxuICAgICAgICAgICAgcmV0dXJuIFtNYXRoLm1pbi5hcHBseShNYXRoLCB0aW1lQXJyKSwgTWF0aC5tYXguYXBwbHkoTWF0aCwgdGltZUFycildO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZXhlYyh0aW1lLCBtYXApe1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBtYXAuZ2V0Q2hpbGQoU3RyaW5nKHRpbWUpKTtcblxuICAgICAgICAgICAgaWYoaGFuZGxlcil7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcnVuU3RyZWFtKHRpbWUpe1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9zdHJlYW1NYXAuZ2V0Q2hpbGQoU3RyaW5nKHRpbWUpKTtcblxuICAgICAgICAgICAgaWYoaGFuZGxlcil7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcnVuQXQodGltZTpudW1iZXIsIGNhbGxiYWNrOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lck1hcC5hZGRDaGlsZChTdHJpbmcodGltZSksIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3RpY2sodGltZTpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrICs9IHRpbWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgZW51bSBBY3Rpb25UeXBle1xuICAgICAgICBORVhULFxuICAgICAgICBFUlJPUixcbiAgICAgICAgQ09NUExFVEVEXG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgVGVzdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW0ge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShtZXNzYWdlczpbUmVjb3JkXSwgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhtZXNzYWdlcywgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzY2hlZHVsZXI6VGVzdFNjaGVkdWxlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihtZXNzYWdlczpbUmVjb3JkXSwgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgc2NoZWR1bGVyID0gPFRlc3RTY2hlZHVsZXI+KHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIuc2V0U3RyZWFtTWFwKG9ic2VydmVyLCB0aGlzLl9tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9