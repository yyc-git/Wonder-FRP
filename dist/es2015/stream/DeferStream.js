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
import { GroupDisposable } from "../Disposable/GroupDisposable";
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
        var group = GroupDisposable.create();
        group.add(this._buildStreamFunc().buildStream(observer));
        return group;
    };
    return DeferStream;
}(BaseStream));
export { DeferStream };
//# sourceMappingURL=DeferStream.js.map