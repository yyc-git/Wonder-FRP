"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collection_1 = require("wonder-commonlib/dist/commonjs/Collection");
var InnerSubscriptionGroup = (function () {
    function InnerSubscriptionGroup() {
        this._container = Collection_1.Collection.create();
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
exports.InnerSubscriptionGroup = InnerSubscriptionGroup;
//# sourceMappingURL=InnerSubscriptionGroup.js.map