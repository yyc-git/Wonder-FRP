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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkp1ZGdlVXRpbHMudHMiLCJiaW5kaW5nL25vZGVqcy9Ob2RlT3BlcmF0b3IudHMiLCJjb3JlL0VudGl0eS50cyIsImNvcmUvTWFpbi50cyIsImRlZmluaXRpb24vdHlwZXNjcmlwdC9kZWNvcmF0b3IvY29udHJhY3QudHMiLCJkaXNwb3NhYmxlL1NpbmdsZURpc3Bvc2FibGUudHMiLCJkaXNwb3NhYmxlL0dyb3VwRGlzcG9zYWJsZS50cyIsImRpc3Bvc2FibGUvSW5uZXJTdWJzY3JpcHRpb24udHMiLCJkaXNwb3NhYmxlL0lubmVyU3Vic2NyaXB0aW9uR3JvdXAudHMiLCJnbG9iYWwvVmFyaWFibGUudHMiLCJnbG9iYWwvQ29uc3QudHMiLCJnbG9iYWwvaW5pdC50cyIsImNvcmUvU3RyZWFtLnRzIiwiY29yZS9TY2hlZHVsZXIudHMiLCJjb3JlL09ic2VydmVyLnRzIiwic3ViamVjdC9TdWJqZWN0LnRzIiwic3ViamVjdC9HZW5lcmF0b3JTdWJqZWN0LnRzIiwib2JzZXJ2ZXIvQW5vbnltb3VzT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9BdXRvRGV0YWNoT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9NYXBPYnNlcnZlci50cyIsIm9ic2VydmVyL0RvT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9NZXJnZUFsbE9ic2VydmVyLnRzIiwib2JzZXJ2ZXIvVGFrZVVudGlsT2JzZXJ2ZXIudHMiLCJvYnNlcnZlci9Db25jYXRPYnNlcnZlci50cyIsIm9ic2VydmVyL1N1YmplY3RPYnNlcnZlci50cyIsIm9ic2VydmVyL0lnbm9yZUVsZW1lbnRzT2JzZXJ2ZXIudHMiLCJzdHJlYW0vQmFzZVN0cmVhbS50cyIsInN0cmVhbS9Eb1N0cmVhbS50cyIsInN0cmVhbS9NYXBTdHJlYW0udHMiLCJzdHJlYW0vRnJvbUFycmF5U3RyZWFtLnRzIiwic3RyZWFtL0Zyb21Qcm9taXNlU3RyZWFtLnRzIiwic3RyZWFtL0Zyb21FdmVudFBhdHRlcm5TdHJlYW0udHMiLCJzdHJlYW0vQW5vbnltb3VzU3RyZWFtLnRzIiwic3RyZWFtL0ludGVydmFsU3RyZWFtLnRzIiwic3RyZWFtL0ludGVydmFsUmVxdWVzdFN0cmVhbS50cyIsInN0cmVhbS9NZXJnZUFsbFN0cmVhbS50cyIsInN0cmVhbS9UYWtlVW50aWxTdHJlYW0udHMiLCJzdHJlYW0vQ29uY2F0U3RyZWFtLnRzIiwic3RyZWFtL1JlcGVhdFN0cmVhbS50cyIsInN0cmVhbS9JZ25vcmVFbGVtZW50c1N0cmVhbS50cyIsInN0cmVhbS9EZWZlclN0cmVhbS50cyIsImdsb2JhbC9PcGVyYXRvci50cyIsInRlc3RpbmcvUmVjb3JkLnRzIiwidGVzdGluZy9Nb2NrT2JzZXJ2ZXIudHMiLCJ0ZXN0aW5nL01vY2tQcm9taXNlLnRzIiwidGVzdGluZy9UZXN0U2NoZWR1bGVyLnRzIiwidGVzdGluZy9BY3Rpb25UeXBlLnRzIiwidGVzdGluZy9UZXN0U3RyZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsSUFBTyxLQUFLLENBZ0JYO0FBaEJELFdBQU8sS0FBSyxFQUFDLENBQUM7SUFDVjtRQUFnQyw4QkFBZTtRQUEvQztZQUFnQyw4QkFBZTtRQWMvQyxDQUFDO1FBYmlCLG9CQUFTLEdBQXZCLFVBQXdCLEdBQUc7WUFDdkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHO21CQUNMLENBQUMsTUFBSyxDQUFDLFVBQVUsWUFBQyxHQUFHLENBQUMsU0FBUyxDQUFDO21CQUNoQyxNQUFLLENBQUMsVUFBVSxZQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRWEsa0JBQU8sR0FBckIsVUFBc0IsR0FBVSxFQUFFLEdBQVU7WUFDeEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUMvQixDQUFDO1FBRWEsc0JBQVcsR0FBekIsVUFBMEIsQ0FBVztZQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxT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U0FBUyxDQUFDLENBQUM7WUFFdEQsTUFBTSxDQUFDLHNCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFDTCxpQkFBQztJQUFELENBeEJBLEFBd0JDLEVBeEIrQixnQkFBVSxFQXdCekM7SUF4QlksZ0JBQVUsYUF3QnRCLENBQUE7QUFDTCxDQUFDLEVBMUJNLEtBQUssS0FBTCxLQUFLLFFBMEJYIiwiZmlsZSI6IndkRnJwLmRlYnVnLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgSnVkZ2VVdGlscyBleHRlbmRzIHdkQ2IuSnVkZ2VVdGlscyB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNQcm9taXNlKG9iail7XG4gICAgICAgICAgICByZXR1cm4gISFvYmpcbiAgICAgICAgICAgICAgICAmJiAhc3VwZXIuaXNGdW5jdGlvbihvYmouc3Vic2NyaWJlKVxuICAgICAgICAgICAgICAgICYmIHN1cGVyLmlzRnVuY3Rpb24ob2JqLnRoZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBpc0VxdWFsKG9iMTpFbnRpdHksIG9iMjpFbnRpdHkpe1xuICAgICAgICAgICAgcmV0dXJuIG9iMS51aWQgPT09IG9iMi51aWQ7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGlzSU9ic2VydmVyKGk6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiBpLm5leHQgJiYgaS5lcnJvciAmJiBpLmNvbXBsZXRlZDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IHZhciBmcm9tTm9kZUNhbGxiYWNrID0gKGZ1bmM6RnVuY3Rpb24sIGNvbnRleHQ/OmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gKC4uLmZ1bmNBcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgaGFuZGVyID0gKGVyciwgLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQuYXBwbHkob2JzZXJ2ZXIsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBmdW5jQXJncy5wdXNoKGhhbmRlcik7XG4gICAgICAgICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBmdW5jQXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21TdHJlYW0gPSAoc3RyZWFtOmFueSwgZmluaXNoRXZlbnROYW1lOnN0cmluZyA9IFwiZW5kXCIpID0+IHtcbiAgICAgICAgc3RyZWFtLnBhdXNlKCk7XG5cbiAgICAgICAgcmV0dXJuIHdkRnJwLmNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIHZhciBkYXRhSGFuZGxlciA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvckhhbmRsZXIgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbmRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdHJlYW0uYWRkTGlzdGVuZXIoXCJkYXRhXCIsIGRhdGFIYW5kbGVyKTtcbiAgICAgICAgICAgIHN0cmVhbS5hZGRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICBzdHJlYW0uYWRkTGlzdGVuZXIoZmluaXNoRXZlbnROYW1lLCBlbmRIYW5kbGVyKTtcblxuICAgICAgICAgICAgc3RyZWFtLnJlc3VtZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcihcImRhdGFcIiwgZGF0YUhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcihcImVycm9yXCIsIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICAgICAgc3RyZWFtLnJlbW92ZUxpc3RlbmVyKGZpbmlzaEV2ZW50TmFtZSwgZW5kSGFuZGxlcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tUmVhZGFibGVTdHJlYW0gPSAoc3RyZWFtOmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gZnJvbVN0cmVhbShzdHJlYW0sIFwiZW5kXCIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGZyb21Xcml0YWJsZVN0cmVhbSA9IChzdHJlYW06YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyZWFtKHN0cmVhbSwgXCJmaW5pc2hcIik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVRyYW5zZm9ybVN0cmVhbSA9IChzdHJlYW06YW55KSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyZWFtKHN0cmVhbSwgXCJmaW5pc2hcIik7XG4gICAgfTtcbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbnRpdHl7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVUlEOm51bWJlciA9IDE7XG5cbiAgICAgICAgcHJpdmF0ZSBfdWlkOnN0cmluZyA9IG51bGw7XG4gICAgICAgIGdldCB1aWQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl91aWQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHVpZCh1aWQ6c3RyaW5nKXtcbiAgICAgICAgICAgIHRoaXMuX3VpZCA9IHVpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKHVpZFByZTpzdHJpbmcpe1xuICAgICAgICAgICAgdGhpcy5fdWlkID0gdWlkUHJlICsgU3RyaW5nKEVudGl0eS5VSUQrKyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1haW57XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNUZXN0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBpbXBvcnQgTG9nID0gd2RDYi5Mb2c7XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gYXNzZXJ0KGNvbmQ6Ym9vbGVhbiwgbWVzc2FnZTpzdHJpbmc9XCJjb250cmFjdCBlcnJvclwiKXtcbiAgICAgICAgTG9nLmVycm9yKCFjb25kLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcmVxdWlyZShJbkZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRlc2NyaXB0b3IudmFsdWU7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIEluRnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlbnN1cmUoT3V0RnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3MpLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBbcmVzdWx0XS5jb25jYXQoYXJncyk7XG5cbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCkge1xuICAgICAgICAgICAgICAgICAgICBPdXRGdW5jLmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVHZXR0ZXIoSW5GdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICB2YXIgZ2V0dGVyID0gZGVzY3JpcHRvci5nZXQ7XG5cbiAgICAgICAgICAgIGRlc2NyaXB0b3IuZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBJbkZ1bmMuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiByZXF1aXJlU2V0dGVyKEluRnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHNldHRlciA9IGRlc2NyaXB0b3Iuc2V0O1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLnNldCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KXtcbiAgICAgICAgICAgICAgICAgICAgSW5GdW5jLmNhbGwodGhpcywgdmFsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZXR0ZXIuY2FsbCh0aGlzLCB2YWwpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZW5zdXJlR2V0dGVyKE91dEZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIHZhciBnZXR0ZXIgPSBkZXNjcmlwdG9yLmdldDtcblxuICAgICAgICAgICAgZGVzY3JpcHRvci5nZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZ2V0dGVyLmNhbGwodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpZihNYWluLmlzVGVzdCl7XG4gICAgICAgICAgICAgICAgICAgIE91dEZ1bmMuY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlbnN1cmVTZXR0ZXIoT3V0RnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgdmFyIHNldHRlciA9IGRlc2NyaXB0b3Iuc2V0O1xuXG4gICAgICAgICAgICBkZXNjcmlwdG9yLnNldCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBzZXR0ZXIuY2FsbCh0aGlzLCB2YWwpLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBbcmVzdWx0LCB2YWxdO1xuXG4gICAgICAgICAgICAgICAgaWYoTWFpbi5pc1Rlc3Qpe1xuICAgICAgICAgICAgICAgICAgICBPdXRGdW5jLmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gaW52YXJpYW50KGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmKE1haW4uaXNUZXN0KSB7XG4gICAgICAgICAgICAgICAgZnVuYyh0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBTaW5nbGVEaXNwb3NhYmxlIGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGRpc3Bvc2VIYW5kbGVyOkZ1bmN0aW9uID0gZnVuY3Rpb24oKXt9KSB7XG4gICAgICAgIFx0dmFyIG9iaiA9IG5ldyB0aGlzKGRpc3Bvc2VIYW5kbGVyKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9kaXNwb3NlSGFuZGxlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoZGlzcG9zZUhhbmRsZXI6RnVuY3Rpb24pe1xuICAgICAgICBcdHRoaXMuX2Rpc3Bvc2VIYW5kbGVyID0gZGlzcG9zZUhhbmRsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2V0RGlzcG9zZUhhbmRsZXIoaGFuZGxlcjpGdW5jdGlvbil7XG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlSGFuZGxlciA9IGhhbmRsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZUhhbmRsZXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgR3JvdXBEaXNwb3NhYmxlIGltcGxlbWVudHMgSURpc3Bvc2FibGV7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGRpc3Bvc2FibGU/OklEaXNwb3NhYmxlKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoZGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9ncm91cDp3ZENiLkNvbGxlY3Rpb248SURpc3Bvc2FibGU+ID0gd2RDYi5Db2xsZWN0aW9uLmNyZWF0ZTxJRGlzcG9zYWJsZT4oKTtcblxuICAgICAgICBjb25zdHJ1Y3RvcihkaXNwb3NhYmxlPzpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICBpZihkaXNwb3NhYmxlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9ncm91cC5hZGRDaGlsZChkaXNwb3NhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhZGQoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSl7XG4gICAgICAgICAgICB0aGlzLl9ncm91cC5hZGRDaGlsZChkaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXAuZm9yRWFjaCgoZGlzcG9zYWJsZTpJRGlzcG9zYWJsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuXHRleHBvcnQgY2xhc3MgSW5uZXJTdWJzY3JpcHRpb24gaW1wbGVtZW50cyBJRGlzcG9zYWJsZXtcblx0XHRwdWJsaWMgc3RhdGljIGNyZWF0ZShzdWJqZWN0OlN1YmplY3R8R2VuZXJhdG9yU3ViamVjdCwgb2JzZXJ2ZXI6T2JzZXJ2ZXIpIHtcblx0XHRcdHZhciBvYmogPSBuZXcgdGhpcyhzdWJqZWN0LCBvYnNlcnZlcik7XG5cblx0XHRcdHJldHVybiBvYmo7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfc3ViamVjdDpTdWJqZWN0fEdlbmVyYXRvclN1YmplY3QgPSBudWxsO1xuXHRcdHByaXZhdGUgX29ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuXHRcdGNvbnN0cnVjdG9yKHN1YmplY3Q6U3ViamVjdHxHZW5lcmF0b3JTdWJqZWN0LCBvYnNlcnZlcjpPYnNlcnZlcil7XG5cdFx0XHR0aGlzLl9zdWJqZWN0ID0gc3ViamVjdDtcblx0XHRcdHRoaXMuX29ic2VydmVyID0gb2JzZXJ2ZXI7XG5cdFx0fVxuXG5cdFx0cHVibGljIGRpc3Bvc2UoKXtcblx0XHRcdHRoaXMuX3N1YmplY3QucmVtb3ZlKHRoaXMuX29ic2VydmVyKTtcblxuXHRcdFx0dGhpcy5fb2JzZXJ2ZXIuZGlzcG9zZSgpO1xuXHRcdH1cblx0fVxufVxuIiwibW9kdWxlIHdkRnJwe1xuXHRleHBvcnQgY2xhc3MgSW5uZXJTdWJzY3JpcHRpb25Hcm91cCBpbXBsZW1lbnRzIElEaXNwb3NhYmxle1xuXHRcdHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuXHRcdFx0dmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cblx0XHRcdHJldHVybiBvYmo7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfY29udGFpbmVyOndkQ2IuQ29sbGVjdGlvbjxJRGlzcG9zYWJsZT4gPSB3ZENiLkNvbGxlY3Rpb24uY3JlYXRlPElEaXNwb3NhYmxlPigpO1xuXG5cdFx0cHVibGljIGFkZENoaWxkKGNoaWxkOklEaXNwb3NhYmxlKXtcblx0XHRcdHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChjaGlsZCk7XG5cdFx0fVxuXG5cdFx0cHVibGljIGRpc3Bvc2UoKXtcblx0XHRcdHRoaXMuX2NvbnRhaW5lci5mb3JFYWNoKChjaGlsZDpJRGlzcG9zYWJsZSkgPT4ge1xuXHRcdFx0XHRjaGlsZC5kaXNwb3NlKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBkZWNsYXJlIHZhciBnbG9iYWw6YW55LHdpbmRvdzphbnk7XG5cbiAgICBleHBvcnQgdmFyIHJvb3Q6YW55O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3ZEZycCwgXCJyb290XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNOb2RlSnMoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdsb2JhbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdztcbiAgICAgICAgfVxuICAgIH0pO1xufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjb25zdCBBQlNUUkFDVF9BVFRSSUJVVEU6YW55ID0gbnVsbDtcbn1cblxuIiwibW9kdWxlIHdkRnJwe1xuICAgIC8vcnN2cC5qc1xuICAgIC8vZGVjbGFyZSB2YXIgUlNWUDphbnk7XG5cbiAgICAvL25vdCBzd2FsbG93IHRoZSBlcnJvclxuICAgIGlmKHJvb3QuUlNWUCl7XG4gICAgICAgIHJvb3QuUlNWUC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfTtcbiAgICAgICAgcm9vdC5SU1ZQLm9uKCdlcnJvcicsIHJvb3QuUlNWUC5vbmVycm9yKTtcbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBpbXBvcnQgTG9nID0gd2RDYi5Mb2c7XG5cbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RyZWFtIGV4dGVuZHMgRW50aXR5e1xuICAgICAgICBwdWJsaWMgc2NoZWR1bGVyOlNjaGVkdWxlciA9IEFCU1RSQUNUX0FUVFJJQlVURTtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZUZ1bmM6KG9ic2VydmVyOklPYnNlcnZlcikgPT4gRnVuY3Rpb258dm9pZCA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc3Vic2NyaWJlRnVuYyl7XG4gICAgICAgICAgICBzdXBlcihcIlN0cmVhbVwiKTtcblxuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVGdW5jID0gc3Vic2NyaWJlRnVuYyB8fCBmdW5jdGlvbigpeyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGFic3RyYWN0IHN1YnNjcmliZShhcmcxOkZ1bmN0aW9ufE9ic2VydmVyfFN1YmplY3QsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxlO1xuXG4gICAgICAgIHB1YmxpYyBidWlsZFN0cmVhbShvYnNlcnZlcjpJT2JzZXJ2ZXIpOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKDxGdW5jdGlvbj4odGhpcy5zdWJzY3JpYmVGdW5jKG9ic2VydmVyKSB8fCBmdW5jdGlvbigpe30pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBkbyhvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gRG9TdHJlYW0uY3JlYXRlKHRoaXMsIG9uTmV4dCwgb25FcnJvciwgb25Db21wbGV0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1hcChzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIE1hcFN0cmVhbS5jcmVhdGUodGhpcywgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGZsYXRNYXAoc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFwKHNlbGVjdG9yKS5tZXJnZUFsbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG1lcmdlQWxsKCl7XG4gICAgICAgICAgICByZXR1cm4gTWVyZ2VBbGxTdHJlYW0uY3JlYXRlKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRha2VVbnRpbChvdGhlclN0cmVhbTpTdHJlYW0pe1xuICAgICAgICAgICAgcmV0dXJuIFRha2VVbnRpbFN0cmVhbS5jcmVhdGUodGhpcywgb3RoZXJTdHJlYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgQHJlcXVpcmUoZnVuY3Rpb24oY291bnQ6bnVtYmVyID0gMSl7XG4gICAgICAgICAgICBhc3NlcnQoY291bnQgPj0gMCwgTG9nLmluZm8uRlVOQ19TSE9VTEQoXCJjb3VudFwiLCBcIj49IDBcIikpO1xuICAgICAgICB9KVxuICAgICAgICBwdWJsaWMgdGFrZShjb3VudDpudW1iZXIgPSAxKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgaWYoY291bnQgPT09IDApe1xuICAgICAgICAgICAgICAgIHJldHVybiBlbXB0eSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLnN1YnNjcmliZSgodmFsdWU6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGNvdW50ID4gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNvdW50LS07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoY291bnQgPD0gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIChlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBAcmVxdWlyZShmdW5jdGlvbihjb3VudDpudW1iZXIgPSAxKXtcbiAgICAgICAgICAgIGFzc2VydChjb3VudCA+PSAwLCBMb2cuaW5mby5GVU5DX1NIT1VMRChcImNvdW50XCIsIFwiPj0gMFwiKSk7XG4gICAgICAgIH0pXG4gICAgICAgIHB1YmxpYyB0YWtlTGFzdChjb3VudDpudW1iZXIgPSAxKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgaWYoY291bnQgPT09IDApe1xuICAgICAgICAgICAgICAgIHJldHVybiBlbXB0eSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgICAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlKCh2YWx1ZTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaCh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYocXVldWUubGVuZ3RoID4gY291bnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIChlOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKHF1ZXVlLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChxdWV1ZS5zaGlmdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29uY2F0KHN0cmVhbUFycjpBcnJheTxTdHJlYW0+KTtcbiAgICAgICAgcHVibGljIGNvbmNhdCguLi5vdGhlclN0cmVhbSk7XG5cbiAgICAgICAgcHVibGljIGNvbmNhdCgpe1xuICAgICAgICAgICAgdmFyIGFyZ3M6QXJyYXk8U3RyZWFtPiA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNBcnJheShhcmd1bWVudHNbMF0pKXtcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gQ29uY2F0U3RyZWFtLmNyZWF0ZShhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBtZXJnZShzdHJlYW1BcnI6QXJyYXk8U3RyZWFtPik7XG4gICAgICAgIHB1YmxpYyBtZXJnZSguLi5vdGhlclN0cmVhbSk7XG5cbiAgICAgICAgcHVibGljIG1lcmdlKCl7XG4gICAgICAgICAgICB2YXIgYXJnczpBcnJheTxTdHJlYW0+ID0gbnVsbCxcbiAgICAgICAgICAgICAgICBzdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoSnVkZ2VVdGlscy5pc0FycmF5KGFyZ3VtZW50c1swXSkpe1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG5cbiAgICAgICAgICAgIHN0cmVhbSA9IGZyb21BcnJheShhcmdzKS5tZXJnZUFsbCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlcGVhdChjb3VudDpudW1iZXIgPSAtMSl7XG4gICAgICAgICAgICByZXR1cm4gUmVwZWF0U3RyZWFtLmNyZWF0ZSh0aGlzLCBjb3VudCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgaWdub3JlRWxlbWVudHMoKXtcbiAgICAgICAgICAgIHJldHVybiBJZ25vcmVFbGVtZW50c1N0cmVhbS5jcmVhdGUodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgaGFuZGxlU3ViamVjdChzdWJqZWN0OmFueSl7XG4gICAgICAgICAgICBpZih0aGlzLl9pc1N1YmplY3Qoc3ViamVjdCkpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFN1YmplY3Qoc3ViamVjdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzU3ViamVjdChzdWJqZWN0OlN1YmplY3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHN1YmplY3QgaW5zdGFuY2VvZiBTdWJqZWN0O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0U3ViamVjdChzdWJqZWN0OlN1YmplY3Qpe1xuICAgICAgICAgICAgc3ViamVjdC5zb3VyY2UgPSB0aGlzO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICByb290LnJlcXVlc3ROZXh0QW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICB3cmFwcGVyID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgY2FsbGJhY2sgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBnZWNrb1ZlcnNpb24gPSBudWxsLFxuICAgICAgICAgICAgdXNlckFnZW50ID0gcm9vdC5uYXZpZ2F0b3IgJiYgcm9vdC5uYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgd3JhcHBlciA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gICAgICAgICAgICB0aW1lID0gcm9vdC5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIHNlbGYuY2FsbGJhY2sodGltZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyohXG4gICAgICAgICBidWchXG4gICAgICAgICBiZWxvdyBjb2RlOlxuICAgICAgICAgd2hlbiBpbnZva2UgYiBhZnRlciAxcywgd2lsbCBvbmx5IGludm9rZSBiLCBub3QgaW52b2tlIGEhXG5cbiAgICAgICAgIGZ1bmN0aW9uIGEodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImFcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGZ1bmN0aW9uIGIodGltZSl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcImJcIiwgdGltZSk7XG4gICAgICAgICB3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYik7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGEoKTtcblxuICAgICAgICAgc2V0VGltZW91dChiLCAxMDAwKTtcblxuXG5cbiAgICAgICAgIHNvIHVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcHJpb3JpdHkhXG4gICAgICAgICAqL1xuICAgICAgICBpZihyb290LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgQ2hyb21lIDEwIGJ1ZyB3aGVyZSBDaHJvbWVcbiAgICAgICAgLy8gZG9lcyBub3QgcGFzcyB0aGUgdGltZSB0byB0aGUgYW5pbWF0aW9uIGZ1bmN0aW9uXG5cbiAgICAgICAgaWYgKHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBEZWZpbmUgdGhlIHdyYXBwZXJcblxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgc3dpdGNoXG5cbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgICAgICAgICAgIHJvb3Qud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgLy8gQnJvd3NlciBjYWxscyB0aGUgd3JhcHBlciBhbmQgd3JhcHBlciBjYWxscyB0aGUgY2FsbGJhY2tcblxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFJlcXVlc3RBbmltYXRpb25GcmFtZSh3cmFwcGVyLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v5L+u5pS5dGltZeWPguaVsFxuICAgICAgICBpZiAocm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgb3JpZ2luYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgICAgICAgICByb290Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHdyYXBwZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgR2Vja28gMi4wLCB3aGljaCBoYXMgYSBidWcgaW5cbiAgICAgICAgLy8gbW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKCkgdGhhdCByZXN0cmljdHMgYW5pbWF0aW9uc1xuICAgICAgICAvLyB0byAzMC00MCBmcHMuXG5cbiAgICAgICAgaWYgKHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAvLyBDaGVjayB0aGUgR2Vja28gdmVyc2lvbi4gR2Vja28gaXMgdXNlZCBieSBicm93c2Vyc1xuICAgICAgICAgICAgLy8gb3RoZXIgdGhhbiBGaXJlZm94LiBHZWNrbyAyLjAgY29ycmVzcG9uZHMgdG9cbiAgICAgICAgICAgIC8vIEZpcmVmb3ggNC4wLlxuXG4gICAgICAgICAgICBpbmRleCA9IHVzZXJBZ2VudC5pbmRleE9mKCdydjonKTtcblxuICAgICAgICAgICAgaWYgKHVzZXJBZ2VudC5pbmRleE9mKCdHZWNrbycpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgZ2Vja29WZXJzaW9uID0gdXNlckFnZW50LnN1YnN0cihpbmRleCArIDMsIDMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGdlY2tvVmVyc2lvbiA9PT0gJzIuMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yY2VzIHRoZSByZXR1cm4gc3RhdGVtZW50IHRvIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgc2V0VGltZW91dCgpIGZ1bmN0aW9uLlxuXG4gICAgICAgICAgICAgICAgICAgIHJvb3QubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByb290LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHJvb3Qub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgcm9vdC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXG4gICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaDtcblxuICAgICAgICAgICAgICAgIHJvb3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gcm9vdC5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2ggPSByb290LnBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYudGltZW91dCA9IDEwMDAgLyA2MCAtIChmaW5pc2ggLSBzdGFydCk7XG5cbiAgICAgICAgICAgICAgICB9LCBzZWxmLnRpbWVvdXQpO1xuICAgICAgICAgICAgfTtcbiAgICB9KCkpO1xuXG4gICAgcm9vdC5jYW5jZWxOZXh0UmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcm9vdC5jYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290LndlYmtpdENhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm1vekNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCByb290Lm9DYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfHwgcm9vdC5tc0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB8fCBjbGVhclRpbWVvdXQ7XG5cblxuICAgIGV4cG9ydCBjbGFzcyBTY2hlZHVsZXJ7XG4gICAgICAgIC8vdG9kbyByZW1vdmUgXCIuLi5hcmdzXCJcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9yZXF1ZXN0TG9vcElkOmFueSA9IG51bGw7XG4gICAgICAgIGdldCByZXF1ZXN0TG9vcElkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgcmVxdWVzdExvb3BJZChyZXF1ZXN0TG9vcElkOmFueSl7XG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0TG9vcElkID0gcmVxdWVzdExvb3BJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vb2JzZXJ2ZXIgaXMgZm9yIFRlc3RTY2hlZHVsZXIgdG8gcmV3cml0ZVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGFjdGlvbjpGdW5jdGlvbil7XG4gICAgICAgICAgICBhY3Rpb24oaW5pdGlhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsKG9ic2VydmVyOklPYnNlcnZlciwgaW5pdGlhbDphbnksIGludGVydmFsOm51bWJlciwgYWN0aW9uOkZ1bmN0aW9uKTpudW1iZXJ7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbCA9IGFjdGlvbihpbml0aWFsKTtcbiAgICAgICAgICAgIH0sIGludGVydmFsKVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHB1Ymxpc2hJbnRlcnZhbFJlcXVlc3Qob2JzZXJ2ZXI6SU9ic2VydmVyLCBhY3Rpb246RnVuY3Rpb24pe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGxvb3AgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNFbmQgPSBhY3Rpb24odGltZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoaXNFbmQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcmVxdWVzdExvb3BJZCA9IHJvb3QucmVxdWVzdE5leHRBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0TG9vcElkID0gcm9vdC5yZXF1ZXN0TmV4dEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgT2JzZXJ2ZXIgZXh0ZW5kcyBFbnRpdHkgaW1wbGVtZW50cyBJT2JzZXJ2ZXJ7XG4gICAgICAgIHByaXZhdGUgX2lzRGlzcG9zZWQ6Ym9vbGVhbiA9IG51bGw7XG4gICAgICAgIGdldCBpc0Rpc3Bvc2VkKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNEaXNwb3NlZDtcbiAgICAgICAgfVxuICAgICAgICBzZXQgaXNEaXNwb3NlZChpc0Rpc3Bvc2VkOmJvb2xlYW4pe1xuICAgICAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IGlzRGlzcG9zZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Vc2VyTmV4dDpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJFcnJvcjpGdW5jdGlvbiA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBvblVzZXJDb21wbGV0ZWQ6RnVuY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgX2lzU3RvcDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIC8vcHJpdmF0ZSBfZGlzcG9zZUhhbmRsZXI6d2RDYi5Db2xsZWN0aW9uPEZ1bmN0aW9uPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2FibGU6SURpc3Bvc2FibGUgPSBudWxsO1xuXG5cbiAgICAgICAgY29uc3RydWN0b3Iob2JzZXJ2ZXI6SU9ic2VydmVyKTtcbiAgICAgICAgY29uc3RydWN0b3Iob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbik7XG5cbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgICAgICAgc3VwZXIoXCJPYnNlcnZlclwiKTtcblxuICAgICAgICAgICAgaWYoYXJncy5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgIGxldCBvYnNlcnZlcjpJT2JzZXJ2ZXIgPSBhcmdzWzBdO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0ID0gZnVuY3Rpb24odil7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodik7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgb25OZXh0ID0gYXJnc1swXSxcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvciA9IGFyZ3NbMV0sXG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGVkID0gYXJnc1syXTtcblxuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyTmV4dCA9IG9uTmV4dCB8fCBmdW5jdGlvbih2KXt9O1xuICAgICAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IgPSBvbkVycm9yIHx8IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCA9IG9uQ29tcGxldGVkIHx8IGZ1bmN0aW9uKCl7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9uTmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZXJyb3IoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdG9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RvcCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYodGhpcy5fZGlzcG9zYWJsZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vdGhpcy5fZGlzcG9zZUhhbmRsZXIuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgLy8gICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgLy99KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHVibGljIGZhaWwoZSkge1xuICAgICAgICAvLyAgICBpZiAoIXRoaXMuX2lzU3RvcCkge1xuICAgICAgICAvLyAgICAgICAgdGhpcy5faXNTdG9wID0gdHJ1ZTtcbiAgICAgICAgLy8gICAgICAgIHRoaXMuZXJyb3IoZSk7XG4gICAgICAgIC8vICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIHB1YmxpYyBzZXREaXNwb3NhYmxlKGRpc3Bvc2FibGU6SURpc3Bvc2FibGUpe1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zYWJsZSA9IGRpc3Bvc2FibGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25OZXh0KHZhbHVlKTtcblxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgb25FcnJvcihlcnJvcik7XG5cbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IG9uQ29tcGxldGVkKCk7XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBTdWJqZWN0IGltcGxlbWVudHMgSU9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcygpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIGdldCBzb3VyY2UoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHNvdXJjZShzb3VyY2U6U3RyZWFtKXtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX29ic2VydmVyOmFueSA9IG5ldyBTdWJqZWN0T2JzZXJ2ZXIoKTtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE/OkZ1bmN0aW9ufE9ic2VydmVyLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKTpJRGlzcG9zYWJsZXtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjpPYnNlcnZlciA9IGFyZzEgaW5zdGFuY2VvZiBPYnNlcnZlclxuICAgICAgICAgICAgICAgID8gPEF1dG9EZXRhY2hPYnNlcnZlcj5hcmcxXG4gICAgICAgICAgICAgICAgOiBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxGdW5jdGlvbj5hcmcxLCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIC8vdGhpcy5fc291cmNlICYmIG9ic2VydmVyLnNldERpc3Bvc2VIYW5kbGVyKHRoaXMuX3NvdXJjZS5kaXNwb3NlSGFuZGxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLmFkZENoaWxkKG9ic2VydmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIElubmVyU3Vic2NyaXB0aW9uLmNyZWF0ZSh0aGlzLCBvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgbmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0KCl7XG4gICAgICAgICAgICBpZighdGhpcy5fc291cmNlKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLnNldERpc3Bvc2FibGUodGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIucmVtb3ZlQ2hpbGQob2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMuX29ic2VydmVyLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgR2VuZXJhdG9yU3ViamVjdCBleHRlbmRzIEVudGl0eSBpbXBsZW1lbnRzIElPYnNlcnZlciB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1N0YXJ0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZ2V0IGlzU3RhcnQoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc1N0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIHNldCBpc1N0YXJ0KGlzU3RhcnQ6Ym9vbGVhbil7XG4gICAgICAgICAgICB0aGlzLl9pc1N0YXJ0ID0gaXNTdGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgICAgICBzdXBlcihcIkdlbmVyYXRvclN1YmplY3RcIik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb2JzZXJ2ZXI6YW55ID0gbmV3IFN1YmplY3RPYnNlcnZlcigpO1xuXG4gICAgICAgIC8qIVxuICAgICAgICBvdXRlciBob29rIG1ldGhvZFxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIG9uQmVmb3JlTmV4dCh2YWx1ZTphbnkpe1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uQWZ0ZXJOZXh0KHZhbHVlOmFueSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG9uSXNDb21wbGV0ZWQodmFsdWU6YW55KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25CZWZvcmVFcnJvcihlcnJvcjphbnkpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvbkFmdGVyRXJyb3IoZXJyb3I6YW55KSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25CZWZvcmVDb21wbGV0ZWQoKSB7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb25BZnRlckNvbXBsZXRlZCgpIHtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy90b2RvXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmUoYXJnMT86RnVuY3Rpb258T2JzZXJ2ZXIsIG9uRXJyb3I/OkZ1bmN0aW9uLCBvbkNvbXBsZXRlZD86RnVuY3Rpb24pOklEaXNwb3NhYmxle1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyA8QXV0b0RldGFjaE9ic2VydmVyPmFyZzFcbiAgICAgICAgICAgICAgICAgICAgOiBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxGdW5jdGlvbj5hcmcxLCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gSW5uZXJTdWJzY3JpcHRpb24uY3JlYXRlKHRoaXMsIG9ic2VydmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNTdGFydCB8fCB0aGlzLm9ic2VydmVyLmlzRW1wdHkoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkJlZm9yZU5leHQodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5uZXh0KHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMub25BZnRlck5leHQodmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgaWYodGhpcy5vbklzQ29tcGxldGVkKHZhbHVlKSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBlcnJvcihlcnJvcjphbnkpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzU3RhcnQgfHwgdGhpcy5vYnNlcnZlci5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZUVycm9yKGVycm9yKTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5lcnJvcihlcnJvcik7XG5cbiAgICAgICAgICAgIHRoaXMub25BZnRlckVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb21wbGV0ZWQoKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1N0YXJ0IHx8IHRoaXMub2JzZXJ2ZXIuaXNFbXB0eSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub25CZWZvcmVDb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5jb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5vbkFmdGVyQ29tcGxldGVkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdG9TdHJlYW0oKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdHJlYW0gPSBudWxsO1xuXG4gICAgICAgICAgICBzdHJlYW0gPSBBbm9ueW1vdXNTdHJlYW0uY3JlYXRlKChvYnNlcnZlcjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlKG9ic2VydmVyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0KCl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuX2lzU3RhcnQgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLnNldERpc3Bvc2FibGUoU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0b3AoKXtcbiAgICAgICAgICAgIHRoaXMuX2lzU3RhcnQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyByZW1vdmUob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5yZW1vdmVDaGlsZChvYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZGlzcG9zZSgpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEFub255bW91c09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9uTmV4dDpGdW5jdGlvbiwgb25FcnJvcjpGdW5jdGlvbiwgb25Db21wbGV0ZWQ6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5vblVzZXJOZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMub25Vc2VyRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLm9uVXNlckNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBBdXRvRGV0YWNoT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob2JzZXJ2ZXI6SU9ic2VydmVyKTtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUob25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbik7XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYoYXJncy5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhhcmdzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgd2RDYi5Mb2cubG9nKFwib25seSBjYW4gZGlzcG9zZSBvbmNlXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uVXNlck5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJFcnJvcihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblVzZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIE1hcE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlciwgc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzZWxlY3RvcjpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZWxlY3Rvcih2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRG9PYnNlcnZlciBleHRlbmRzIE9ic2VydmVye1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBwcmV2T2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX3ByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHByZXZPYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlciA9IHByZXZPYnNlcnZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5e1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgLy90aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldk9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwe1xuICAgIGV4cG9ydCBjbGFzcyBNZXJnZUFsbE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGN1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIsIHN0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+LCBncm91cERpc3Bvc2FibGU6R3JvdXBEaXNwb3NhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoY3VycmVudE9ic2VydmVyLCBzdHJlYW1Hcm91cCwgZ3JvdXBEaXNwb3NhYmxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRPYnNlcnZlcjpJT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBnZXQgY3VycmVudE9ic2VydmVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG4gICAgICAgIHNldCBjdXJyZW50T2JzZXJ2ZXIoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9kb25lOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgZ2V0IGRvbmUoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kb25lO1xuICAgICAgICB9XG4gICAgICAgIHNldCBkb25lKGRvbmU6Ym9vbGVhbil7XG4gICAgICAgICAgICB0aGlzLl9kb25lID0gZG9uZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3N0cmVhbUdyb3VwOndkQ2IuQ29sbGVjdGlvbjxTdHJlYW0+ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfZ3JvdXBEaXNwb3NhYmxlOkdyb3VwRGlzcG9zYWJsZSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY3VycmVudE9ic2VydmVyOklPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGdyb3VwRGlzcG9zYWJsZTpHcm91cERpc3Bvc2FibGUpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwID0gc3RyZWFtR3JvdXA7XG4gICAgICAgICAgICB0aGlzLl9ncm91cERpc3Bvc2FibGUgPSBncm91cERpc3Bvc2FibGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KGlubmVyU291cmNlOmFueSl7XG4gICAgICAgICAgICB3ZENiLkxvZy5lcnJvcighKGlubmVyU291cmNlIGluc3RhbmNlb2YgU3RyZWFtIHx8IEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSksIHdkQ2IuTG9nLmluZm8uRlVOQ19NVVNUX0JFKFwiaW5uZXJTb3VyY2VcIiwgXCJTdHJlYW0gb3IgUHJvbWlzZVwiKSk7XG5cbiAgICAgICAgICAgIGlmKEp1ZGdlVXRpbHMuaXNQcm9taXNlKGlubmVyU291cmNlKSl7XG4gICAgICAgICAgICAgICAgaW5uZXJTb3VyY2UgPSBmcm9tUHJvbWlzZShpbm5lclNvdXJjZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3N0cmVhbUdyb3VwLmFkZENoaWxkKGlubmVyU291cmNlKTtcblxuICAgICAgICAgICAgdGhpcy5fZ3JvdXBEaXNwb3NhYmxlLmFkZChpbm5lclNvdXJjZS5idWlsZFN0cmVhbShJbm5lck9ic2VydmVyLmNyZWF0ZSh0aGlzLCB0aGlzLl9zdHJlYW1Hcm91cCwgaW5uZXJTb3VyY2UpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0aGlzLl9zdHJlYW1Hcm91cC5nZXRDb3VudCgpID09PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50T2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGFzcyBJbm5lck9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHBhcmVudDpNZXJnZUFsbE9ic2VydmVyLCBzdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiwgY3VycmVudFN0cmVhbTpTdHJlYW0pIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocGFyZW50LCBzdHJlYW1Hcm91cCwgY3VycmVudFN0cmVhbSk7XG5cbiAgICAgICAgXHRyZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfcGFyZW50Ok1lcmdlQWxsT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1Hcm91cDp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2N1cnJlbnRTdHJlYW06U3RyZWFtID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6TWVyZ2VBbGxPYnNlcnZlciwgc3RyZWFtR3JvdXA6d2RDYi5Db2xsZWN0aW9uPFN0cmVhbT4sIGN1cnJlbnRTdHJlYW06U3RyZWFtKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1Hcm91cCA9IHN0cmVhbUdyb3VwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0cmVhbSA9IGN1cnJlbnRTdHJlYW07XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jdXJyZW50T2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcil7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdHJlYW0gPSB0aGlzLl9jdXJyZW50U3RyZWFtLFxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHRoaXMuX3BhcmVudDtcblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtR3JvdXAucmVtb3ZlQ2hpbGQoKHN0cmVhbTpTdHJlYW0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSnVkZ2VVdGlscy5pc0VxdWFsKHN0cmVhbSwgY3VycmVudFN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9wYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgLy90aGlzLmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgLyohXG4gICAgICAgICAgICBpZiB0aGlzIGlubmVyU291cmNlIGlzIGFzeW5jIHN0cmVhbShhcyBwcm9taXNlIHN0cmVhbSksXG4gICAgICAgICAgICBpdCB3aWxsIGZpcnN0IGV4ZWMgYWxsIHBhcmVudC5uZXh0IGFuZCBvbmUgcGFyZW50LmNvbXBsZXRlZCxcbiAgICAgICAgICAgIHRoZW4gZXhlYyBhbGwgdGhpcy5uZXh0IGFuZCBhbGwgdGhpcy5jb21wbGV0ZWRcbiAgICAgICAgICAgIHNvIGluIHRoaXMgY2FzZSwgaXQgc2hvdWxkIGludm9rZSBwYXJlbnQuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCBhZnRlciB0aGUgbGFzdCBpbnZva2NhdGlvbiBvZiB0aGlzLmNvbXBsZXRlZChoYXZlIGludm9rZWQgYWxsIHRoZSBpbm5lclNvdXJjZSlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZih0aGlzLl9pc0FzeW5jKCkgJiYgdGhpcy5fc3RyZWFtR3JvdXAuZ2V0Q291bnQoKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgcGFyZW50LmN1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2lzQXN5bmMoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQuZG9uZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgVGFrZVVudGlsT2JzZXJ2ZXIgZXh0ZW5kcyBPYnNlcnZlcntcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJldk9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHByZXZPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcmV2T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihwcmV2T2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9wcmV2T2JzZXJ2ZXIgPSBwcmV2T2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25OZXh0KHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKXtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKXtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIENvbmNhdE9ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdGFydE5leHRTdHJlYW06RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhjdXJyZW50T2JzZXJ2ZXIsIHN0YXJ0TmV4dFN0cmVhbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgY3VycmVudE9ic2VydmVyOklPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHByb3RlY3RlZCBjdXJyZW50T2JzZXJ2ZXI6YW55ID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfc3RhcnROZXh0U3RyZWFtOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyLCBzdGFydE5leHRTdHJlYW06RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHN1cGVyKG51bGwsIG51bGwsIG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlciA9IGN1cnJlbnRPYnNlcnZlcjtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0TmV4dFN0cmVhbSA9IHN0YXJ0TmV4dFN0cmVhbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk5leHQodmFsdWUpe1xuICAgICAgICAgICAgLyohXG4gICAgICAgICAgICBpZiBcInRoaXMuY3VycmVudE9ic2VydmVyLm5leHRcIiBlcnJvciwgaXQgd2lsbCBwYXNlIHRvIHRoaXMuY3VycmVudE9ic2VydmVyLT5vbkVycm9yLlxuICAgICAgICAgICAgc28gaXQgc2hvdWxkbid0IGludm9rZSB0aGlzLmN1cnJlbnRPYnNlcnZlci5lcnJvciBoZXJlIGFnYWluIVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAvL3RyeXtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgLy99XG4gICAgICAgICAgICAvL2NhdGNoKGUpe1xuICAgICAgICAgICAgLy8gICAgdGhpcy5jdXJyZW50T2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25Db21wbGV0ZWQoKSB7XG4gICAgICAgICAgICAvL3RoaXMuY3VycmVudE9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnROZXh0U3RyZWFtKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFN1YmplY3RPYnNlcnZlciBpbXBsZW1lbnRzIElPYnNlcnZlcntcbiAgICAgICAgcHVibGljIG9ic2VydmVyczp3ZENiLkNvbGxlY3Rpb248SU9ic2VydmVyPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8SU9ic2VydmVyPigpO1xuXG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2FibGU6SURpc3Bvc2FibGUgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBpc0VtcHR5KCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vYnNlcnZlcnMuZ2V0Q291bnQoKSA9PT0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBuZXh0KHZhbHVlOmFueSl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZXJyb3IoZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY29tcGxldGVkKCl7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIG9iLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgYWRkQ2hpbGQob2JzZXJ2ZXI6T2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuYWRkQ2hpbGQob2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuX2Rpc3Bvc2FibGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHJlbW92ZUNoaWxkKG9ic2VydmVyOk9ic2VydmVyKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnJlbW92ZUNoaWxkKChvYjpPYnNlcnZlcikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBKdWRnZVV0aWxzLmlzRXF1YWwob2IsIG9ic2VydmVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9iOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2V0RGlzcG9zYWJsZShkaXNwb3NhYmxlOklEaXNwb3NhYmxlKXtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goKG9ic2VydmVyOk9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuc2V0RGlzcG9zYWJsZShkaXNwb3NhYmxlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NhYmxlID0gZGlzcG9zYWJsZTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNPYnNlcnZlciBleHRlbmRzIE9ic2VydmVyIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoY3VycmVudE9ic2VydmVyOklPYnNlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGN1cnJlbnRPYnNlcnZlcik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjdXJyZW50T2JzZXJ2ZXI6SU9ic2VydmVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyID0gY3VycmVudE9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25FcnJvcihlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudE9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRPYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZVN0cmVhbSBleHRlbmRzIFN0cmVhbXtcbiAgICAgICAgcHVibGljIGFic3RyYWN0IHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKTpJRGlzcG9zYWJsZTtcblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKGFyZzE6RnVuY3Rpb258T2JzZXJ2ZXJ8U3ViamVjdCwgb25FcnJvcj8sIG9uQ29tcGxldGVkPyk6SURpc3Bvc2FibGUge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyOk9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICAgICAgaWYodGhpcy5oYW5kbGVTdWJqZWN0KGFyZzEpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyID0gYXJnMSBpbnN0YW5jZW9mIE9ic2VydmVyXG4gICAgICAgICAgICAgICAgPyBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKDxJT2JzZXJ2ZXI+YXJnMSlcbiAgICAgICAgICAgICAgICA6IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUoPEZ1bmN0aW9uPmFyZzEsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgLy9vYnNlcnZlci5zZXREaXNwb3NlSGFuZGxlcih0aGlzLmRpc3Bvc2VIYW5kbGVyKTtcblxuXG4gICAgICAgICAgICBvYnNlcnZlci5zZXREaXNwb3NhYmxlKHRoaXMuYnVpbGRTdHJlYW0ob2JzZXJ2ZXIpKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJ1aWxkU3RyZWFtKG9ic2VydmVyOklPYnNlcnZlcik6SURpc3Bvc2FibGV7XG4gICAgICAgICAgICBzdXBlci5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN1YnNjcmliZUNvcmUob2JzZXJ2ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIF9oYXNNdWx0aU9ic2VydmVycygpe1xuICAgICAgICAvLyAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXIuZ2V0T2JzZXJ2ZXJzKCkgPiAxO1xuICAgICAgICAvL31cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRG9TdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtLCBvbk5leHQ/OkZ1bmN0aW9uLCBvbkVycm9yPzpGdW5jdGlvbiwgb25Db21wbGV0ZWQ/OkZ1bmN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBvbk5leHQsIG9uRXJyb3IsIG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpPYnNlcnZlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgb25OZXh0OkZ1bmN0aW9uLCBvbkVycm9yOkZ1bmN0aW9uLCBvbkNvbXBsZXRlZDpGdW5jdGlvbil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBBbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oRG9PYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIsIHRoaXMuX29ic2VydmVyKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTWFwU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSwgc2VsZWN0b3I6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhzb3VyY2UsIHNlbGVjdG9yKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9zZWxlY3RvcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgc2VsZWN0b3I6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLmJ1aWxkU3RyZWFtKE1hcE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgdGhpcy5fc2VsZWN0b3IpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbUFycmF5U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKGFycmF5LCBzY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYXJyYXk6QXJyYXk8YW55PiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnJheTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBhcnJheSA9IHRoaXMuX2FycmF5LFxuICAgICAgICAgICAgICAgIGxlbiA9IGFycmF5Lmxlbmd0aDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gbG9vcFJlY3Vyc2l2ZShpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChhcnJheVtpXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzLmNhbGxlZShpICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyLCAwLCBsb29wUmVjdXJzaXZlKTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEZyb21Qcm9taXNlU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUocHJvbWlzZTphbnksIHNjaGVkdWxlcjpTY2hlZHVsZXIpIHtcbiAgICAgICAgXHR2YXIgb2JqID0gbmV3IHRoaXMocHJvbWlzZSwgc2NoZWR1bGVyKTtcblxuICAgICAgICBcdHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9wcm9taXNlOmFueSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJvbWlzZTphbnksIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3Byb21pc2UgPSBwcm9taXNlO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5fcHJvbWlzZS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChkYXRhKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSwgb2JzZXJ2ZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRnJvbUV2ZW50UGF0dGVyblN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhhZGRIYW5kbGVyLCByZW1vdmVIYW5kbGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FkZEhhbmRsZXI6RnVuY3Rpb24gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9yZW1vdmVIYW5kbGVyOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihhZGRIYW5kbGVyOkZ1bmN0aW9uLCByZW1vdmVIYW5kbGVyOkZ1bmN0aW9uKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9hZGRIYW5kbGVyID0gYWRkSGFuZGxlcjtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUhhbmRsZXIgPSByZW1vdmVIYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgZnVuY3Rpb24gaW5uZXJIYW5kbGVyKGV2ZW50KXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fYWRkSGFuZGxlcihpbm5lckhhbmRsZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuX3JlbW92ZUhhbmRsZXIoaW5uZXJIYW5kbGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEFub255bW91c1N0cmVhbSBleHRlbmRzIFN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc3Vic2NyaWJlRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHN1YnNjcmliZUZ1bmMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc3Vic2NyaWJlRnVuYzpGdW5jdGlvbikge1xuICAgICAgICAgICAgc3VwZXIoc3Vic2NyaWJlRnVuYyk7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShzdWJqZWN0OlN1YmplY3QpOklEaXNwb3NhYmxlO1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9ic2VydmVyOklPYnNlcnZlcik6SURpc3Bvc2FibGU7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZShvbk5leHQ6KHZhbHVlOmFueSk9PnZvaWQpOklEaXNwb3NhYmxlO1xuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlKG9uTmV4dDoodmFsdWU6YW55KT0+dm9pZCwgb25FcnJvcjooZTphbnkpPT52b2lkKTpJRGlzcG9zYWJsZTtcbiAgICAgICAgcHVibGljIHN1YnNjcmliZShvbk5leHQ6KHZhbHVlOmFueSk9PnZvaWQsIG9uRXJyb3I6KGU6YW55KT0+dm9pZCwgb25Db21wbGV0ZTooKT0+dm9pZCk6SURpc3Bvc2FibGU7XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZSguLi5hcmdzKTpJRGlzcG9zYWJsZSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI6QXV0b0RldGFjaE9ic2VydmVyID0gbnVsbDtcblxuICAgICAgICAgICAgaWYoYXJnc1swXSBpbnN0YW5jZW9mIFN1YmplY3Qpe1xuICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0OlN1YmplY3QgPSA8U3ViamVjdD5hcmdzWzBdO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTdWJqZWN0KHN1YmplY3QpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihKdWRnZVV0aWxzLmlzSU9ic2VydmVyKDxJT2JzZXJ2ZXI+YXJnc1swXSkpe1xuICAgICAgICAgICAgICAgIG9ic2VydmVyID0gQXV0b0RldGFjaE9ic2VydmVyLmNyZWF0ZSg8SU9ic2VydmVyPmFyZ3NbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgb25OZXh0OkZ1bmN0aW9uID0gPEZ1bmN0aW9uPmFyZ3NbMF0sXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3I6RnVuY3Rpb24gPSA8RnVuY3Rpb24+YXJnc1sxXSB8fCBudWxsLFxuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlZDpGdW5jdGlvbiA9IDxGdW5jdGlvbj5hcmdzWzJdIHx8IG51bGw7XG5cbiAgICAgICAgICAgICAgICBvYnNlcnZlciA9IEF1dG9EZXRhY2hPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLCBvbkNvbXBsZXRlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyLnNldERpc3Bvc2FibGUodGhpcy5idWlsZFN0cmVhbShvYnNlcnZlcikpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIEludGVydmFsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaW50ZXJ2YWw6bnVtYmVyLCBzY2hlZHVsZXI6U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoaW50ZXJ2YWwsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIG9iai5pbml0V2hlbkNyZWF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfaW50ZXJ2YWw6bnVtYmVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihpbnRlcnZhbDpudW1iZXIsIHNjaGVkdWxlcjpTY2hlZHVsZXIpe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gaW50ZXJ2YWw7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbml0V2hlbkNyZWF0ZSgpe1xuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSB0aGlzLl9pbnRlcnZhbCA8PSAwID8gMSA6IHRoaXMuX2ludGVydmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlkID0gdGhpcy5zY2hlZHVsZXIucHVibGlzaEludGVydmFsKG9ic2VydmVyLCAwLCB0aGlzLl9pbnRlcnZhbCwgKGNvdW50KSA9PiB7XG4gICAgICAgICAgICAgICAgLy9zZWxmLnNjaGVkdWxlci5uZXh0KGNvdW50KTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGNvdW50KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudCArIDE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9EaXNwb3Nlci5hZGREaXNwb3NlSGFuZGxlcigoKSA9PiB7XG4gICAgICAgICAgICAvL30pO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QuY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgSW50ZXJ2YWxSZXF1ZXN0U3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc2NoZWR1bGVyOlNjaGVkdWxlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc0VuZDpib29sZWFuID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2NoZWR1bGVyOlNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3Vic2NyaWJlQ29yZShvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5wdWJsaXNoSW50ZXJ2YWxSZXF1ZXN0KG9ic2VydmVyLCAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodGltZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5faXNFbmQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIFNpbmdsZURpc3Bvc2FibGUuY3JlYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LmNhbmNlbE5leHRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2VsZi5zY2hlZHVsZXIucmVxdWVzdExvb3BJZCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNFbmQgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIE1lcmdlQWxsU3RyZWFtIGV4dGVuZHMgQmFzZVN0cmVhbXtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoc291cmNlOlN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9zb3VyY2U6U3RyZWFtID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBfb2JzZXJ2ZXI6T2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIC8vdGhpcy5fb2JzZXJ2ZXIgPSBBbm9ueW1vdXNPYnNlcnZlci5jcmVhdGUob25OZXh0LCBvbkVycm9yLG9uQ29tcGxldGVkKTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzdHJlYW1Hcm91cCA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8U3RyZWFtPigpLFxuICAgICAgICAgICAgICAgIGdyb3VwRGlzcG9zYWJsZSA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKTtcblxuICAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShNZXJnZUFsbE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgc3RyZWFtR3JvdXAsIGdyb3VwRGlzcG9zYWJsZSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBEaXNwb3NhYmxlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFRha2VVbnRpbFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIG90aGVyU3RlYW06U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlLCBvdGhlclN0ZWFtKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vdGhlclN0cmVhbTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0sIG90aGVyU3RyZWFtOlN0cmVhbSl7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5fb3RoZXJTdHJlYW0gPSBKdWRnZVV0aWxzLmlzUHJvbWlzZShvdGhlclN0cmVhbSkgPyBmcm9tUHJvbWlzZShvdGhlclN0cmVhbSkgOiBvdGhlclN0cmVhbTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBncm91cCA9IEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoKSxcbiAgICAgICAgICAgICAgICBhdXRvRGV0YWNoT2JzZXJ2ZXIgPSBBdXRvRGV0YWNoT2JzZXJ2ZXIuY3JlYXRlKG9ic2VydmVyKSxcbiAgICAgICAgICAgICAgICBzb3VyY2VEaXNwb3NhYmxlID0gbnVsbDtcblxuICAgICAgICAgICAgc291cmNlRGlzcG9zYWJsZSA9IHRoaXMuX3NvdXJjZS5idWlsZFN0cmVhbShvYnNlcnZlcik7XG5cbiAgICAgICAgICAgIGdyb3VwLmFkZChzb3VyY2VEaXNwb3NhYmxlKTtcblxuICAgICAgICAgICAgYXV0b0RldGFjaE9ic2VydmVyLnNldERpc3Bvc2FibGUoc291cmNlRGlzcG9zYWJsZSk7XG5cbiAgICAgICAgICAgIGdyb3VwLmFkZCh0aGlzLl9vdGhlclN0cmVhbS5idWlsZFN0cmVhbShUYWtlVW50aWxPYnNlcnZlci5jcmVhdGUoYXV0b0RldGFjaE9ic2VydmVyKSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIENvbmNhdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZXM6QXJyYXk8U3RyZWFtPikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlczp3ZENiLkNvbGxlY3Rpb248U3RyZWFtPiA9IHdkQ2IuQ29sbGVjdGlvbi5jcmVhdGU8U3RyZWFtPigpO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZXM6QXJyYXk8U3RyZWFtPil7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAvL3RvZG8gZG9uJ3Qgc2V0IHNjaGVkdWxlciBoZXJlP1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBzb3VyY2VzWzBdLnNjaGVkdWxlcjtcblxuICAgICAgICAgICAgc291cmNlcy5mb3JFYWNoKChzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZihKdWRnZVV0aWxzLmlzUHJvbWlzZShzb3VyY2UpKXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc291cmNlcy5hZGRDaGlsZChmcm9tUHJvbWlzZShzb3VyY2UpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc291cmNlcy5hZGRDaGlsZChzb3VyY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb3VudCA9IHRoaXMuX3NvdXJjZXMuZ2V0Q291bnQoKSxcbiAgICAgICAgICAgICAgICBkID0gR3JvdXBEaXNwb3NhYmxlLmNyZWF0ZSgpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb29wUmVjdXJzaXZlKGkpIHtcbiAgICAgICAgICAgICAgICBpZihpID09PSBjb3VudCl7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkLmFkZChzZWxmLl9zb3VyY2VzLmdldENoaWxkKGkpLmJ1aWxkU3RyZWFtKENvbmNhdE9ic2VydmVyLmNyZWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLCAoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BSZWN1cnNpdmUoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucHVibGlzaFJlY3Vyc2l2ZShvYnNlcnZlciwgMCwgbG9vcFJlY3Vyc2l2ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBHcm91cERpc3Bvc2FibGUuY3JlYXRlKGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IGNsYXNzIFJlcGVhdFN0cmVhbSBleHRlbmRzIEJhc2VTdHJlYW17XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNvdXJjZTpTdHJlYW0sIGNvdW50Om51bWJlcikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNvdXJjZSwgY291bnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc291cmNlOlN0cmVhbSA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2NvdW50Om51bWJlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc291cmNlOlN0cmVhbSwgY291bnQ6bnVtYmVyKXtcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xuXG4gICAgICAgICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLl9jb3VudCA9IGNvdW50O1xuXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMuX3NvdXJjZS5zY2hlZHVsZXI7XG5cbiAgICAgICAgICAgIC8vdGhpcy5zdWJqZWN0R3JvdXAgPSB0aGlzLl9zb3VyY2Uuc3ViamVjdEdyb3VwO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGQgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvb3BSZWN1cnNpdmUoY291bnQpIHtcbiAgICAgICAgICAgICAgICBpZihjb3VudCA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkLmFkZChcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc291cmNlLmJ1aWxkU3RyZWFtKENvbmNhdE9ic2VydmVyLmNyZWF0ZShvYnNlcnZlciwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFJlY3Vyc2l2ZShjb3VudCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnB1Ymxpc2hSZWN1cnNpdmUob2JzZXJ2ZXIsIHRoaXMuX2NvdW50LCBsb29wUmVjdXJzaXZlKTtcblxuICAgICAgICAgICAgcmV0dXJuIEdyb3VwRGlzcG9zYWJsZS5jcmVhdGUoZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgSWdub3JlRWxlbWVudHNTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShzb3VyY2U6U3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc291cmNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NvdXJjZTpTdHJlYW0gPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNvdXJjZTpTdHJlYW0pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLl9zb3VyY2Uuc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2UuYnVpbGRTdHJlYW0oSWdub3JlRWxlbWVudHNPYnNlcnZlci5jcmVhdGUob2JzZXJ2ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgRGVmZXJTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFte1xuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShidWlsZFN0cmVhbUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhidWlsZFN0cmVhbUZ1bmMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihidWlsZFN0cmVhbUZ1bmM6RnVuY3Rpb24pe1xuICAgICAgICAgICAgc3VwZXIobnVsbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2J1aWxkU3RyZWFtRnVuYyA9IGJ1aWxkU3RyZWFtRnVuYztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdWJzY3JpYmVDb3JlKG9ic2VydmVyOklPYnNlcnZlcil7XG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBHcm91cERpc3Bvc2FibGUuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgIGdyb3VwLmFkZCh0aGlzLl9idWlsZFN0cmVhbUZ1bmMoKS5idWlsZFN0cmVhbShvYnNlcnZlcikpO1xuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUgd2RGcnB7XG4gICAgZXhwb3J0IHZhciBjcmVhdGVTdHJlYW0gPSAoc3Vic2NyaWJlRnVuYykgPT4ge1xuICAgICAgICByZXR1cm4gQW5vbnltb3VzU3RyZWFtLmNyZWF0ZShzdWJzY3JpYmVGdW5jKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tQXJyYXkgPSAoYXJyYXk6QXJyYXk8YW55Piwgc2NoZWR1bGVyID0gU2NoZWR1bGVyLmNyZWF0ZSgpKSA9PntcbiAgICAgICAgcmV0dXJuIEZyb21BcnJheVN0cmVhbS5jcmVhdGUoYXJyYXksIHNjaGVkdWxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZnJvbVByb21pc2UgPSAocHJvbWlzZTphbnksIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT57XG4gICAgICAgIHJldHVybiBGcm9tUHJvbWlzZVN0cmVhbS5jcmVhdGUocHJvbWlzZSwgc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBmcm9tRXZlbnRQYXR0ZXJuID0gKGFkZEhhbmRsZXI6RnVuY3Rpb24sIHJlbW92ZUhhbmRsZXI6RnVuY3Rpb24pID0+e1xuICAgICAgICByZXR1cm4gRnJvbUV2ZW50UGF0dGVyblN0cmVhbS5jcmVhdGUoYWRkSGFuZGxlciwgcmVtb3ZlSGFuZGxlcik7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgaW50ZXJ2YWwgPSAoaW50ZXJ2YWwsIHNjaGVkdWxlciA9IFNjaGVkdWxlci5jcmVhdGUoKSkgPT4ge1xuICAgICAgICByZXR1cm4gSW50ZXJ2YWxTdHJlYW0uY3JlYXRlKGludGVydmFsLCBzY2hlZHVsZXIpO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGludGVydmFsUmVxdWVzdCA9IChzY2hlZHVsZXIgPSBTY2hlZHVsZXIuY3JlYXRlKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsUmVxdWVzdFN0cmVhbS5jcmVhdGUoc2NoZWR1bGVyKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBlbXB0eSA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmVhbSgob2JzZXJ2ZXI6SU9ic2VydmVyKSA9PntcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBjYWxsRnVuYyA9IChmdW5jOkZ1bmN0aW9uLCBjb250ZXh0ID0gcm9vdCkgPT4ge1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGZ1bmMuY2FsbChjb250ZXh0LCBudWxsKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBleHBvcnQgdmFyIGp1ZGdlID0gKGNvbmRpdGlvbjpGdW5jdGlvbiwgdGhlblNvdXJjZTpGdW5jdGlvbiwgZWxzZVNvdXJjZTpGdW5jdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gY29uZGl0aW9uKCkgPyB0aGVuU291cmNlKCkgOiBlbHNlU291cmNlKCk7XG4gICAgfTtcblxuICAgIGV4cG9ydCB2YXIgZGVmZXIgPSAoYnVpbGRTdHJlYW1GdW5jOkZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiBEZWZlclN0cmVhbS5jcmVhdGUoYnVpbGRTdHJlYW1GdW5jKTtcbiAgICB9O1xuXG4gICAgZXhwb3J0IHZhciBqdXN0ID0gKHJldHVyblZhbHVlOmFueSkgPT4ge1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RyZWFtKChvYnNlcnZlcjpJT2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQocmV0dXJuVmFsdWUpO1xuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICB2YXIgZGVmYXVsdElzRXF1YWwgPSAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICB9O1xuXG4gICAgZXhwb3J0IGNsYXNzIFJlY29yZCB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHRpbWU6bnVtYmVyLCB2YWx1ZTphbnksIGFjdGlvblR5cGU/OkFjdGlvblR5cGUsIGNvbXBhcmVyPzpGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHRpbWUsIHZhbHVlLCBhY3Rpb25UeXBlLCBjb21wYXJlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB0aW1lKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgdGltZSh0aW1lOm51bWJlcil7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3ZhbHVlOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCB2YWx1ZSgpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHNldCB2YWx1ZSh2YWx1ZTpudW1iZXIpe1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FjdGlvblR5cGU6QWN0aW9uVHlwZSA9IG51bGw7XG4gICAgICAgIGdldCBhY3Rpb25UeXBlKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aW9uVHlwZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgYWN0aW9uVHlwZShhY3Rpb25UeXBlOkFjdGlvblR5cGUpe1xuICAgICAgICAgICAgdGhpcy5fYWN0aW9uVHlwZSA9IGFjdGlvblR5cGU7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9jb21wYXJlcjpGdW5jdGlvbiA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IodGltZSwgdmFsdWUsIGFjdGlvblR5cGU6QWN0aW9uVHlwZSwgY29tcGFyZXI6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX2FjdGlvblR5cGUgPSBhY3Rpb25UeXBlO1xuICAgICAgICAgICAgdGhpcy5fY29tcGFyZXIgPSBjb21wYXJlciB8fCBkZWZhdWx0SXNFcXVhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWUgPT09IG90aGVyLnRpbWUgJiYgdGhpcy5fY29tcGFyZXIodGhpcy5fdmFsdWUsIG90aGVyLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTW9ja09ic2VydmVyIGV4dGVuZHMgT2JzZXJ2ZXJ7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMoc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX21lc3NhZ2VzOltSZWNvcmRdID0gPFtSZWNvcmRdPltdO1xuICAgICAgICBnZXQgbWVzc2FnZXMoKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgICAgICAgfVxuICAgICAgICBzZXQgbWVzc2FnZXMobWVzc2FnZXM6W1JlY29yZF0pe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3NjaGVkdWxlcjpUZXN0U2NoZWR1bGVyID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihzY2hlZHVsZXI6VGVzdFNjaGVkdWxlcil7XG4gICAgICAgICAgICBzdXBlcihudWxsLCBudWxsLCBudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTmV4dCh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKFJlY29yZC5jcmVhdGUodGhpcy5fc2NoZWR1bGVyLmNsb2NrLCB2YWx1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uRXJyb3IoZXJyb3Ipe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgZXJyb3IpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNvbXBsZXRlZCgpe1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChSZWNvcmQuY3JlYXRlKHRoaXMuX3NjaGVkdWxlci5jbG9jaywgbnVsbCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGRpc3Bvc2UoKXtcbiAgICAgICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjb3B5KCl7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gTW9ja09ic2VydmVyLmNyZWF0ZSh0aGlzLl9zY2hlZHVsZXIpO1xuXG4gICAgICAgICAgICByZXN1bHQubWVzc2FnZXMgPSB0aGlzLl9tZXNzYWdlcztcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycHtcbiAgICBleHBvcnQgY2xhc3MgTW9ja1Byb21pc2V7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyLCBtZXNzYWdlczpbUmVjb3JkXSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG5ldyB0aGlzKHNjaGVkdWxlciwgbWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXM6W1JlY29yZF0gPSA8W1JlY29yZF0+W107XG4gICAgICAgIC8vZ2V0IG1lc3NhZ2VzKCl7XG4gICAgICAgIC8vICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgICAgICAgLy99XG4gICAgICAgIC8vc2V0IG1lc3NhZ2VzKG1lc3NhZ2VzOltSZWNvcmRdKXtcbiAgICAgICAgLy8gICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgLy99XG5cbiAgICAgICAgcHJpdmF0ZSBfc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHRoZW4oc3VjY2Vzc0NiOkZ1bmN0aW9uLCBlcnJvckNiOkZ1bmN0aW9uLCBvYnNlcnZlcjpJT2JzZXJ2ZXIpe1xuICAgICAgICAgICAgLy92YXIgc2NoZWR1bGVyID0gPFRlc3RTY2hlZHVsZXI+KHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlIHdkRnJwIHtcbiAgICBjb25zdCBTVUJTQ1JJQkVfVElNRSA9IDIwMDtcbiAgICBjb25zdCBESVNQT1NFX1RJTUUgPSAxMDAwO1xuXG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsZXIge1xuICAgICAgICBwdWJsaWMgc3RhdGljIG5leHQodGljaywgdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWNvcmQuY3JlYXRlKHRpY2ssIHZhbHVlLCBBY3Rpb25UeXBlLk5FWFQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBlcnJvcih0aWNrLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgZXJyb3IsIEFjdGlvblR5cGUuRVJST1IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjb21wbGV0ZWQodGljaykge1xuICAgICAgICAgICAgcmV0dXJuIFJlY29yZC5jcmVhdGUodGljaywgbnVsbCwgQWN0aW9uVHlwZS5DT01QTEVURUQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUoaXNSZXNldDpib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgICAgIHZhciBvYmogPSBuZXcgdGhpcyhpc1Jlc2V0KTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKGlzUmVzZXQ6Ym9vbGVhbil7XG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICB0aGlzLl9pc1Jlc2V0ID0gaXNSZXNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2Nsb2NrOm51bWJlciA9IG51bGw7XG4gICAgICAgIGdldCBjbG9jaygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBjbG9jayhjbG9jazpudW1iZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gY2xvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9pc1Jlc2V0OmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgcHJpdmF0ZSBfaXNEaXNwb3NlZDpib29sZWFuID0gZmFsc2U7XG4gICAgICAgIHByaXZhdGUgX3RpbWVyTWFwOndkQ2IuSGFzaDxGdW5jdGlvbj4gPSB3ZENiLkhhc2guY3JlYXRlPEZ1bmN0aW9uPigpO1xuICAgICAgICBwcml2YXRlIF9zdHJlYW1NYXA6d2RDYi5IYXNoPEZ1bmN0aW9uPiA9IHdkQ2IuSGFzaC5jcmVhdGU8RnVuY3Rpb24+KCk7XG4gICAgICAgIHByaXZhdGUgX3N1YnNjcmliZWRUaW1lOm51bWJlciA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgX2Rpc3Bvc2VkVGltZTpudW1iZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9vYnNlcnZlcjpNb2NrT2JzZXJ2ZXIgPSBudWxsO1xuXG4gICAgICAgIHB1YmxpYyBzZXRTdHJlYW1NYXAob2JzZXJ2ZXI6SU9ic2VydmVyLCBtZXNzYWdlczpbUmVjb3JkXSl7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIG1lc3NhZ2VzLmZvckVhY2goKHJlY29yZDpSZWNvcmQpID0+e1xuICAgICAgICAgICAgICAgIHZhciBmdW5jID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVjb3JkLmFjdGlvblR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuTkVYVDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHJlY29yZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uVHlwZS5FUlJPUjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmMgPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihyZWNvcmQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGlvblR5cGUuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgd2RDYi5Mb2cuZXJyb3IodHJ1ZSwgd2RDYi5Mb2cuaW5mby5GVU5DX1VOS05PVyhcImFjdGlvblR5cGVcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5fc3RyZWFtTWFwLmFkZENoaWxkKFN0cmluZyhyZWNvcmQudGltZSksIGZ1bmMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcmVtb3ZlKG9ic2VydmVyOk9ic2VydmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoUmVjdXJzaXZlKG9ic2VydmVyOk1vY2tPYnNlcnZlciwgaW5pdGlhbDphbnksIHJlY3Vyc2l2ZUZ1bmM6RnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAvL21lc3NhZ2VzID0gW10sXG4gICAgICAgICAgICAgICAgbmV4dCA9IG51bGwsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkID0gbnVsbDtcblxuICAgICAgICAgICAgdGhpcy5fc2V0Q2xvY2soKTtcblxuICAgICAgICAgICAgbmV4dCA9IG9ic2VydmVyLm5leHQ7XG4gICAgICAgICAgICBjb21wbGV0ZWQgPSBvYnNlcnZlci5jb21wbGV0ZWQ7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0LmNhbGwob2JzZXJ2ZXIsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGVkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZC5jYWxsKG9ic2VydmVyKTtcbiAgICAgICAgICAgICAgICBzZWxmLl90aWNrKDEpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVjdXJzaXZlRnVuYyhpbml0aWFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaXNoSW50ZXJ2YWwob2JzZXJ2ZXI6SU9ic2VydmVyLCBpbml0aWFsOmFueSwgaW50ZXJ2YWw6bnVtYmVyLCBhY3Rpb246RnVuY3Rpb24pOm51bWJlcntcbiAgICAgICAgICAgIC8vcHJvZHVjZSAxMCB2YWwgZm9yIHRlc3RcbiAgICAgICAgICAgIHZhciBDT1VOVCA9IDEwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuX3NldENsb2NrKCk7XG5cbiAgICAgICAgICAgIHdoaWxlIChDT1VOVCA+IDAgJiYgIXRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aWNrKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKFRlc3RTY2hlZHVsZXIubmV4dCh0aGlzLl9jbG9jaywgaW5pdGlhbCkpO1xuXG4gICAgICAgICAgICAgICAgLy9ubyBuZWVkIHRvIGludm9rZSBhY3Rpb25cbiAgICAgICAgICAgICAgICAvL2FjdGlvbihpbml0aWFsKTtcblxuICAgICAgICAgICAgICAgIGluaXRpYWwrKztcbiAgICAgICAgICAgICAgICBDT1VOVC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0cmVhbU1hcChvYnNlcnZlciwgPFtSZWNvcmRdPm1lc3NhZ2VzKTtcbiAgICAgICAgICAgIC8vdGhpcy5zZXRTdHJlYW1NYXAodGhpcy5fb2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgcHVibGlzaEludGVydmFsUmVxdWVzdChvYnNlcnZlcjpJT2JzZXJ2ZXIsIGFjdGlvbjpGdW5jdGlvbik6bnVtYmVye1xuICAgICAgICAgICAgLy9wcm9kdWNlIDEwIHZhbCBmb3IgdGVzdFxuICAgICAgICAgICAgdmFyIENPVU5UID0gMTAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IDEwMCxcbiAgICAgICAgICAgICAgICBudW0gPSAwO1xuXG4gICAgICAgICAgICB0aGlzLl9zZXRDbG9jaygpO1xuXG4gICAgICAgICAgICB3aGlsZSAoQ09VTlQgPiAwICYmICF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGljayhpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChUZXN0U2NoZWR1bGVyLm5leHQodGhpcy5fY2xvY2ssIG51bSkpO1xuXG4gICAgICAgICAgICAgICAgbnVtKys7XG4gICAgICAgICAgICAgICAgQ09VTlQtLTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdHJlYW1NYXAob2JzZXJ2ZXIsIDxbUmVjb3JkXT5tZXNzYWdlcyk7XG4gICAgICAgICAgICAvL3RoaXMuc2V0U3RyZWFtTWFwKHRoaXMuX29ic2VydmVyLCA8W1JlY29yZF0+bWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfc2V0Q2xvY2soKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzUmVzZXQpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGhpcy5fc3Vic2NyaWJlZFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoVGltZShjcmVhdGU6RnVuY3Rpb24sIHN1YnNjcmliZWRUaW1lOm51bWJlciwgZGlzcG9zZWRUaW1lOm51bWJlcikge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gdGhpcy5jcmVhdGVPYnNlcnZlcigpLFxuICAgICAgICAgICAgICAgIHNvdXJjZSwgc3Vic2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmVkVGltZSA9IHN1YnNjcmliZWRUaW1lO1xuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZWRUaW1lID0gZGlzcG9zZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9jbG9jayA9IHN1YnNjcmliZWRUaW1lO1xuXG4gICAgICAgICAgICB0aGlzLl9ydW5BdChzdWJzY3JpYmVkVGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNvdXJjZSA9IGNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3J1bkF0KGRpc3Bvc2VkVGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBvYnNlcnZlcjtcblxuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnRXaXRoU3Vic2NyaWJlKGNyZWF0ZSwgc3Vic2NyaWJlZFRpbWUgPSBTVUJTQ1JJQkVfVElNRSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRXaXRoVGltZShjcmVhdGUsIHN1YnNjcmliZWRUaW1lLCBESVNQT1NFX1RJTUUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXJ0V2l0aERpc3Bvc2UoY3JlYXRlLCBkaXNwb3NlZFRpbWUgPSBESVNQT1NFX1RJTUUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0V2l0aFRpbWUoY3JlYXRlLCBTVUJTQ1JJQkVfVElNRSwgZGlzcG9zZWRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBwdWJsaWNBYnNvbHV0ZSh0aW1lLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9ydW5BdCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgICAgICB2YXIgZXh0cmVtZU51bUFyciA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKSxcbiAgICAgICAgICAgICAgICBtaW4gPSBleHRyZW1lTnVtQXJyWzBdLFxuICAgICAgICAgICAgICAgIG1heCA9IGV4dHJlbWVOdW1BcnJbMV0sXG4gICAgICAgICAgICAgICAgdGltZSA9IG1pbjtcblxuICAgICAgICAgICAgLy90b2RvIHJlZHVjZSBsb29wIHRpbWVcbiAgICAgICAgICAgIHdoaWxlICh0aW1lIDw9IG1heCkge1xuICAgICAgICAgICAgICAgIC8vaWYodGhpcy5faXNEaXNwb3NlZCl7XG4gICAgICAgICAgICAgICAgLy8gICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy99XG5cbiAgICAgICAgICAgICAgICAvL2JlY2F1c2UgXCJfZXhlYyxfcnVuU3RyZWFtXCIgbWF5IGNoYW5nZSBcIl9jbG9ja1wiLFxuICAgICAgICAgICAgICAgIC8vc28gaXQgc2hvdWxkIHJlc2V0IHRoZSBfY2xvY2tcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb2NrID0gdGltZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2V4ZWModGltZSwgdGhpcy5fdGltZXJNYXApO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvY2sgPSB0aW1lO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcnVuU3RyZWFtKHRpbWUpO1xuXG4gICAgICAgICAgICAgICAgdGltZSsrO1xuXG4gICAgICAgICAgICAgICAgLy90b2RvIGdldCBtYXggdGltZSBvbmx5IGZyb20gc3RyZWFtTWFwP1xuICAgICAgICAgICAgICAgIC8vbmVlZCByZWZyZXNoIG1heCB0aW1lLlxuICAgICAgICAgICAgICAgIC8vYmVjYXVzZSBpZiB0aW1lck1hcCBoYXMgY2FsbGJhY2sgdGhhdCBjcmVhdGUgaW5maW5pdGUgc3RyZWFtKGFzIGludGVydmFsKSxcbiAgICAgICAgICAgICAgICAvL2l0IHdpbGwgc2V0IHN0cmVhbU1hcCBzbyB0aGF0IHRoZSBtYXggdGltZSB3aWxsIGNoYW5nZVxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuX2dldE1pbkFuZE1heFRpbWUoKVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVTdHJlYW0oYXJncyl7XG4gICAgICAgICAgICByZXR1cm4gVGVzdFN0cmVhbS5jcmVhdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlT2JzZXJ2ZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gTW9ja09ic2VydmVyLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjcmVhdGVSZXNvbHZlZFByb21pc2UodGltZTpudW1iZXIsIHZhbHVlOmFueSl7XG4gICAgICAgICAgICByZXR1cm4gTW9ja1Byb21pc2UuY3JlYXRlKHRoaXMsIFtUZXN0U2NoZWR1bGVyLm5leHQodGltZSwgdmFsdWUpLCBUZXN0U2NoZWR1bGVyLmNvbXBsZXRlZCh0aW1lKzEpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY3JlYXRlUmVqZWN0UHJvbWlzZSh0aW1lOm51bWJlciwgZXJyb3I6YW55KXtcbiAgICAgICAgICAgIHJldHVybiBNb2NrUHJvbWlzZS5jcmVhdGUodGhpcywgW1Rlc3RTY2hlZHVsZXIuZXJyb3IodGltZSwgZXJyb3IpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9nZXRNaW5BbmRNYXhUaW1lKCl7XG4gICAgICAgICAgICB2YXIgdGltZUFycjphbnkgPSAodGhpcy5fdGltZXJNYXAuZ2V0S2V5cygpLmFkZENoaWxkcmVuKHRoaXMuX3N0cmVhbU1hcC5nZXRLZXlzKCkpKTtcblxuICAgICAgICAgICAgICAgIHRpbWVBcnIgPSB0aW1lQXJyLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIoa2V5KTtcbiAgICAgICAgICAgICAgICB9KS50b0FycmF5KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBbTWF0aC5taW4uYXBwbHkoTWF0aCwgdGltZUFyciksIE1hdGgubWF4LmFwcGx5KE1hdGgsIHRpbWVBcnIpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2V4ZWModGltZSwgbWFwKXtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gbWFwLmdldENoaWxkKFN0cmluZyh0aW1lKSk7XG5cbiAgICAgICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3J1blN0cmVhbSh0aW1lKXtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fc3RyZWFtTWFwLmdldENoaWxkKFN0cmluZyh0aW1lKSk7XG5cbiAgICAgICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX3J1bkF0KHRpbWU6bnVtYmVyLCBjYWxsYmFjazpGdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fdGltZXJNYXAuYWRkQ2hpbGQoU3RyaW5nKHRpbWUpLCBjYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF90aWNrKHRpbWU6bnVtYmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9jbG9jayArPSB0aW1lO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGVudW0gQWN0aW9uVHlwZXtcbiAgICAgICAgTkVYVCxcbiAgICAgICAgRVJST1IsXG4gICAgICAgIENPTVBMRVRFRFxuICAgIH1cbn1cbiIsIm1vZHVsZSB3ZEZycCB7XG4gICAgZXhwb3J0IGNsYXNzIFRlc3RTdHJlYW0gZXh0ZW5kcyBCYXNlU3RyZWFtIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGUobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMobWVzc2FnZXMsIHNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc2NoZWR1bGVyOlRlc3RTY2hlZHVsZXIgPSBudWxsO1xuICAgICAgICBwcml2YXRlIF9tZXNzYWdlczpbUmVjb3JkXSA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IobWVzc2FnZXM6W1JlY29yZF0sIHNjaGVkdWxlcjpUZXN0U2NoZWR1bGVyKSB7XG4gICAgICAgICAgICBzdXBlcihudWxsKTtcblxuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcztcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN1YnNjcmliZUNvcmUob2JzZXJ2ZXI6SU9ic2VydmVyKXtcbiAgICAgICAgICAgIC8vdmFyIHNjaGVkdWxlciA9IDxUZXN0U2NoZWR1bGVyPih0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnNldFN0cmVhbU1hcChvYnNlcnZlciwgdGhpcy5fbWVzc2FnZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gU2luZ2xlRGlzcG9zYWJsZS5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==