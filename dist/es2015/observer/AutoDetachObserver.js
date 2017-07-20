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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Observer } from "../core/Observer";
import { requireCheck } from "../definition/typescript/decorator/contract";
import { Log } from "wonder-commonlib/dist/es2015/Log";
var AutoDetachObserver = (function (_super) {
    __extends(AutoDetachObserver, _super);
    function AutoDetachObserver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AutoDetachObserver.create = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 1) {
            return new this(args[0]);
        }
        else {
            return new this(args[0], args[1], args[2]);
        }
    };
    AutoDetachObserver.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
    };
    AutoDetachObserver.prototype.onNext = function (value) {
        try {
            this.onUserNext(value);
        }
        catch (e) {
            this.onError(e);
        }
    };
    AutoDetachObserver.prototype.onError = function (error) {
        try {
            this.onUserError(error);
        }
        catch (e) {
            throw e;
        }
        finally {
            this.dispose();
        }
    };
    AutoDetachObserver.prototype.onCompleted = function () {
        try {
            this.onUserCompleted();
            this.dispose();
        }
        catch (e) {
            throw e;
        }
    };
    __decorate([
        requireCheck(function () {
            if (this.isDisposed) {
                Log.warn("only can dispose once");
            }
        })
    ], AutoDetachObserver.prototype, "dispose", null);
    return AutoDetachObserver;
}(Observer));
export { AutoDetachObserver };
//# sourceMappingURL=AutoDetachObserver.js.map