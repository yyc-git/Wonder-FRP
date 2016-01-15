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
        Stream.prototype.mergeAll = function () {
            return wdFrp.MergeAllStream.create(this);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkp1ZGdlVXRpbHMudHMiLCJiaW5kaW5nL25vZGVqcy9Ob2RlT3BlcmF0b3IudHMiLCJjb3JlL0VudGl0eS50cyIsImNvcmUvTWFpbi50cyIsImRlZmluaXRpb24vdHlwZXNjcmlwdC9kZWNvcmF0b3IvY29udHJhY3QudHMiLCJkaXNwb3NhYmxlL1NpbmdsZURpc3Bvc2FibGUudHMiLCJkaXNwb3NhYmxlL0dyb3VwRGlzcG9zYWJsZS50cyIsImRpc3Bvc2FibGUvSW5uZXJTdWJzY3JpcHRpb24udHMiLCJkaXNwb3NhYmxlL0lubmVyU3Vic2NyaXB0aW9uR3JvdXAudHMiLCJnbG9iYWwvVmFyaWFibGUudHMiLCJnbG9iYWwvQ29uc3QudHMiLCJnbG9iYWwvaW5pdC50cyIsImNvcmUvU3RyZWFtLnRzIiwiY29yZS9TY2hlZHVsZXIudHMiLCJjb3JlL09ic2VydmVyLnRzIiwic3ViamVjdC9TdWJqZWN0LnRzIiwic3ViamVjdC9HZW5lcmF0b3JTdWJqZWN0LnRzIiwib2JzZXJ2ZXIvQW5vbnltb3VzT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9BdXRvRGV0YWNoT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9NYXBPYnNlcnZlci50cyIsIm9ic2VydmVyL0RvT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9NZXJnZUFsbE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvVGFrZVVudGlsT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9Db25jYXRPYnNlcnZlci50cyIsIm9ic2VydmVyL1N1YmplY3RPYnNlcnZlci50cyIsIm9ic2VydmVyL0lnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9GaWx0ZXJPYnNlcnZlci50cyIsIm9ic2VydmVyL0ZpbHRlcldpdGhTdGF0ZU9ic2VydmVyLnRzIiwic3RyZWFtL0Jhc2VTdHJlYW0udHMiLCJzdHJlYW0vRG9TdHJlYW0udHMiLCJzdHJlYW0vTWFwU3RyZWFtLnRzIiwic3RyZWFtL0Zyb21BcnJheVN0cmVhbS50cyIsInN0cmVhbS9Gcm9tUHJvbWlzZVN0cmVhbS50cyIsInN0cmVhbS9Gcm9tRXZlbnRQYXR0ZXJuU3RyZWFtLnRzIiwic3RyZWFtL0Fub255bW91c1N0cmVhbS50cyIsInN0cmVhbS9JbnRlcnZhbFN0cmVhbS50cyIsInN0cmVhbS9JbnRlcnZhbFJlcXVlc3RTdHJlYW0udHMiLCJzdHJlYW0vTWVyZ2VBbGxTdHJlYW0udHMiLCJzdHJlYW0vVGFrZVVudGlsU3RyZWFtLnRzIiwic3RyZWFtL0NvbmNhdFN0cmVhbS50cyIsInN0cmVhbS9SZXBlYXRTdHJlYW0udHMiLCJzdHJlYW0vSWdub3JlRWxlbWVudHNTdHJlYW0udHMiLCJzdHJlYW0vRGVmZXJTdHJlYW0udHMiLCJzdHJlYW0vRmlsdGVyU3RyZWFtLnRzIiwic3RyZWFtL0ZpbHRlcldpdGhTdGF0ZVN0cmVhbS50cyIsImdsb2JhbC9PcGVyYXRvci50cyIsImVudW0vRmlsdGVyU3RhdGUudHMiLCJ0ZXN0aW5nL1JlY29yZC50cyIsInRlc3RpbmcvTW9ja09ic2VydmVyLnRzIiwidGVzdGluZy9Nb2NrUHJvbWlzZS50cyIsInRlc3RpbmcvVGVzdFNjaGVkdWxlci50cyIsInRlc3RpbmcvQWN0aW9uVHlwZS50cyIsInRlc3RpbmcvVGVzdFN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLElBQU8sS0FBSyxDQWdCWDtBQWhCRCxXQUFPLEtBQUssRUFBQyxDQUFDO0lBQ1Y7UUFBZ0MsOEJBQWU7UUFBL0M7WUFBZ0MsOEJBQWU7UUFjL0MsQ0FBQztRQWJpQixvQkFBUyxHQUF2QixVQUF3QixHQUFHO1lBQ3ZCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRzttQkFDTCxDQUFDLE1BQUssQ0FBQyxVQUFVLFlBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzttQkFDaEMsTUFBSyxDQUFDLFVBQVUsWUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVhLGtCQUFPLEdBQXJCLFVBQXNCLEdBQVUsRUFBRSxHQUFVO1lBQ3hDLE1BQU0sQ0FB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QUM7WUFDOUIsY0FBUyxHQUFZLElBQUksQ0FBQztZQUs5QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMvQixDQUFDO1FBZGEsaUJBQU0sR0FBcEIsVUFBcUIsUUFBaUIsRUFBRSxTQUF1QjtZQUMzRCxJQUFJLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFeEMsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNmLENBQUM7UUFZTSxrQ0FBYSxHQUFwQixVQUFxQixRQUFrQjtZQUduQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXRELE1BQU0sQ0FBQyxzQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNyQyxDQUFDO1FBQ0wsaUJBQUM7SUFBRCxDQXhCQSxBQXdCQyxFQXhCK0IsZ0JBQVUsRUF3QnpDO0lBeEJZLGdCQUFVLGFBd0J0QixDQUFBO0FBQ0wsQ0FBQyxFQTFCTSxLQUFLLEtBQUwsS0FBSyxRQTBCWCIsImZpbGUiOiJ3ZEZycC5kZWJ1Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIEp1ZGdlVXRpbHMgZXh0ZW5kcyB3ZENiLkp1ZGdlVXRpbHMge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGlzUHJvbWlzZShvYmope1xuICAgICAgICAgICAgcmV0dXJuICEhb2JqXG4gICAgICAgICAgICAgICAgJiYgIXN1cGVyLmlzRnVuY3Rpb24ob2JqLnN1YnNjcmliZSlcbiAgICAgICAgICAgICAgICAmJiBzdXBlci5pc0Z1bmN0aW9uKG9iai50aGVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNFcXVhbChvYjE6RW50aXR5LCBvYjI6RW50aXR5KXtcbiAgICAgICAgICAgIHJldHVybiBvYjEudWlkID09PSBvYjIudWlkO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBpc0lPYnNlcnZlcihpOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gaS5uZXh0ICYmIGkuZXJyb3IgJiYgaS5jb21wbGV0ZWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIGV4cG9ydCB2YXIgZnJvbU5vZGVDYWxsYmFjayA9IChmdW5jOkZ1bmN0aW9uLCBjb250ZXh0PzphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuICguLi5mdW5jQXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGhhbmRlciA9IChlcnIsIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0LmFwcGx5KG9ic2VydmVyLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZnVuY0FyZ3MucHVzaChoYW5kZXIpO1xuICAgICAgICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgZnVuY0FyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tU3RyZWFtID0gKHN0cmVhbTphbnksIGZpbmlzaEV2ZW50TmFtZTpzdHJpbmcgPSBcImVuZFwiKSA9PiB7XG4gICAgICAgIHN0cmVhbS5wYXVzZSgpO1xuXG4gICAgICAgIHJldHVybiB3ZEZycC5jcmVhdGVTdHJlYW0oKG9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICB2YXIgZGF0YUhhbmRsZXIgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGRhdGEpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3JIYW5kbGVyID0gKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZW5kSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RyZWFtLmFkZExpc3RlbmVyKFwiZGF0YVwiLCBkYXRhSGFuZGxlcik7XG4gICAgICAgICAgICBzdHJlYW0uYWRkTGlzdGVuZXIoXCJlcnJvclwiLCBlcnJvckhhbmRsZXIpO1xuICAgICAgICAgICAgc3RyZWFtLmFkZExpc3RlbmVyKGZpbmlzaEV2ZW50TmFtZSwgZW5kSGFuZGxlcik7XG5cbiAgICAgICAgICAgIHN0cmVhbS5yZXN1bWUoKTtcblxuICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICBzdHJlYW0ucmVtb3ZlTGlzdGVuZXIoXCJkYXRhXCIsIGRhdGFIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICBzdHJlYW0ucmVtb3ZlTGlzdGVuZXIoXCJlcnJvclwiLCBlcnJvckhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcihmaW5pc2hFdmVudE5hbWUsIGVuZEhhbmRsZXIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVJlYWRhYmxlU3RyZWFtID0gKHN0cmVhbTphbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGZyb21TdHJlYW0oc3RyZWFtLCBcImVuZFwiKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tV3JpdGFibGVTdHJlYW0gPSAoc3RyZWFtOmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gZnJvbVN0cmVhbShzdHJlYW0sIFwiZmluaXNoXCIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21UcmFuc2Zvcm1TdHJlYW0gPSAoc3RyZWFtOmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gZnJvbVN0cmVhbShzdHJlYW0sIFwiZmluaXNoXCIpO1xuICAgIH07XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgRW50aXR5e1xuICAgICAgICBwdWJsaWMgc3RhdGljIFVJRDpudW1iZXIgPSAxO1xuXG4gICAgICAgIHByaXZhdGUgX3VpZDpzdHJpbmcgPSBudWxsO1xuICAgICAgICBnZXQgdWlkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdWlkO1xuICAgICAgICB9XG4gICAgICAgIHNldCB1aWQodWlkOnN0cmluZyl7XG4gICAgICAgICAgICB0aGlzLl91aWQgPSB1aWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcih1aWRQcmU6c3RyaW5nKXtcbiAgICAgICAgICAgIHRoaXMuX3VpZCA9IHVpZFByZSArIFN0cmluZyhFbnRpdHkuVUlEKyspO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNYWlue1xuICAgICAgICBwdWJsaWMgc3RhdGljIGlzVGVzdDpib29sZWFuID0gZmFsc2U7XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgaW1wb3J0IExvZyA9IHdkQ2IuTG9nO1xuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChjb25kOmJvb2xlYW4sIG1lc3NhZ2U6c3RyaW5nPVwiY29udHJhY3QgZXJyb3JcIil7XG4gICAgICAgIExvZy5lcnJvcighY29uZCwgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmUoSW5GdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBkZXNjcmlwdG9yLnZhbHVlO1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLnZhbHVlID0gZnVuY3Rpb24oLi4uYXJncyl7XG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBJbkZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZW5zdXJlKE91dEZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRlc2NyaXB0b3IudmFsdWU7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmdzKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zID0gW3Jlc3VsdF0uY29uY2F0KGFyZ3MpO1xuXG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgT3V0RnVuYy5hcHBseSh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiByZXF1aXJlR2V0dGVyKEluRnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIGdldHRlciA9IGRlc2NyaXB0b3IuZ2V0O1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLmdldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KXtcbiAgICAgICAgICAgICAgICAgICAgSW5GdW5jLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcmVxdWlyZVNldHRlcihJbkZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciBzZXR0ZXIgPSBkZXNjcmlwdG9yLnNldDtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci5zZXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIEluRnVuYy5jYWxsKHRoaXMsIHZhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2V0dGVyLmNhbGwodGhpcywgdmFsKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUdldHRlcihPdXRGdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICB2YXIgZ2V0dGVyID0gZGVzY3JpcHRvci5nZXQ7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IuZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGdldHRlci5jYWxsKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBPdXRGdW5jLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZW5zdXJlU2V0dGVyKE91dEZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciBzZXR0ZXIgPSBkZXNjcmlwdG9yLnNldDtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci5zZXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gc2V0dGVyLmNhbGwodGhpcywgdmFsKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zID0gW3Jlc3VsdCwgdmFsXTtcblxuICAgICAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KXtcbiAgICAgICAgICAgICAgICAgICAgT3V0RnVuYy5hcHBseSh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGludmFyaWFudChmdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgICAgICBpZihNYWluLmlzVGVzdCkge1xuICAgICAgICAgICAgICAgIGZ1bmModGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgU2luZ2xlRGlzcG9zYWJsZSBpbXBsZW1lbnRzIElEaXNwb3NhYmxle1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShkaXNwb3NlSGFuZGxlcjpGdW5jdGlvbiA9IGZ1bmN0aW9uKCl7fSkge1xuICAgICAgICBcdHZhciBvYmogPSBuZXcgdGhpcyhkaXNwb3NlSGFuZGxlcik7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZGlzcG9zZUhhbmRsZXI6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGRpc3Bvc2VIYW5kbGVyOkZ1bmN0aW9uKXtcbiAgICAgICAgXHR0aGlzLl9kaXNwb3NlSGFuZGxlciA9IGRpc3Bvc2VIYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2VIYW5kbGVyKGhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIgPSBoYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VIYW5kbGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEdyb3VwRGlzcG9zYWJsZSBpbXBsZW1lbnRzIElEaXNwb3NhYmxle1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShkaXNwb3NhYmxlPzpJRGlzcG9zYWJsZSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGRpc3Bvc2FibGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfZ3JvdXA6d2RDYi5Db2xsZWN0aW9uPElEaXNwb3NhYmxlPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8SURpc3Bvc2FibGU+KCk7XG5cbiAgICAgICAgY29uc3RydWN0b3IoZGlzcG9zYWJsZT86SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgaWYoZGlzcG9zYWJsZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fZ3JvdXAuYWRkQ2hpbGQoZGlzcG9zYWJsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYWRkKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXAuYWRkQ2hpbGQoZGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMuX2dyb3VwLmZvckVhY2goKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpID0+IHtcbiAgICAgICAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uIGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG5cdFx0cHVibGljIHN0YXRpYyBjcmVhdGUoc3ViamVjdDpTdWJqZWN0fEdlbmVyYXRvclN1YmplY3QsIG9ic2VydmVyOk9ic2VydmVyKSB7XG5cdFx0XHR2YXIgb2JqID0gbmV3IHRoaXMoc3ViamVjdCwgb2JzZXJ2ZXIpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX3N1YmplY3Q6U3ViamVjdHxHZW5lcmF0b3JTdWJqZWN0ID0gbnVsbDtcblx0XHRwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cblx0XHRjb25zdHJ1Y3RvcihzdWJqZWN0OlN1YmplY3R8R2VuZXJhdG9yU3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuXHRcdFx0dGhpcy5fc3ViamVjdCA9IHN1YmplY3Q7XG5cdFx0XHR0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9zdWJqZWN0LnJlbW92ZSh0aGlzLl9vYnNlcnZlcik7XG5cblx0XHRcdHRoaXMuX29ic2VydmVyLmRpc3Bvc2UoKTtcblx0XHR9XG5cdH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcblx0ZXhwb3J0IGNsYXNzIElubmVyU3Vic2NyaXB0aW9uR3JvdXAgaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX2NvbnRhaW5lcjp3ZENiLkNvbGxlY3Rpb248SURpc3Bvc2FibGU+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJRGlzcG9zYWJsZT4oKTtcblxuXHRcdHB1YmxpYyBhZGRDaGlsZChjaGlsZDpJRGlzcG9zYWJsZSl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuYWRkQ2hpbGQoY2hpbGQpO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBkaXNwb3NlKCl7XG5cdFx0XHR0aGlzLl9jb250YWluZXIuZm9yRWFjaCgoY2hpbGQ6SURpc3Bvc2FibGUpID0+IHtcblx0XHRcdFx0Y2hpbGQuZGlzcG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZGVjbGFyZSB2YXIgZ2xvYmFsOmFueSx3aW5kb3c6YW55O1xuXG4gICAgZXhwb3J0IHZhciByb290OmFueTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2RGcnAsIFwicm9vdFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzTm9kZUpzKCkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBnbG9iYWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB3aW5kb3c7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY29uc3QgQUJTVFJBQ1RfQVRUUklCVVRFOmFueSA9IG51bGw7XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICAvL3JzdnAuanNcbiAgICAvL2RlY2xhcmUgdmFyIFJTVlA6YW55O1xuXG4gICAgLy9ub3Qgc3dhbGxvdyB0aGUgZXJyb3JcbiAgICBpZihyb290LlJTVlApe1xuICAgICAgICByb290LlJTVlAub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH07XG4gICAgICAgIHJvb3QuUlNWUC5vbignZXJyb3InLCByb290LlJTVlAub25lcnJvcik7XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgaW1wb3J0IExvZyA9IHdkQ2IuTG9nO1xuXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0cmVhbSBleHRlbmRzIEVudGl0eXtcbiAgICAgICAgcHVibGljIHNjaGVkdWxlcjpTY2hlZHVsZXIgPSBBQlNUUkFDVF9BVFRSSUJVVEU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVGdW5jOihvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IEZ1bmN0aW9ufHZvaWQgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHN1YnNjcmliZUZ1bmMpe1xuICAgICAgICAgICAgc3VwZXIoXCJTdHJlYW1cIik7XG5cbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlRnVuYyA9IHN1YnNjcmliZUZ1bmMgfHwgZnVuY3Rpb24oKXsgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBzdWJzY3JpYmUoYXJnMTpGdW5jdGlvbnxPYnNlcnZlcnxTdWJqZWN0LCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKTpJRGlzcG9zYWJsZTtcblxuICAgICAgICBwdWJsaWMgYnVpbGRTdHJlYW0ob2JzZXJ2ZXI6SU9ic2VydmVyKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSg8RnVuY3Rpb24+KHRoaXMuc3Vic2NyaWJlRnVuYyhvYnNlcnZlcikgfHwgZnVuY3Rpb24oKXt9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZG8ob25OZXh0PzpGdW5jdGlvbiwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIERvU3RyZWFtLmNyZWF0ZSh0aGlzLCBvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBtYXAoc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBNYXBTdHJlYW0uY3JlYXRlKHRoaXMsIHNlbGVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBmbGF0TWFwKHNlbGVjdG9yOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcChzZWxlY3RvcikubWVyZ2VBbGwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBtZXJnZUFsbCgpe1xuICAgICAgICAgICAgcmV0dXJuIE1lcmdlQWxsU3RyZWFtLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB0YWtlVW50aWwob3RoZXJTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHJldHVybiBUYWtlVW50aWxTdHJlYW0uY3JlYXRlKHRoaXMsIG90aGVyU3RyZWFtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEByZXF1aXJlKGZ1bmN0aW9uKGNvdW50Om51bWJlciA9IDEpe1xuICAgICAgICAgICAgYXNzZXJ0KGNvdW50ID49IDAsIExvZy5pbmZvLkZVTkNfU0hPVUxEKFwiY291bnRcIiwgXCI+PSAwXCIpKTtcbiAgICAgICAgfSlcbiAgICAgICAgcHVibGljIHRha2UoY291bnQ6bnVtYmVyID0gMSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmKGNvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW1wdHkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmUoKHZhbHVlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihjb3VudCA+IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb3VudC0tO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKGNvdW50IDw9IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgQHJlcXVpcmUoZnVuY3Rpb24oY291bnQ6bnVtYmVyID0gMSl7XG4gICAgICAgICAgICBhc3NlcnQoY291bnQgPj0gMCwgTG9nLmluZm8uRlVOQ19TSE9VTEQoXCJjb3VudFwiLCBcIj49IDBcIikpO1xuICAgICAgICB9KVxuICAgICAgICBwdWJsaWMgdGFrZUxhc3QoY291bnQ6bnVtYmVyID0gMSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmKGNvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW1wdHkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICAgICAgICAgICAgICBzZWxmLnN1YnNjcmliZSgodmFsdWU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2godmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHF1ZXVlLmxlbmd0aCA+IGNvdW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB3aGlsZShxdWV1ZS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQocXVldWUuc2hpZnQoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRha2VXaGlsZShwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg6bnVtYmVyLCBzb3VyY2U6U3RyZWFtKT0+Ym9vbGVhbiwgdGhpc0FyZyA9IHRoaXMpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGJpbmRQcmVkaWNhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICBiaW5kUHJlZGljYXRlID0gd2RDYi5GdW5jdGlvblV0aWxzLmJpbmQodGhpc0FyZywgcHJlZGljYXRlKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgICAgICBpc1N0YXJ0ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBzZWxmLnN1YnNjcmliZSgodmFsdWU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGJpbmRQcmVkaWNhdGUodmFsdWUsIGkrKywgc2VsZikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3RhcnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpc1N0YXJ0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIChlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmlsdGVyKHByZWRpY2F0ZToodmFsdWU6YW55KT0+Ym9vbGVhbiwgdGhpc0FyZyA9IHRoaXMpe1xuICAgICAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIEZpbHRlclN0cmVhbSl7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGY6YW55ID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsRmlsdGVyKHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJTdHJlYW0uY3JlYXRlKHRoaXMsIHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZmlsdGVyV2l0aFN0YXRlKHByZWRpY2F0ZToodmFsdWU6YW55KT0+Ym9vbGVhbiwgdGhpc0FyZyA9IHRoaXMpe1xuICAgICAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIEZpbHRlclN0cmVhbSl7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGY6YW55ID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVybmFsRmlsdGVyKHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJXaXRoU3RhdGVTdHJlYW0uY3JlYXRlKHRoaXMsIHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29uY2F0KHN0cmVhbUFycjpBcnJheTxTdHJlYW0+KTtcbiAgICAgICAgcHVibGljIGNvbmNhdCguLi5vdGhlclN0cmVhbSk7XG5cbiAgICAgICAgcHVibGljIGNvbmNhdCgpe1xuICAgICAgICAgICAgdmFyIGFyZ3M6QXJyYXk8U3RyZWFtPiA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNBcnJheShhcmd1bWVudHNbMF0pKXtcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gQ29uY2F0U3RyZWFtLmNyZWF0ZShhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBtZXJnZShzdHJlYW1BcnI6QXJyYXk8U3RyZWFtPik7XG4gICAgICAgIHB1YmxpYyBtZXJnZSguLi5vdGhlclN0cmVhbSk7XG5cbiAgICAgICAgcHVibGljIG1lcmdlKCl7XG4gICAgICAgICAgICB2YXIgYXJnczpBcnJheTxTdHJlYW0+ID0gbnVsbCxcbiAgICAgICAgICAgICAgICBzdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0FycmF5KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG5cbiAgICAgICAgICAgIHN0cmVhbSA9IGZyb21BcnJheShhcmdzKS5tZXJnZUFsbCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlcGVhdChjb3VudDpudW1iZXIgPSAtMSl7XG4gICAgICAgICAgICByZXR1cm4gUmVwZWF0U3RyZWFtLmNyZWF0ZSh0aGlzLCBjb3VudCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgaWdub3JlRWxlbWVudHMoKXtcbiAgICAgICAgICAgIHJldHVybiBJZ25vcmVFbGVtZW50c1N0cmVhbS5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgaGFuZGxlU3ViamVjdChzdWJqZWN0OmFueSl7XG4gICAgICAgICAgICBpZih0aGlzLl9pc1N1YmplY3Qoc3ViamVjdCkpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFN1YmplY3Qoc3ViamVjdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzU3ViamVjdChzdWJqZWN0OlN1YmplY3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHN1YmplY3QgaW5zdGFuY2VvZiBTdWJqZWN0O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0U3ViamVjdChzdWJqZWN0OlN1YmplY3Qpe1xuICAgICAgICAgICAgc3ViamVjdC5zb3VyY2UgPSB0aGlzO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICB3cmFwcGVyID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgY2FsbGJhY2sgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBnZWNrb1ZlcnNpb24gPSBudWxsLFxuICAgICAgICAgICAgdXNlckFnZW50ID0gcm9vdC5uYXZpZ2F0b3IgJiYgcm9vdC5uYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgd3JhcHBlciA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gICAgICAgICAgICB0aW1lID0gcm9vdC5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIHNlbGYuY2FsbGJhY2sodGltZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyohXG4gICAgICAgICBidWchXG4gICAgICAgICBiZWxvdyBjb2RlOlxuICAgICAgICAgd2hlbiBpbnZva2UgYiBhZnRlciAxcywgd2lsbCBvbmx5IGludm9rZSBiLCBub3QgaW52b2tlIGEhXG5cbiAgICAgICAgIGZ1bmN0aW9uIGEodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImFcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGZ1bmN0aW9uIGIodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImJcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYik7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGEoKTtcblxuICAgICAgICAgc2V0VGltZW91dChiLCAxMDAwKTtcblxuXG5cbiAgICAgICAgIHNvIHVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcHJpb3JpdHkhXG4gICAgICAgICAqL1xuICAgICAgICBpZihyb290LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgQ2hyb21lIDEwIGJ1ZyB3aGVyZSBDaHJvbWVcbiAgICAgICAgLy8gZG9lcyBub3QgcGFzcyB0aGUgdGltZSB0byB0aGUgYW5pbWF0aW9uIGZ1bmN0aW9uXG5cbiAgICAgICAgaWYgKHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBEZWZpbmUgdGhlIHdyYXBwZXJcblxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgc3dpdGNoXG5cbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgLy8gQnJvd3NlciBjYWxscyB0aGUgd3JhcHBlciBhbmQgd3JhcHBlciBjYWxscyB0aGUgY2FsbGJhY2tcblxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSh3cmFwcGVyLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v5L+u5pS5dGltZeWPguaVsFxuICAgICAgICBpZiAocm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgR2Vja28gMi4wLCB3aGljaCBoYXMgYSBidWcgaW5cbiAgICAgICAgLy8gbW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKCkgdGhhdCByZXN0cmljdHMgYW5pbWF0aW9uc1xuICAgICAgICAvLyB0byAzMC00MCBmcHMuXG5cbiAgICAgICAgaWYgKHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBDaGVjayB0aGUgR2Vja28gdmVyc2lvbi4gR2Vja28gaXMgdXNlZCBieSBicm93c2Vyc1xuICAgICAgICAgICAgLy8gb3RoZXIgdGhhbiBGaXJlZm94LiBHZWNrbyAyLjAgY29ycmVzcG9uZHMgdG9cbiAgICAgICAgICAgIC8vIEZpcmVmb3ggNC4wLlxuXG4gICAgICAgICAgICBpbmRleCA9IHVzZXJBZ2VudC5pbmRleE9mKCdydjonKTtcblxuICAgICAgICAgICAgaWYgKHVzZXJBZ2VudC5pbmRleE9mKCdHZWNrbycpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gdXNlckFnZW50LnN1YnN0cihpbmRleCArIDMsIDMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGdlY2tvVmVyc2lvbiA9PT0gJzIuMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yY2VzIHRoZSByZXR1cm4gc3RhdGVtZW50IHRvIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgc2V0VGltZW91dCgpIGZ1bmN0aW9uLlxuXG4gICAgICAgICAgICAgICAgICAgIHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHJvb3Qub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXG4gICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaDtcblxuICAgICAgICAgICAgICAgIHJvb3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gcm9vdC5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2ggPSByb290LnBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYudGltZW91dCA9IDEwMDAgLyA2MCAtIChmaW5pc2ggLSBzdGFydCk7XG5cbiAgICAgICAgICAgICAgICB9LCBzZWxmLnRpbWVvdXQpO1xuICAgICAgICAgICAgfTtcbiAgICB9KCkpO1xuXG4gICAgcm9vdC5jYW5jZWxOZXh0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC5jYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290LndlYmtpdENhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm1vekNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm9DYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC5tc0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCBjbGVhclRpbWVvdXQ7XG5cblxuICAgIGV4cG9ydCBjbGFzcyBTY2hlZHVsZXJ7XG4gICAgICAgIC8vdG9kbyByZW1vdmUgXCIuLi5hcmdzXCJcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9yZXF1ZXN0TG9vcElkOmFueSA9IG51bGw7XG4gICAgICAgIGdldCByZXF1ZXN0TG9vcElkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgcmVxdWVzdExvb3BJZChyZXF1ZXN0TG9vcElkOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0TG9vcElkID0gcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vb2JzZXJ2ZXIgaXMgZm9yIFRlc3RTY2hlZHVsZXIgdG8gcmV3cml0ZVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICBhY3Rpb24oaW5pdGlhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGludGVydmFsOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbCA9IGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgICAgIH0sIGludGVydmFsKVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXI6SU9ic2VydmVyLCBhY3Rpb246RnVuY3Rpb24pe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGxvb3AgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNFbmQgPSBhY3Rpb24odGltZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoaXNFbmQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcmVxdWVzdExvb3BJZCA9IHJvb3QucmVxdWVzdE5leHRBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0TG9vcElkID0gcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgT2JzZXJ2ZXIgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IG51bGw7XG4gICAgICAgIGdldCBpc0Rpc3Bvc2VkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNEaXNwb3NlZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNEaXNwb3NlZChpc0Rpc3Bvc2VkOmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IGlzRGlzcG9zZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyTmV4dDpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJFcnJvcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJDb21wbGV0ZWQ6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2lzU3RvcDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIC8vcHJpdmF0ZSBfZGlzcG9zZUhhbmRsZXI6d2RDYi5Db2xsZWN0aW9uPEZ1bmN0aW9uPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2FibGU6SURpc3Bvc2FibGUgPSBudWxsO1xuXG5cbiAgICAgICAgY29uc3RydWN0b3Iob2JzZXJ2ZXI6SU9ic2VydmVyKTtcbiAgICAgICAgY29uc3RydWN0b3Iob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbik7XG5cbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgICAgICAgc3VwZXIoXCJPYnNlcnZlclwiKTtcblxuICAgICAgICAgICAgaWYoYXJncy5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgIGxldCBvYnNlcnZlcjpJT2JzZXJ2ZXIgPSBhcmdzWzBdO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0ID0gZnVuY3Rpb24odil7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodik7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgb25OZXh0ID0gYXJnc1swXSxcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvciA9IGFyZ3NbMV0sXG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGVkID0gYXJnc1syXTtcblxuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCA9IG9uTmV4dCB8fCBmdW5jdGlvbih2KXt9O1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IgPSBvbkVycm9yIHx8IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCA9IG9uQ29tcGxldGVkIHx8IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vbk5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9kaXNwb3NhYmxlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy90aGlzLl9kaXNwb3NlSGFuZGxlci5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAvLyAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICAvL30pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wdWJsaWMgZmFpbChlKSB7XG4gICAgICAgIC8vICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgIC8vICAgICAgICB0aGlzLl9pc1N0b3AgPSB0cnVlO1xuICAgICAgICAvLyAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgLy8gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHVibGljIHNldERpc3Bvc2FibGUoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlID0gZGlzcG9zYWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbk5leHQodmFsdWU6YW55KTtcblxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25FcnJvcihlcnJvcjphbnkpO1xuXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbkNvbXBsZXRlZCgpO1xuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgU3ViamVjdCBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBnZXQgc291cmNlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBzb3VyY2Uoc291cmNlOlN0cmVhbSl7XG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjphbnkgPSBuZXcgU3ViamVjdE9ic2VydmVyKCk7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxPzpGdW5jdGlvbnxPYnNlcnZlciwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBhcmcxIGluc3RhbmNlb2YgT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICA/IDxBdXRvRGV0YWNoT2JzZXJ2ZXI+YXJnMVxuICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICAvL3RoaXMuX3NvdXJjZSAmJiBvYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLl9zb3VyY2UuZGlzcG9zZUhhbmRsZXIpO1xuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5hZGRDaGlsZChvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBJbm5lclN1YnNjcmlwdGlvbi5jcmVhdGUodGhpcywgb2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG5leHQodmFsdWU6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGVycm9yKGVycm9yOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX3NvdXJjZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbSh0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLnJlbW92ZUNoaWxkKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkaXNwb3NlKCl7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEdlbmVyYXRvclN1YmplY3QgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNTdGFydDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGdldCBpc1N0YXJ0KCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNTdGFydDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNTdGFydChpc1N0YXJ0OmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNTdGFydCA9IGlzU3RhcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICAgICAgc3VwZXIoXCJHZW5lcmF0b3JTdWJqZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9ic2VydmVyOmFueSA9IG5ldyBTdWJqZWN0T2JzZXJ2ZXIoKTtcblxuICAgICAgICAvKiFcbiAgICAgICAgb3V0ZXIgaG9vayBtZXRob2RcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBvbkJlZm9yZU5leHQodmFsdWU6YW55KXtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkFmdGVyTmV4dCh2YWx1ZTphbnkpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbklzQ29tcGxldGVkKHZhbHVlOmFueSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQmVmb3JlRXJyb3IoZXJyb3I6YW55KSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25BZnRlckVycm9yKGVycm9yOmFueSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQmVmb3JlQ29tcGxldGVkKCkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQWZ0ZXJDb21wbGV0ZWQoKSB7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vdG9kb1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE/OkZ1bmN0aW9ufE9ic2VydmVyLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gPEF1dG9EZXRhY2hPYnNlcnZlcj5hcmcxXG4gICAgICAgICAgICAgICAgICAgIDogQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8RnVuY3Rpb24+YXJnMSwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLmFkZENoaWxkKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIElubmVyU3Vic2NyaXB0aW9uLmNyZWF0ZSh0aGlzLCBvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzU3RhcnQgfHwgdGhpcy5vYnNlcnZlci5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMub25CZWZvcmVOZXh0KHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9uQWZ0ZXJOZXh0KHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIGlmKHRoaXMub25Jc0NvbXBsZXRlZCh2YWx1ZSkpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1N0YXJ0IHx8IHRoaXMub2JzZXJ2ZXIuaXNFbXB0eSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub25CZWZvcmVFcnJvcihlcnJvcik7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuXG4gICAgICAgICAgICB0aGlzLm9uQWZ0ZXJFcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNTdGFydCB8fCB0aGlzLm9ic2VydmVyLmlzRW1wdHkoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlQ29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuY29tcGxldGVkKCk7XG5cbiAgICAgICAgICAgIHRoaXMub25BZnRlckNvbXBsZXRlZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRvU3RyZWFtKCl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3RyZWFtID0gbnVsbDtcblxuICAgICAgICAgICAgc3RyZWFtID0gQW5vbnltb3VzU3RyZWFtLmNyZWF0ZSgob2JzZXJ2ZXI6T2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLnN1YnNjcmliZShvYnNlcnZlcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGFydCgpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl9pc1N0YXJ0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5zZXREaXNwb3NhYmxlKFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdG9wKCl7XG4gICAgICAgICAgICB0aGlzLl9pc1N0YXJ0ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIucmVtb3ZlQ2hpbGQob2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBBbm9ueW1vdXNPYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShvbk5leHQ6RnVuY3Rpb24sIG9uRXJyb3I6RnVuY3Rpb24sIG9uQ29tcGxldGVkOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlck5leHQodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBBdXRvRGV0YWNoT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob2JzZXJ2ZXI6SU9ic2VydmVyKTtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbik7XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYoYXJncy5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhhcmdzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgd2RDYi5Mb2cubG9nKFwib25seSBjYW4gZGlzcG9zZSBvbmNlXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZTphbnkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3I6YW55KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIE1hcE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZWxlY3Rvcih2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRG9PYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBwcmV2T2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3ByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlciA9IHByZXZPYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgLy90aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzdHJlYW1Hcm91cCwgZ3JvdXBEaXNwb3NhYmxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBnZXQgY3VycmVudE9ic2VydmVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG4gICAgICAgIHNldCBjdXJyZW50T2JzZXJ2ZXIoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9kb25lOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZ2V0IGRvbmUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kb25lO1xuICAgICAgICB9XG4gICAgICAgIHNldCBkb25lKGRvbmU6Ym9vbGVhbil7XG4gICAgICAgICAgICB0aGlzLl9kb25lID0gZG9uZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3N0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGdyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgICAgICB0aGlzLl9ncm91cERpc3Bvc2FibGUgPSBncm91cERpc3Bvc2FibGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICB3ZENiLkxvZy5lcnJvcighKGlubmVyU291cmNlIGluc3RhbmNlb2YgU3RyZWFtIHx8IEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSksIHdkQ2IuTG9nLmluZm8uRlVOQ19NVVNUX0JFKFwiaW5uZXJTb3VyY2VcIiwgXCJTdHJlYW0gb3IgUHJvbWlzZVwiKSk7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSl7XG4gICAgICAgICAgICAgICAgaW5uZXJTb3VyY2UgPSBmcm9tUHJvbWlzZShpbm5lclNvdXJjZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLmFkZENoaWxkKGlubmVyU291cmNlKTtcblxuICAgICAgICAgICAgdGhpcy5fZ3JvdXBEaXNwb3NhYmxlLmFkZChpbm5lclNvdXJjZS5idWlsZFN0cmVhbShJbm5lck9ic2VydmVyLmNyZWF0ZSh0aGlzLCB0aGlzLl9zdHJlYW1Hcm91cCwgaW5uZXJTb3VyY2UpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGFzcyBJbm5lck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHBhcmVudDpNZXJnZUFsbE9ic2VydmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgY3VycmVudFN0cmVhbTpTdHJlYW0pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0cmVhbSA9IGN1cnJlbnRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdHJlYW0gPSB0aGlzLl9jdXJyZW50U3RyZWFtLFxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHRoaXMuX3BhcmVudDtcblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAucmVtb3ZlQ2hpbGQoKHN0cmVhbTpTdHJlYW0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKHN0cmVhbSwgY3VycmVudFN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9wYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgLy90aGlzLmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgLyohXG4gICAgICAgICAgICBpZiB0aGlzIGlubmVyU291cmNlIGlzIGFzeW5jIHN0cmVhbShhcyBwcm9taXNlIHN0cmVhbSksXG4gICAgICAgICAgICBpdCB3aWxsIGZpcnN0IGV4ZWMgYWxsIHBhcmVudC5uZXh0IGFuZCBvbmUgcGFyZW50LmNvbXBsZXRlZCxcbiAgICAgICAgICAgIHRoZW4gZXhlYyBhbGwgdGhpcy5uZXh0IGFuZCBhbGwgdGhpcy5jb21wbGV0ZWRcbiAgICAgICAgICAgIHNvIGluIHRoaXMgY2FzZSwgaXQgc2hvdWxkIGludm9rZSBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCBhZnRlciB0aGUgbGFzdCBpbnZva2NhdGlvbiBvZiB0aGlzLmNvbXBsZXRlZChoYXZlIGludm9rZWQgYWxsIHRoZSBpbm5lclNvdXJjZSlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZih0aGlzLl9pc0FzeW5jKCkgJiYgdGhpcy5fc3RyZWFtR3JvdXAuZ2V0Q291bnQoKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgcGFyZW50LmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzQXN5bmMoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQuZG9uZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIENvbmNhdE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdGFydE5leHRTdHJlYW06RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHN0YXJ0TmV4dFN0cmVhbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBjdXJyZW50T2JzZXJ2ZXI6YW55ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdGFydE5leHRTdHJlYW06RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0TmV4dFN0cmVhbSA9IHN0YXJ0TmV4dFN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgLyohXG4gICAgICAgICAgICBpZiBcInRoaXMuY3VycmVudE9ic2VydmVyLm5leHRcIiBlcnJvciwgaXQgd2lsbCBwYXNlIHRvIHRoaXMuY3VycmVudE9ic2VydmVyLT5vbkVycm9yLlxuICAgICAgICAgICAgc28gaXQgc2hvdWxkbid0IGludm9rZSB0aGlzLmN1cnJlbnRPYnNlcnZlci5lcnJvciBoZXJlIGFnYWluIVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAvL3RyeXtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgLy99XG4gICAgICAgICAgICAvL2NhdGNoKGUpe1xuICAgICAgICAgICAgLy8gICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICAvL3RoaXMuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnROZXh0U3RyZWFtKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFN1YmplY3RPYnNlcnZlciBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHVibGljIG9ic2VydmVyczp3ZENiLkNvbGxlY3Rpb248SU9ic2VydmVyPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8SU9ic2VydmVyPigpO1xuXG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2FibGU6SURpc3Bvc2FibGUgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBpc0VtcHR5KCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vYnNlcnZlcnMuZ2V0Q291bnQoKSA9PT0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYWRkQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuX2Rpc3Bvc2FibGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZUNoaWxkKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnJlbW92ZUNoaWxkKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBKdWRnZVV0aWxzLmlzRXF1YWwob2IsIG9ic2VydmVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2V0RGlzcG9zYWJsZShkaXNwb3NhYmxlOklEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9ic2VydmVyOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZShkaXNwb3NhYmxlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlID0gZGlzcG9zYWJsZTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIEZpbHRlck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCBzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMocHJldk9ic2VydmVyLCBwcmVkaWNhdGUsIHNvdXJjZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmVkaWNhdGU6KHZhbHVlOmFueSk9PmJvb2xlYW4sIHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlciA9IHByZXZPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMucHJlZGljYXRlID0gcHJlZGljYXRlO1xuICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgcHJldk9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBzb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJvdGVjdGVkIGk6bnVtYmVyID0gMDtcbiAgICAgICAgcHJvdGVjdGVkIHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4gPSBudWxsO1xuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJlZGljYXRlKHZhbHVlLCB0aGlzLmkrKywgdGhpcy5zb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJldk9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIEZpbHRlcldpdGhTdGF0ZU9ic2VydmVyIGV4dGVuZHMgRmlsdGVyT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCBzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMocHJldk9ic2VydmVyLCBwcmVkaWNhdGUsIHNvdXJjZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1RyaWdnZXI6Ym9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBkYXRhOnt2YWx1ZTphbnksIHN0YXRlOkZpbHRlclN0YXRlfSA9IG51bGw7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJlZGljYXRlKHZhbHVlLCB0aGlzLmkrKywgdGhpcy5zb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKCF0aGlzLl9pc1RyaWdnZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTp2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTpGaWx0ZXJTdGF0ZS5FTlRFUlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTp2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTpGaWx0ZXJTdGF0ZS5UUklHR0VSXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIubmV4dChkYXRhKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc1RyaWdnZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLl9pc1RyaWdnZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTp2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTpGaWx0ZXJTdGF0ZS5MRUFWRVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIubmV4dChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzVHJpZ2dlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VTdHJlYW0gZXh0ZW5kcyBTdHJlYW17XG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcik6SURpc3Bvc2FibGU7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/LCBvbkNvbXBsZXRlZD8pOklEaXNwb3NhYmxlIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuaGFuZGxlU3ViamVjdChhcmcxKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8SU9ic2VydmVyPmFyZzEpXG4gICAgICAgICAgICAgICAgOiBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxGdW5jdGlvbj5hcmcxLCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIC8vb2JzZXJ2ZXIuc2V0RGlzcG9zZUhhbmRsZXIodGhpcy5kaXNwb3NlSGFuZGxlcik7XG5cblxuICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZSh0aGlzLmJ1aWxkU3RyZWFtKG9ic2VydmVyKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgc3VwZXIuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmVDb3JlKG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHJpdmF0ZSBfaGFzTXVsdGlPYnNlcnZlcnMoKXtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVyLmdldE9ic2VydmVycygpID4gMTtcbiAgICAgICAgLy99XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIERvU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgb25OZXh0PzpGdW5jdGlvbiwgb25FcnJvcj86RnVuY3Rpb24sIG9uQ29tcGxldGVkPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgb25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyID0gQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvcixvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKERvT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLl9vYnNlcnZlcikpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1hcFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIHNlbGVjdG9yOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc2VsZWN0b3I6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIHNlbGVjdG9yOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShNYXBPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX3NlbGVjdG9yKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21BcnJheVN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhhcnJheSwgc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FycmF5OkFycmF5PGFueT4gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGFycmF5OkFycmF5PGFueT4sIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyYXk7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgYXJyYXkgPSB0aGlzLl9hcnJheSxcbiAgICAgICAgICAgICAgICBsZW4gPSBhcnJheS5sZW5ndGg7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvb3BSZWN1cnNpdmUoaSkge1xuICAgICAgICAgICAgICAgIGlmIChpIDwgbGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoYXJyYXlbaV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50cy5jYWxsZWUoaSArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlciwgMCwgbG9vcFJlY3Vyc2l2ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGcm9tUHJvbWlzZVN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHByb21pc2U6YW55LCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKHByb21pc2UsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcHJvbWlzZTphbnkgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByb21pc2U6YW55LCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3Byb21pc2UudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0sIG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21FdmVudFBhdHRlcm5TdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hZGRIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYWRkSGFuZGxlcjpGdW5jdGlvbiwgcmVtb3ZlSGFuZGxlcjpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlciA9IGFkZEhhbmRsZXI7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVIYW5kbGVyID0gcmVtb3ZlSGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlubmVySGFuZGxlcihldmVudCl7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2FkZEhhbmRsZXIoaW5uZXJIYW5kbGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLl9yZW1vdmVIYW5kbGVyKGlubmVySGFuZGxlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBBbm9ueW1vdXNTdHJlYW0gZXh0ZW5kcyBTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHN1YnNjcmliZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzdWJzY3JpYmVGdW5jKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHN1YnNjcmliZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKHN1YnNjcmliZUZ1bmMpO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoc3ViamVjdDpTdWJqZWN0KTpJRGlzcG9zYWJsZTtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob25OZXh0Oih2YWx1ZTphbnkpPT52b2lkKTpJRGlzcG9zYWJsZTtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZShvbk5leHQ6KHZhbHVlOmFueSk9PnZvaWQsIG9uRXJyb3I6KGU6YW55KT0+dm9pZCk6SURpc3Bvc2FibGU7XG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUob25OZXh0Oih2YWx1ZTphbnkpPT52b2lkLCBvbkVycm9yOihlOmFueSk9PnZvaWQsIG9uQ29tcGxldGU6KCk9PnZvaWQpOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoLi4uYXJncyk6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyOkF1dG9EZXRhY2hPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKGFyZ3NbMF0gaW5zdGFuY2VvZiBTdWJqZWN0KXtcbiAgICAgICAgICAgICAgICBsZXQgc3ViamVjdDpTdWJqZWN0ID0gPFN1YmplY3Q+YXJnc1swXTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU3ViamVjdChzdWJqZWN0KTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoSnVkZ2VVdGlscy5pc0lPYnNlcnZlcig8SU9ic2VydmVyPmFyZ3NbMF0pKXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlciA9IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPElPYnNlcnZlcj5hcmdzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgbGV0IG9uTmV4dDpGdW5jdGlvbiA9IDxGdW5jdGlvbj5hcmdzWzBdLFxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yOkZ1bmN0aW9uID0gPEZ1bmN0aW9uPmFyZ3NbMV0gfHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZWQ6RnVuY3Rpb24gPSA8RnVuY3Rpb24+YXJnc1syXSB8fCBudWxsO1xuXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBJbnRlcnZhbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGludGVydmFsOm51bWJlciwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGludGVydmFsLCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICBvYmouaW5pdFdoZW5DcmVhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2ludGVydmFsOm51bWJlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoaW50ZXJ2YWw6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgaW5pdFdoZW5DcmVhdGUoKXtcbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gdGhpcy5faW50ZXJ2YWwgPD0gMCA/IDEgOiB0aGlzLl9pbnRlcnZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaWQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZCA9IHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hJbnRlcnZhbChvYnNlcnZlciwgMCwgdGhpcy5faW50ZXJ2YWwsIChjb3VudCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vc2VsZi5zY2hlZHVsZXIubmV4dChjb3VudCk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChjb3VudCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY291bnQgKyAxO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vRGlzcG9zZXIuYWRkRGlzcG9zZUhhbmRsZXIoKCkgPT4ge1xuICAgICAgICAgICAgLy99KTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LmNsZWFySW50ZXJ2YWwoaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEludGVydmFsUmVxdWVzdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNFbmQ6Ym9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlciwgKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2lzRW5kO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBTaW5nbGVEaXNwb3NhYmxlLmNyZWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5jYW5jZWxOZXh0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNlbGYuc2NoZWR1bGVyLnJlcXVlc3RMb29wSWQpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2lzRW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICAvL3RoaXMuX29ic2VydmVyID0gQW5vbnltb3VzT2JzZXJ2ZXIuY3JlYXRlKG9uTmV4dCwgb25FcnJvcixvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc3RyZWFtR3JvdXAgPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKSxcbiAgICAgICAgICAgICAgICBncm91cERpc3Bvc2FibGUgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgICB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oTWVyZ2VBbGxPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHN0cmVhbUdyb3VwLCBncm91cERpc3Bvc2FibGUpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwRGlzcG9zYWJsZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBUYWtlVW50aWxTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBvdGhlclN0ZWFtOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgb3RoZXJTdGVhbSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb3RoZXJTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtLCBvdGhlclN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuX290aGVyU3RyZWFtID0gSnVkZ2VVdGlscy5pc1Byb21pc2Uob3RoZXJTdHJlYW0pID8gZnJvbVByb21pc2Uob3RoZXJTdHJlYW0pIDogb3RoZXJTdHJlYW07XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCksXG4gICAgICAgICAgICAgICAgYXV0b0RldGFjaE9ic2VydmVyID0gQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciksXG4gICAgICAgICAgICAgICAgc291cmNlRGlzcG9zYWJsZSA9IG51bGw7XG5cbiAgICAgICAgICAgIHNvdXJjZURpc3Bvc2FibGUgPSB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICBncm91cC5hZGQoc291cmNlRGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIGF1dG9EZXRhY2hPYnNlcnZlci5zZXREaXNwb3NhYmxlKHNvdXJjZURpc3Bvc2FibGUpO1xuXG4gICAgICAgICAgICBncm91cC5hZGQodGhpcy5fb3RoZXJTdHJlYW0uYnVpbGRTdHJlYW0oVGFrZVVudGlsT2JzZXJ2ZXIuY3JlYXRlKGF1dG9EZXRhY2hPYnNlcnZlcikpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBDb25jYXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2VzOkFycmF5PFN0cmVhbT4pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2VzKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZXM6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPFN0cmVhbT4oKTtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2VzOkFycmF5PFN0cmVhbT4pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgLy90b2RvIGRvbid0IHNldCBzY2hlZHVsZXIgaGVyZT9cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc291cmNlc1swXS5zY2hlZHVsZXI7XG5cbiAgICAgICAgICAgIHNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc1Byb21pc2Uoc291cmNlKSl7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuYWRkQ2hpbGQoZnJvbVByb21pc2Uoc291cmNlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZXMuYWRkQ2hpbGQoc291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY291bnQgPSB0aGlzLl9zb3VyY2VzLmdldENvdW50KCksXG4gICAgICAgICAgICAgICAgZCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShpKSB7XG4gICAgICAgICAgICAgICAgaWYoaSA9PT0gY291bnQpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZC5hZGQoc2VsZi5fc291cmNlcy5nZXRDaGlsZChpKS5idWlsZFN0cmVhbShDb25jYXRPYnNlcnZlci5jcmVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlciwgKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wUmVjdXJzaXZlKGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIDAsIGxvb3BSZWN1cnNpdmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZShkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBSZXBlYXRTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBjb3VudDpudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIGNvdW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9jb3VudDpudW1iZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIGNvdW50Om51bWJlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fY291bnQgPSBjb3VudDtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuXG4gICAgICAgICAgICAvL3RoaXMuc3ViamVjdEdyb3VwID0gdGhpcy5fc291cmNlLnN1YmplY3RHcm91cDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBkID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGNvdW50KSB7XG4gICAgICAgICAgICAgICAgaWYoY291bnQgPT09IDApe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZC5hZGQoXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NvdXJjZS5idWlsZFN0cmVhbShDb25jYXRPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BSZWN1cnNpdmUoY291bnQgLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyLCB0aGlzLl9jb3VudCwgbG9vcFJlY3Vyc2l2ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBHcm91cERpc3Bvc2FibGUuY3JlYXRlKGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIElnbm9yZUVsZW1lbnRzU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihzb3VyY2U6U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gdGhpcy5fc291cmNlLnNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKElnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIERlZmVyU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoYnVpbGRTdHJlYW1GdW5jKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2J1aWxkU3RyZWFtRnVuYzpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9idWlsZFN0cmVhbUZ1bmMgPSBidWlsZFN0cmVhbUZ1bmM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIGdyb3VwID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICBncm91cC5hZGQodGhpcy5fYnVpbGRTdHJlYW1GdW5jKCkuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCB0aGlzQXJnOmFueSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgcHJlZGljYXRlLCB0aGlzQXJnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIHByZWRpY2F0ZToodmFsdWU6YW55LCBpbmRleD86bnVtYmVyLCBzb3VyY2U/OlN0cmVhbSk9PmJvb2xlYW4sIHRoaXNBcmc6YW55KXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLnByZWRpY2F0ZSA9IHdkQ2IuRnVuY3Rpb25VdGlscy5iaW5kKHRoaXNBcmcsIHByZWRpY2F0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHJlZGljYXRlOih2YWx1ZTphbnksIGluZGV4PzpudW1iZXIsIHNvdXJjZT86U3RyZWFtKT0+Ym9vbGVhbiA9IG51bGw7XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2Uuc3Vic2NyaWJlKHRoaXMuY3JlYXRlT2JzZXJ2ZXIob2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbnRlcm5hbEZpbHRlcihwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCB0aGlzQXJnOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVTdHJlYW1Gb3JJbnRlcm5hbEZpbHRlcih0aGlzLl9zb3VyY2UsIHRoaXMuX2lubmVyUHJlZGljYXRlKHByZWRpY2F0ZSwgdGhpcyksIHRoaXNBcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZU9ic2VydmVyKG9ic2VydmVyOklPYnNlcnZlcik6T2JzZXJ2ZXJ7XG4gICAgICAgICAgICByZXR1cm4gRmlsdGVyT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyLCB0aGlzLnByZWRpY2F0ZSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlU3RyZWFtRm9ySW50ZXJuYWxGaWx0ZXIoc291cmNlOlN0cmVhbSwgaW5uZXJQcmVkaWNhdGU6YW55LCB0aGlzQXJnOmFueSk6U3RyZWFte1xuICAgICAgICAgICAgcmV0dXJuIEZpbHRlclN0cmVhbS5jcmVhdGUoc291cmNlLCBpbm5lclByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pbm5lclByZWRpY2F0ZShwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCBzZWxmOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gKHZhbHVlLCBpLCBvKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYucHJlZGljYXRlKHZhbHVlLCBpLCBvKSAmJiBwcmVkaWNhdGUuY2FsbCh0aGlzLCB2YWx1ZSwgaSwgbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyV2l0aFN0YXRlU3RyZWFtIGV4dGVuZHMgRmlsdGVyU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBwcmVkaWNhdGU6KHZhbHVlOmFueSwgaW5kZXg/Om51bWJlciwgc291cmNlPzpTdHJlYW0pPT5ib29sZWFuLCB0aGlzQXJnOmFueSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgcHJlZGljYXRlLCB0aGlzQXJnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVPYnNlcnZlcihvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgcmV0dXJuIEZpbHRlcldpdGhTdGF0ZU9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5wcmVkaWNhdGUsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVN0cmVhbUZvckludGVybmFsRmlsdGVyKHNvdXJjZTpTdHJlYW0sIGlubmVyUHJlZGljYXRlOmFueSwgdGhpc0FyZzphbnkpOlN0cmVhbXtcbiAgICAgICAgICAgIHJldHVybiBGaWx0ZXJXaXRoU3RhdGVTdHJlYW0uY3JlYXRlKHNvdXJjZSwgaW5uZXJQcmVkaWNhdGUsIHRoaXNBcmcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IHZhciBjcmVhdGVTdHJlYW0gPSAoc3Vic2NyaWJlRnVuYykgPT4ge1xuICAgICAgICByZXR1cm4gQW5vbnltb3VzU3RyZWFtLmNyZWF0ZShzdWJzY3JpYmVGdW5jKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tQXJyYXkgPSAoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PntcbiAgICAgICAgcmV0dXJuIEZyb21BcnJheVN0cmVhbS5jcmVhdGUoYXJyYXksIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVByb21pc2UgPSAocHJvbWlzZTphbnksIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT57XG4gICAgICAgIHJldHVybiBGcm9tUHJvbWlzZVN0cmVhbS5jcmVhdGUocHJvbWlzZSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tRXZlbnRQYXR0ZXJuID0gKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pID0+e1xuICAgICAgICByZXR1cm4gRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5jcmVhdGUoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgaW50ZXJ2YWwgPSAoaW50ZXJ2YWwsIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT4ge1xuICAgICAgICByZXR1cm4gSW50ZXJ2YWxTdHJlYW0uY3JlYXRlKGludGVydmFsLCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGludGVydmFsUmVxdWVzdCA9IChzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsUmVxdWVzdFN0cmVhbS5jcmVhdGUoc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBlbXB0eSA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PntcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBjYWxsRnVuYyA9IChmdW5jOkZ1bmN0aW9uLCBjb250ZXh0ID0gcm9vdCkgPT4ge1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGZ1bmMuY2FsbChjb250ZXh0LCBudWxsKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGp1ZGdlID0gKGNvbmRpdGlvbjpGdW5jdGlvbiwgdGhlblNvdXJjZTpGdW5jdGlvbiwgZWxzZVNvdXJjZTpGdW5jdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gY29uZGl0aW9uKCkgPyB0aGVuU291cmNlKCkgOiBlbHNlU291cmNlKCk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZGVmZXIgPSAoYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiBEZWZlclN0cmVhbS5jcmVhdGUoYnVpbGRTdHJlYW1GdW5jKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBqdXN0ID0gKHJldHVyblZhbHVlOmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQocmV0dXJuVmFsdWUpO1xuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBlbnVtIEZpbHRlclN0YXRle1xuICAgICAgICBUUklHR0VSLFxuICAgICAgICBFTlRFUixcbiAgICAgICAgTEVBVkVcbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnAge1xuICAgIHZhciBkZWZhdWx0SXNFcXVhbCA9IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBhID09PSBiO1xuICAgIH07XG5cbiAgICBleHBvcnQgY2xhc3MgUmVjb3JkIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUodGltZTpudW1iZXIsIHZhbHVlOmFueSwgYWN0aW9uVHlwZT86QWN0aW9uVHlwZSwgY29tcGFyZXI/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXModGltZSwgdmFsdWUsIGFjdGlvblR5cGUsIGNvbXBhcmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3RpbWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgZ2V0IHRpbWUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90aW1lO1xuICAgICAgICB9XG4gICAgICAgIHNldCB0aW1lKHRpbWU6bnVtYmVyKXtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfdmFsdWU6bnVtYmVyID0gbnVsbDtcbiAgICAgICAgZ2V0IHZhbHVlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHZhbHVlKHZhbHVlOm51bWJlcil7XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYWN0aW9uVHlwZTpBY3Rpb25UeXBlID0gbnVsbDtcbiAgICAgICAgZ2V0IGFjdGlvblR5cGUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY3Rpb25UeXBlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBhY3Rpb25UeXBlKGFjdGlvblR5cGU6QWN0aW9uVHlwZSl7XG4gICAgICAgICAgICB0aGlzLl9hY3Rpb25UeXBlID0gYWN0aW9uVHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2NvbXBhcmVyOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih0aW1lLCB2YWx1ZSwgYWN0aW9uVHlwZTpBY3Rpb25UeXBlLCBjb21wYXJlcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fYWN0aW9uVHlwZSA9IGFjdGlvblR5cGU7XG4gICAgICAgICAgICB0aGlzLl9jb21wYXJlciA9IGNvbXBhcmVyIHx8IGRlZmF1bHRJc0VxdWFsO1xuICAgICAgICB9XG5cbiAgICAgICAgZXF1YWxzKG90aGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZSA9PT0gb3RoZXIudGltZSAmJiB0aGlzLl9jb21wYXJlcih0aGlzLl92YWx1ZSwgb3RoZXIudmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNb2NrT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSA8W1JlY29yZF0+W107XG4gICAgICAgIGdldCBtZXNzYWdlcygpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICAgICAgICB9XG4gICAgICAgIHNldCBtZXNzYWdlcyhtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHZhciByZWNvcmQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzRGlyZWN0T2JqZWN0KHZhbHVlKSl7XG4gICAgICAgICAgICAgICAgcmVjb3JkID0gUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQsIChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSBpbiBhKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGEuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFbaV0gIT09IGJbaV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcmVjb3JkID0gUmVjb3JkLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIuY2xvY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKHJlY29yZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCBlcnJvciwgQWN0aW9uVHlwZS5FUlJPUikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCBudWxsLCBBY3Rpb25UeXBlLkNPTVBMRVRFRCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb3B5KCl7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gTW9ja09ic2VydmVyLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXN1bHQubWVzc2FnZXMgPSB0aGlzLl9tZXNzYWdlcztcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTW9ja1Byb21pc2V7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyLCBtZXNzYWdlczpbUmVjb3JkXSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlciwgbWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSA8W1JlY29yZF0+W107XG4gICAgICAgIC8vZ2V0IG1lc3NhZ2VzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgICAgICAgLy99XG4gICAgICAgIC8vc2V0IG1lc3NhZ2VzKG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgLy8gICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHJpdmF0ZSBfc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRoZW4oc3VjY2Vzc0NiOkZ1bmN0aW9uLCBlcnJvckNiOkZ1bmN0aW9uLCBvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgc2NoZWR1bGVyID0gPFRlc3RTY2hlZHVsZXI+KHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBjb25zdCBTVUJTQ1JJQkVfVElNRSA9IDIwMDtcbiAgICBjb25zdCBESVNQT1NFX1RJTUUgPSAxMDAwO1xuXG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIG5leHQodGljaywgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNEaXJlY3RPYmplY3QodmFsdWUpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVjb3JkLmNyZWF0ZSh0aWNrLCB2YWx1ZSwgQWN0aW9uVHlwZS5ORVhULCAoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGkgaW4gYSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhLmhhc093blByb3BlcnR5KGkpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhW2ldICE9PSBiW2ldKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBlcnJvcih0aWNrLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgZXJyb3IsIEFjdGlvblR5cGUuRVJST1IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjb21wbGV0ZWQodGljaykge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgbnVsbCwgQWN0aW9uVHlwZS5DT01QTEVURUQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaXNSZXNldDpib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhpc1Jlc2V0KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKGlzUmVzZXQ6Ym9vbGVhbil7XG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICB0aGlzLl9pc1Jlc2V0ID0gaXNSZXNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2Nsb2NrOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCBjbG9jaygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBjbG9jayhjbG9jazpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1Jlc2V0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHJpdmF0ZSBfaXNEaXNwb3NlZDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX3RpbWVyTWFwOndkQ2IuSGFzaDxGdW5jdGlvbj4gPSB3ZENiLkhhc2guY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1NYXA6d2RDYi5IYXNoPEZ1bmN0aW9uPiA9IHdkQ2IuSGFzaC5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX3N1YnNjcmliZWRUaW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VkVGltZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpNb2NrT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzZXRTdHJlYW1NYXAob2JzZXJ2ZXI6SU9ic2VydmVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIG1lc3NhZ2VzLmZvckVhY2goKHJlY29yZDpSZWNvcmQpID0+e1xuICAgICAgICAgICAgICAgIHZhciBmdW5jID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVjb3JkLmFjdGlvblR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuTkVYVDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHJlY29yZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5FUlJPUjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgd2RDYi5Mb2cuZXJyb3IodHJ1ZSwgd2RDYi5Mb2cuaW5mby5GVU5DX1VOS05PVyhcImFjdGlvblR5cGVcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5fc3RyZWFtTWFwLmFkZENoaWxkKFN0cmluZyhyZWNvcmQudGltZSksIGZ1bmMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOk1vY2tPYnNlcnZlciwgaW5pdGlhbDphbnksIHJlY3Vyc2l2ZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAvL21lc3NhZ2VzID0gW10sXG4gICAgICAgICAgICAgICAgbmV4dCA9IG51bGwsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkID0gbnVsbDtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgbmV4dCA9IG9ic2VydmVyLm5leHQ7XG4gICAgICAgICAgICBjb21wbGV0ZWQgPSBvYnNlcnZlci5jb21wbGV0ZWQ7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0LmNhbGwob2JzZXJ2ZXIsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZC5jYWxsKG9ic2VydmVyKTtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVjdXJzaXZlRnVuYyhpbml0aWFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgaW50ZXJ2YWw6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIC8vcHJvZHVjZSAxMCB2YWwgZm9yIHRlc3RcbiAgICAgICAgICAgIHZhciBDT1VOVCA9IDEwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHdoaWxlIChDT1VOVCA+IDAgJiYgIXRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aWNrKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dCh0aGlzLl9jbG9jaywgaW5pdGlhbCkpO1xuXG4gICAgICAgICAgICAgICAgLy9ubyBuZWVkIHRvIGludm9rZSBhY3Rpb25cbiAgICAgICAgICAgICAgICAvL2FjdGlvbihpbml0aWFsKTtcblxuICAgICAgICAgICAgICAgIGluaXRpYWwrKztcbiAgICAgICAgICAgICAgICBDT1VOVC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcbiAgICAgICAgICAgIC8vdGhpcy5zZXRTdHJlYW1NYXAodGhpcy5fb2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IDEwMCxcbiAgICAgICAgICAgICAgICBudW0gPSAwO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB3aGlsZSAoQ09VTlQgPiAwICYmICF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGljayhpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIG51bSkpO1xuXG4gICAgICAgICAgICAgICAgbnVtKys7XG4gICAgICAgICAgICAgICAgQ09VTlQtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG4gICAgICAgICAgICAvL3RoaXMuc2V0U3RyZWFtTWFwKHRoaXMuX29ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0Q2xvY2soKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzUmVzZXQpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGhpcy5fc3Vic2NyaWJlZFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoVGltZShjcmVhdGU6RnVuY3Rpb24sIHN1YnNjcmliZWRUaW1lOm51bWJlciwgZGlzcG9zZWRUaW1lOm51bWJlcikge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gdGhpcy5jcmVhdGVPYnNlcnZlcigpLFxuICAgICAgICAgICAgICAgIHNvdXJjZSwgc3Vic2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmVkVGltZSA9IHN1YnNjcmliZWRUaW1lO1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZWRUaW1lID0gZGlzcG9zZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9jbG9jayA9IHN1YnNjcmliZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9ydW5BdChzdWJzY3JpYmVkVGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNvdXJjZSA9IGNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KGRpc3Bvc2VkVGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBvYnNlcnZlcjtcblxuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoU3Vic2NyaWJlKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUgPSBTVUJTQ1JJQkVfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIHN1YnNjcmliZWRUaW1lLCBESVNQT1NFX1RJTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aERpc3Bvc2UoY3JlYXRlLCBkaXNwb3NlZFRpbWUgPSBESVNQT1NFX1RJTUUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0V2l0aFRpbWUoY3JlYXRlLCBTVUJTQ1JJQkVfVElNRSwgZGlzcG9zZWRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaWNBYnNvbHV0ZSh0aW1lLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9ydW5BdCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgICAgICB2YXIgZXh0cmVtZU51bUFyciA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKSxcbiAgICAgICAgICAgICAgICBtaW4gPSBleHRyZW1lTnVtQXJyWzBdLFxuICAgICAgICAgICAgICAgIG1heCA9IGV4dHJlbWVOdW1BcnJbMV0sXG4gICAgICAgICAgICAgICAgdGltZSA9IG1pbjtcblxuICAgICAgICAgICAgLy90b2RvIHJlZHVjZSBsb29wIHRpbWVcbiAgICAgICAgICAgIHdoaWxlICh0aW1lIDw9IG1heCkge1xuICAgICAgICAgICAgICAgIC8vaWYodGhpcy5faXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgLy8gICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy99XG5cbiAgICAgICAgICAgICAgICAvL2JlY2F1c2UgXCJfZXhlYyxfcnVuU3RyZWFtXCIgbWF5IGNoYW5nZSBcIl9jbG9ja1wiLFxuICAgICAgICAgICAgICAgIC8vc28gaXQgc2hvdWxkIHJlc2V0IHRoZSBfY2xvY2tcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGltZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2V4ZWModGltZSwgdGhpcy5fdGltZXJNYXApO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aW1lO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcnVuU3RyZWFtKHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgdGltZSsrO1xuXG4gICAgICAgICAgICAgICAgLy90b2RvIGdldCBtYXggdGltZSBvbmx5IGZyb20gc3RyZWFtTWFwP1xuICAgICAgICAgICAgICAgIC8vbmVlZCByZWZyZXNoIG1heCB0aW1lLlxuICAgICAgICAgICAgICAgIC8vYmVjYXVzZSBpZiB0aW1lck1hcCBoYXMgY2FsbGJhY2sgdGhhdCBjcmVhdGUgaW5maW5pdGUgc3RyZWFtKGFzIGludGVydmFsKSxcbiAgICAgICAgICAgICAgICAvL2l0IHdpbGwgc2V0IHN0cmVhbU1hcCBzbyB0aGF0IHRoZSBtYXggdGltZSB3aWxsIGNoYW5nZVxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVTdHJlYW0oYXJncyl7XG4gICAgICAgICAgICByZXR1cm4gVGVzdFN0cmVhbS5jcmVhdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlT2JzZXJ2ZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gTW9ja09ic2VydmVyLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVSZXNvbHZlZFByb21pc2UodGltZTpudW1iZXIsIHZhbHVlOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gTW9ja1Byb21pc2UuY3JlYXRlKHRoaXMsIFtUZXN0U2NoZWR1bGVyLm5leHQodGltZSwgdmFsdWUpLCBUZXN0U2NoZWR1bGVyLmNvbXBsZXRlZCh0aW1lKzEpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlUmVqZWN0UHJvbWlzZSh0aW1lOm51bWJlciwgZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHJldHVybiBNb2NrUHJvbWlzZS5jcmVhdGUodGhpcywgW1Rlc3RTY2hlZHVsZXIuZXJyb3IodGltZSwgZXJyb3IpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9nZXRNaW5BbmRNYXhUaW1lKCl7XG4gICAgICAgICAgICB2YXIgdGltZUFycjphbnkgPSAodGhpcy5fdGltZXJNYXAuZ2V0S2V5cygpLmFkZENoaWxkcmVuKHRoaXMuX3N0cmVhbU1hcC5nZXRLZXlzKCkpKTtcblxuICAgICAgICAgICAgICAgIHRpbWVBcnIgPSB0aW1lQXJyLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIoa2V5KTtcbiAgICAgICAgICAgICAgICB9KS50b0FycmF5KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBbTWF0aC5taW4uYXBwbHkoTWF0aCwgdGltZUFyciksIE1hdGgubWF4LmFwcGx5KE1hdGgsIHRpbWVBcnIpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2V4ZWModGltZSwgbWFwKXtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gbWFwLmdldENoaWxkKFN0cmluZyh0aW1lKSk7XG5cbiAgICAgICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3J1blN0cmVhbSh0aW1lKXtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fc3RyZWFtTWFwLmdldENoaWxkKFN0cmluZyh0aW1lKSk7XG5cbiAgICAgICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3J1bkF0KHRpbWU6bnVtYmVyLCBjYWxsYmFjazpGdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fdGltZXJNYXAuYWRkQ2hpbGQoU3RyaW5nKHRpbWUpLCBjYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aWNrKHRpbWU6bnVtYmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9jbG9jayArPSB0aW1lO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGVudW0gQWN0aW9uVHlwZXtcbiAgICAgICAgTkVYVCxcbiAgICAgICAgRVJST1IsXG4gICAgICAgIENPTVBMRVRFRFxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFtIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMobWVzc2FnZXMsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdmFyIHNjaGVkdWxlciA9IDxUZXN0U2NoZWR1bGVyPih0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==