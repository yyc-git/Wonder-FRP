"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var Entity_1 = require("../core/Entity");
var Collection_1 = require("wonder-commonlib/dist/commonjs/Collection");
var GroupDisposable = (function (_super) {
    __extends(GroupDisposable, _super);
    function GroupDisposable(disposable) {
        var _this = _super.call(this, "GroupDisposable") || this;
        _this._group = Collection_1.Collection.create();
        _this._isDisposed = false;
        if (disposable) {
            _this._group.addChild(disposable);
        }
        return _this;
    }
    GroupDisposable.create = function (disposable) {
        var obj = new this(disposable);
        return obj;
    };
    GroupDisposable.prototype.add = function (disposable) {
        this._group.addChild(disposable);
        return this;
    };
    GroupDisposable.prototype.remove = function (disposable) {
        this._group.removeChild(disposable);
        return this;
    };
    GroupDisposable.prototype.dispose = function () {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._group.forEach(function (disposable) {
            disposable.dispose();
        });
    };
    return GroupDisposable;
}(Entity_1.Entity));
exports.GroupDisposable = GroupDisposable;
//# sourceMappingURL=GroupDisposable.js.map