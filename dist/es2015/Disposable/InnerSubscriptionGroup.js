import { Collection } from "wonder-commonlib/dist/es2015/Collection";
var InnerSubscriptionGroup = (function () {
    function InnerSubscriptionGroup() {
        this._container = Collection.create();
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
}());
export { InnerSubscriptionGroup };
//# sourceMappingURL=InnerSubscriptionGroup.js.map