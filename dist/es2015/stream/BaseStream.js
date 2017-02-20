var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Stream } from "../core/Stream";
import { Observer } from "../core/Observer";
import { AutoDetachObserver } from "../observer/AutoDetachObserver";
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
        observer = arg1 instanceof Observer
            ? AutoDetachObserver.create(arg1)
            : AutoDetachObserver.create(arg1, onError, onCompleted);
        observer.setDisposable(this.buildStream(observer));
        return observer;
    };
    BaseStream.prototype.buildStream = function (observer) {
        _super.prototype.buildStream.call(this, observer);
        return this.subscribeCore(observer);
    };
    return BaseStream;
}(Stream));
export { BaseStream };
//# sourceMappingURL=BaseStream.js.map