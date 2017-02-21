import { Observer } from "../core/Observer";

export class AnonymousObserver extends Observer {
    public static create(onNext: Function, onError: Function, onCompleted: Function) {
        return new this(onNext, onError, onCompleted);
    }

    protected onNext(value: any) {
        this.onUserNext(value);
    }

    protected onError(error: any) {
        this.onUserError(error);
    }

    protected onCompleted() {
        this.onUserCompleted();
    }
}