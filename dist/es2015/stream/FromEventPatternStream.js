var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { BaseStream } from "./BaseStream";
import { SingleDisposable } from "../Disposable/SingleDisposable";
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
        return SingleDisposable.create(function () {
            self._removeHandler(innerHandler);
        });
    };
    return FromEventPatternStream;
}(BaseStream));
export { FromEventPatternStream };
//# sourceMappingURL=FromEventPatternStream.js.map