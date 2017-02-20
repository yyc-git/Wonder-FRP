var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Scheduler } from "../core/Scheduler";
import { JudgeUtils } from "../JudgeUtils";
import { Record } from "./Record";
import { ActionType } from "./ActionType";
import { Hash } from "wonder-commonlib/dist/es2015/Hash";
import { MockObserver } from "./MockObserver";
import { Log } from "wonder-commonlib/dist/es2015/Log";
import { TestStream } from "./TestStream";
import { MockPromise } from "./MockPromise";
var SUBSCRIBE_TIME = 200;
var DISPOSE_TIME = 1000;
var TestScheduler = (function (_super) {
    __extends(TestScheduler, _super);
    function TestScheduler(isReset) {
        var _this = _super.call(this) || this;
        _this._clock = null;
        _this._isReset = false;
        _this._isDisposed = false;
        _this._timerMap = Hash.create();
        _this._streamMap = Hash.create();
        _this._subscribedTime = null;
        _this._disposedTime = null;
        _this._observer = null;
        _this._isReset = isReset;
        return _this;
    }
    TestScheduler.next = function (tick, value) {
        if (JudgeUtils.isDirectObject(value)) {
            return Record.create(tick, value, ActionType.NEXT, function (a, b) {
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
            return Record.create(tick, value, ActionType.NEXT);
        }
    };
    TestScheduler.error = function (tick, error) {
        return Record.create(tick, error, ActionType.ERROR);
    };
    TestScheduler.completed = function (tick) {
        return Record.create(tick, null, ActionType.COMPLETED);
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
                case ActionType.NEXT:
                    func = function () {
                        observer.next(record.value);
                    };
                    break;
                case ActionType.ERROR:
                    func = function () {
                        observer.error(record.value);
                    };
                    break;
                case ActionType.COMPLETED:
                    func = function () {
                        observer.completed();
                    };
                    break;
                default:
                    Log.error(true, Log.info.FUNC_UNKNOW("actionType"));
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
        return TestStream.create(Array.prototype.slice.call(arguments, 0), this);
    };
    TestScheduler.prototype.createObserver = function () {
        return MockObserver.create(this);
    };
    TestScheduler.prototype.createResolvedPromise = function (time, value) {
        return MockPromise.create(this, [TestScheduler.next(time, value), TestScheduler.completed(time + 1)]);
    };
    TestScheduler.prototype.createRejectPromise = function (time, error) {
        return MockPromise.create(this, [TestScheduler.error(time, error)]);
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
}(Scheduler));
export { TestScheduler };
//# sourceMappingURL=TestScheduler.js.map