"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.InnerSubscription = InnerSubscription;
//# sourceMappingURL=InnerSubscription.js.map