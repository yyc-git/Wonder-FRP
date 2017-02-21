var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Observer } from "../core/Observer";
import { Record } from "./Record";
import { JudgeUtils } from "../JudgeUtils";
import { ActionType } from "./ActionType";
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
        if (JudgeUtils.isDirectObject(value)) {
            record = Record.create(this._scheduler.clock, value, ActionType.NEXT, function (a, b) {
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
            record = Record.create(this._scheduler.clock, value, ActionType.NEXT);
        }
        this._messages.push(record);
    };
    MockObserver.prototype.onError = function (error) {
        this._messages.push(Record.create(this._scheduler.clock, error, ActionType.ERROR));
    };
    MockObserver.prototype.onCompleted = function () {
        this._messages.push(Record.create(this._scheduler.clock, null, ActionType.COMPLETED));
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
}(Observer));
export { MockObserver };
//# sourceMappingURL=MockObserver.js.map