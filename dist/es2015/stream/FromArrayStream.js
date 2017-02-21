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
import { BaseStream } from "./BaseStream";
import { SingleDisposable } from "../Disposable/SingleDisposable";
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
        return SingleDisposable.create();
    };
    return FromArrayStream;
}(BaseStream));
export { FromArrayStream };
//# sourceMappingURL=FromArrayStream.js.map